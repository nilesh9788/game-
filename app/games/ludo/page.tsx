'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Piece {
  id: number;
  position: number; // -1: home, 0-51: board, 52-56: home stretch, 57: finished
  finished: boolean;
}

interface Player {
  color: string;
  name: string;
  pieces: Piece[];
  rollCount: number;
}

const BOARD_SIZE = 52; // Total positions on main board
const HOME_STRETCH_SIZE = 6; // 6 squares to reach home
const TOTAL_MOVES = BOARD_SIZE + HOME_STRETCH_SIZE; // 58 total moves to finish

export default function LudoPage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { color: 'red', name: 'Player 1 (Red)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
    { color: 'blue', name: 'Player 2 (Blue)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
    { color: 'green', name: 'Player 3 (Green)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
    { color: 'yellow', name: 'Player 4 (Yellow)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const colors: Record<string, Record<string, string>> = {
    red: { bg: 'bg-red-600', light: 'bg-red-500', text: 'text-red-600', dot: 'bg-red-700' },
    blue: { bg: 'bg-blue-600', light: 'bg-blue-500', text: 'text-blue-600', dot: 'bg-blue-700' },
    green: { bg: 'bg-green-600', light: 'bg-green-500', text: 'text-green-600', dot: 'bg-green-700' },
    yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-400', text: 'text-yellow-500', dot: 'bg-yellow-600' },
  };

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayer(0);
    setGameLog(['Game started!']);
    setConsecutiveSixes(0);
  };

  const rollDice = () => {
    if (gameMode !== 'playing') return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayerData = newPlayers[currentPlayer];
    const newLog = [...gameLog];

    let pieceMoved = false;
    let capturedPiece = false;

    // Logic for moving pieces
    // Try to move a piece that can be moved
    let movedPiece = null;

    // First, try to move a piece already on board
    for (let i = 0; i < currentPlayerData.pieces.length; i++) {
      const piece = currentPlayerData.pieces[i];
      if (!piece.finished && piece.position >= 0) {
        const newPos = piece.position + roll;
        if (newPos < TOTAL_MOVES) {
          piece.position = newPos;
          pieceMoved = true;
          movedPiece = i;
          break;
        } else if (newPos === TOTAL_MOVES) {
          piece.finished = true;
          piece.position = TOTAL_MOVES;
          pieceMoved = true;
          movedPiece = i;
          newLog.push(`${currentPlayerData.name} Piece ${i + 1} finished!`);
          break;
        }
      }
    }

    // If no piece moved and we rolled a 6, send a piece from home
    if (!pieceMoved && roll === 6) {
      for (const piece of currentPlayerData.pieces) {
        if (piece.position === -1) {
          piece.position = 0;
          pieceMoved = true;
          newLog.push(`${currentPlayerData.name} sent a piece to board!`);
          break;
        }
      }
    }

    // If still no piece moved, try to move any available piece
    if (!pieceMoved) {
      for (let i = 0; i < currentPlayerData.pieces.length; i++) {
        const piece = currentPlayerData.pieces[i];
        if (!piece.finished && piece.position === -1 && roll === 6) {
          piece.position = 0;
          pieceMoved = true;
          newLog.push(`${currentPlayerData.name} sent a piece to board!`);
          break;
        }
      }
    }

    setPlayers(newPlayers);
    newLog.push(`${currentPlayerData.name} rolled ${roll}`);
    setGameLog(newLog);

    // Check if player won
    const allFinished = currentPlayerData.pieces.every(p => p.finished);
    if (allFinished) {
      setGameWinner(currentPlayerData.name);
      setGameMode('finished');
      newLog.push(`🎉 ${currentPlayerData.name} wins the game!`);
      return;
    }

    // Handle consecutive sixes
    if (roll === 6) {
      setConsecutiveSixes(consecutiveSixes + 1);
      if (consecutiveSixes + 1 < 3) {
        // Can roll again
        return;
      } else {
        // Third 6 in a row - skip turn
        newLog.push(`${currentPlayerData.name} rolled 3 sixes! Skipping turn.`);
        setConsecutiveSixes(0);
        setCurrentPlayer((currentPlayer + 1) % 4);
      }
    } else {
      setConsecutiveSixes(0);
      setCurrentPlayer((currentPlayer + 1) % 4);
    }
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers([
      { color: 'red', name: 'Player 1 (Red)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
      { color: 'blue', name: 'Player 2 (Blue)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
      { color: 'green', name: 'Player 3 (Green)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
      { color: 'yellow', name: 'Player 4 (Yellow)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), rollCount: 0 },
    ]);
    setCurrentPlayer(0);
    setDiceValue(0);
    setGameWinner(null);
    setGameLog([]);
    setConsecutiveSixes(0);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="mb-8 inline-block px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-4 text-center text-blue-400">Ludo Game</h1>
        <p className="text-center text-neutral-400 mb-8">Race your 4 pieces around the board. Roll a 6 to start moving!</p>

        {gameWinner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border-2 border-green-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-pulse">
              <h2 className="text-4xl font-bold text-green-400">Game Over!</h2>
              <p className="text-2xl text-white font-semibold">{gameWinner} wins!</p>
              <div className="space-y-3">
                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
                <a href="/" className="block">
                  <button className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
                    Back to Home
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Game Setup</h2>
            <p className="text-neutral-400">Players: 4 (Red, Blue, Green, Yellow)</p>
            <p className="text-neutral-400">Goal: Move all 4 pieces around the board to finish</p>
            <p className="text-sm text-neutral-500">Roll a 6 to move a piece from home. Get all pieces to the finish!</p>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ludo Board Visualization */}
            <div className="card-game">
              <h3 className="text-xl font-bold mb-6">Game Board</h3>
              
              {/* Player Status Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {players.map((player, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      idx === currentPlayer 
                        ? `border-blue-500 bg-blue-900/30 ring-2 ring-blue-400` 
                        : 'border-neutral-700'
                    }`}
                  >
                    <h4 className={`font-bold mb-3 text-sm ${colors[player.color].text}`}>
                      {player.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {player.pieces.map((piece) => (
                        <div 
                          key={piece.id} 
                          className={`w-full p-2 rounded text-center text-xs font-bold ${colors[player.color].bg}`}
                        >
                          {piece.finished ? '✓' : piece.position === -1 ? 'H' : piece.position}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            <div className="card-game max-w-md mx-auto space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">
                  {players[currentPlayer].name}'s Turn
                </h3>
                <p className="text-sm text-neutral-400">
                  {diceValue === 0 ? 'Roll the dice to continue' : `Rolled: ${diceValue}`}
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <div className={`w-24 h-24 flex items-center justify-center text-5xl font-bold rounded-lg border-4 transition-all ${
                  diceValue ? 
                    `${colors[players[currentPlayer].color].bg} text-white border-blue-400` 
                    : 'bg-neutral-800 border-neutral-600 text-neutral-600'
                }`}>
                  {diceValue || '-'}
                </div>
              </div>

              <button
                onClick={rollDice}
                disabled={gameMode === 'finished'}
                className="w-full px-6 py-4 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 text-lg"
              >
                {diceValue === 0 ? '🎲 Roll Dice' : 'Roll Again'}
              </button>

              {/* Game Log */}
              {gameLog.length > 0 && (
                <div className="border-t border-neutral-700 pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-neutral-400">Game Log</h4>
                  <div className="bg-neutral-800/50 rounded p-3 max-h-32 overflow-y-auto text-xs text-neutral-400 space-y-1">
                    {gameLog.slice(-8).reverse().map((log, idx) => (
                      <div key={idx} className="text-neutral-300">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
