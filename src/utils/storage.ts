import { GameState, Difficulty } from '../types';

const STORAGE_KEY = 'minesweeper-state';
const HIGH_SCORES_KEY = 'minesweeper-high-scores';

// Save game state to localStorage
export const saveGameState = (gameState: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

// Load game state from localStorage
export const loadGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return null;
    }
    
    const parsedState = JSON.parse(savedState);
    
    // Validate the parsed state has required properties
    if (!parsedState || 
        !Array.isArray(parsedState.board) || 
        typeof parsedState.difficulty !== 'string' ||
        typeof parsedState.gameStatus !== 'string' ||
        typeof parsedState.mineCount !== 'number' ||
        typeof parsedState.flagCount !== 'number' ||
        typeof parsedState.timer !== 'number' ||
        typeof parsedState.firstClick !== 'boolean') {
      console.warn('Invalid saved game state structure');
      return null;
    }
    
    return parsedState as GameState;
  } catch (error) {
    console.warn('Failed to load game state, starting new game');
    return null;
  }
};

// Clear saved game state
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

// Save high score
export const saveHighScore = (difficulty: Difficulty, time: number): boolean => {
  try {
    const highScores = getHighScores();
    const currentBest = highScores[difficulty];
    
    // Only save if it's better than the current best
    if (!currentBest || time < currentBest) {
      highScores[difficulty] = time;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save high score:', error);
    return false;
  }
};

// Get all high scores
export const getHighScores = (): Record<Difficulty, number | null> => {
  try {
    const savedScores = localStorage.getItem(HIGH_SCORES_KEY);
    if (!savedScores) {
      return {
        easy: null,
        medium: null,
        hard: null
      };
    }
    return JSON.parse(savedScores) as Record<Difficulty, number | null>;
  } catch (error) {
    console.error('Failed to get high scores:', error);
    return {
      easy: null,
      medium: null,
      hard: null
    };
  }
};

// Format time in seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};