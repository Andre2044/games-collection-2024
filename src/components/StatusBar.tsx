import React from 'react';
import { Difficulty } from '../types';
import { formatTime } from '../utils/storage';
import { Flag, Clock, Trophy, RefreshCw, Lightbulb } from 'lucide-react';

interface StatusBarProps {
  minesRemaining: number;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  difficulty: Difficulty;
  highScore: number | null;
  onNewGame: () => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onTip: () => void;
  timer: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  minesRemaining,
  gameStatus,
  difficulty,
  highScore,
  onNewGame,
  onChangeDifficulty,
  onTip,
  timer
}) => {
  // Get status message based on game status
  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'idle':
        return 'Click any cell to start';
      case 'playing':
        return 'Game in progress';
      case 'won':
        return 'You won! 🎉';
      case 'lost':
        return 'Game over! 💥';
      default:
        return '';
    }
  };
  
  return (
    <div className="status-bar">
      <div className="status-group">
        <div className="status-left">
          <div className="status-item mines-counter" aria-live="polite">
            <Flag size={16} />
            <span aria-label={`${minesRemaining} mines remaining`}>
              {minesRemaining}
            </span>
          </div>
        </div>
        <div className="status-center">
          <div className="status-message" aria-live="polite">
            {getStatusMessage()}
          </div>
        </div>
        <div className="status-right">
          {highScore && (
            <div className="status-item high-score" aria-live="polite">
              <Trophy size={16} />
              <span aria-label={`Best time: ${formatTime(highScore)}`}>
                {formatTime(highScore)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;