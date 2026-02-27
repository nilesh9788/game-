'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Piece {
  id: number;
  position: number; // -1: home, 0-51: outer track, 52-57: home stretch, 58: finished
}

interface Player {
  id: number;
  color: string;
  name: string;
  pieces: Piece[];
  startPos: number; // Starting position on outer track
}

// Board configuration
const OUTER_TRACK_SIZE = 52;
const HOME_STRETCH_SIZE = 6;
const TOTAL_POSITIONS = 58;

// Safe positions where pieces cannot be captured
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

const PLAYERS: Player[] = [
  { id: 0, color: 'red', name: 'Red', pieces: [], startPos: 0 },
  { id: 1, color: 'blue', name: 'Blue', pieces: [], startPos: 13 },
  { id: 2, color: 'yellow', name: 'Yellow', pieces: [], startPos: 26 },
  { id: 3, color: 'green', name: 'Green', pieces: [], startPos: 39 },
];

const colorMap: Record<string, { bg: string; text: string; light: string; border: string }> = {
  red: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-100', border: 'border-red-600' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-100', border: 'border-blue-600' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100', border: 'border-yellow-500' },
  green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-100', border: 'border-green-600' },
};

// Calculate actual position on board path considering home stretch
const getGlobalPosition = (playerIdx: number, pos: number): number => {
  if (pos === -1) return -1;
  if (pos < OUTER_TRACK_SIZE) return pos;
  // Home stretch positions: 52-57 for player 0, 58-63 for player 1, etc.
  return 52 + playerIdx * HOME_STRETCH_SIZE + (pos - OUTER_TRACK_SIZE);
};

// Get board cell for rendering
const getBoardCell = (index: number): { row: number; col: number; type: string } => {
  // This creates a 15x15 grid representing the Ludo board
  // Outer track forms a square loop
  // Home stretches go toward center
  
  if (index < 13) {
    // Top row (0-12)
    return { row: 0, col: index, type: 'outer' };
  } else if (index < 21) {
    // Right side (13-20)
    return { row: index - 13, col: 14, type: 'outer' };
  } else if (index < 34) {
    // Bottom row reversed (21-33)
    return { row: 14, col: 14 - (index - 21), type: 'outer' };
  } else if (index < 47) {
    // Left side (34-46)
    return { row: 14 - (index - 34), col: 0, type: 'outer' };
  } else {
    // Top left remainder (47-51)
    return { row: 0, col: 47 - index, type: 'outer' };
  }
};

export default function LudoPage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>(
    PLAYERS.map(p => ({
      ...p,
      pieces: Array(4)
        .fill(0)
        .map((_, i) => ({ id: i, position: -1 })),
    }))
  );
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayerIdx(0);
    setGameLog(['Game started!']);
    setConsecutiveSixes(0);
  };

  const rollDice = () => {
    if (gameMode !== 'playing') return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayer = newPlayers[currentPlayerIdx];
    const newLog = [...gameLog];

    let pieceMoved = false;

    // Try to move a piece
    // Priority 1: Move a piece already on board
    for (let i = 0; i < currentPlayer.pieces.length; i++) {
      const piece = currentPlayer.pieces[i];
      if (piece.position >= 0 && piece.position < TOTAL_POSITIONS) {
        const newPos = piece.position + roll;

        if (newPos <= TOTAL_POSITIONS) {
          piece.position = newPos;
          pieceMoved = true;
          newLog.push(`${currentPlayer.name} moved piece ${i + 1} to position ${newPos}`);

          if (newPos === TOTAL_POSITIONS) {
            piece.position = 58; // Mark as finished
            newLog.push(`${currentPlayer.name} piece ${i + 1} finished!`);
          }
          break;
        }
      }
    }

    // Priority 2: Send a piece from home if rolled a 6
    if (!pieceMoved && roll === 6) {
      for (let i = 0; i < currentPlayer.pieces.length; i++) {
        const piece = currentPlayer.pieces[i];
        if (piece.position === -1) {
          piece.position = currentPlayer.startPos;
          pieceMoved = true;
          newLog.push(`${currentPlayer.name} sent piece ${i + 1} onto board!`);
          break;
        }
      }
    }

    setPlayers(newPlayers);
    setGameLog(newLog);

    // Check if current player won
    const allFinished = currentPlayer.pieces.every(p => p.position === 58);
    if (allFinished) {
      setGameWinner(currentPlayer.name);
      setGameMode('finished');
      newLog.push(`${currentPlayer.name} wins the game!`);
      return;
    }

    // Handle consecutive sixes
    if (roll === 6) {
      const newSixes = consecutiveSixes + 1;
      setConsecutiveSixes(newSixes);
      if (newSixes < 3) {
        newLog.push(`${currentPlayer.name} rolled a 6! Roll again.`);
      } else {
        newLog.push(`${currentPlayer.name} rolled 3 sixes! Skipping turn.`);
        setConsecutiveSixes(0);
        setCurrentPlayerIdx((currentPlayerIdx + 1) % 4);
      }
    } else {
      setConsecutiveSixes(0);
      setCurrentPlayerIdx((currentPlayerIdx + 1) % 4);
    }
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers(
      PLAYERS.map(p => ({
        ...p,
        pieces: Array(4)
          .fill(0)
          .map((_, i) => ({ id: i, position: -1 })),
      }))
    );
    setCurrentPlayerIdx(0);
    setDiceValue(0);
    setGameWinner(null);
    setGameLog([]);
    setConsecutiveSixes(0);
  };

  // Create board grid (simplified 2D representation)
  const renderBoardGrid = () => {
    return (
      <div className="relative bg-neutral-900 border-4 border-neutral-700 aspect-square max-w-2xl mx-auto">
        {/* Red Base (Top Left) */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600 border-2 border-red-700 flex flex-wrap items-center justify-center gap-2 p-2">
          {players[0].pieces.map((piece, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${
                piece.position >= 0 ? 'bg-red-300 border-2 border-red-400' : 'bg-red-400 border-2 border-red-500'
              }`}
            />
          ))}
        </div>

        {/* Blue Base (Top Right) */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600 border-2 border-blue-700 flex flex-wrap items-center justify-center gap-2 p-2">
          {players[1].pieces.map((piece, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${
                piece.position >= 0 ? 'bg-blue-300 border-2 border-blue-400' : 'bg-blue-400 border-2 border-blue-500'
              }`}
            />
          ))}
        </div>

        {/* Yellow Base (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-yellow-500 border-2 border-yellow-600 flex flex-wrap items-center justify-center gap-2 p-2">
          {players[2].pieces.map((piece, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${
                piece.position >= 0 ? 'bg-yellow-300 border-2 border-yellow-400' : 'bg-yellow-400 border-2 border-yellow-500'
              }`}
            />
          ))}
        </div>

        {/* Green Base (Bottom Left) */}
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-green-600 border-2 border-green-700 flex flex-wrap items-center justify-center gap-2 p-2">
          {players[3].pieces.map((piece, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${
                piece.position >= 0 ? 'bg-green-300 border-2 border-green-400' : 'bg-green-400 border-2 border-green-500'
              }`}
            />
          ))}
        </div>

        {/* Center Home */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-gradient-to-br from-red-400 via-yellow-300 to-green-400 border-4 border-neutral-800 flex items-center justify-center">
          <div className="text-center text-neutral-900 font-bold text-sm">FINISH</div>
        </div>

        {/* Outer track squares */}
        <div className="absolute inset-2 border-2 border-neutral-600 rounded-lg opacity-30" />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-neutral-50">Ludo Game</h1>
          <Link href="/">
            <button className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-all">
              Back
            </button>
          </Link>
        </div>

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Ludo Game</h2>
            <p className="text-neutral-400 text-sm">
              Roll a 6 to send pieces from home. Move all 4 pieces to the center to win!
            </p>
            <button
              onClick={startGame}
              className="w-full px-6 py-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Board */}
            <div className="lg:col-span-2 space-y-4">{renderBoardGrid()}</div>

            {/* Game Controls */}
            <div className="space-y-6">
              {/* Current Player */}
              <div className="card-game">
                <h3 className="text-xl font-bold mb-4">Current Turn</h3>
                <div className={`p-4 rounded-lg ${colorMap[players[currentPlayerIdx].color].bg} text-white`}>
                  <p className="font-bold text-lg">{players[currentPlayerIdx].name}</p>
                </div>
              </div>

              {/* Dice */}
              <div className="card-game space-y-4">
                <h3 className="text-lg font-bold">Dice</h3>
                <div className="flex justify-center">
                  <div
                    className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-lg border-2 transition-all ${
                      diceValue > 0
                        ? `${colorMap[players[currentPlayerIdx].color].bg} text-white border-blue-400`
                        : 'bg-neutral-800 text-neutral-600 border-neutral-600'
                    }`}
                  >
                    {diceValue || '-'}
                  </div>
                </div>
                <button
                  onClick={rollDice}
                  disabled={gameMode !== 'playing'}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  Roll Dice
                </button>
              </div>

              {/* Players Status */}
              <div className="card-game space-y-2">
                <h3 className="text-lg font-bold mb-3">Players</h3>
                {players.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                    <p className="text-sm font-semibold text-neutral-300 mb-1">{p.name}</p>
                    <div className="flex gap-1">
                      {p.pieces.map((piece, pidx) => (
                        <div
                          key={pidx}
                          className={`w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold ${colorMap[p.color].bg}`}
                        >
                          {piece.position === -1 ? 'H' : piece.position === 58 ? 'F' : piece.position}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Log */}
              {gameLog.length > 0 && (
                <div className="card-game space-y-2">
                  <h3 className="text-sm font-bold text-neutral-400">Game Log</h3>
                  <div className="bg-neutral-800 rounded p-3 max-h-32 overflow-y-auto text-xs text-neutral-300 space-y-1">
                    {gameLog.slice(-6).reverse().map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameMode === 'finished' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="card-game max-w-md space-y-6">
              <h2 className="text-3xl font-bold">Game Over</h2>
              <p className="text-xl text-neutral-300">
                <span className={`font-bold ${colorMap[players[currentPlayerIdx].color].text}`}>
                  {gameWinner}
                </span>{' '}
                wins!
              </p>
              <div className="space-y-2">
                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
                <Link href="/" className="block">
                  <button className="w-full px-6 py-3 rounded-lg font-bold bg-neutral-700 hover:bg-neutral-600 text-white transition-all">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
