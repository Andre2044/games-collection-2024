import React, { useState, useCallback, useRef, useEffect } from 'react';

interface GridCellProps {
  row: number;
  col: number;
  content: string;
  isRevealed: boolean;
  onCellClick: (row: number, col: number) => void;
  onTimerStart: () => void;
}

const GridCell: React.FC<GridCellProps> = ({
  row,
  col,
  content,
  isRevealed,
  onCellClick,
  onTimerStart
}) => {
  // Track cell state
  const [isVisible, setIsVisible] = useState(isRevealed);
  const clickLock = useRef(false);
  const mountedRef = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Update visibility when revealed prop changes
  useEffect(() => {
    setIsVisible(isRevealed);
  }, [isRevealed]);
  
  // Handle cell click with debouncing and state synchronization
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Prevent rapid clicks
    if (clickLock.current) {
      return;
    }
    
    try {
      // Lock to prevent multiple rapid clicks
      clickLock.current = true;
      
      // Start timer first to ensure it's running
      onTimerStart();
      
      // Reveal cell immediately
      setIsVisible(true);
      
      // Notify parent of cell click
      onCellClick(row, col);
      
      // Release lock after a short delay
      setTimeout(() => {
        if (mountedRef.current) {
          clickLock.current = false;
        }
      }, 100);
      
    } catch (error) {
      console.error('Error handling cell click:', error);
      // Release lock on error
      clickLock.current = false;
    }
  }, [row, col, onCellClick, onTimerStart]);
  
  return (
    <div
      className={`grid-cell ${isVisible ? 'revealed' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}`}
      aria-pressed={isVisible}
      data-row={row}
      data-col={col}
    >
      {isVisible ? content : ''}
    </div>
  );
};

export default React.memo(GridCell);