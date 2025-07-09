// Example: ColorFloodGame.tsx with CSS Modules
// This shows the key changes needed to migrate from global CSS to CSS Modules

import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
// ... other imports ...

// CHANGE 1: Import CSS Module instead of global CSS
import styles from './ColorFloodGame.module.css';
// Remove: import './ColorFloodGame.css';

// CHANGE 2: Update LoadingSpinner component
const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>
    <div className={styles.spinner}></div>
    <p>Loading 3D Scene...</p>
  </div>
);

export const ColorFloodGame: React.FC = () => {
  // ... component logic stays the same ...

  return (
    // CHANGE 3: Update all className references
    <div className={styles.colorFloodGame}>
      <div className={styles.gameContainer}>
        <div className={styles.gameScene}>
          <Canvas
            camera={{
              position: cameraPosition,
              fov: 50,
            }}
            shadows
            className={styles.gameCanvas} // Update Canvas className
            gl={{
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.LinearToneMapping,
              toneMappingExposure: 1
            }}
          >
            <Suspense fallback={null}>
              <CubeScene onCellClick={handleCellClick} />
            </Suspense>
          </Canvas>
          
          {/* Visual feedback overlays */}
          <MoveEffects />
          <ComboTracker />
        </div>
        
        {/* Minimal bottom controls */}
        <MinimalControls 
          onShowInstructions={() => setShowInstructions(true)} 
          showColorPalette={showColorPalette}
          onToggleColorPalette={setShowColorPalette}
        />
        
        {/* D-pad controls (toggleable) */}
        <DpadControls />
        
        {/* Color Palette (toggleable) */}
        {showColorPalette && (
          <ColorPalette className={styles.floatingPalette} />
        )}
        
        {/* Toast notifications */}
        <MoveToast />
        
        {/* Win Dialog */}
        {isWon && !dismissedWinDialog && (
          <WinDialog onClose={() => setDismissedWinDialog(true)} />
        )}
        
        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}
      </div>
      
      {/* Hamburger Menu - rendered outside of game-container */}
      <HamburgerMenu onShowInstructions={() => setShowInstructions(true)} />
      
      {/* Tutorial Overlay */}
      <TutorialOverlay />
    </div>
  );
};

// CHANGE 4: Example of updating a component with conditional classes
const ExampleButton: React.FC<{ active?: boolean; disabled?: boolean }> = ({ active, disabled }) => {
  // Old way:
  // <button className={`control-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>

  // New way with CSS Modules:
  return (
    <button 
      className={`
        ${styles.controlButton} 
        ${active ? styles.controlButtonActive : ''} 
        ${disabled ? styles.disabled : ''}
      `.trim()}
      disabled={disabled}
    >
      Button
    </button>
  );
};

// CHANGE 5: Example of passing styles to child components
interface ColorPaletteProps {
  className?: string;
}

const ColorPaletteExample: React.FC<ColorPaletteProps> = ({ className }) => {
  // Merge module styles with passed className
  return (
    <div className={`${styles.colorPalette} ${className || ''}`}>
      {/* Palette content */}
    </div>
  );
};

// CHANGE 6: Using styles in dynamic scenarios
const DynamicStarRating: React.FC<{ stars: number }> = ({ stars }) => {
  return (
    <div className={styles.starsContainer}>
      {[1, 2, 3].map((star) => (
        <span 
          key={star} 
          className={`${styles.star} ${star <= stars ? styles.starFilled : styles.starEmpty}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};