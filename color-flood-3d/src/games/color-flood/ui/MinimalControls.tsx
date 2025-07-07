import React from 'react';
import { useCubeState, useCanUndo, useSimpleGameStore, useCubeSize, useIsExploded } from '../logic/simpleGameStore';

interface MinimalControlsProps {
  onShowInstructions?: () => void;
}

export const MinimalControls: React.FC<MinimalControlsProps> = () => {
  const cubeState = useCubeState();
  const canUndo = useCanUndo();
  const cubeSize = useCubeSize();
  const isExploded = useIsExploded();

  const handleUndo = () => {
    useSimpleGameStore.getState().undo();
  };

  const handleReset = () => {
    useSimpleGameStore.getState().reset();
  };

  const handleToggleExplode = () => {
    useSimpleGameStore.getState().toggleExplodedView();
  };

  return (
    <div className="minimal-controls">
      <div className="controls-left">
        <button
          className="minimal-button"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (U)"
        >
          Undo
        </button>
        
        <button
          className="minimal-button"
          onClick={handleReset}
          title="Reset (R)"
        >
          Reset
        </button>
        
        <button
          className={`minimal-button ${isExploded ? 'active' : ''}`}
          onClick={handleToggleExplode}
          title="Explode (E)"
        >
          Explode
        </button>
      </div>

      <div className="controls-center">
        <span className="move-counter">
          <span className={`moves-value ${
            cubeState.moves / cubeState.maxMoves < 0.8 ? 'good' :
            cubeState.moves / cubeState.maxMoves <= 1.0 ? 'warning' :
            'over'
          }`}>
            {cubeState.moves}/{cubeState.maxMoves} moves
          </span>
        </span>
        
        <span className="cube-size-indicator">
          {cubeSize}×{cubeSize}
        </span>
      </div>

      <div className="controls-right">
        <button
          className="hamburger-button"
          onClick={() => window.dispatchEvent(new CustomEvent('openHamburgerMenu'))}
          title="Menu (M or Esc)"
        >
          ☰
        </button>
      </div>
    </div>
  );
};