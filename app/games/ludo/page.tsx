'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Block type definitions
type BlockType = 'BASE' | 'START' | 'NORMAL' | 'SAFE' | 'HOME_ENTRY' | 'HOME_PATH' | 'FINAL' | 'CENTER';

interface Block {
  id: string;
  type: BlockType;
  playerColor: string | null;
  isSafe: boolean;
  canCapture: boolean;
  occupants: Token[];
}

interface Token {
  id: string;
  playerId: number;
  playerColor: string;
  status: 'BASE' | 'ACTIVE' | 'HOME' | 'FINISHED';
  position: number; // Global position on board
  stepsOnBoard: number; // Steps moved from start
  completedLoop: boolean;
}

interface Player {
  id: number;
  color: string;
  name: string;
  tokens: Token[];
  startBlock: number;
  homeEntryBlock: number;
  homePathStart: number;
  finished: number; // Count of finished tokens
}

// Board configuration - Complete layout based on specification
const SAFE_BLOCK_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47]; // 8 safe blocks
const OUTER_TRACK_BLOCKS = 52;
const HOME_PATH_BLOCKS = 6;
const TOTAL_BOARD_BLOCKS = 52 + 6 * 4; // 52 outer + 24 home paths + 1 center

const PLAYERS_CONFIG: Player[] = [
  {
    id: 0,
    color: 'red',
    name: 'Red',
    tokens: [],
    startBlock: 0,
    homeEntryBlock: 48,
    homePathStart: 52,
    finished: 0,
  },
  {
    id: 1,
    color: 'blue',
    name: 'Blue',
    tokens: [],
    startBlock: 13,
    homeEntryBlock: 9,
    homePathStart: 58,
    finished: 0,
  },
  {
    id: 2,
    color: 'yellow',
    name: 'Yellow',
    tokens: [],
    startBlock: 26,
    homeEntryBlock: 22,
    homePathStart: 64,
    finished: 0,
  },
  {
    id: 3,
    color: 'green',
    name: 'Green',
    tokens: [],
    startBlock: 39,
    homeEntryBlock: 35,
    homePathStart: 70,
    finished: 0,
  },
];

const colorStyles: Record<
  string,
  { bg: string; text: string; border: string; light: string }
> = {
  red: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    light: 'bg-red-400',
  },
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-600',
    light: 'bg-blue-400',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    light: 'bg-yellow-400',
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-green-600',
    border: 'border-green-600',
    light: 'bg-green-400',
  },
};

export default function LudoPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [gameWinner, setGameWinner] = useState<Player | null>(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  // Initialize game
  const startGame = () => {
    const newPlayers = PLAYERS_CONFIG.map((p) => ({
      ...p,
      tokens: Array(4)
        .fill(null)
        .map((_, i) => ({
          id: `${p.id}-${i}`,
          playerId: p.id,
          playerColor: p.color,
          status: 'BASE' as const,
          position: -1, // -1 = in base
          stepsOnBoard: 0,
          completedLoop: false,
        })),
    }));

    setPlayers(newPlayers);
    setGameMode('playing');
    setCurrentPlayerIdx(0);
    setGameLog(['Game started!']);
    setDiceValue(0);
    setConsecutiveSixes(0);
  };

  // Roll dice and apply movement
  const rollDice = () => {
    if (gameMode !== 'playing') return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayer = newPlayers[currentPlayerIdx];
    const logs: string[] = [];

    logs.push(`${currentPlayer.name} rolled ${roll}`);

    // Check if player can move any token
    let canMoveAny = false;
    let movedToken = false;

    // If rolled 6, allow token from base to start
    if (roll === 6) {
      const baseToken = currentPlayer.tokens.find((t: Token) => t.status === 'BASE');
      if (baseToken) {
        baseToken.status = 'ACTIVE';
        baseToken.position = currentPlayer.startBlock;
        baseToken.stepsOnBoard = 0;
        movedToken = true;
        canMoveAny = true;
        logs.push(`${currentPlayer.name} sent token to start!`);
      }
    }

    // Move existing tokens on board
    const activeTokens = currentPlayer.tokens.filter((t: Token) => t.status === 'ACTIVE' || t.status === 'HOME');
    
    if (activeTokens.length > 0 && !movedToken) {
      // Find first movable token
      for (const token of activeTokens) {
        const newPosition = calculateNewPosition(token, roll, currentPlayer);
        
        if (newPosition !== null) {
          // Check if move is valid (not blocked by own token stack variant)
          const targetBlock = getBlockInfo(newPosition);
          
          // Apply movement
          if (token.status === 'HOME') {
            token.position = newPosition;
          } else {
            token.stepsOnBoard += roll;
            token.position = newPosition;
          }

          // Check if token completed loop and can enter home
          if (token.stepsOnBoard >= OUTER_TRACK_BLOCKS && !token.completedLoop) {
            token.completedLoop = true;
            logs.push(`${currentPlayer.name} token completed loop!`);
          }

          // Check if token reached final position
          if (token.position >= currentPlayer.homePathStart + HOME_PATH_BLOCKS) {
            token.status = 'FINISHED';
            token.position = currentPlayer.homePathStart + HOME_PATH_BLOCKS;
            currentPlayer.finished++;
            logs.push(`${currentPlayer.name} token finished!`);
          } else if (token.completedLoop && token.position >= currentPlayer.homePathStart) {
            token.status = 'HOME';
          }

          movedToken = true;
          break;
        }
      }
    }

    setPlayers(newPlayers);
    setGameLog([...gameLog, ...logs]);

    // Check for winner
    if (currentPlayer.finished === 4) {
      setGameWinner(currentPlayer);
      setGameMode('finished');
      setGameLog((prev) => [...prev, `🎉 ${currentPlayer.name} wins the game!`]);
      return;
    }

    // Handle turn progression
    if (roll === 6) {
      setConsecutiveSixes(consecutiveSixes + 1);
      if (consecutiveSixes + 1 >= 3) {
        logs.push(`${currentPlayer.name} rolled 3 sixes! Skipping turn.`);
        setConsecutiveSixes(0);
        setCurrentPlayerIdx((currentPlayerIdx + 1) % 4);
      }
      // Otherwise, player rolls again (don't change turn)
    } else {
      setConsecutiveSixes(0);
      setCurrentPlayerIdx((currentPlayerIdx + 1) % 4);
    }
  };

  // Calculate new position considering capture and safety
  const calculateNewPosition = (token: Token, roll: number, player: Player): number | null => {
    if (token.status === 'BASE') return null;

    if (token.status === 'HOME') {
      // Token in home path - simple movement
      const newPos = token.position + roll;
      if (newPos <= player.homePathStart + HOME_PATH_BLOCKS) {
        return newPos;
      }
      return null; // Overshot
    }

    // Token on outer track
    if (token.status === 'ACTIVE') {
      const newPos = (token.stepsOnBoard + roll) % OUTER_TRACK_BLOCKS;
      return newPos;
    }

    return null;
  };

  // Get block information
  const getBlockInfo = (position: number): Block => {
    const isSafe = SAFE_BLOCK_POSITIONS.includes(position);
    
    return {
      id: `block-${position}`,
      type: isSafe ? 'SAFE' : 'NORMAL',
      playerColor: null,
      isSafe,
      canCapture: !isSafe,
      occupants: [],
    };
  };

  // Reset game
  const resetGame = () => {
    setGameMode('setup');
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setDiceValue(0);
    setGameLog([]);
    setGameWinner(null);
    setConsecutiveSixes(0);
  };

  if (gameMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-neutral-400 hover:text-neutral-200 transition">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white">Ludo Game</h1>
            <div></div>
          </div>

          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Ready to Play?</h2>
            <p className="text-neutral-400">4 Players: Red, Blue, Yellow, Green</p>
            <p className="text-sm text-neutral-500">
              Roll a 6 to send pieces from home. First player to move all 4 pieces to finish wins!
            </p>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="card-game max-w-md mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold">Game Over!</h2>
            <div className={`text-5xl font-bold ${colorStyles[gameWinner?.color || 'red'].text}`}>
              {gameWinner?.name} Wins!
            </div>
            <button
              onClick={resetGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <Link href="/">
              <button className="w-full px-6 py-3 rounded-lg font-bold bg-neutral-700 hover:bg-neutral-600 text-white transition-all">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-neutral-400 hover:text-neutral-200 transition">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white">Ludo Game</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Board */}
          <div className="lg:col-span-2">
            <div className="card-game p-8 bg-white">
              <h2 className="text-2xl font-bold mb-6 text-neutral-900">Board</h2>
              
              {/* Board Layout - Cross shape representing Ludo */}
              <div className="grid grid-cols-6 gap-1 bg-neutral-200 p-4 rounded">
                {/* Simplified board representation */}
                {Array(52)
                  .fill(null)
                  .map((_, i) => {
                    const isSafe = SAFE_BLOCK_POSITIONS.includes(i);
                    return (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded flex items-center justify-center text-xs font-bold transition ${
                          isSafe
                            ? 'bg-yellow-300 border-2 border-yellow-600'
                            : 'bg-neutral-100 border border-neutral-400'
                        }`}
                      >
                        {i}
                      </div>
                    );
                  })}
              </div>

              {/* Player Positions */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-neutral-900">Token Positions</h3>
                {players.map((player) => (
                  <div key={player.id} className="space-y-2">
                    <div className={`font-bold ${colorStyles[player.color].text}`}>
                      {player.name} ({player.finished}/4 finished)
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {player.tokens.map((token) => (
                        <div
                          key={token.id}
                          className={`p-2 rounded text-center text-xs font-bold text-white ${colorStyles[player.color].bg}`}
                        >
                          {token.status === 'BASE'
                            ? 'BASE'
                            : token.status === 'FINISHED'
                              ? 'FIN'
                              : token.status === 'HOME'
                                ? `H${token.position - player.homePathStart}`
                                : `${token.stepsOnBoard}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls and Game Info */}
          <div className="space-y-6">
            {/* Current Player */}
            <div className="card-game">
              <h3 className="text-lg font-bold mb-4">Current Player</h3>
              <div className={`text-3xl font-bold ${colorStyles[players[currentPlayerIdx]?.color || 'red'].text}`}>
                {players[currentPlayerIdx]?.name}
              </div>
            </div>

            {/* Dice */}
            <div className="card-game text-center">
              <h3 className="text-lg font-bold mb-4">Dice</h3>
              <div className={`w-20 h-20 mx-auto flex items-center justify-center text-5xl font-bold rounded-lg ${
                diceValue
                  ? colorStyles[players[currentPlayerIdx]?.color || 'red'].bg + ' text-white'
                  : 'bg-neutral-700 text-neutral-500'
              }`}>
                {diceValue || '-'}
              </div>
              <button
                onClick={rollDice}
                className="w-full mt-4 px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Roll Dice
              </button>
            </div>

            {/* Game Log */}
            {gameLog.length > 0 && (
              <div className="card-game">
                <h3 className="text-lg font-bold mb-3">Game Log</h3>
                <div className="bg-neutral-800/50 rounded p-3 max-h-48 overflow-y-auto space-y-1 text-xs text-neutral-300">
                  {gameLog.slice(-10).reverse().map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
