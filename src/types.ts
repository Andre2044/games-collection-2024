// Game difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Cell state
export interface CellState {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

// Game state
export interface GameState {
  board: CellState[][];
  difficulty: Difficulty;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  mineCount: number;
  flagCount: number;
  timer: number;
  firstClick: boolean;
}

// Theme options
export type Theme = 'light' | 'dark';