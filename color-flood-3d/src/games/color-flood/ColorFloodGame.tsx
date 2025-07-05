import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Group } from 'three';
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

interface AnimatedGroupProps {
  rotation: [any, any, any];
  children: React.ReactNode;
}

const AnimatedGroup: React.FC<AnimatedGroupProps> = ({ rotation, children }) => {
  const groupRef = useRef<Group>(null);
  const lastValues = useRef({ x: 0, y: 0, z: 0 });
  
  useFrame(() => {
    if (groupRef.current) {
      const x = rotation[0].get();
      const y = rotation[1].get();
      const z = rotation[2].get();
      
      // Only log and update if values changed significantly
      if (Math.abs(x - lastValues.current.x) > 0.001 || 
          Math.abs(y - lastValues.current.y) > 0.001 || 
          Math.abs(z - lastValues.current.z) > 0.001) {
        
        console.log('🟢 AnimatedGroup applying rotation:', { x, y, z });
        console.log('🟢 Group ref exists:', !!groupRef.current);
        console.log('🟢 Previous group rotation:', groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z);
        
        groupRef.current.rotation.x = x;
        groupRef.current.rotation.y = y;
        groupRef.current.rotation.z = z;
        
        console.log('🟢 New group rotation:', groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z);
        
        lastValues.current = { x, y, z };
      }
    } else {
      console.log('🔴 AnimatedGroup: groupRef.current is null');
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

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
      
      <AnimatedGroup rotation={rotation}>
        <CubeMesh
          cells={cubeState.cells}
          colors={palette.colors}
          floodRegion={cubeState.floodRegion}
          spacing={1.1}
          animationProgress={animationProgress}
          onCellClick={onCellClick}
        />
      </AnimatedGroup>
      
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