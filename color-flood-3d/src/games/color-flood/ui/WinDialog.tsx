import React from 'react';
import { useCubeState, useIsWon, useSimpleGameStore } from '../logic/simpleGameStore';
import { SAMPLE_LEVELS, type ExtendedLevel } from '../levels/sampleLevels';

interface WinDialogProps {
  // No props needed currently
}

export const WinDialog: React.FC<WinDialogProps> = () => {
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

  // Get current level tier and find next unplayed level in same tier
  const sameTierLevels = SAMPLE_LEVELS.filter(level => level.tier === currentLevel.tier);
  const unplayedSameTier = sameTierLevels.filter(level => !levelProgress[level.id] || level.id === currentLevel.id);
  const hasMoreInTier = unplayedSameTier.length > 1; // More than just current level

  // Find next unplayed level overall (prioritize same tier, then next tier)
  const currentIndex = SAMPLE_LEVELS.findIndex(level => level.id === currentLevel.id);
  
  // First try to find next unplayed level in same tier
  let nextLevel = unplayedSameTier.find(level => level.id !== currentLevel.id);
  
  // If no more in same tier, find next level in progression
  if (!nextLevel && currentIndex >= 0) {
    for (let i = currentIndex + 1; i < SAMPLE_LEVELS.length; i++) {
      if (!levelProgress[SAMPLE_LEVELS[i].id]) {
        nextLevel = SAMPLE_LEVELS[i];
        break;
      }
    }
  }

  const handlePlayNextLevel = () => {
    if (nextLevel) {
      gameState.loadLevel(nextLevel);
    }
  };

  const handlePlaySameLevel = () => {
    if (hasMoreInTier) {
      // Play next unplayed level in same tier
      gameState.loadLevel(unplayedSameTier[0]);
    }
  };

  const handleReplayLevel = () => {
    gameState.loadLevel(currentLevel);
  };

  let message = 'Victory!';
  if (stars === 3) {
    message = '🌟 Perfect! 3 Stars!';
  } else if (stars === 2) {
    message = '⭐ Great! 2 Stars!';
  } else if (stars === 1) {
    message = '🎉 Victory! 1 Star!';
  } else {
    message = '💪 Completed!';
  }

  return (
    <div className="win-dialog-overlay">
      <div className="win-dialog">
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
            {nextLevel && (
              <button 
                className="win-button primary"
                onClick={handlePlayNextLevel}
              >
                {nextLevel.tier === currentLevel.tier 
                  ? `Next: ${nextLevel.name}`
                  : `${nextLevel.tier}: ${nextLevel.name}`
                }
              </button>
            )}
            
            <button 
              className="win-button secondary"
              onClick={hasMoreInTier ? handlePlaySameLevel : handleReplayLevel}
            >
              {hasMoreInTier ? `More ${currentLevel.tier} Levels` : 'Replay Level'}
            </button>
            
            {!hasMoreInTier && !nextLevel && (
              <div className="tier-complete-notice">
                🎉 All levels completed! You're amazing!
              </div>
            )}
            
            {!hasMoreInTier && nextLevel && nextLevel.tier !== currentLevel.tier && (
              <div className="tier-complete-notice">
                🏆 {currentLevel.tier} tier complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};