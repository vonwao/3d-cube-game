import React, { useState, useCallback, useMemo } from 'react';
import { useKeyboardManager, isActionKey } from '../../../engine/useKeyboardManager';
import { useCubeState, useIsWon, useIsGameOver, useCanUndo, useCurrentPalette, useSimpleGameStore } from '../logic/simpleGameStore';
import { LEVEL_TIERS, SAMPLE_LEVELS } from '../levels/sampleLevels';
import type { ColorIndex } from '../logic/types';

interface UnifiedControlPanelProps {
  className?: string;
  onShowInstructions?: () => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({ className = '', onShowInstructions }) => {
  const cubeState = useCubeState();
  const isWon = useIsWon();
  const isGameOver = useIsGameOver();
  const canUndo = useCanUndo();
  const palette = useCurrentPalette();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
  const [hoveredColor, setHoveredColor] = useState<ColorIndex | null>(null);
  
  const handleUndo = useCallback(() => {
    useSimpleGameStore.getState().undo();
  }, []);
  
  const handleReset = useCallback(() => {
    useSimpleGameStore.getState().reset();
  }, []);
  
  const handleNewGame = useCallback(() => {
    const tierLevels = SAMPLE_LEVELS.filter(level => level.tier === selectedDifficulty);
    const randomLevel = tierLevels[Math.floor(Math.random() * tierLevels.length)];
    useSimpleGameStore.getState().loadLevel(randomLevel);
  }, [selectedDifficulty]);
  
  const handleColorClick = useCallback((colorIndex: ColorIndex) => {
    if (isWon || isGameOver) return;
    useSimpleGameStore.getState().applyColor(colorIndex);
  }, [isWon, isGameOver]);
  
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
      
      return false;
    },
    { 
      enabled: true,
      priority: 15
    }
  );
  
  const isDisabled = isWon || isGameOver;
  
  const difficultyOptions = useMemo(() => {
    return LEVEL_TIERS.filter(tier => tier.id !== 'tutorial').map(tier => ({
      id: tier.id,
      name: tier.name,
      color: tier.color
    }));
  }, []);
  
  return (
    <div className={`unified-control-panel ${className}`}>
      {/* Row 1: Game Controls and Difficulty */}
      <div className="control-row row-1">
        {/* Game Controls Section */}
        <div className="control-section game-controls">
          <h3 className="section-title">Game</h3>
          <div className="control-buttons">
            <button
              className="control-button undo-button"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo last move (U)"
            >
              ↶
            </button>
            
            <button
              className="control-button reset-button"
              onClick={handleReset}
              title="Reset level (R)"
            >
              ⟲
            </button>
            
            <button
              className="control-button select-level-button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openLevelSelector'));
              }}
              title="Browse all levels"
            >
              📋
            </button>
            
            <button
              className="control-button help-button"
              onClick={onShowInstructions}
              title="Show help and instructions"
            >
              ❓
            </button>
          </div>
        </div>
        
        {/* Difficulty Selection */}
        <div className="control-section difficulty-section">
          <h3 className="section-title">Difficulty</h3>
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
            className="new-game-button"
            onClick={handleNewGame}
            title={`Start a random ${selectedDifficulty} level`}
          >
            🎲 New {difficultyOptions.find(d => d.id === selectedDifficulty)?.name} Game
          </button>
        </div>
      </div>
      
      {/* Row 2: Colors and Game Info */}
      <div className="control-row row-2">
        {/* Color Palette Section */}
        <div className="control-section color-section">
          <h3 className="section-title">Colors</h3>
          <div className="color-grid">
            {palette.colors.map((color, index) => {
              const colorIndex = index as ColorIndex;
              const isHovered = hoveredColor === colorIndex;
              
              return (
                <button
                  key={colorIndex}
                  className={`color-button ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
                  style={{
                    backgroundColor: color,
                    borderColor: color,
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isHovered
                      ? `0 0 0 2px ${color}60, 0 4px 8px ${color}40`
                      : '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                  onClick={() => handleColorClick(colorIndex)}
                  onMouseEnter={() => setHoveredColor(colorIndex)}
                  onMouseLeave={() => setHoveredColor(null)}
                  disabled={isDisabled}
                  title={`Select color ${colorIndex + 1} (Press ${colorIndex + 1})`}
                >
                  <span className="color-hotkey">{colorIndex + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Game Info */}
        <div className="control-section info-section">
          <div className="current-moves">
            <span className="moves-label">Moves:</span>
            <span className="moves-value">{cubeState.moves}/{cubeState.maxMoves}</span>
          </div>
          
          <div className="control-hints">
            <div className="hint-line">🎨 Click colors or 1-6</div>
            <div className="hint-line">🔄 Drag/arrows to rotate</div>
            <div className="hint-line">⌨️ U: Undo, R: Reset</div>
          </div>
        </div>
      </div>
    </div>
  );
};