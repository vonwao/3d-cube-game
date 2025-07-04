import { useEffect } from 'react';
import { useGameActions, useGameState, useGameStats, useGameStore } from '../logic/gameStore';

interface GameHUDProps {
  className?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({ className = '' }) => {
  const { undo, reset } = useGameActions();
  const { canUndo, isWon, isGameOver } = useGameState();
  const { moves, maxMoves, stars, movesRemaining } = useGameStats();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'u' || event.key === 'U') {
        const state = useGameStore.getState();
        if (state.undoStack.length > 0) {
          state.actions.undo();
        }
      }
      if (event.key === 'r' || event.key === 'R') {
        const state = useGameStore.getState();
        state.actions.reset();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo last move"
            title="Undo (U)"
          >
            ↶
          </button>
          
          <button
            className="control-button reset-button"
            onClick={reset}
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