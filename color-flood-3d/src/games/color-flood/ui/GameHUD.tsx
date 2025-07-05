import React, { useCallback, useMemo, useEffect } from 'react';
import { useCubeState, useIsWon, useIsGameOver, useCanUndo, useSimpleGameStore } from '../logic/simpleGameStore';

interface GameHUDProps {
  className?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({ className = '' }) => {
  const cubeState = useCubeState();
  const isWon = useIsWon();
  const isGameOver = useIsGameOver();
  const canUndo = useCanUndo();
  
  const handleUndo = useCallback(() => {
    useSimpleGameStore.getState().undo();
  }, []);
  
  const handleReset = useCallback(() => {
    useSimpleGameStore.getState().reset();
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not already handled by other components
      if (event.defaultPrevented) return;
      
      if (event.key === 'u' || event.key === 'U') {
        if (canUndo) {
          handleUndo();
          event.preventDefault();
        }
      }
      if (event.key === 'r' || event.key === 'R') {
        handleReset();
        event.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, handleUndo, handleReset]);
  
  const stars = useMemo(() => {
    if (!isWon) return 0;
    const { moves, maxMoves } = cubeState;
    if (moves <= Math.floor(maxMoves * 0.6)) return 3;
    if (moves <= Math.floor(maxMoves * 0.8)) return 2;
    if (moves <= maxMoves) return 1;
    return 0;
  }, [isWon, cubeState.moves, cubeState.maxMoves]);
  
  const movesRemaining = useMemo(() => {
    return Math.max(0, cubeState.maxMoves - cubeState.moves);
  }, [cubeState.maxMoves, cubeState.moves]);
  
  const renderStars = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < stars ? 'filled' : 'empty'}`}
        aria-label={`Star ${i + 1} ${i < stars ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  }, [stars]);
  
  const statusMessage = useMemo(() => {
    if (isWon) {
      return `Congratulations! ${stars} star${stars !== 1 ? 's' : ''}!`;
    }
    if (isGameOver) {
      return 'Game Over - Try Again!';
    }
    return `${movesRemaining} moves remaining`;
  }, [isWon, isGameOver, stars, movesRemaining]);
  
  return (
    <div className={`game-hud ${className}`}>
      <div className="hud-top">
        <div className="moves-display">
          <div className="moves-counter">
            <span className="moves-current">{cubeState.moves}</span>
            <span className="moves-divider">/</span>
            <span className="moves-max">{cubeState.maxMoves}</span>
          </div>
          <div className="moves-label">Moves</div>
        </div>
        
        <div className="stars-display">
          <div className="stars-container">
            {renderStars}
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
          {statusMessage}
        </div>
      </div>
    </div>
  );
};