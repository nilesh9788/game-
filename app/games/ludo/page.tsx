'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Piece {
  id: number;
  position: number; // -1: home, 0-51: main board, 52-57: home stretch, 58: finished
}

interface Player {
  color: string;
  name: string;
  pieces: Piece[];
  homeColor: string;
  boardColor: string;
}

// Safe positions on board (where pieces can't be captured)
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

const PLAYERS: Player[] = [
  {
    color: 'red',
    name: 'Red',
    pieces: [],
    homeColor: 'bg-red-600',
    boardColor: 'bg-red-500',
  },
  {
    color: 'blue',
    name: 'Blue',
    pieces: [],
    homeColor: 'bg-blue-600',
    boardColor: 'bg-blue-500',
  },
  {
    color: 'green',
    name: 'Green',
    pieces: [],
    homeColor: 'bg-green-600',
    boardColor: 'bg-green-500',
  },
  {
    color: 'yellow',
    name: 'Yellow',
    pieces: [],
    homeColor: 'bg-yellow-500',
    boardColor: 'bg-yellow-400',
  },
];

// Helper function to calculate piece position on grid
const getBoardPosition = (index: number, col: number, row: number) => {
  return { x: col, y: row };
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

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayerIdx(0);
    setGameLog(['Game started!']);
  };

  const rollDice = () => {
    if (gameMode !== 'playing') return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayer = newPlayers[currentPlayerIdx];
    const newLog = [...gameLog];

    let pieceMoved = false;

    // Try moving a piece that's already on board
    for (let i = 0; i < currentPlayer.pieces.length; i++) {
      const piece = currentPlayer.pieces[i];
      if (piece.position >= 0 && piece.position < 58) {
        const newPos = piece.position + roll;
        if (newPos <= 58) {
          piece.position = newPos;
          pieceMoved = true;
          if (newPos === 58) {
            newLog.push(`${currentPlayer.name} - Piece ${i + 1} finished!`);
          }
          break;
        }
      }
    }

    // If no piece moved and rolled 6, move piece from home
    if (!pieceMoved && roll === 6) {
      for (const piece of currentPlayer.pieces) {
        if (piece.position === -1) {
          piece.position = 0;
          pieceMoved = true;
          newLog.push(`${currentPlayer.name} - Piece sent to board!`);
          break;
        }
      }
    }

    setPlayers(newPlayers);
    newLog.push(`${currentPlayer.name} rolled ${roll}`);
    setGameLog(newLog);

    // Check if current player won
    const allFinished = currentPlayer.pieces.every(p => p.position === 58);
    if (allFinished) {
      setGameWinner(currentPlayer.name);
      setGameMode('finished');
      newLog.push(`🎉 ${currentPlayer.name} wins!`);
      setGameLog(newLog);
      return;
    }

    // Move to next player if didn't roll 6
    if (roll !== 6) {
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
  };

  // Render board squares for main path
  const renderBoardSquare = (position: number) => {
    let playerPieces: (Player & { pieceIndex: number })[] = [];
    players.forEach(player => {
      player.pieces.forEach((piece, idx) => {
        if (piece.position === position) {
          playerPieces.push({ ...player, pieceIndex: idx });
        }
      });
    });

    const isSafe = SAFE_POSITIONS.includes(position);

    return (
      <div
        key={`board-${position}`}
        className={`w-12 h-12 border border-neutral-400 flex items-center justify-center flex-wrap gap-0.5 ${
          isSafe
            ? 'bg-yellow-200 border-yellow-400'
            : position % 2 === 0
            ? 'bg-white'
            : 'bg-neutral-100'
        }`}
      >
        {playerPieces.map((player, idx) => (
          <div
            key={`${player.color}-${player.pieceIndex}`}
            className={`w-4 h-4 rounded-full ${player.boardColor} border border-white`}
          />
        ))}
        {isSafe && playerPieces.length === 0 && (
          <span className="text-xs text-yellow-600">★</span>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-900 p-4 md:p-8">
      <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-4xl font-bold text-white mb-8">Ludo Game</h1>

      {gameMode === 'setup' ? (
        <div className="card-game max-w-md mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Welcome to Ludo</h2>
          <p className="text-neutral-400">
            4 Players. Roll a 6 to move a piece from home. First player to move all pieces to center wins!
          </p>
          <button
            onClick={startGame}
            className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Ludo Board */}
          <div className="card-game overflow-x-auto flex justify-center">
            <div className="w-fit">
              {/* Top Section */}
              <div className="flex gap-0">
                {/* Red Home Area */}
                <div className="w-32 h-32 bg-red-600 flex flex-wrap items-center justify-center gap-2 p-4">
                  {players[0].pieces.map((piece, idx) => (
                    <div
                      key={`red-home-${idx}`}
                      className={`w-6 h-6 rounded-full ${
                        piece.position === -1 ? 'bg-red-700 border-2 border-white' : 'opacity-30 bg-red-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Top Center Path */}
                <div className="flex gap-0 bg-white">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => renderBoardSquare(i))}
                </div>

                {/* Blue Home Area */}
                <div className="w-32 h-32 bg-blue-600 flex flex-wrap items-center justify-center gap-2 p-4">
                  {players[1].pieces.map((piece, idx) => (
                    <div
                      key={`blue-home-${idx}`}
                      className={`w-6 h-6 rounded-full ${
                        piece.position === -1 ? 'bg-blue-400 border-2 border-white' : 'opacity-30 bg-blue-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Middle Section */}
              <div className="flex gap-0">
                {/* Left Path */}
                <div className="flex flex-col gap-0 bg-white">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => renderBoardSquare(6 + i))}
                </div>

                {/* Center Diamond */}
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">HOME</div>
                </div>

                {/* Right Path */}
                <div className="flex flex-col gap-0 bg-white">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => renderBoardSquare(12 + i))}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex gap-0">
                {/* Green Home Area */}
                <div className="w-32 h-32 bg-green-600 flex flex-wrap items-center justify-center gap-2 p-4">
                  {players[2].pieces.map((piece, idx) => (
                    <div
                      key={`green-home-${idx}`}
                      className={`w-6 h-6 rounded-full ${
                        piece.position === -1 ? 'bg-green-400 border-2 border-white' : 'opacity-30 bg-green-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Bottom Center Path */}
                <div className="flex gap-0 bg-white">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => renderBoardSquare(18 + i))}
                </div>

                {/* Yellow Home Area */}
                <div className="w-32 h-32 bg-yellow-500 flex flex-wrap items-center justify-center gap-2 p-4">
                  {players[3].pieces.map((piece, idx) => (
                    <div
                      key={`yellow-home-${idx}`}
                      className={`w-6 h-6 rounded-full ${
                        piece.position === -1
                          ? 'bg-yellow-600 border-2 border-white'
                          : 'opacity-30 bg-yellow-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Status */}
            <div className="card-game space-y-4">
              <h3 className="font-bold">Players Status</h3>
              {players.map((player, idx) => (
                <div
                  key={player.color}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    idx === currentPlayerIdx
                      ? `${player.homeColor} border-white`
                      : 'bg-neutral-800 border-neutral-700'
                  }`}
                >
                  <p className="font-bold text-white text-sm">{player.name}</p>
                  <p className="text-xs text-neutral-200">
                    {player.pieces.filter(p => p.position === 58).length}/4 home
                  </p>
                </div>
              ))}
            </div>

            {/* Dice and Actions */}
            <div className="card-game space-y-4 text-center">
              <h3 className="font-bold">
                {players[currentPlayerIdx].name}'s Turn
              </h3>
              <div className="flex justify-center">
                <div
                  className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg border-4 ${
                    diceValue
                      ? `${players[currentPlayerIdx].homeColor} border-white text-white`
                      : 'bg-neutral-800 border-neutral-600 text-neutral-500'
                  }`}
                >
                  {diceValue || '-'}
                </div>
              </div>
              <button
                onClick={rollDice}
                disabled={gameMode === 'finished'}
                className="w-full px-4 py-2 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50"
              >
                Roll Dice
              </button>
            </div>

            {/* Game Log */}
            <div className="card-game space-y-2">
              <h3 className="font-bold">Game Log</h3>
              <div className="bg-neutral-800 rounded p-3 max-h-40 overflow-y-auto text-xs text-neutral-300 space-y-1">
                {gameLog.length === 0 ? (
                  <p className="text-neutral-500">Waiting...</p>
                ) : (
                  gameLog
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((log, idx) => (
                      <div key={idx} className="border-b border-neutral-700 pb-1">
                        {log}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Finished State */}
          {gameMode === 'finished' && gameWinner && (
            <div className="card-game space-y-4 text-center max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-green-400">Game Over!</h2>
              <p className="text-2xl font-bold text-white">{gameWinner} Wins!</p>
              <button
                onClick={resetGame}
                className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
