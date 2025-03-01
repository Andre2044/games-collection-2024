import React, { useState, useEffect, useCallback } from 'react';
import Board from '../components/Board';
import Header from '../components/Header';
import StatusBar from '../components/StatusBar';
import CookieWarning from '../components/CookieWarning';
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
  
  return (
    <div className="game-container">
      <Header
        difficulty={gameState.difficulty}
        timer={gameState.timer}
        gameStatus={gameState.gameStatus}
        onChangeDifficulty={handleChangeDifficulty}
        onNewGame={handleNewGame}
        onTip={handleTip}
      />
      
      <StatusBar
        minesRemaining={minesRemaining}
        gameStatus={gameState.gameStatus}
        difficulty={gameState.difficulty}
        highScore={highScores[gameState.difficulty]}
        onNewGame={handleNewGame}
        onChangeDifficulty={handleChangeDifficulty}
        onTip={handleTip}
        timer={gameState.timer}
      />
      
      {gameState.board.length > 0 && (
        <Board
          gameState={gameState}
          setGameState={setGameState}
          onGameOver={handleGameOver}
          onCellAction={handleCellAction}
        />
      )}
      
      <div className="high-scores">
        <h2>High Scores</h2>
        <table className="high-scores-table">
          <thead>
            <tr>
              <th>Difficulty</th>
              <th>Best Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Easy</td>
              <td>{highScores.easy ? formatTime(highScores.easy) : 'No record'}</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>{highScores.medium ? formatTime(highScores.medium) : 'No record'}</td>
            </tr>
            <tr>
              <td>Hard</td>
              <td>{highScores.hard ? formatTime(highScores.hard) : 'No record'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CookieWarning />
    </div>
  );
};

export default Minesweeper;
