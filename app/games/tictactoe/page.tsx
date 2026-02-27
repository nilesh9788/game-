'use client';

import { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type GameMode = 'setup' | 'playing' | 'finished';

export default function TicTacToePage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [winner, setWinner] = useState<Player>(null);
  const [gameCount, setGameCount] = useState({ player1: 0, player2: 0, draws: 0 });

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const isBoardFull = (squares: Player[]) => {
    return squares.every(square => square !== null);
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || gameMode !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameMode('finished');
      setGameCount(prev => ({
        ...prev,
        [gameWinner === 'X' ? 'player1' : 'player2']: prev[gameWinner === 'X' ? 'player1' : 'player2'] + 1,
      }));
    } else if (isBoardFull(newBoard)) {
      setGameMode('finished');
      setGameCount(prev => ({ ...prev, draws: prev.draws + 1 }));
    }

    setIsXNext(!isXNext);
  };

  const handleStartGame = () => {
    if (player1Name && player2Name) {
      setGameMode('playing');
      setBoard(Array(9).fill(null));
      setWinner(null);
      setIsXNext(true);
    }
  };

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setGameMode('playing');
    setIsXNext(true);
  };

  const resetStats = () => {
    setGameCount({ player1: 0, player2: 0, draws: 0 });
  };

  const getStatusMessage = () => {
    if (winner) {
      return `${winner === 'X' ? player1Name : player2Name} Wins!`;
    }
    if (isBoardFull(board)) {
      return "It's a Draw!";
    }
    return `${isXNext ? player1Name : player2Name}'s Turn`;
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-2">Tic Tac Toe</h1>
        <p className="text-neutral-400 mb-12">Classic 3x3 grid game for two players</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {gameMode === 'setup' ? (
              <div className="card-game space-y-6">
                <h2 className="text-2xl font-bold">Enter Player Names</h2>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Player 1 (X)</label>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Player 2 (O)</label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Start Game
                </button>
              </div>
            ) : (
              <div className="card-game space-y-8">
                <div>
                  <p className="text-lg font-bold text-blue-400 mb-4">{getStatusMessage()}</p>

                  {/* Game Board */}
                  <div className="grid grid-cols-3 gap-2 mb-8">
                    {board.map((value, index) => (
                      <button
                        key={index}
                        onClick={() => handleSquareClick(index)}
                        className="aspect-square bg-neutral-800 border-2 border-neutral-700 rounded-lg text-4xl font-bold hover:border-blue-500 transition-all active:scale-95"
                      >
                        <span
                          className={
                            value === 'X'
                              ? 'text-blue-400'
                              : value === 'O'
                              ? 'text-pink-400'
                              : ''
                          }
                        >
                          {value}
                        </span>
                      </button>
                    ))}
                  </div>

                  {gameMode === 'finished' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handlePlayAgain}
                        className="flex-1 px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Play Again
                      </button>
                      <a href="/" className="flex-1">
                        <button className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
                          Back Home
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div>
            <div className="card-game space-y-4">
              <h3 className="text-xl font-bold">Score</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-700">
                  <span className="text-blue-400 font-semibold">{player1Name}</span>
                  <span className="text-2xl font-bold">{gameCount.player1}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-neutral-700">
                  <span className="text-pink-400 font-semibold">{player2Name}</span>
                  <span className="text-2xl font-bold">{gameCount.player2}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-semibold">Draws</span>
                  <span className="text-2xl font-bold">{gameCount.draws}</span>
                </div>
              </div>

              <button
                onClick={resetStats}
                className="w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                Reset Stats
              </button>
            </div>
          </div>
        </div>

        {/* Winner Modal */}
        {gameMode === 'finished' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border-2 border-green-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-pulse">
              <h2 className="text-4xl font-bold text-green-400">
                {winner ? 'Game Won!' : 'Game Draw!'}
              </h2>
              <p className="text-2xl text-white font-semibold">
                {winner ? (
                  <>
                    <span className={winner === 'X' ? 'text-blue-400' : 'text-pink-400'}>
                      {winner === 'X' ? player1Name : player2Name}
                    </span>
                    <span className="mx-2">wins!</span>
                  </>
                ) : (
                  "It's a tie!"
                )}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handlePlayAgain}
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
      </div>
    </main>
  );
}
