// Helper functions for grid operations

// Check if coordinates are valid
export const isValidCell = (row: number, col: number, rows: number, cols: number): boolean => {
  return row >= 0 && row < rows && col >= 0 && col < cols;
};

// Get adjacent cells
export const getAdjacentCells = (
  row: number,
  col: number,
  rows: number,
  cols: number
): [number, number][] => {
  const adjacent: [number, number][] = [];
  
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;
      
      const newRow = row + r;
      const newCol = col + c;
      
      if (isValidCell(newRow, newCol, rows, cols)) {
        adjacent.push([newRow, newCol]);
      }
    }
  }
  
  return adjacent;
};