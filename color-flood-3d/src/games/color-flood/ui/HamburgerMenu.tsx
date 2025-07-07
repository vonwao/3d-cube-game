import React, { useState } from 'react';
import { useSimpleGameStore, useCubeSize, useShowDpad, useIsExploded } from '../logic/simpleGameStore';
import { CubeSizeSelector } from './CubeSizeSelector';
import { generateLevelForSize } from '../logic/levelGenerator';
import type { CubeSize } from '../../../engine/types';

interface HamburgerMenuProps {
  onShowInstructions?: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onShowInstructions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cubeSize = useCubeSize();
  const showDpad = useShowDpad();
  const isExploded = useIsExploded();

  const handleNewPuzzle = () => {
    const level = generateLevelForSize(cubeSize, 5); // Medium difficulty
    useSimpleGameStore.getState().loadLevel(level);
    setIsOpen(false);
  };

  const handleCubeSizeChange = (size: CubeSize) => {
    useSimpleGameStore.getState().changeCubeSize(size);
    setIsOpen(false);
  };

  const toggleDpad = () => {
    useSimpleGameStore.getState().toggleShowDpad();
  };

  const specialPuzzles = [
    { name: 'The Onion', size: 3, difficulty: 6 },
    { name: 'Rainbow Layers', size: 4, difficulty: 7 },
    { name: 'Gradient Flow', size: 5, difficulty: 8 },
    { name: 'Color Storm', size: 6, difficulty: 9 },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        ☰
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsOpen(false)} />
          <div className="hamburger-menu">
            <div className="menu-header">
              <h2>Settings</h2>
              <button 
                className="close-menu-button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="menu-section">
              <h3>Cube Size</h3>
              <div className="cube-size-buttons">
                {([3, 4, 5, 6] as CubeSize[]).map(size => (
                  <button
                    key={size}
                    className={`size-button ${cubeSize === size ? 'active' : ''}`}
                    onClick={() => handleCubeSizeChange(size)}
                  >
                    {size}×{size}×{size}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <h3>Display Options</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={showDpad}
                  onChange={toggleDpad}
                />
                <span>Show D-pad Controls</span>
              </label>
            </div>

            <div className="menu-section">
              <button 
                className="menu-button primary"
                onClick={handleNewPuzzle}
              >
                🎲 New Random Puzzle
              </button>
            </div>

            <div className="menu-section">
              <h3>Special Puzzles</h3>
              <div className="special-puzzles">
                {specialPuzzles.map(puzzle => (
                  <button
                    key={puzzle.name}
                    className="special-puzzle-button"
                    onClick={() => {
                      if (cubeSize !== puzzle.size) {
                        handleCubeSizeChange(puzzle.size as CubeSize);
                      }
                      const level = generateLevelForSize(puzzle.size as CubeSize, puzzle.difficulty);
                      useSimpleGameStore.getState().loadLevel(level);
                      setIsOpen(false);
                    }}
                  >
                    {puzzle.name} ({puzzle.size}×{puzzle.size}×{puzzle.size})
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-list">
                <div className="shortcut">
                  <span className="key">1-6</span>
                  <span className="action">Select colors</span>
                </div>
                <div className="shortcut">
                  <span className="key">E</span>
                  <span className="action">Toggle exploded view</span>
                </div>
                <div className="shortcut">
                  <span className="key">U</span>
                  <span className="action">Undo last move</span>
                </div>
                <div className="shortcut">
                  <span className="key">R</span>
                  <span className="action">Reset puzzle</span>
                </div>
                <div className="shortcut">
                  <span className="key">↑↓←→</span>
                  <span className="action">Rotate cube</span>
                </div>
                <div className="shortcut">
                  <span className="key">Q/E</span>
                  <span className="action">Roll left/right</span>
                </div>
              </div>
            </div>

            {onShowInstructions && (
              <div className="menu-section">
                <button 
                  className="menu-button"
                  onClick={() => {
                    onShowInstructions();
                    setIsOpen(false);
                  }}
                >
                  💡 How to Play
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};