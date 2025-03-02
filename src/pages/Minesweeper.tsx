import React, { useState, useEffect, useCallback } from 'react';
import { Bomb, Clock, Trophy, Brain, RotateCcw, Lightbulb, Gauge, Shield } from 'lucide-react';
import { Difficulty, GameState, CellState } from '../types';
import { generateBoard, revealAllMines, getDifficultySettings, findTipCell, revealCell } from '../utils/gameLogic';
import { saveGameState, loadGameState, saveHighScore, getHighScores, formatTime } from '../utils/storage';
import { showNotification } from '../utils/animations';

const Minesweeper: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    difficulty: 'easy',
    gameStatus: 'idle',
    mineCount: 0,
    flagCount: 0,
    timer: 0,
    firstClick: true
  });
  
  // Timer interval reference
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // High scores
  const [highScores, setHighScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null
  });
  
  // Initialize game
  const initializeGame = useCallback((difficulty: Difficulty = 'easy') => {
    const { board, mineCount } = generateBoard(difficulty);
    
    const newGameState: GameState = {
      board,
      difficulty,
      gameStatus: 'idle',
      mineCount,
      flagCount: 0,
      timer: 0,
      firstClick: true
    };
    
    setGameState(newGameState);
    
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Save initial state
    saveGameState(newGameState);
  }, [timerInterval]);
  
  // Start a new game
  const handleNewGame = useCallback(() => {
    initializeGame(gameState.difficulty);
  }, [gameState.difficulty, initializeGame]);
  
  // Change difficulty
  const handleChangeDifficulty = useCallback((difficulty: Difficulty) => {
    initializeGame(difficulty);
  }, [initializeGame]);
  
  // Handle game over
  const handleGameOver = useCallback((win: boolean) => {
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Update game state
    setGameState(prev => {
      const updatedBoard = win ? prev.board : revealAllMines(prev.board);
      const updatedState: GameState = {
        ...prev,
        board: updatedBoard,
        gameStatus: win ? 'won' : 'lost'
      };
      
      // Save final state
      saveGameState(updatedState);
      
      return updatedState;
    });
    
    // Show notification
    showNotification(
      win ? 'Congratulations! You won! 🎉' : 'Game over! Better luck next time! 💥',
      win ? 'success' : 'error'
    );
    
    // Save high score if won
    if (win) {
      const isNewHighScore = saveHighScore(gameState.difficulty, gameState.timer);
      if (isNewHighScore) {
        showNotification(`New high score: ${formatTime(gameState.timer)}! 🏆`, 'success');
        // Update high scores
        setHighScores(getHighScores());
      }
    }
  }, [timerInterval, gameState.difficulty, gameState.timer]);
  
  // Handle cell action (start timer if first action)
  const handleCellAction = useCallback(() => {
    // Don't start timer if game is over
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      return;
    }
    
    // Start timer if not already running
    if (!timerInterval) {
      const interval = setInterval(() => {
        setGameState(prev => {
          const updatedState: GameState = {
            ...prev,
            timer: prev.timer + 1
          };
          
          // Save state periodically
          saveGameState(updatedState);
          
          return updatedState;
        });
      }, 1000);
      
      setTimerInterval(interval);
    }
  }, [gameState.gameStatus, timerInterval]);
  
  // Handle tip request
  const handleTip = useCallback(() => {
    // Only allow tips during active gameplay and after first reveal
    if (gameState.gameStatus !== 'playing') {
      showNotification('Start a new game to use tips!', 'error');
      return;
    }
    
    const tipCell = findTipCell(gameState.board);
    if (!tipCell) {
      showNotification('No safe moves available!', 'error');
      return;
    }
    
    const [row, col] = tipCell;
    
    // Start game if first action
    if (gameState.firstClick) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        firstClick: false
      }));
    }
    
    // Reveal the cell
    const { updatedBoard, win } = revealCell(gameState.board, row, col);
    
    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      gameStatus: win ? 'won' : 'playing'
    }));
    
    if (win) {
      handleGameOver(true);
    }
    
    showNotification('Safe cell revealed! 💡', 'success');
  }, [gameState, handleGameOver]);
  
  // Load saved game or initialize new game on mount
  useEffect(() => {
    // Load high scores
    setHighScores(getHighScores());
  
    // Load saved game or initialize new game
    try {
      const savedGame = loadGameState();
      if (savedGame && savedGame.board.length > 0) {
        setGameState(savedGame);
      
        // Restart timer if game was in progress
        if (savedGame.gameStatus === 'playing' && !timerInterval) {
          const interval = setInterval(() => {
            setGameState(prev => ({
              ...prev,
              timer: prev.timer + 1
            }));
          }, 1000);
        
          setTimerInterval(interval);
        }
      } else {
        initializeGame('easy');
      }
    } catch (error) {
      console.warn('Error in game initialization, starting new game');
      initializeGame('easy');
    }
    
    // Clean up timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []); // Empty dependency array since we only want this to run once on mount
  
  // Calculate mines remaining
  const minesRemaining = gameState.mineCount - gameState.flagCount;
  
  // Get difficulty display name
  const getDifficultyDisplay = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Custom';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (gameState.gameStatus) {
      case 'won': return <Trophy className="text-yellow-400 status-icon" size={24} />;
      case 'lost': return <Bomb className="text-red-500 status-icon" size={24} />;
      case 'playing': return <Brain className="text-blue-400 status-icon" size={24} />;
      default: return <Shield className="text-gray-400" size={24} />;
    }
  };
  
  return (
    <div className="game-container">
      <div className="minesweeper-board">
        <div className="game-header">
          <div className="game-title">
            <Bomb size={28} className="text-red-500" />
            <h1>Minesweeper</h1>
            {getStatusIcon()}
          </div>
          
          <div className="difficulty-switcher">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(difficulty => (
              <button
                key={difficulty}
                className={`difficulty-button ${gameState.difficulty === difficulty ? 'active' : ''}`}
                onClick={() => handleChangeDifficulty(difficulty)}
                disabled={gameState.gameStatus === 'playing'}
              >
                {getDifficultyDisplay(difficulty)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="game-stats">
          <div className="stat-card stat-mines">
            <Bomb size={20} className="text-red-400 mb-1" />
            <div className="stat-value text-white">{minesRemaining}</div>
            <div className="stat-label text-white">Mines</div>
          </div>
          
          <div className="stat-card stat-timer">
            <Clock size={20} className="text-blue-400 mb-1" />
            <div className="stat-value text-white">{formatTime(gameState.timer)}</div>
            <div className="stat-label text-white">Time</div>
          </div>
          
          <div className="stat-card stat-difficulty">
            <Gauge size={20} className="text-purple-400 mb-1" />
            <div className="stat-value text-white">{getDifficultyDisplay(gameState.difficulty)}</div>
            <div className="stat-label text-white">Difficulty</div>
          </div>
          
          <div className="stat-card stat-score">
            <Trophy size={20} className="text-green-400 mb-1" />
            <div className="stat-value text-white">
              {highScores[gameState.difficulty] ? formatTime(highScores[gameState.difficulty]!) : '--:--'}
            </div>
            <div className="stat-label text-white">Best Time</div>
          </div>
        </div>
        
        <div className="game-board-container">
          {gameState.board.length > 0 && (
            <div 
              className="game-board"
              style={{
                gridTemplateRows: `repeat(${gameState.board.length}, 1fr)`,
                gridTemplateColumns: `repeat(${gameState.board[0].length}, 1fr)`
              }}
            >
              {gameState.board.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isFlagged ? 'flagged' : ''} ${
                      cell.isRevealed && cell.isMine ? 'mine' : ''
                    } ${cell.isRevealed && !cell.isMine && cell.adjacentMines === 0 ? 'empty' : ''}`}
                    onClick={() => {
                      if (cell.isRevealed || cell.isFlagged || gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') return;
                      
                      // Start game if first action
                      if (gameState.firstClick) {
                        setGameState(prev => ({
                          ...prev,
                          gameStatus: 'playing',
                          firstClick: false
                        }));
                        handleCellAction();
                      }
                      
                      const { updatedBoard, gameOver, win } = revealCell(gameState.board, rowIndex, colIndex);
                      
                      setGameState(prev => ({
                        ...prev,
                        board: updatedBoard,
                        gameStatus: gameOver ? 'lost' : win ? 'won' : 'playing'
                      }));
                      
                      if (gameOver || win) {
                        handleGameOver(win);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      
                      if (cell.isRevealed || gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') return;
                      
                      // Start game if first action
                      if (gameState.firstClick) {
                        setGameState(prev => ({
                          ...prev,
                          gameStatus: 'playing',
                          firstClick: false
                        }));
                        handleCellAction();
                      }
                      
                      // Toggle flag
                      setGameState(prev => {
                        const board = [...prev.board];
                        board[rowIndex] = [...board[rowIndex]];
                        board[rowIndex][colIndex] = {
                          ...board[rowIndex][colIndex],
                          isFlagged: !board[rowIndex][colIndex].isFlagged
                        };
                        
                        return {
                          ...prev,
                          board,
                          flagCount: prev.flagCount + (board[rowIndex][colIndex].isFlagged ? 1 : -1)
                        };
                      });
                    }}
                    style={{ color: cell.isRevealed && !cell.isMine ? getCellColor(cell.adjacentMines) : '' }}
                  >
                    {cell.isRevealed && cell.isMine && '💣'}
                    {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="control-buttons">
          <button
            className="game-control control-new"
            onClick={handleNewGame}
          >
            <RotateCcw size={18} />
            New Game
          </button>
          
          <button
            className="game-control control-tip"
            onClick={handleTip}
            disabled={gameState.gameStatus !== 'playing'}
          >
            <Lightbulb size={18} />
            Need a Tip?
          </button>
        </div>
      </div>
      
      <div className="high-scores">
        <h2>
          <Trophy size={20} className="text-yellow-400" />
          High Scores
        </h2>
        
        <div className="high-score-list">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
            <div 
              key={difficulty} 
              className={`high-score-item high-score-${difficulty} text-white`}
            >
              <div>
                <div className="font-medium">{getDifficultyDisplay(difficulty)}</div>
                <div className="text-xs opacity-70">Best Time</div>
              </div>
              <div className="text-xl font-mono">
                {highScores[difficulty] ? formatTime(highScores[difficulty]!) : '--:--'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function for cell colors
const getCellColor = (adjacentMines: number) => {
  const colors = [
    '', // No color for 0
    '#3b82f6', // 1: Blue
    '#10b981', // 2: Green
    '#ef4444', // 3: Red
    '#8b5cf6', // 4: Purple
    '#f59e0b', // 5: Orange
    '#0ea5e9', // 6: Light Blue
    '#000000', // 7: Black
    '#6b7280'  // 8: Gray
  ];
  
  return colors[adjacentMines] || '';
};

export default Minesweeper;
