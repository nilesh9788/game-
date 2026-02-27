'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Piece {
  id: number;
  position: number; // -1: home, 0-51: board, 52-57: home stretch, 58: finished
  x: number;
  y: number;
}

interface Player {
  color: string;
  name: string;
  pieces: Piece[];
  startPos: number; // Starting position on main board
  homeStretchStart: number; // Where home stretch begins for this player
}

// Board positions mapping: 52 positions on main path
// Player positions: Red=0, Blue=13, Green=26, Yellow=39
const PLAYERS_CONFIG = [
  { color: 'red', name: 'Red', startPos: 0, homeStretchStart: 52, bgColor: 'bg-red-600', lightColor: 'bg-red-500', accentColor: 'border-red-400' },
  { color: 'blue', name: 'Blue', startPos: 13, homeStretchStart: 56, bgColor: 'bg-blue-600', lightColor: 'bg-blue-500', accentColor: 'border-blue-400' },
  { color: 'green', name: 'Green', startPos: 26, homeStretchStart: 60, bgColor: 'bg-green-600', lightColor: 'bg-green-500', accentColor: 'border-green-400' },
  { color: 'yellow', name: 'Yellow', startPos: 39, homeStretchStart: 64, bgColor: 'bg-yellow-500', lightColor: 'bg-yellow-400', accentColor: 'border-yellow-400' },
];

// Safe positions on the board (star positions)
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

export default function LudoPage() {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>(
    PLAYERS_CONFIG.map(config => ({
      color: config.color,
      name: config.name,
      startPos: config.startPos,
      homeStretchStart: config.homeStretchStart,
      pieces: Array(4).fill(0).map((_, i) => ({
        id: i,
        position: -1,
        x: 0,
        y: 0,
      })),
    }))
  );
  
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<{ playerIdx: number; pieceIdx: number } | null>(null);

  const startGame = () => {
    setGameMode('playing');
    setDiceValue(0);
    setCurrentPlayer(0);
    setGameLog(['Game started!']);
  };

  const canMovePiece = (playerIdx: number, pieceIdx: number, diceValue: number): boolean => {
    const piece = players[playerIdx].pieces[pieceIdx];
    
    // Can't move if piece is finished
    if (piece.position >= 58) return false;
    
    // Can only move from home with 6
    if (piece.position === -1 && diceValue !== 6) return false;
    
    // Can move if on board
    if (piece.position >= 0 && piece.position < 58) return true;
    
    return diceValue === 6;
  };

  const getNewPosition = (playerIdx: number, pieceIdx: number, diceValue: number): number => {
    const piece = players[playerIdx].pieces[pieceIdx];
    
    // If at home, move to start position when rolling 6
    if (piece.position === -1) {
      return PLAYERS_CONFIG[playerIdx].startPos;
    }
    
    // Move on board
    return piece.position + diceValue;
  };

  const rollDice = () => {
    if (gameMode !== 'playing' || diceValue > 0) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    setSelectedPiece(null);

    const newPlayers = JSON.parse(JSON.stringify(players));
    const currentPlayerData = newPlayers[currentPlayer];
    const newLog = [...gameLog];

    // Try to move a piece
    let moveMade = false;
    let pieceMoved = -1;

    // Prioritize moving pieces already on the board
    for (let i = 0; i < currentPlayerData.pieces.length; i++) {
      const piece = currentPlayerData.pieces[i];
      if (piece.position >= 0 && piece.position < 58) {
        const newPos = piece.position + roll;
        if (newPos <= 58) {
          piece.position = newPos;
          moveMade = true;
          pieceMoved = i;
          break;
        }
      }
    }

    // If no piece moved and rolled 6, send a piece from home
    if (!moveMade && roll === 6) {
      for (let i = 0; i < currentPlayerData.pieces.length; i++) {
        if (currentPlayerData.pieces[i].position === -1) {
          currentPlayerData.pieces[i].position = PLAYERS_CONFIG[currentPlayer].startPos;
          moveMade = true;
          pieceMoved = i;
          newLog.push(`Piece ${i + 1} sent to board!`);
          break;
        }
      }
    }

    // If still no move possible, try any available piece
    if (!moveMade && roll !== 6) {
      for (let i = 0; i < currentPlayerData.pieces.length; i++) {
        const piece = currentPlayerData.pieces[i];
        if (piece.position >= 0 && piece.position < 58) {
          const newPos = piece.position + roll;
          if (newPos <= 58) {
            piece.position = newPos;
            moveMade = true;
            pieceMoved = i;
            break;
          }
        }
      }
    }

    setPlayers(newPlayers);
    newLog.push(`${PLAYERS_CONFIG[currentPlayer].name} rolled ${roll}`);
    setGameLog(newLog);

    // Check for winner
    const allFinished = currentPlayerData.pieces.every((p: Piece) => p.position >= 58);
    if (allFinished) {
      setGameWinner(PLAYERS_CONFIG[currentPlayer].name);
      setGameMode('finished');
      newLog.push(`${PLAYERS_CONFIG[currentPlayer].name} wins!`);
      return;
    }

    // Next turn logic: get another roll if 6, otherwise next player
    setTimeout(() => {
      if (roll === 6) {
        setDiceValue(0);
        // Same player rolls again
      } else {
        setDiceValue(0);
        setCurrentPlayer((currentPlayer + 1) % 4);
      }
    }, 500);
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers(
      PLAYERS_CONFIG.map(config => ({
        color: config.color,
        name: config.name,
        startPos: config.startPos,
        homeStretchStart: config.homeStretchStart,
        pieces: Array(4).fill(0).map((_, i) => ({
          id: i,
          position: -1,
          x: 0,
          y: 0,
        })),
      }))
    );
    setCurrentPlayer(0);
    setDiceValue(0);
    setGameWinner(null);
    setGameLog([]);
  };

  const renderBoardSquare = (position: number) => {
    const piecesAtPosition: JSX.Element[] = [];
    
    players.forEach((player, playerIdx) => {
      player.pieces.forEach((piece, pieceIdx) => {
        if (piece.position === position) {
          const config = PLAYERS_CONFIG[playerIdx];
          piecesAtPosition.push(
            <div
              key={`${playerIdx}-${pieceIdx}`}
              className={`w-5 h-5 rounded-full ${config.bgColor} border-2 border-white cursor-pointer hover:ring-2 hover:ring-yellow-300`}
              onClick={() => {
                if (gameMode === 'playing' && diceValue > 0 && currentPlayer === playerIdx) {
                  setSelectedPiece({ playerIdx, pieceIdx });
                }
              }}
            />
          );
        }
      });
    });

    const isSafe = SAFE_POSITIONS.includes(position);
    return (
      <div
        key={position}
        className={`w-8 h-8 flex items-center justify-center border border-neutral-300 text-xs font-bold ${
          isSafe ? 'bg-neutral-700' : 'bg-white'
        } relative`}
      >
        {isSafe && <span className="text-yellow-400">X</span>}
        <div className="absolute flex flex-wrap gap-0.5">
          {piecesAtPosition}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            Back to GameHub
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Ludo Game</h1>

        {gameMode === 'setup' ? (
          <div className="card-game max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Ready to Play?</h2>
            <p className="text-neutral-400">4-Player Ludo Game</p>
            <p className="text-sm text-neutral-500">Roll the dice, move your pieces around the board, and be the first to get all pieces home!</p>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Board */}
            <div className="card-game">
              <div className="grid grid-cols-4 gap-8 mb-8">
                {/* Player Status */}
                {PLAYERS_CONFIG.map((config, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      currentPlayer === idx ? `${config.accentColor} border-2 ring-2 ring-yellow-300` : 'border-neutral-700'
                    }`}
                  >
                    <h3 className="font-bold mb-2">{config.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {players[idx].pieces.map((piece, pieceIdx) => (
                        <div
                          key={pieceIdx}
                          className={`p-2 rounded text-xs text-center font-bold ${config.bgColor}`}
                        >
                          {piece.position === -1 ? 'H' : piece.position >= 58 ? 'W' : piece.position}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ludo Board Visual */}
              <div className="bg-neutral-800 p-8 rounded-lg overflow-x-auto">
                <div className="inline-block">
                  <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(13, minmax(32px, 1fr))' }}>
                    {/* Top row */}
                    {Array.from({ length: 52 }, (_, i) => renderBoardSquare(i))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="card-game max-w-md mx-auto space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{PLAYERS_CONFIG[currentPlayer].name}'s Turn</h3>
              </div>

              <div className="flex justify-center">
                <div className={`w-24 h-24 flex items-center justify-center text-5xl font-bold rounded-lg border-4 ${
                  diceValue > 0 
                    ? `${PLAYERS_CONFIG[currentPlayer].bgColor} text-white border-yellow-400`
                    : 'bg-neutral-800 border-neutral-600 text-neutral-600'
                }`}>
                  {diceValue || '-'}
                </div>
              </div>

              <button
                onClick={rollDice}
                disabled={gameMode === 'finished' || diceValue > 0}
                className="w-full px-6 py-4 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Roll Dice
              </button>

              {/* Game Log */}
              {gameLog.length > 0 && (
                <div className="border-t border-neutral-700 pt-4">
                  <h4 className="text-sm font-semibold mb-2 text-neutral-400">Recent Actions</h4>
                  <div className="bg-neutral-800/50 rounded p-3 max-h-32 overflow-y-auto text-xs text-neutral-300 space-y-1">
                    {gameLog.slice(-5).reverse().map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameMode === 'finished' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="card-game max-w-md w-full mx-4 text-center space-y-6">
              <h2 className="text-3xl font-bold">Game Over!</h2>
              <p className="text-xl text-green-400">{gameWinner} wins!</p>
              <button
                onClick={resetGame}
                className="w-full px-6 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
