import React from 'react';
import { useCubeState, useIsWon, useSimpleGameStore } from '../logic/simpleGameStore';
import { SAMPLE_LEVELS, type ExtendedLevel } from '../levels/sampleLevels';

interface WinDialogProps {
  onClose?: () => void;
}

export const WinDialog: React.FC<WinDialogProps> = ({ onClose }) => {
  const isWon = useIsWon();
  const cubeState = useCubeState();
  const gameState = useSimpleGameStore();
  const currentLevel = gameState.currentLevel as ExtendedLevel;
  const levelProgress = gameState.levelProgress;

  if (!isWon || !currentLevel) return null;

  const efficiency = cubeState.moves / cubeState.maxMoves;
  let stars = 0;
  if (efficiency <= 0.6) stars = 3;
  else if (efficiency <= 0.8) stars = 2;
  else if (efficiency <= 1.0) stars = 1;

  // Find next unplayed level

  const currentIndex = SAMPLE_LEVELS.findIndex(level => level.id === currentLevel.id);
  let nextLevel = null;
  
  // Find next unplayed level
  if (currentIndex >= 0) {
    for (let i = currentIndex + 1; i < SAMPLE_LEVELS.length; i++) {
      if (!levelProgress[SAMPLE_LEVELS[i].id]) {
        nextLevel = SAMPLE_LEVELS[i];
        break;
      }
    }
  }

  const handleNextLevel = () => {
    if (nextLevel) {
      gameState.loadLevel(nextLevel);
    } else {
      // If no next level, reload current level
      gameState.loadLevel(currentLevel);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  let message = 'Victory!';
  if (stars === 3) {
    message = 'Perfect! 3 Stars!';
  } else if (stars === 2) {
    message = 'Great! 2 Stars!';
  } else if (stars === 1) {
    message = 'Victory! 1 Star!';
  } else {
    message = 'Completed!';
  }

  return (
    <div className="win-dialog-overlay">
      <div className="win-dialog">
        <button className="win-dialog-close" onClick={handleClose} title="Close">
          ×
        </button>
        <div className="win-dialog-content">
          <h2 className="win-title">{message}</h2>
          
          <div className="win-stats">
            <div className="stat">
              <span className="stat-label">Moves:</span>
              <span className="stat-value">{cubeState.moves}/{cubeState.maxMoves}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Efficiency:</span>
              <span className="stat-value">{Math.round(efficiency * 100)}%</span>
            </div>
          </div>

          {stars > 0 && (
            <div className="win-stars">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={`star ${i < stars ? 'filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
          )}

          <div className="win-buttons">
            <button 
              className="win-button primary"
              onClick={handleNextLevel}
            >
              {nextLevel 
                ? (nextLevel.tier === currentLevel.tier 
                    ? `Next Level: ${nextLevel.name}`
                    : `${nextLevel.tier}: ${nextLevel.name}`)
                : 'Play Again'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};