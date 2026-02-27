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
  colorCode: string;
  textColor: string;
  name: string;
  pieces: Piece[];
}

const BOARD_POSITIONS = 52; // 52 positions on the board
const HOME_STRETCH = 6; // 6 positions before winning

export default function LudoPage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { color: 'red', colorCode: 'bg-red-600', textColor: 'text-red-600', name: 'Red', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })) },
    { color: 'blue', colorCode: 'bg-blue-600', textColor: 'text-blue-600', name: 'Blue', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })) },
    { color: 'green', colorCode: 'bg-green-600', textColor: 'text-green-600', name: 'Green', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })) },
    { color: 'yellow', colorCode: 'bg-yellow-500', textColor: 'text-yellow-600', name: 'Yellow', pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false })) },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{ playerIdx: number; pieceIdx: number } | null>(null);

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayer(0);
  };

  const rollDice = () => {
    if (gameMode !== 'playing') return;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayerData = newPlayers[currentPlayer];

    // Check if player can move a piece
    let canMove = false;

    // Try to move an existing piece on board
    for (let i = 0; i < currentPlayerData.pieces.length; i++) {
      const piece = currentPlayerData.pieces[i];
      if (!piece.finished && piece.position >= 0) {
        const newPos = piece.position + roll;
        if (newPos <= BOARD_POSITIONS + HOME_STRETCH) {
          piece.position = newPos;
          if (newPos === BOARD_POSITIONS + HOME_STRETCH) {
            piece.finished = true;
          }
          canMove = true;
          break;
        }
      }
    }

    // If rolling a 6, send a piece from home
    if (roll === 6 && !canMove) {
      for (const piece of currentPlayerData.pieces) {
        if (piece.position === -1) {
          piece.position = 0;
          canMove = true;
          break;
        }
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

    // Move to next player (unless rolled a 6)
    if (roll !== 6) {
      setCurrentPlayer((currentPlayer + 1) % 4);
    }
    setTimeout(() => setDiceValue(0), 1500);
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers(players.map(p => ({
      ...p,
      pieces: Array(4).fill(0).map((_, i) => ({ id: i, position: -1, finished: false }))
    })));
    setCurrentPlayer(0);
    setDiceValue(0);
    setGameWinner(null);
    setSelectedPiece(null);
  };

  const getBoardPosition = (boardIndex: number): { x: number; y: number } => {
    // Create a square board path
    const boardSize = 52;
    const sideSize = 13; // 13 squares per side
    
    if (boardIndex < sideSize) {
      // Top side (left to right)
      return { x: boardIndex * 30, y: 0 };
    } else if (boardIndex < sideSize * 2) {
      // Right side (top to bottom)
      return { x: (sideSize - 1) * 30, y: (boardIndex - sideSize) * 30 };
    } else if (boardIndex < sideSize * 3) {
      // Bottom side (right to left)
      return { x: (sideSize - 1 - (boardIndex - sideSize * 2)) * 30, y: (sideSize - 1) * 30 };
    } else {
      // Left side (bottom to top)
      return { x: 0, y: (sideSize - 1 - (boardIndex - sideSize * 3)) * 30 };
    }
  };

  const getPiecePositionStyle = (position: number) => {
    if (position === -1) return {}; // Home position handled separately
    if (position > BOARD_POSITIONS) {
      // Home stretch - show in center
      return { bottom: `${20 + (position - BOARD_POSITIONS) * 25}px` };
    }
    const boardPos = getBoardPosition(position % BOARD_POSITIONS);
    return {
      left: `${boardPos.x}px`,
      top: `${boardPos.y}px`
    };
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="mb-8 inline-block px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-2 text-center">Ludo Game</h1>
        <p className="text-center text-neutral-400 mb-8">Race your 4 pieces around the board to win</p>

        {gameWinner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border-2 border-green-500 rounded-xl p-8 max-w-md w-full text-center space-y-6">
              <h2 className="text-4xl font-bold text-green-400">Game Over</h2>
              <p className="text-2xl text-white font-semibold">{gameWinner} Player Wins</p>
              <div className="space-y-3">
                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all"
                >
                  Play Again
                </button>
                <Link href="/">
                  <button className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Game Setup</h2>
            <p className="text-neutral-400">4 Players: Red, Blue, Green, Yellow</p>
            <p className="text-neutral-400">Move all 4 pieces around the board to reach the finish</p>
            <p className="text-sm text-neutral-500">Roll a 6 to send a piece from home. First to finish all pieces wins!</p>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Board */}
            <div className="card-game">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ludo Board */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-bold">Game Board</h3>
                  <div className="bg-neutral-800 rounded-lg p-8 relative min-h-96">
                    {/* Board squares background */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
                      {Array(52).fill(0).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded border border-neutral-700 bg-neutral-700/50 flex items-center justify-center text-xs text-neutral-600"
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* Pieces on board */}
                    {players.map((player, playerIdx) =>
                      player.pieces.map((piece, pieceIdx) => (
                        piece.position >= 0 && (
                          <div
                            key={`${playerIdx}-${pieceIdx}`}
                            className={`absolute w-6 h-6 rounded-full ${player.colorCode} border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform`}
                            style={{
                              ...getPiecePositionStyle(piece.position),
                              transform: `translate(-50%, -50%)`
                            }}
                          >
                            {pieceIdx + 1}
                          </div>
                        )
                      ))
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Home Positions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Home Positions</h3>
                    {players.map((player, playerIdx) => (
                      <div key={playerIdx} className="mb-6 p-4 rounded-lg bg-neutral-800">
                        <h4 className={`font-bold mb-3 ${player.textColor}`}>{player.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {player.pieces.map((piece, pieceIdx) => (
                            <div
                              key={pieceIdx}
                              className={`p-2 rounded text-center font-bold text-white ${
                                piece.position === -1
                                  ? `${player.colorCode} border-2 border-white`
                                  : 'bg-neutral-700 opacity-50'
                              }`}
                            >
                              P{pieceIdx + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Player Status */}
                  <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-700">
                    <p className="text-sm text-neutral-400 mb-2">Current Turn</p>
                    <p className="text-2xl font-bold text-blue-400">{players[currentPlayer].name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dice and Controls */}
            <div className="card-game max-w-md mx-auto space-y-6 text-center">
              <div className="flex justify-center">
                <div className={`w-32 h-32 flex items-center justify-center text-6xl font-bold rounded-xl border-4 transition-all ${
                  diceValue
                    ? `${players[currentPlayer].colorCode} border-blue-400 text-white`
                    : 'bg-neutral-800 border-neutral-600 text-neutral-600'
                }`}>
                  {diceValue || '-'}
                </div>
              </div>

              <button
                onClick={rollDice}
                className="w-full px-6 py-4 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all text-lg"
              >
                Roll Dice
              </button>

              <div className="grid grid-cols-4 gap-2 text-xs">
                {players.map((player, idx) => {
                  const finishedCount = player.pieces.filter(p => p.finished).length;
                  return (
                    <div key={idx} className="p-2 rounded bg-neutral-800">
                      <div className={`font-bold ${player.textColor}`}>{player.name}</div>
                      <div className="text-neutral-400">{finishedCount}/4 done</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
