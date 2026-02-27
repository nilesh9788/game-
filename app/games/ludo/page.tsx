'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Piece {
  id: number;
  position: number;
  finished: boolean;
}

interface Player {
  color: string;
  name: string;
  pieces: Piece[];
  score: number;
}

export default function LudoPage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { color: 'red', name: 'Player 1 (Red)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
    { color: 'blue', name: 'Player 2 (Blue)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
    { color: 'green', name: 'Player 3 (Green)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
    { color: 'yellow', name: 'Player 4 (Yellow)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  const colors: Record<string, string> = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
  };

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayer(0);
  };

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    // Auto move logic
    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayerData = newPlayers[currentPlayer];
    let pieceMoved = false;

    // Move first available piece
    for (const piece of currentPlayerData.pieces) {
      if (!piece.finished && piece.position < 51) {
        piece.position += roll;
        if (piece.position >= 51) {
          piece.finished = true;
        }
        pieceMoved = true;
        break;
      } else if (piece.position === -1 && roll === 6) {
        piece.position = 0;
        pieceMoved = true;
        break;
      }
    }

    setPlayers(newPlayers);

    // Check if player won
    const allFinished = currentPlayerData.pieces.every(p => p.finished);
    if (allFinished) {
      setGameWinner(currentPlayerData.name);
      setGameMode('finished');
      return;
    }

    // Move to next player
    if (roll !== 6) {
      setCurrentPlayer((currentPlayer + 1) % 4);
    }
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers([
      { color: 'red', name: 'Player 1 (Red)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
      { color: 'blue', name: 'Player 2 (Blue)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
      { color: 'green', name: 'Player 3 (Green)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
      { color: 'yellow', name: 'Player 4 (Yellow)', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })), score: 0 },
    ]);
    setCurrentPlayer(0);
    setDiceValue(0);
    setGameWinner(null);
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
            <p className="text-neutral-400">Goal: Move all 4 pieces to the finish</p>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Game Board */}
            <div className="card-game">
              <h3 className="text-xl font-bold mb-4">Ludo Board</h3>
              <div className="grid grid-cols-4 gap-4">
                {players.map((player, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 border-neutral-700 ${idx === currentPlayer ? 'border-blue-500 bg-blue-900/30' : ''}`}>
                    <h4 className={`font-bold mb-2 ${colors[player.color]}`}>{player.name}</h4>
                    <div className="space-y-1">
                      {player.pieces.map((piece) => (
                        <div key={piece.id} className="text-sm text-neutral-400">
                          Piece {piece.id + 1}: {piece.finished ? 'FINISHED' : piece.position === -1 ? 'Home' : `Pos ${piece.position}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dice and Controls */}
            <div className="card-game max-w-md mx-auto space-y-4 text-center">
              <h3 className="text-lg font-bold">
                {players[currentPlayer].name}'s Turn
              </h3>
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-lg border-2 border-neutral-600 ${diceValue ? 'bg-blue-600 text-white' : 'bg-neutral-800'}`}>
                  {diceValue || '-'}
                </div>
              </div>
              <button
                onClick={rollDice}
                disabled={gameMode === 'finished'}
                className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Roll Dice
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
