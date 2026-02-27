/**
 * Game Utilities
 * Shared functions for all games
 */

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getPieceLabel = (type: string): string => {
  const labels: Record<string, string> = {
    pawn: 'P',
    rook: 'R',
    knight: 'N',
    bishop: 'B',
    queen: 'Q',
    king: 'K',
  };
  return labels[type] || '?';
};

export const getGameUrl = (gameId: string): string => {
  return `/games/${gameId}`;
};

export const checkWinCondition = (board: (string | null)[]): string | null => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i * 3] &&
      board[i * 3] === board[i * 3 + 1] &&
      board[i * 3] === board[i * 3 + 2]
    ) {
      return board[i * 3];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[i] &&
      board[i] === board[i + 3] &&
      board[i] === board[i + 6]
    ) {
      return board[i];
    }
  }

  // Check diagonals
  if (
    board[0] &&
    board[0] === board[4] &&
    board[0] === board[8]
  ) {
    return board[0];
  }

  if (
    board[2] &&
    board[2] === board[4] &&
    board[2] === board[6]
  ) {
    return board[2];
  }

  return null;
};
