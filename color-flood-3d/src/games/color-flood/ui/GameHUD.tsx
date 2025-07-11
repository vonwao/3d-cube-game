import React, { useCallback, useMemo } from 'react';
import { useKeyboardManager, isActionKey } from '../../../engine/useKeyboardManager';
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
  
  // Action keys (undo/reset) with medium priority
  useKeyboardManager(
    (event: KeyboardEvent) => {
      const actionKey = isActionKey(event.key);
      
      if (actionKey === 'u' && canUndo) {
        handleUndo();
        return true; // Event handled
      }
      
      if (actionKey === 'r') {
        handleReset();
        return true; // Event handled
      }
      
      return false; // Event not handled
    },
    { 
      enabled: true,
      priority: 15 // Medium priority - between color selection and cube rotation
    }
  );
  
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
            className="control-button"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo last move"
            title="Undo (U)"
          >
            ↶
          </button>
          
          <button
            className="control-button"
            onClick={handleReset}
            aria-label="Reset level"
            title="Reset (R)"
          >
            ⟲
          </button>
          
          <button
            className="control-button"
            onClick={() => {
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('openLevelSelector'));
            }}
            aria-label="Select different level"
            title="Select Level"
          >
            📋
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