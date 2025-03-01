import React, { useCallback, useState, useRef } from 'react';
import GridCell from './GridCell';

interface GridProps {
  rows: number;
  cols: number;
  initialContent: string[][];
}

const Grid: React.FC<GridProps> = ({ rows, cols, initialContent }) => {
  // Track timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  
  // Track revealed cells
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(
    Array(rows).fill(null).map(() => Array(cols).fill(false))
  );
  
  // Start timer
  const startTimer = useCallback(() => {
    if (!isTimerRunning && !timerRef.current) {
      setIsTimerRunning(true);
      timerRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
  }, [isTimerRunning]);
  
  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    try {
      setRevealedCells(prev => {
        const newRevealed = [...prev];
        newRevealed[row][col] = true;
        return newRevealed;
      });
    } catch (error) {
      console.error('Error revealing cell:', error);
    }
  }, []);
  
  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="grid-container">
      <div className="timer">Time: {time}s</div>
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 40px)`,
          gridTemplateColumns: `repeat(${cols}, 40px)`,
          gap: '1px',
          background: '#ccc',
          padding: '1px'
        }}
      >
        {initialContent.map((row, rowIndex) =>
          row.map((content, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              content={content}
              isRevealed={revealedCells[rowIndex][colIndex]}
              onCellClick={handleCellClick}
              onTimerStart={startTimer}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Grid;