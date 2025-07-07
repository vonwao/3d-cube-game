import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Group } from 'three';
import * as THREE from 'three';
import type { SpringValue } from '@react-spring/three';
import { CubeMesh } from '../../engine/CubeMesh';
import { useCubeControls } from '../../engine/useCubeControls';
import { useKeyboardManager, isColorKey } from '../../engine/useKeyboardManager';
import { useGameAnimation } from './hooks/useGameAnimation';
import { useExplosionAnimation } from './hooks/useExplosionAnimation';
import { useCurrentLevel, useCubeState, useCurrentPalette, useAnimationProgress, useSimpleGameStore, useCubeSize, useExplosionProgress } from './logic/simpleGameStore';
import { MinimalControls } from './ui/MinimalControls';
import { DpadControls } from './ui/DpadControls';
import { ColorPalette } from './ui/ColorPalette';
import { HamburgerMenu } from './ui/HamburgerMenu';
import { Instructions } from './ui/Instructions';
import { MoveToast } from './ui/MoveToast';
import { WinDialog } from './ui/WinDialog';
import { MoveEffects } from './ui/MoveEffects';
import { ComboTracker } from './ui/ComboTracker';
import { TutorialOverlay } from './ui/TutorialOverlay';
import { SAMPLE_LEVELS } from './levels/sampleLevels';
import { useTutorialStore, useHasSeenTutorial } from './logic/tutorialStore';

interface CubeSceneProps {
  onCellClick?: (index: number) => void;
}

interface AnimatedGroupProps {
  rotation: [SpringValue<number>, SpringValue<number>, SpringValue<number>];
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
      
      // Only update if values changed significantly
      if (Math.abs(x - lastValues.current.x) > 0.001 || 
          Math.abs(y - lastValues.current.y) > 0.001 || 
          Math.abs(z - lastValues.current.z) > 0.001) {
        
        groupRef.current.rotation.x = x;
        groupRef.current.rotation.y = y;
        groupRef.current.rotation.z = z;
        
        lastValues.current = { x, y, z };
      }
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

const CubeScene: React.FC<CubeSceneProps> = ({ onCellClick }) => {
  const cubeState = useCubeState();
  const palette = useCurrentPalette();
  const animationProgress = useAnimationProgress();
  const cubeSize = useCubeSize();
  const explosionProgress = useExplosionProgress();
  const { registerAction } = useTutorialStore();
  const { rotation, isRotating } = useCubeControls({
    rotationSpeed: 1.2,
    keyboardSpeed: 45,
    enableKeyboard: true,
    enableMouse: true,
    enableTouch: true
  });
  
  // Track rotation for tutorial
  useEffect(() => {
    if (isRotating) {
      registerAction('rotate-cube');
    }
  }, [isRotating, registerAction]);
  
  // Initialize the game animation system
  useGameAnimation();
  
  // Initialize explosion animation
  useExplosionAnimation();
  
  // Dynamic scale based on cube size
  const groupScale = useMemo(() => {
    const scale = cubeSize <= 4 ? 1.5 : 1.5 * (4 / cubeSize);
    return [scale, scale, scale] as [number, number, number];
  }, [cubeSize]);
  
  
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <group scale={groupScale}>
        <AnimatedGroup rotation={rotation}>
          <CubeMesh
            cells={cubeState.cells}
            colors={palette.colors}
            floodRegion={cubeState.floodRegion}
            spacing={1.1}
            animationProgress={animationProgress}
            onCellClick={onCellClick}
            enableHover={true}
            cubeSize={cubeSize}
            explosionProgress={explosionProgress}
          />
        </AnimatedGroup>
      </group>
      
      
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
  const cubeSize = useCubeSize();
  const hasSeenTutorial = useHasSeenTutorial();
  const { startTutorial, registerAction } = useTutorialStore();
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('showInstructionsOnStart') === 'true';
  });
  const [showColorPalette, setShowColorPalette] = useState(() => {
    return localStorage.getItem('showColorPalette') === 'true';
  });
  
  // Dynamic camera position based on cube size
  const cameraPosition = useMemo(() => {
    const distance = cubeSize * 2.7;
    return [distance, distance, distance] as [number, number, number];
  }, [cubeSize]);
  
  // Color selection keyboard handler with highest priority (outside Canvas)
  useKeyboardManager(
    (event: KeyboardEvent) => {
      const colorIndex = isColorKey(event.key);
      
      if (colorIndex !== null) {
        const state = useSimpleGameStore.getState();
        state.applyColor(colorIndex as 0 | 1 | 2 | 3 | 4 | 5);
        registerAction('make-move');
        return true; // Event handled
      }
      
      // Handle explode toggle with 'E' key
      if (event.key === 'e' || event.key === 'E') {
        const state = useSimpleGameStore.getState();
        state.toggleExplodedView();
        return true;
      }
      
      // Handle menu toggle with 'M' or 'Escape' key
      if (event.key === 'm' || event.key === 'M' || event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('openHamburgerMenu'));
        return true;
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
  
  // Start tutorial for new users
  useEffect(() => {
    if (!hasSeenTutorial && currentLevel) {
      // Slight delay to ensure everything is loaded
      setTimeout(() => {
        startTutorial();
      }, 500);
    }
  }, [hasSeenTutorial, currentLevel, startTutorial]);
  
  // Listen for color palette toggle from hamburger menu
  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      setShowColorPalette(customEvent.detail);
    };
    
    window.addEventListener('toggleColorPalette', handleToggle);
    return () => window.removeEventListener('toggleColorPalette', handleToggle);
  }, []);
  
  const handleCellClick = (index: number) => {
    const state = useSimpleGameStore.getState();
    const cubeState = state.cubeState;
    const clickedCellColor = cubeState.cells[index];
    state.applyColor(clickedCellColor as 0 | 1 | 2 | 3 | 4 | 5);
    registerAction('make-move');
  };
  
  if (!currentLevel) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="color-flood-game">
      <div className="game-container">
        <div className="game-scene">
          <Canvas
            camera={{
              position: cameraPosition,
              fov: 50,
            }}
            shadows
            className="game-canvas"
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
        <MinimalControls onShowInstructions={() => setShowInstructions(true)} />
        
        {/* D-pad controls (toggleable) */}
        <DpadControls />
        
        {/* Color Palette (toggleable) */}
        {showColorPalette && (
          <ColorPalette className="floating-palette" />
        )}
        
        {/* Toast notifications */}
        <MoveToast />
        
        {/* Win Dialog */}
        <WinDialog />
        
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