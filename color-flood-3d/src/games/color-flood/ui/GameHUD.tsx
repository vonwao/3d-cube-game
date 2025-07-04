import { useCallback } from 'react';
import { useGameState, useGameStats, useGameStore } from '../logic/gameStore';

interface GameHUDProps {
  className?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({ className = '' }) => {
  const { canUndo, isWon, isGameOver } = useGameState();
  const { moves, maxMoves, stars, movesRemaining } = useGameStats();
  
  const handleUndo = useCallback(() => {
    const state = useGameStore.getState();
    if (state.undoStack.length > 0) {
      state.undo();
    }
  }, []);
  
  const handleReset = useCallback(() => {
    const state = useGameStore.getState();
    state.reset();
  }, []);
  
  const renderStars = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < stars ? 'filled' : 'empty'}`}
        aria-label={`Star ${i + 1} ${i < stars ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };
  
  const getStatusMessage = () => {
    if (isWon) {
      return `Congratulations! ${stars} star${stars !== 1 ? 's' : ''}!`;
    }
    if (isGameOver) {
      return 'Game Over - Try Again!';
    }
    return `${movesRemaining} moves remaining`;
  };
  
  return (
    <div className={`game-hud ${className}`}>
      <div className="hud-top">
        <div className="moves-display">
          <div className="moves-counter">
            <span className="moves-current">{moves}</span>
            <span className="moves-divider">/</span>
            <span className="moves-max">{maxMoves}</span>
          </div>
          <div className="moves-label">Moves</div>
        </div>
        
        <div className="stars-display">
          <div className="stars-container">
            {renderStars()}
          </div>
          <div className="stars-label">Stars</div>
        </div>
        
        <div className="controls">
          <button
            className="control-button undo-button"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo last move"
            title="Undo (U)"
          >
            ↶
          </button>
          
          <button
            className="control-button reset-button"
            onClick={handleReset}
            aria-label="Reset level"
            title="Reset (R)"
          >
            ⟲
          </button>
        </div>
      </div>
      
      <div className="hud-status">
        <div className={`status-message ${isWon ? 'won' : isGameOver ? 'game-over' : ''}`}>
          {getStatusMessage()}
        </div>
      </div>
    </div>
  );
};