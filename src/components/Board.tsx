import React, { useState, useEffect, useCallback, useRef } from 'react';
import Cell from './Cell';
import { CellState, GameState } from '../types';
import { revealCell, toggleFlag, quickReveal } from '../utils/gameLogic';
import { showNotification } from '../utils/animations';

interface BoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameOver: (win: boolean) => void;
  onCellAction: () => void;
}

const Board: React.FC<BoardProps> = ({ 
  gameState, 
  setGameState, 
  onGameOver,
  onCellAction
}) => {
  const [focusPosition, setFocusPosition] = useState<[number, number] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Handle cell reveal
  const handleReveal = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'idle') {
      return;
    }
    
    // Call onCellAction before state updates to ensure timer starts
    onCellAction();

    // Clear any existing transition styles
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      (cell as HTMLElement).style.transition = '';
    });
    
    // Start game on first click
    if (gameState.firstClick) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        firstClick: false
      }));
    }
    
    const { updatedBoard, gameOver, win } = revealCell(gameState.board, row, col);
    
    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      gameStatus: gameOver ? 'lost' : win ? 'won' : 'playing'
    }));
    
    if (gameOver || win) {
      onGameOver(win);
    }
  }, [gameState, setGameState, onGameOver, onCellAction]);
  
  // Handle flag toggle
  const handleFlag = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'idle') {
      return;
    }

    // Call onCellAction before state updates to ensure timer starts
    onCellAction();
    
    // Start game on first action
    if (gameState.firstClick) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        firstClick: false
      }));
    }
    
    const { updatedBoard, flagsChanged } = toggleFlag(gameState.board, row, col);
    
    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      flagCount: prev.flagCount + flagsChanged
    }));
  }, [gameState, setGameState, onCellAction]);
  
  // Handle quick reveal (double click)
  const handleQuickReveal = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== 'playing') {
      return;
    }

    // Call onCellAction before state updates to ensure timer starts
    onCellAction();
    
    const { updatedBoard, gameOver, win } = quickReveal(gameState.board, row, col);
    
    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      gameStatus: gameOver ? 'lost' : win ? 'won' : 'playing'
    }));
    
    if (gameOver || win) {
      onGameOver(win);
    }
  }, [gameState, setGameState, onGameOver, onCellAction]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'idle') {
      return;
    }
    
    if (!focusPosition) {
      setFocusPosition([0, 0]);
      return;
    }
    
    const [row, col] = focusPosition;
    const rows = gameState.board.length;
    const cols = gameState.board[0].length;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusPosition([Math.max(0, row - 1), col]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusPosition([Math.min(rows - 1, row + 1), col]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusPosition([row, Math.max(0, col - 1)]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusPosition([row, Math.min(cols - 1, col + 1)]);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) {
          handleFlag(row, col);
        } else {
          handleReveal(row, col);
        }
        break;
      case 'f':
        e.preventDefault();
        handleFlag(row, col);
        break;
      case 'q':
        e.preventDefault();
        handleQuickReveal(row, col);
        break;
      default:
        break;
    }
  }, [focusPosition, gameState.board, gameState.gameStatus, handleFlag, handleQuickReveal, handleReveal]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Focus the board when it mounts
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, []);
  
  // Handle errors
  const handleError = (error: Error) => {
    console.error('Game error:', error);
    showNotification(`Error: ${error.message}`, 'error');
  };
  
  // Render the board with error boundary
  try {
    return (
      <div 
        className="game-board"
        ref={boardRef}
        tabIndex={-1}
        role="grid"
        aria-label="Minesweeper game board"
        style={{
          gridTemplateRows: `repeat(${gameState.board.length}, 1fr)`,
          gridTemplateColumns: `repeat(${gameState.board[0].length}, 1fr)`
        }}
      >
        {gameState.board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cellState={cell}
              row={rowIndex}
              col={colIndex}
              onReveal={handleReveal}
              onFlag={handleFlag}
              onQuickReveal={handleQuickReveal}
              gameOver={gameState.gameStatus === 'won' || gameState.gameStatus === 'lost'}
              isFocused={focusPosition ? focusPosition[0] === rowIndex && focusPosition[1] === colIndex : false}
            />
          ))
        )}
      </div>
    );
  } catch (error) {
    handleError(error as Error);
    return (
      <div className="error-boundary">
        <p>Something went wrong with the game board. Please try refreshing the page.</p>
      </div>
    );
  }
};

export default Board;