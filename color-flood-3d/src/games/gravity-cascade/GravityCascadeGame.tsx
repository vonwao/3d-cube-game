import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Group } from 'three'
import type { SpringValue } from '@react-spring/three'
import { useCubeControls } from '../../engine/useCubeControls'
import type { CubeSize } from '../../engine/types'
import {
  useGameStore,
  useBlocks,
  useSelectedBlockId,
  useScore,
  useCombo,
  useGameStatus,
  useCurrentLevel,
  useIsAnimating
} from './logic/gameStore'
import { LEVELS, COLOR_PALETTE } from './config/levels'
import { BlockRenderer } from './ui/BlockRenderer'
import { GameHUD } from './ui/GameHUD'
import { LevelSelector } from './ui/LevelSelector'
import { WinDialog } from './ui/WinDialog'
import styles from './GravityCascade.module.css'

interface AnimatedGroupProps {
  rotation: [SpringValue<number>, SpringValue<number>, SpringValue<number>]
  children: React.ReactNode
}

const AnimatedGroup: React.FC<AnimatedGroupProps> = ({ rotation, children }) => {
  const groupRef = useRef<Group>(null)
  const lastValues = useRef({ x: 0, y: 0, z: 0 })
  
  useFrame(() => {
    if (groupRef.current) {
      const x = rotation[0].get()
      const y = rotation[1].get()
      const z = rotation[2].get()
      
      if (Math.abs(x - lastValues.current.x) > 0.001 || 
          Math.abs(y - lastValues.current.y) > 0.001 || 
          Math.abs(z - lastValues.current.z) > 0.001) {
        
        groupRef.current.rotation.x = x
        groupRef.current.rotation.y = y
        groupRef.current.rotation.z = z
        
        lastValues.current = { x, y, z }
      }
    }
  })
  
  return <group ref={groupRef}>{children}</group>
}

const GameScene: React.FC = () => {
  const blocks = useBlocks()
  const selectedBlockId = useSelectedBlockId()
  const currentLevel = useCurrentLevel()
  const { selectBlock, swapBlocks, updatePhysics } = useGameStore()
  
  const { rotation } = useCubeControls({
    rotationSpeed: 1.0,
    keyboardSpeed: 45,
    enableKeyboard: true,
    enableMouse: true,
    enableTouch: true
  })
  
  // Update physics every frame
  useFrame(() => {
    updatePhysics()
  })
  
  const handleBlockClick = (blockId: string) => {
    if (selectedBlockId === null) {
      selectBlock(blockId)
    } else if (selectedBlockId === blockId) {
      selectBlock(null)
    } else {
      swapBlocks(selectedBlockId, blockId)
    }
  }
  
  if (!currentLevel) return null
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      <AnimatedGroup rotation={rotation}>
        {/* Grid helper to visualize cube bounds */}
        <gridHelper 
          args={[currentLevel.cubeSize, currentLevel.cubeSize]} 
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        />
        
        {/* Gravity well at center */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#3A86FF"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Render blocks */}
        <BlockRenderer
          blocks={blocks}
          colors={COLOR_PALETTE.colors}
          selectedBlockId={selectedBlockId}
          onBlockClick={handleBlockClick}
          cubeSize={currentLevel.cubeSize as CubeSize}
        />
      </AnimatedGroup>
      
      <Environment preset="sunset" />
    </>
  )
}

export const GravityCascadeGame: React.FC = () => {
  const { initLevel, spawnBlocks } = useGameStore()
  const score = useScore()
  const combo = useCombo()
  const gameStatus = useGameStatus()
  const currentLevel = useCurrentLevel()
  const isAnimating = useIsAnimating()
  
  // Initialize first level
  useEffect(() => {
    initLevel(LEVELS[0])
  }, [initLevel])
  
  // Spawn blocks periodically
  useEffect(() => {
    if (!currentLevel || gameStatus !== 'playing' || isAnimating) return
    
    const interval = setInterval(() => {
      spawnBlocks(Math.ceil(currentLevel.spawnRate))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [currentLevel, gameStatus, isAnimating, spawnBlocks])
  
  const handleLevelSelect = (level: typeof LEVELS[0]) => {
    initLevel(level)
  }
  
  const handleNextLevel = () => {
    if (currentLevel) {
      const nextLevelIndex = LEVELS.findIndex(l => l.id === currentLevel.id) + 1
      if (nextLevelIndex < LEVELS.length) {
        initLevel(LEVELS[nextLevelIndex])
      }
    }
  }
  
  return (
    <div className={styles.gameContainer}>
      <div className={styles.canvasContainer}>
        <Canvas
          camera={{ position: [15, 15, 15], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0a0a0a')
          }}
        >
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
      </div>
      
      <div className={styles.uiOverlay}>
        <GameHUD
          score={score}
          combo={combo}
          level={currentLevel?.id || 1}
          targetScore={currentLevel?.targetScore || 0}
        />
        
        <LevelSelector
          levels={LEVELS}
          currentLevelId={currentLevel?.id || 1}
          onSelectLevel={handleLevelSelect}
        />
      </div>
      
      {gameStatus === 'won' && currentLevel && (
        <WinDialog
          score={score}
          targetScore={currentLevel.targetScore}
          onNextLevel={handleNextLevel}
          onReplay={() => initLevel(currentLevel)}
        />
      )}
    </div>
  )
}