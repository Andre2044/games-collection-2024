import React, { useRef, useEffect } from 'react';
import { CellState } from '../types';
import { animateCellReveal, animateFlagToggle, animateMineExplosion } from '../utils/animations';

interface CellProps {
  cellState: CellState;
  row: number;
  col: number;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onQuickReveal: (row: number, col: number) => void;
  gameOver: boolean;
  isFocused: boolean;
}

const Cell: React.FC<CellProps> = ({
  cellState,
  row,
  col,
  onReveal,
  onFlag,
  onQuickReveal,
  gameOver,
  isFocused
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const wasRevealed = useRef<boolean>(cellState.isRevealed);
  const wasFlagged = useRef<boolean>(cellState.isFlagged);
  
  // Get cell content based on state
  const getCellContent = () => {
    if (cellState.isFlagged) {
      return '🚩';
    }
    
    if (!cellState.isRevealed) {
      return '';
    }
    
    if (cellState.isMine) {
      return '💣';
    }
    
    if (cellState.adjacentMines === 0) {
      return '';
    }
    
    return cellState.adjacentMines.toString();
  };
  
  // Get cell color based on adjacent mines
  const getCellColor = () => {
    if (!cellState.isRevealed || cellState.adjacentMines === 0) {
      return '';
    }
    
    const colors = [
      '', // No color for 0
      '#2196F3', // 1: Blue
      '#4CAF50', // 2: Green
      '#F44336', // 3: Red
      '#9C27B0', // 4: Purple
      '#FF9800', // 5: Orange
      '#795548', // 6: Brown
      '#607D8B', // 7: Blue-grey
      '#E91E63'  // 8: Pink
    ];
    
    return colors[cellState.adjacentMines];
  };
  
  // Handle animations when cell state changes
  useEffect(() => {
    if (cellRef.current) {
      // Animate cell reveal
      if (cellState.isRevealed && !wasRevealed.current) {
        if (cellState.isMine) {
          animateMineExplosion(cellRef.current);
        } else {
          animateCellReveal(cellRef.current);
        }
      }
      
      // Animate flag toggle
      if (cellState.isFlagged !== wasFlagged.current) {
        animateFlagToggle(cellRef.current);
      }
    }
    
    wasRevealed.current = cellState.isRevealed;
    wasFlagged.current = cellState.isFlagged;
  }, [cellState.isRevealed, cellState.isFlagged, cellState.isMine]);
  
  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Right click to flag
    if (e.button === 2) {
      onFlag(row, col);
      return;
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Left click to reveal
    if (e.button === 0) {
      onReveal(row, col);
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickReveal(row, col);
  };
  
  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Start long press timer for flagging
    longPressTimer.current = setTimeout(() => {
      onFlag(row, col);
      longPressTimer.current = null;
    }, 300);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // If not a long press, treat as a reveal
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onReveal(row, col);
    }
  };
  
  const handleTouchMove = () => {
    // Cancel long press if finger moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);
  
  // Get cell class names
  const getCellClassNames = () => {
    const classNames = ['cell'];
    
    if (cellState.isRevealed) {
      classNames.push('revealed');
      
      if (cellState.isMine) {
        classNames.push('mine');
      } else if (cellState.adjacentMines === 0) {
        classNames.push('empty');
      }
    }
    
    if (cellState.isFlagged) {
      classNames.push('flagged');
    }
    
    if (isFocused) {
      classNames.push('focused');
    }
    
    return classNames.join(' ');
  };
  
  // Get ARIA label for accessibility
  const getAriaLabel = () => {
    if (cellState.isFlagged) {
      return `Flagged cell at row ${row + 1}, column ${col + 1}`;
    }
    
    if (!cellState.isRevealed) {
      return `Unrevealed cell at row ${row + 1}, column ${col + 1}`;
    }
    
    if (cellState.isMine) {
      return `Mine at row ${row + 1}, column ${col + 1}`;
    }
    
    if (cellState.adjacentMines === 0) {
      return `Empty cell at row ${row + 1}, column ${col + 1}`;
    }
    
    return `Cell with ${cellState.adjacentMines} adjacent mines at row ${row + 1}, column ${col + 1}`;
  };
  
  return (
    <div
      ref={cellRef}
      className={getCellClassNames()}
      style={{ color: getCellColor() }}
      onClick={handleClick}
      onContextMenu={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      tabIndex={gameOver ? -1 : 0}
      role="button"
      aria-label={getAriaLabel()}
      data-row={row}
      data-col={col}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;