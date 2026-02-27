'use client';

import { useState } from 'react';
import ChessBoard from '@/components/games/ChessBoard';

export default function ChessPage() {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<'setup' | 'mode-select' | 'playing' | 'finished'>('setup');
  const [player1Name, setPlayer1Name] = useState('Player 1 (White)');
  const [player2Name, setPlayer2Name] = useState('Player 2 (Black)');
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameType, setGameType] = useState<'pvp' | 'ai' | null>(null);

  const handleModeSelect = (type: 'pvp' | 'ai') => {
    setGameType(type);
    if (type === 'pvp') {
      setGameMode('playing');
      setPlayer2Name('Player 2 (Black)');
    } else {
      setGameMode('playing');
      setPlayer2Name('Computer (Black)');
    }
    setGameHistory([]);
    setSelectedSquare(null);
    setGameWinner(null);
  };

  const handleGameEnd = (result: 'white' | 'black' | 'draw') => {
    setGameMode('finished');
    let winnerText = '';
    if (result === 'white') {
      winnerText = `${player1Name} (White) wins!`;
    } else if (result === 'black') {
      winnerText = `${player2Name} (Black) wins!`;
    } else {
      winnerText = 'Game is a Draw!';
    }
    setGameWinner(winnerText);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            ← Back to GameHub
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-2">Chess</h1>
        <p className="text-neutral-400 mb-12">Two-player chess game on the same device</p>

        {gameMode === 'setup' ? (
          <div className="card-game space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold">Game Mode</h2>
            <p className="text-neutral-400">Choose how you want to play</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setGameMode('mode-select');
                  setGameType('pvp');
                }}
                className="w-full px-6 py-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Player vs Player
              </button>

              <button
                onClick={() => {
                  setGameMode('mode-select');
                  setGameType('ai');
                }}
                className="w-full px-6 py-4 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Play vs Computer
              </button>
            </div>
          </div>
        ) : gameMode === 'mode-select' ? (
          <div className="card-game space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold">Game Setup</h2>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Your Name (White)</label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-blue-500"
              />
            </div>

            {gameType === 'pvp' && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Player 2 (Black)</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleModeSelect(gameType!)}
                className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Start Game
              </button>
              <button
                onClick={() => setGameMode('setup')}
                className="w-full px-6 py-3 rounded-lg font-bold bg-neutral-700 hover:bg-neutral-600 text-white transition-all"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {gameWinner && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-neutral-900 border-2 border-green-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-bounce">
                  <h2 className="text-4xl font-bold text-green-400">Game Over!</h2>
                  <p className="text-2xl text-white">{gameWinner}</p>
                  <button
                    onClick={() => setGameMode('setup')}
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
            )}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Chess Board */}
              <div className="lg:col-span-2">
                <ChessBoard
                  selectedSquare={selectedSquare}
                  onSquareSelect={setSelectedSquare}
                  onGameEnd={handleGameEnd}
                />
            </div>

            {/* Game Info */}
            <div>
              <div className="card-game space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Players</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white">
                      <span className="inline-block w-3 h-3 bg-white rounded-full mr-2"></span>
                      {player1Name}
                    </p>
                    <p className="text-neutral-400">
                      <span className="inline-block w-3 h-3 bg-neutral-600 rounded-full mr-2"></span>
                      {player2Name}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-700 pt-4">
                  <h3 className="text-lg font-bold mb-4">Game Info</h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    Total moves: {gameHistory.length}
                  </p>

                  {gameHistory.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Move History:</h4>
                      <div className="bg-neutral-800/50 rounded p-3 max-h-40 overflow-y-auto text-xs text-neutral-400">
                        {gameHistory.map((move, idx) => (
                          <div key={idx}>{idx + 1}. {move}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setGameMode('setup')}
                    className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    New Game
                  </button>
                  <a href="/" className="block">
                    <button className="w-full px-6 py-3 rounded-lg font-bold bg-neutral-700 hover:bg-neutral-600 text-white transition-all">
                      Back to Home
                    </button>
                  </a>
                </div>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
