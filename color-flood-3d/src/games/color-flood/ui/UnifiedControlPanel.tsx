import React, { useState, useCallback } from 'react';
import { useKeyboardManager, isActionKey } from '../../../engine/useKeyboardManager';
import { useCubeState, useIsWon, useIsGameOver, useCanUndo, useCurrentPalette, useSimpleGameStore } from '../logic/simpleGameStore';
import type { ColorIndex } from '../logic/types';
import { getHint } from '../logic/solver';

interface UnifiedControlPanelProps {
  className?: string;
  onShowInstructions?: () => void;
  rotateTo?: (axis: 'x' | 'y' | 'z', degrees: number) => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({ className = '', onShowInstructions, rotateTo }) => {
  const cubeState = useCubeState();
  const isWon: boolean = useIsWon();
  const isGameOver: boolean = useIsGameOver();
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
    if (isWon || isGameOver) return;
    useSimpleGameStore.getState().applyColor(colorIndex);
    setHintColor(null); // Clear hint when player makes a move
  }, [isWon, isGameOver]);

  const handleHint = useCallback(() => {
    if (isWon || isGameOver) return;
    const currentLevel = useSimpleGameStore.getState().currentLevel;
    if (!currentLevel) return;
    
    const hint = getHint(currentLevel, cubeState);
    setHintColor(hint);
    
    // Clear hint after 3 seconds
    setTimeout(() => setHintColor(null), 3000);
  }, [cubeState, isWon, isGameOver]);
  
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
  
  const isDisabled = isWon || isGameOver;
  
  return (
    <div className={`unified-control-panel ${className}`}>
      {/* Row 1: Color Palette */}
      <div className="control-row row-1">
        <div className="control-section color-section">
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
        </div>

        <div className="control-section game-controls">
          <div className="control-buttons">
            <button
              className="control-button"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo last move (U)"
            >
              ↶
            </button>
            
            <button
              className="control-button"
              onClick={handleReset}
              title="Reset level (R)"
            >
              🔄
            </button>
            
            <button
              className="control-button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openLevelSelector'));
              }}
              title="New Game"
            >
              🎮
            </button>
            
            <button
              className="control-button"
              onClick={handleHint}
              disabled={isDisabled}
              title="Get hint for next move (H)"
            >
              🔍
            </button>
            
            <button
              className="control-button"
              onClick={onShowInstructions}
              title="Show help and instructions"
            >
              💡
            </button>
            
            {/* Directional rotation buttons for mobile */}
            <button
              className="control-button rotation-button"
              onClick={() => rotateTo?.('x', -45)}
              disabled={!rotateTo}
              title="Rotate up (↑)"
            >
              ↑
            </button>
            <button
              className="control-button rotation-button"
              onClick={() => rotateTo?.('x', 45)}
              disabled={!rotateTo}
              title="Rotate down (↓)"
            >
              ↓
            </button>
            <button
              className="control-button rotation-button"
              onClick={() => rotateTo?.('y', -45)}
              disabled={!rotateTo}
              title="Rotate left (←)"
            >
              ←
            </button>
            <button
              className="control-button rotation-button"
              onClick={() => rotateTo?.('y', 45)}
              disabled={!rotateTo}
              title="Rotate right (→)"
            >
              →
            </button>
          </div>
        </div>
      </div>
      
      {/* Row 2: Game Info */}
      <div className="control-row row-2">
        <div className="control-section info-section">
          <div className="current-moves">
            <span className="moves-label">Move</span>
            <span className="moves-value">{cubeState.moves}/{cubeState.maxMoves}</span>
          </div>
          
          <div className="control-hints">
            <div className="hint-line">1-6: Colors • U: Undo • R: Reset • H: Hint</div>
            <div className="hint-line">Drag or ↑↓←→ to rotate</div>
          </div>
        </div>
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