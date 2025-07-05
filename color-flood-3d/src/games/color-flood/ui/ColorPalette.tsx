import { useState } from 'react';
import type { ColorIndex } from '../logic/types';
import { useIsWon, useIsGameOver, useSelectedColor, useCurrentPalette, useSimpleGameStore } from '../logic/simpleGameStore';

interface ColorPaletteProps {
  className?: string;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ className = '' }) => {
  const isWon = useIsWon();
  const isGameOver = useIsGameOver();
  const selectedColor = useSelectedColor();
  const palette = useCurrentPalette();
  const [hoveredColor, setHoveredColor] = useState<ColorIndex | null>(null);
  
  const handleColorClick = (colorIndex: ColorIndex) => {
    if (isWon || isGameOver) return;
    
    const state = useSimpleGameStore.getState();
    state.applyColor(colorIndex);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent, colorIndex: ColorIndex) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleColorClick(colorIndex);
    }
  };
  
  const isDisabled = isWon || isGameOver;
  
  return (
    <div className={`color-palette ${className}`}>
      <div className="color-palette-grid">
        {palette.colors.map((color, index) => {
          const colorIndex = index as ColorIndex;
          const isSelected = selectedColor === colorIndex;
          const isHovered = hoveredColor === colorIndex;
          
          return (
            <button
              key={colorIndex}
              className={`color-button ${isSelected ? 'selected' : ''} ${
                isHovered ? 'hovered' : ''
              } ${isDisabled ? 'disabled' : ''}`}
              style={{
                backgroundColor: color,
                transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 0 0 3px ${color}40, 0 4px 12px ${color}60`
                  : isHovered
                  ? `0 0 0 2px ${color}60, 0 2px 8px ${color}40`
                  : '0 2px 4px rgba(0,0,0,0.2)',
              }}
              onClick={() => handleColorClick(colorIndex)}
              onMouseEnter={() => setHoveredColor(colorIndex)}
              onMouseLeave={() => setHoveredColor(null)}
              onKeyDown={(e) => handleKeyDown(e, colorIndex)}
              disabled={isDisabled}
              aria-label={`Color ${colorIndex + 1}`}
              tabIndex={0}
            >
              <span className="color-number">{colorIndex + 1}</span>
            </button>
          );
        })}
      </div>
      
      <div className="color-palette-hint">
        <div className="keyboard-hints">
          <span>Press 1-6 to select colors</span>
          <span>Arrow keys to rotate</span>
          <span>Q/E to roll</span>
        </div>
      </div>
    </div>
  );
};