import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { animated } from '@react-spring/three';
import { CubeMesh } from '../../engine/CubeMesh';
import { useCubeControls } from '../../engine/useCubeControls';
import { useKeyboardManager, isColorKey } from '../../engine/useKeyboardManager';
import { useGameAnimation } from './hooks/useGameAnimation';
import { useCurrentLevel, useCubeState, useCurrentPalette, useAnimationProgress, useSimpleGameStore } from './logic/simpleGameStore';
import { ColorPalette } from './ui/ColorPalette';
import { GameHUD } from './ui/GameHUD';
import { Instructions } from './ui/Instructions';
import { LevelSelector } from './ui/LevelSelector';
import { SAMPLE_LEVELS } from './levels/sampleLevels';
import type { Level } from './logic/types';

interface CubeSceneProps {
  onCellClick?: (index: number) => void;
}

const CubeScene: React.FC<CubeSceneProps> = ({ onCellClick }) => {
  const cubeState = useCubeState();
  const palette = useCurrentPalette();
  const animationProgress = useAnimationProgress();
  const { rotation } = useCubeControls({
    rotationSpeed: 1.2,
    keyboardSpeed: 45,
    enableKeyboard: true,
  });
  
  // Initialize the game animation system
  useGameAnimation();
  
  // Debug rotation values
  useEffect(() => {
    console.log('🔵 Rotation springs:', rotation);
    console.log('🔵 Rotation values:', rotation[0].get(), rotation[1].get(), rotation[2].get());
  }, [rotation]);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <animated.group rotation-x={rotation[0]} rotation-y={rotation[1]} rotation-z={rotation[2]}>
        <CubeMesh
          cells={cubeState.cells}
          colors={palette.colors}
          floodRegion={cubeState.floodRegion}
          spacing={1.1}
          animationProgress={animationProgress}
          onCellClick={onCellClick}
        />
      </animated.group>
      
      <Environment preset="studio" />
    </>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading 3D Scene...</p>
  </div>
);

export const ColorFloodGame: React.FC = () => {
  const currentLevel = useCurrentLevel();
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Color selection keyboard handler with highest priority (outside Canvas)
  useKeyboardManager(
    (event: KeyboardEvent) => {
      const colorIndex = isColorKey(event.key);
      
      if (colorIndex !== null) {
        const state = useSimpleGameStore.getState();
        state.applyColor(colorIndex as 0 | 1 | 2 | 3 | 4 | 5);
        return true; // Event handled
      }
      
      return false; // Event not handled
    },
    { 
      enabled: true,
      priority: 20 // Highest priority - color selection takes precedence
    }
  );
  
  useEffect(() => {
    if (!currentLevel) {
      const state = useSimpleGameStore.getState();
      state.loadLevel(SAMPLE_LEVELS[0]);
    }
  }, [currentLevel]);
  
  useEffect(() => {
    const handleOpenLevelSelector = () => {
      setShowLevelSelector(true);
    };
    
    window.addEventListener('openLevelSelector', handleOpenLevelSelector);
    
    return () => {
      window.removeEventListener('openLevelSelector', handleOpenLevelSelector);
    };
  }, []);
  
  const handleLevelSelect = (level: Level) => {
    const state = useSimpleGameStore.getState();
    state.loadLevel(level);
    setShowLevelSelector(false);
  };
  
  const handleCloseLevelSelector = () => {
    setShowLevelSelector(false);
  };
  
  const handleCellClick = (index: number) => {
    console.log(`Cell clicked: ${index}`);
  };
  
  if (!currentLevel) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="color-flood-game">
      <div className="game-container">
        <GameHUD className="game-hud" />
        
        <div className="game-scene">
          <Canvas
            camera={{
              position: [8, 8, 8],
              fov: 50,
            }}
            shadows
            className="game-canvas"
          >
            <Suspense fallback={null}>
              <CubeScene onCellClick={handleCellClick} />
            </Suspense>
          </Canvas>
        </div>
        
        <ColorPalette className="color-palette" />
        
        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}
        
        {showLevelSelector && (
          <LevelSelector
            onLevelSelect={handleLevelSelect}
            onClose={handleCloseLevelSelector}
          />
        )}
      </div>
    </div>
  );
};