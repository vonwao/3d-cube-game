import React, { useState, useCallback } from 'react';
import { useKeyboardManager, isActionKey } from '../../../engine/useKeyboardManager';
import { useCubeState, useIsWon, useCanUndo, useCurrentPalette, useSimpleGameStore } from '../logic/simpleGameStore';
import type { ColorIndex } from '../logic/types';
import { getHint } from '../logic/solver';

interface UnifiedControlPanelProps {
  className?: string;
  onShowInstructions?: () => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({ className = '', onShowInstructions }) => {
  const cubeState = useCubeState();
  const isWon: boolean = useIsWon();
  const canUndo = useCanUndo();
  const palette = useCurrentPalette();
  const [hoveredColor, setHoveredColor] = useState<ColorIndex | null>(null);
  const [hintColor, setHintColor] = useState<ColorIndex | null>(null);
  
  const handleUndo = useCallback(() => {
    useSimpleGameStore.getState().undo();
  }, []);
  
  const handleReset = useCallback(() => {
    useSimpleGameStore.getState().reset();
  }, []);
  
  const handleColorClick = useCallback((colorIndex: ColorIndex) => {
    if (isWon) return;
    useSimpleGameStore.getState().applyColor(colorIndex);
    setHintColor(null); // Clear hint when player makes a move
  }, [isWon]);

  const handleHint = useCallback(() => {
    if (isWon) return;
    const currentLevel = useSimpleGameStore.getState().currentLevel;
    if (!currentLevel) return;
    
    const hint = getHint(currentLevel, cubeState);
    setHintColor(hint);
    
    // Clear hint after 3 seconds
    setTimeout(() => setHintColor(null), 3000);
  }, [cubeState, isWon]);

  // Rotation handlers that dispatch keyboard events (same as keyboard shortcuts)
  const handleRotateUp = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  }, []);

  const handleRotateDown = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
  }, []);

  const handleRotateLeft = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  }, []);

  const handleRotateRight = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  }, []);
  
  // Action keys (undo/reset) with medium priority
  useKeyboardManager(
    (event: KeyboardEvent) => {
      const actionKey = isActionKey(event.key);
      
      if (actionKey === 'u' && canUndo) {
        handleUndo();
        return true;
      }
      
      if (actionKey === 'r') {
        handleReset();
        return true;
      }
      
      if (actionKey === 'h' && !isDisabled) {
        handleHint();
        return true;
      }
      
      return false;
    },
    { 
      enabled: true,
      priority: 15
    }
  );
  
  const isDisabled = isWon;
  
  return (
    <div className={`unified-control-panel ${className}`}>
      {/* Section 1: Colors, Buttons, D-pad */}
      <div className="controls-section">
        <div className="color-grid">
          {palette.colors.map((color, index) => {
            const colorIndex = index as ColorIndex;
            const isHovered = hoveredColor === colorIndex;
            const isHinted = hintColor === colorIndex;

            return (
              <button
                key={colorIndex}
                className={`color-button ${isHovered ? 'hovered' : ''} ${isHinted ? 'hinted' : ''} ${isDisabled ? 'disabled' : ''}`}
                style={{
                  backgroundColor: color,
                  borderColor: color,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isHinted
                    ? `0 0 0 3px #FFD700, 0 0 10px #FFD700, 0 4px 8px ${color}40`
                    : isHovered
                    ? `0 0 0 2px ${color}60, 0 4px 8px ${color}40`
                    : '0 2px 4px rgba(0,0,0,0.15)',
                  animation: isHinted ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
                onClick={() => handleColorClick(colorIndex)}
                onMouseEnter={() => setHoveredColor(colorIndex)}
                onMouseLeave={() => setHoveredColor(null)}
                disabled={isDisabled}
                title={`Select color ${colorIndex + 1} (Press ${colorIndex + 1})${isHinted ? ' - Hint!' : ''}`}
              >
                <span className="color-number">{colorIndex + 1}</span>
                {isHinted && <span className="hint-indicator">★</span>}
              </button>
            );
          })}
        </div>

        <div className="main-control-buttons">
          <button
            className="control-button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo last move (U)"
          >
            <span className="button-icon">↶</span>
            <span className="button-label">Undo</span>
          </button>
          
          <button
            className="control-button"
            onClick={handleReset}
            title="Reset level (R)"
          >
            <span className="button-icon">🔄</span>
            <span className="button-label">Reset</span>
          </button>
          
          <button
            className="control-button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openLevelSelector'));
            }}
            title="New Game"
          >
            <span className="button-icon">🎮</span>
            <span className="button-label">Game</span>
          </button>
          
          <button
            className="control-button"
            onClick={handleHint}
            disabled={isDisabled}
            title="Get hint for next move (H)"
          >
            <span className="button-icon">🔍</span>
            <span className="button-label">Hint</span>
          </button>
        </div>

        <div className="rotation-dpad">
          <button
            className="control-button rotation-button dpad-up"
            onClick={handleRotateUp}
            title="Rotate up (↑)"
          >
            <span className="button-icon">↑</span>
          </button>
          <div className="dpad-bottom-row">
            <button
              className="control-button rotation-button dpad-left"
              onClick={handleRotateLeft}
              title="Rotate left (←)"
            >
              <span className="button-icon">←</span>
            </button>
            <button
              className="control-button rotation-button dpad-down"
              onClick={handleRotateDown}
              title="Rotate down (↓)"
            >
              <span className="button-icon">↓</span>
            </button>
            <button
              className="control-button rotation-button dpad-right"
              onClick={handleRotateRight}
              title="Rotate right (→)"
            >
              <span className="button-icon">→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Section 2: Move counter, shortcuts, info button */}
      <div className="info-section">
        <div className="current-moves">
          <span className="moves-label">Move</span>
          <span className={`moves-value ${
            cubeState.moves / cubeState.maxMoves < 0.8 ? 'moves-good' :
            cubeState.moves / cubeState.maxMoves <= 1.0 ? 'moves-warning' :
            'moves-over'
          }`}>{cubeState.moves}/{cubeState.maxMoves}</span>
        </div>
        
        <div className="control-hints">
          <div className="hint-line">1-6: Colors • U: Undo • R: Reset • H: Hint</div>
          <div className="hint-line">Drag or ↑↓←→ to rotate</div>
        </div>

        <button
          className="control-button info-button"
          onClick={onShowInstructions}
          title="Show help and instructions"
        >
          <span className="button-icon">💡</span>
          <span className="button-label">Help</span>
        </button>
      </div>
      
      {/* Commented out difficulty section for potential future use
      <div className="control-section difficulty-section" style={{display: 'none'}}>
        <div className="difficulty-flow-group">
          {difficultyOptions.map(option => (
            <label key={option.id} className="difficulty-chip">
              <input
                type="radio"
                name="difficulty"
                value={option.id}
                checked={selectedDifficulty === option.id}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              />
              <span 
                className="difficulty-label"
                style={{ '--tier-color': option.color } as React.CSSProperties}
              >
                {option.name}
              </span>
            </label>
          ))}
        </div>
        
        <button
          className="new-game-button-old"
          onClick={handleNewGame}
          title={`Start a random ${selectedDifficulty} level`}
        >
          🎲 New {difficultyOptions.find(d => d.id === selectedDifficulty)?.name} Game
        </button>
      </div>
      */}
    </div>
  );
};