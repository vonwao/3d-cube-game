import React, { useState, useRef, useEffect } from 'react';
import { useCubeState, useCanUndo, useSimpleGameStore, useCubeSize, useIsExploded } from '../logic/simpleGameStore';
import { CubeSizeSelector } from './CubeSizeSelector';
import { Undo, RefreshCw, Expand, Palette, Gamepad, RotateCcw, Menu } from 'lucide-react';

interface MinimalControlsProps {
  onShowInstructions?: () => void;
  showColorPalette?: boolean;
  onToggleColorPalette?: (show: boolean) => void;
}

export const MinimalControls: React.FC<MinimalControlsProps> = ({ 
  showColorPalette = false, 
  onToggleColorPalette 
}) => {
  const cubeState = useCubeState();
  const canUndo = useCanUndo();
  const cubeSize = useCubeSize();
  const isExploded = useIsExploded();
  const showDpad = useSimpleGameStore(state => state.showDpad);
  const [showNewGameMenu, setShowNewGameMenu] = useState(false);
  const newGameMenuRef = useRef<HTMLDivElement>(null);

  const handleUndo = () => {
    useSimpleGameStore.getState().undo();
  };

  const handleReset = () => {
    useSimpleGameStore.getState().reset();
  };

  const handleToggleExplode = () => {
    useSimpleGameStore.getState().toggleExplodedView();
  };

  const handleToggleDpad = () => {
    useSimpleGameStore.getState().toggleShowDpad();
  };

  const handleToggleColorPalette = () => {
    const newValue = !showColorPalette;
    onToggleColorPalette?.(newValue);
    localStorage.setItem('showColorPalette', newValue.toString());
  };

  const handleNewGame = () => {
    setShowNewGameMenu(!showNewGameMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newGameMenuRef.current && !newGameMenuRef.current.contains(event.target as Node)) {
        setShowNewGameMenu(false);
      }
    };

    if (showNewGameMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNewGameMenu]);

  return (
    <>
      <div className="minimal-controls">
        <div className="controls-left">
          <button
            className="minimal-button icon-button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (U)"
          >
            <Undo size={20} />
          </button>
          
          <button
            className="minimal-button icon-button"
            onClick={handleReset}
            title="Reset (R)"
          >
            <RefreshCw size={20} />
          </button>
          
          <button
            className={`minimal-button ${isExploded ? 'active' : ''}`}
            onClick={handleToggleExplode}
            title="Explode (E)"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Expand size={20} />
              <span>Explode</span>
            </span>
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
            className={`minimal-button icon-button ${showColorPalette ? 'active' : ''}`}
            onClick={handleToggleColorPalette}
            title="Toggle Color Palette"
          >
            <Palette size={20} />
          </button>
          
          <button
            className={`minimal-button icon-button ${showDpad ? 'active' : ''}`}
            onClick={handleToggleDpad}
            title="Toggle D-pad Controls"
          >
            <Gamepad size={20} />
          </button>
        </div>
      </div>
      
      {/* Floating buttons in upper right corner */}
      <div className="floating-top-right-buttons">
        <div className="new-game-container" ref={newGameMenuRef}>
          <button
            className="minimal-button icon-button"
            onClick={handleNewGame}
            title="New Game"
          >
            <RotateCcw size={20} />
          </button>
          {showNewGameMenu && (
            <div className="new-game-menu">
              <div className="new-game-header">Choose Cube Size</div>
              <CubeSizeSelector className="compact" />
              <button 
                className="close-menu-btn"
                onClick={() => setShowNewGameMenu(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
        
        <button
          className="hamburger-button"
          onClick={() => window.dispatchEvent(new CustomEvent('openHamburgerMenu'))}
          title="Menu (M or Esc)"
        >
          <Menu size={20} />
        </button>
      </div>
    </>
  );
};