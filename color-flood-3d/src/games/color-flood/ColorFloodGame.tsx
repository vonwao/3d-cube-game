import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { CubeMesh } from '../../engine/CubeMesh';
import { useCubeControls } from '../../engine/useCubeControls';
import { useGameActions, useGameState, usePalette, useAnimationState, useGameStore } from './logic/gameStore';
import { ColorPalette } from './ui/ColorPalette';
import { GameHUD } from './ui/GameHUD';
import { SAMPLE_LEVELS } from './levels/sampleLevels';

interface CubeSceneProps {
  onCellClick?: (index: number) => void;
}

const CubeScene: React.FC<CubeSceneProps> = ({ onCellClick }) => {
  const { cubeState } = useGameState();
  const palette = usePalette();
  const { animationProgress } = useAnimationState();
  const { rotation } = useCubeControls({
    rotationSpeed: 1.2,
    dampingFactor: 0.08,
    enableKeyboard: true,
  });
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key >= '1' && key <= '6') {
        const colorIndex = parseInt(key) - 1;
        if (colorIndex >= 0 && colorIndex < 6) {
          const state = useGameStore.getState();
          state.actions.applyColor(colorIndex as 0 | 1 | 2 | 3 | 4 | 5);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
      
      <group rotation={rotation}>
        <CubeMesh
          cells={cubeState.cells}
          colors={palette.colors}
          floodRegion={cubeState.floodRegion}
          spacing={1.1}
          animationProgress={animationProgress}
          onCellClick={onCellClick}
        />
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
  const { loadLevel } = useGameActions();
  const { currentLevel } = useGameState();
  
  useEffect(() => {
    if (!currentLevel) {
      loadLevel(SAMPLE_LEVELS[0]);
    }
  }, [currentLevel, loadLevel]);
  
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
      </div>
    </div>
  );
};