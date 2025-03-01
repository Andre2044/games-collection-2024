import { CellState, Difficulty, GameState } from '../types';

// Generate a new game board
export const generateBoard = (
  difficulty: Difficulty,
  firstClickRow?: number,
  firstClickCol?: number
): { board: CellState[][], mineCount: number } => {
  const { rows, cols, mines } = getDifficultySettings(difficulty);
  
  // Initialize empty board
  const board: CellState[][] = Array(rows)
    .fill(null)
    .map(() => 
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );
  
  // Place mines (avoiding first click if provided)
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    
    // Skip if this is the first click position or adjacent to it
    if (firstClickRow !== undefined && firstClickCol !== undefined) {
      if (
        Math.abs(row - firstClickRow) <= 1 && 
        Math.abs(col - firstClickCol) <= 1
      ) {
        continue;
      }
    }
    
    // Skip if already a mine
    if (board[row][col].isMine) {
      continue;
    }
    
    board[row][col].isMine = true;
    minesPlaced++;
  }
  
  // Calculate adjacent mines for each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].isMine) continue;
      
      let count = 0;
      // Check all 8 adjacent cells
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r === row && c === col) continue;
          if (board[r][c].isMine) count++;
        }
      }
      
      board[row][col].adjacentMines = count;
    }
  }
  
  return { board, mineCount: mines };
};

// Find a safe cell to reveal as a tip
export const findTipCell = (board: CellState[][]): [number, number] | null => {
  const rows = board.length;
  const cols = board[0].length;
  let bestCell: [number, number] | null = null;
  let bestScore = -1;
  
  // Helper to count revealed neighbors
  const countRevealedNeighbors = (row: number, col: number): number => {
    let count = 0;
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        if (r === row && c === col) continue;
        if (board[r][c].isRevealed) count++;
      }
    }
    return count;
  };
  
  // Find the best cell to reveal
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col];
      
      // Skip if cell is revealed, flagged, or contains a mine
      if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
      
      // Calculate score based on revealed neighbors
      const score = countRevealedNeighbors(row, col);
      
      // Prefer cells with more revealed neighbors
      if (score > bestScore) {
        bestScore = score;
        bestCell = [row, col];
      }
    }
  }
  
  return bestCell;
};

// Reveal a cell and handle cascading reveals for empty cells
export const revealCell = (
  board: CellState[][],
  row: number,
  col: number
): { updatedBoard: CellState[][], gameOver: boolean, win: boolean } => {
  const rows = board.length;
  const cols = board[0].length;
  
  // Clone the board to avoid direct mutations
  const updatedBoard = JSON.parse(JSON.stringify(board));
  
  // If cell is already revealed or flagged, do nothing
  if (updatedBoard[row][col].isRevealed || updatedBoard[row][col].isFlagged) {
    return { updatedBoard, gameOver: false, win: false };
  }
  
  // Reveal the cell
  updatedBoard[row][col].isRevealed = true;
  
  // Check if it's a mine
  if (updatedBoard[row][col].isMine) {
    return { updatedBoard, gameOver: true, win: false };
  }
  
  // If it's an empty cell (no adjacent mines), reveal adjacent cells
  if (updatedBoard[row][col].adjacentMines === 0) {
    const queue = [{ row, col }];
    
    while (queue.length > 0) {
      const { row: r, col: c } = queue.shift()!;
      
      // Check all 8 adjacent cells
      for (let nr = Math.max(0, r - 1); nr <= Math.min(rows - 1, r + 1); nr++) {
        for (let nc = Math.max(0, c - 1); nc <= Math.min(cols - 1, c + 1); nc++) {
          // Skip if already revealed or flagged
          if (updatedBoard[nr][nc].isRevealed || updatedBoard[nr][nc].isFlagged) {
            continue;
          }
          
          // Reveal this cell
          updatedBoard[nr][nc].isRevealed = true;
          
          // If it's also empty, add to queue
          if (updatedBoard[nr][nc].adjacentMines === 0) {
            queue.push({ row: nr, col: nc });
          }
        }
      }
    }
  }
  
  // Check if the game is won
  const win = checkWin(updatedBoard);
  
  return { updatedBoard, gameOver: false, win };
};

// Toggle flag on a cell
export const toggleFlag = (
  board: CellState[][],
  row: number,
  col: number
): { updatedBoard: CellState[][], flagsChanged: number } => {
  // Clone the board to avoid direct mutations
  const updatedBoard = JSON.parse(JSON.stringify(board));
  
  // If cell is already revealed, do nothing
  if (updatedBoard[row][col].isRevealed) {
    return { updatedBoard, flagsChanged: 0 };
  }
  
  // Toggle flag
  updatedBoard[row][col].isFlagged = !updatedBoard[row][col].isFlagged;
  const flagsChanged = updatedBoard[row][col].isFlagged ? 1 : -1;
  
  return { updatedBoard, flagsChanged };
};

// Quick reveal adjacent cells (for double-click)
export const quickReveal = (
  board: CellState[][],
  row: number,
  col: number
): { updatedBoard: CellState[][], gameOver: boolean, win: boolean } => {
  const rows = board.length;
  const cols = board[0].length;
  
  // If cell is not revealed or has no adjacent mines, do nothing
  if (!board[row][col].isRevealed || board[row][col].adjacentMines === 0) {
    return { updatedBoard: board, gameOver: false, win: false };
  }
  
  // Count flags around the cell
  let flagCount = 0;
  for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
      if (r === row && c === col) continue;
      if (board[r][c].isFlagged) flagCount++;
    }
  }
  
  // If flag count doesn't match adjacent mines, do nothing
  if (flagCount !== board[row][col].adjacentMines) {
    return { updatedBoard: board, gameOver: false, win: false };
  }
  
  // Clone the board to avoid direct mutations
  let updatedBoard = JSON.parse(JSON.stringify(board));
  let gameOver = false;
  
  // Reveal all non-flagged adjacent cells
  for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
      if (r === row && c === col) continue;
      if (!updatedBoard[r][c].isFlagged && !updatedBoard[r][c].isRevealed) {
        const result = revealCell(updatedBoard, r, c);
        updatedBoard = result.updatedBoard;
        if (result.gameOver) {
          gameOver = true;
        }
      }
    }
  }
  
  // Check if the game is won
  const win = checkWin(updatedBoard);
  
  return { updatedBoard, gameOver, win };
};

// Check if the game is won
export const checkWin = (board: CellState[][]): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      // If there's a non-mine cell that's not revealed, game is not won
      if (!board[row][col].isMine && !board[row][col].isRevealed) {
        return false;
      }
    }
  }
  return true;
};

// Reveal all mines (when game is over)
export const revealAllMines = (board: CellState[][]): CellState[][] => {
  const updatedBoard = JSON.parse(JSON.stringify(board));
  
  for (let row = 0; row < updatedBoard.length; row++) {
    for (let col = 0; col < updatedBoard[0].length; col++) {
      if (updatedBoard[row][col].isMine) {
        updatedBoard[row][col].isRevealed = true;
      }
    }
  }
  
  return updatedBoard;
};

// Get settings based on difficulty
export const getDifficultySettings = (difficulty: Difficulty): { rows: number, cols: number, mines: number } => {
  switch (difficulty) {
    case 'easy':
      return { rows: 8, cols: 8, mines: 10 };
    case 'medium':
      return { rows: 16, cols: 16, mines: 40 };
    case 'hard':
      return { rows: 16, cols: 30, mines: 99 };
    default:
      return { rows: 8, cols: 8, mines: 10 };
  }
};