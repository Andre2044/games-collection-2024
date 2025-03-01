import React from 'react';
import { Difficulty } from '../types';
import { BombIcon, RefreshCw, Lightbulb } from 'lucide-react';
import { formatTime } from '../utils/storage';

interface HeaderProps {
  difficulty: Difficulty;
  timer: number;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onTip: () => void;
}

const Header: React.FC<HeaderProps> = ({
  difficulty,
  timer,
  gameStatus,
  onChangeDifficulty,
  onNewGame,
  onTip
}) => {
  return (
    <header className="game-header">
      <div className="header-content flex-col">
        <div className="game-title">
          <BombIcon className="title-icon" size={24} />
          <h1>Minesweeper</h1>
        </div>
        
        <div className="header-main">
          <div className="game-timer" role="timer" aria-label="Game timer">
            {formatTime(timer)}
          </div>
          
          <div className="game-controls">
            <div className="difficulty-selector">
              <label htmlFor="difficulty-select" className="sr-only">Select difficulty</label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => onChangeDifficulty(e.target.value as Difficulty)}
                aria-label="Game difficulty"
              >
                <option value="easy">Easy (8×8)</option>
                <option value="medium">Medium (16×16)</option>
                <option value="hard">Hard (30×16)</option>
              </select>
            </div>
            
            <button
              className="new-game-button"
              onClick={onNewGame}
              aria-label="Start new game"
            >
              <RefreshCw size={18} />
              <span>New Game</span>
            </button>
            
            <button
              className="tip-button"
              onClick={onTip}
              disabled={gameStatus === 'idle' || gameStatus === 'won' || gameStatus === 'lost'}
              aria-label="Get a tip"
              title="Get a tip"
            >
              <Lightbulb size={18} />
              <span>Tip</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
