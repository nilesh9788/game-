'use client';

import { useState, useEffect } from 'react';

interface ChessBoardProps {
  selectedSquare: number | null;
  onSquareSelect: (square: number | null) => void;
  onGameEnd?: (winner: 'white' | 'black' | 'draw') => void;
}

type Piece = {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
} | null;

type Board = Piece[];

const INITIAL_BOARD: Board = [
  { type: 'rook', color: 'black' },
  { type: 'knight', color: 'black' },
  { type: 'bishop', color: 'black' },
  { type: 'queen', color: 'black' },
  { type: 'king', color: 'black' },
  { type: 'bishop', color: 'black' },
  { type: 'knight', color: 'black' },
  { type: 'rook', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  { type: 'pawn', color: 'black' },
  ...Array(32).fill(null),
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'rook', color: 'white' },
  { type: 'knight', color: 'white' },
  { type: 'bishop', color: 'white' },
  { type: 'queen', color: 'white' },
  { type: 'king', color: 'white' },
  { type: 'bishop', color: 'white' },
  { type: 'knight', color: 'white' },
  { type: 'rook', color: 'white' },
];

const getPieceIcon = (piece: Piece): string => {
  if (!piece) return '';
  const iconMap: Record<string, Record<string, string>> = {
    white: {
      pawn: 'P',
      rook: 'R',
      knight: 'N',
      bishop: 'B',
      queen: 'Q',
      king: 'K',
    },
    black: {
      pawn: 'P',
      rook: 'R',
      knight: 'N',
      bishop: 'B',
      queen: 'Q',
      king: 'K',
    },
  };
  return iconMap[piece.color][piece.type];
};

const getPieceColor = (piece: Piece): string => {
  if (!piece) return '';
  return piece.color === 'white' ? 'text-white' : 'text-gray-900';
};

const isLightSquare = (index: number): boolean => {
  const row = Math.floor(index / 8);
  const col = index % 8;
  return (row + col) % 2 === 0;
};

export default function ChessBoard({ selectedSquare, onSquareSelect, onGameEnd }: ChessBoardProps) {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (isWhiteTurn) {
        setWhiteTime(t => {
          if (t <= 1) {
            setGameOver(true);
            setWinner('Black wins! (White timeout)');
            onGameEnd?.('black');
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) {
            setGameOver(true);
            setWinner('White wins! (Black timeout)');
            onGameEnd?.('white');
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWhiteTurn, gameOver, onGameEnd]);

  const getValidMoves = (index: number, piece: Piece): number[] => {
    if (!piece) return [];

    const moves: number[] = [];
    const row = Math.floor(index / 8);
    const col = index % 8;

    if (piece.type === 'pawn') {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      const nextIndex = index + direction * 8;
      if (nextIndex >= 0 && nextIndex < 64 && !board[nextIndex]) {
        moves.push(nextIndex);
      }

      if (row === startRow) {
        const doubleIndex = index + direction * 16;
        if (!board[index + direction * 8] && !board[doubleIndex]) {
          moves.push(doubleIndex);
        }
      }

      [-1, 1].forEach(colOffset => {
        const captureIndex = index + direction * 8 + colOffset;
        if (
          captureIndex >= 0 &&
          captureIndex < 64 &&
          Math.abs(col - (captureIndex % 8)) === 1 &&
          board[captureIndex]
        ) {
          moves.push(captureIndex);
        }
      });
    } else if (piece.type === 'knight') {
      const knightMoves = [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 },
      ];
      knightMoves.forEach(({ row: dRow, col: dCol }) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const move = newRow * 8 + newCol;
          if (!board[move] || board[move]?.color !== piece.color) {
            moves.push(move);
          }
        }
      });
    } else if (piece.type === 'rook' || piece.type === 'bishop' || piece.type === 'queen') {
      const directions = 
        piece.type === 'rook' 
          ? [[0, 1], [0, -1], [1, 0], [-1, 0]]
          : piece.type === 'bishop'
          ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
          : [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      
      directions.forEach(([dRow, dCol]) => {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dRow * i;
          const newCol = col + dCol * i;
          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
          const move = newRow * 8 + newCol;
          if (!board[move]) {
            moves.push(move);
          } else if (board[move]?.color !== piece.color) {
            moves.push(move);
            break;
          } else {
            break;
          }
        }
      });
    } else if (piece.type === 'king') {
      for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
          if (dRow === 0 && dCol === 0) continue;
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const move = newRow * 8 + newCol;
            if (!board[move] || board[move]?.color !== piece.color) {
              moves.push(move);
            }
          }
        }
      }
    }

    return moves;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSquareClick = (index: number) => {
    if (gameOver) return;

    const piece = board[index];

    if (selectedSquare === null) {
      if (piece && piece.color === (isWhiteTurn ? 'white' : 'black')) {
        onSquareSelect(index);
        setValidMoves(getValidMoves(index, piece));
      }
    } else {
      if (index === selectedSquare) {
        onSquareSelect(null);
        setValidMoves([]);
      } else if (validMoves.includes(index)) {
        const capturedPiece = board[index];
        const newBoard = board.map((p, i) => (i === index ? board[selectedSquare] : i === selectedSquare ? null : p));
        
        // Track captured pieces
        if (capturedPiece) {
          if (capturedPiece.color === 'white') {
            setCapturedBlack([...capturedBlack, capturedPiece]);
          } else {
            setCapturedWhite([...capturedWhite, capturedPiece]);
          }
        }

        setBoard(newBoard);
        setIsWhiteTurn(!isWhiteTurn);
        onSquareSelect(null);
        setValidMoves([]);
      } else if (piece && piece.color === (isWhiteTurn ? 'white' : 'black')) {
        onSquareSelect(index);
        setValidMoves(getValidMoves(index, piece));
      } else {
        onSquareSelect(null);
        setValidMoves([]);
      }
    }
  };

  const handleResetBoard = () => {
    setBoard(INITIAL_BOARD);
    onSquareSelect(null);
    setValidMoves([]);
    setIsWhiteTurn(true);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameOver(false);
    setWinner(null);
    setWhiteTime(600);
    setBlackTime(600);
  };

  return (
    <div className="space-y-6">
      <div className="card-game space-y-4">
        {/* Timers */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isWhiteTurn ? 'bg-blue-900/50 border border-blue-700' : 'bg-neutral-800'}`}>
            <div className="text-sm text-neutral-400 mb-1">White Time</div>
            <div className={`text-2xl font-bold font-mono ${whiteTime < 60 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(whiteTime)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${!isWhiteTurn ? 'bg-blue-900/50 border border-blue-700' : 'bg-neutral-800'}`}>
            <div className="text-sm text-neutral-400 mb-1">Black Time</div>
            <div className={`text-2xl font-bold font-mono ${blackTime < 60 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(blackTime)}
            </div>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {gameOver ? (
              <span className="text-green-400">{winner}</span>
            ) : (
              isWhiteTurn ? 'White\'s Turn' : 'Black\'s Turn'
            )}
          </h3>
          <button
            onClick={handleResetBoard}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Chess Board */}
        <div className="inline-block border-4 border-neutral-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 gap-0 bg-neutral-900">
            {board.map((piece, index) => (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                disabled={gameOver}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold transition-all border border-neutral-600 ${
                  isLightSquare(index)
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-neutral-900'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                } ${selectedSquare === index ? 'ring-2 ring-inset ring-blue-400' : ''} ${
                  validMoves.includes(index)
                    ? 'ring-2 ring-inset ring-green-400'
                    : ''
                } ${gameOver ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <span className={getPieceColor(piece)}>
                  {getPieceIcon(piece)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-neutral-500">
          Click a piece to select it, then click a valid square to move.
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-game">
          <h4 className="text-sm font-semibold text-neutral-400 mb-2">White Captured</h4>
          <div className="flex flex-wrap gap-2 min-h-10">
            {capturedWhite.length === 0 ? (
              <span className="text-xs text-neutral-500">None</span>
            ) : (
              capturedWhite.map((piece, idx) => (
                <span key={idx} className="text-lg font-bold bg-neutral-800 px-2 py-1 rounded text-neutral-900">
                  {getPieceIcon(piece)}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="card-game">
          <h4 className="text-sm font-semibold text-neutral-400 mb-2">Black Captured</h4>
          <div className="flex flex-wrap gap-2 min-h-10">
            {capturedBlack.length === 0 ? (
              <span className="text-xs text-neutral-500">None</span>
            ) : (
              capturedBlack.map((piece, idx) => (
                <span key={idx} className="text-lg font-bold bg-neutral-800 px-2 py-1 rounded text-white">
                  {getPieceIcon(piece)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
