import { Suspense, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { 
  useCells, 
  useCubeSize, 
  useGeneration,
  useIsRunning,
  useSimulationStore 
} from './logic/simulationStore'
import { SimulationControls } from './ui/SimulationControls'
import { PatternSelector } from './ui/PatternSelector'
import { GenerationDisplay } from './ui/GenerationDisplay'
import { SpeedControl } from './ui/SpeedControl'
import { ConfigPanel } from './ui/ConfigPanel'
import { DebugPanel } from './components/DebugPanel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SimpleCubeMesh } from './components/SimpleCubeMesh'
import { TestCubeGrid } from './components/TestCubeGrid'
import './ColorCompetitionGame.css'

// Default color palette for the simulation
const DEFAULT_PALETTE = {
  colors: [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // turquoise
    '#2c3e50', // dark gray for empty cells
  ],
}

// Camera setup component
const CameraSetup: React.FC = () => {
  const { camera } = useThree()
  const cubeSize = useCubeSize()
  
  useEffect(() => {
    const distance = cubeSize * 3
    camera.position.set(distance, distance, distance)
    camera.lookAt(0, 0, 0)
    console.log('📷 Camera setup - distance:', distance)
  }, [camera, cubeSize])
  
  return null
}

const CubeScene: React.FC = () => {
  const cells = useCells()
  const cubeSize = useCubeSize()
  console.log('🎮 CubeScene rendering...', { cellsLength: cells.length, cubeSize })
  
  // Force a visible element
  useEffect(() => {
    console.log('CubeScene mounted!')
    return () => console.log('CubeScene unmounted!')
  }, [])
  
  // Dynamic scale based on cube size
  const groupScale = useMemo(() => {
    const scale = cubeSize <= 4 ? 1.5 : 1.5 * (4 / cubeSize)
    return [scale, scale, scale] as [number, number, number]
  }, [cubeSize])
  
  // Log current state
  useEffect(() => {
    console.log('📊 Cells state:', cells.slice(0, 10), '...')
  }, [cells])
  
  return (
    <>
      <color attach="background" args={['#222222']} />
      <CameraSetup />
      <OrbitControls enableDamping dampingFactor={0.05} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      
      {/* Test cube at origin */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Add axes helper */}
      <axesHelper args={[5]} />
      
      {/* Temporarily use TestCubeGrid to verify rendering */}
      <TestCubeGrid size={3} />
      
      {/* Original cube mesh - hidden for now */}
      {false && (
        <group scale={groupScale}>
          <group>
            <SimpleCubeMesh
              cubeSize={cubeSize}
              cells={cells}
              colors={DEFAULT_PALETTE.colors}
            />
          </group>
        </group>
      )}
      
      {/* Grid helper */}
      <gridHelper args={[10, 10]} />
    </>
  )
}

export const ColorCompetitionGame: React.FC = () => {
  const generation = useGeneration()
  const isRunning = useIsRunning()
  
  console.log('🎯 ColorCompetitionGame render - Generation:', generation, 'Running:', isRunning)
  
  // Test if WebGL is supported
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    console.log('WebGL support:', !!gl)
    if (!gl) {
      console.error('WebGL is not supported in this browser!')
    }
  }, [])
  
  return (
    <ErrorBoundary>
    <div className="color-competition-game">
      <div className="game-container">
        <div className="game-scene">
          <Canvas 
            camera={{ position: [10, 10, 10], fov: 50, near: 0.1, far: 1000 }}
            gl={{ outputColorSpace: THREE.SRGBColorSpace }}
            onCreated={(state) => {
              console.log('🎨 Canvas created!', state)
              console.log('WebGL context:', state.gl.getContext())
              console.log('Scene children:', state.scene.children.length)
            }}
            onPointerMissed={() => console.log('Canvas clicked!')}
          >
          <Suspense fallback={null}>
            <CubeScene />
          </Suspense>
        </Canvas>
        </div>
      </div>
      
      <div className="ui-overlay">
        <div className="top-bar">
          <h1>Color Competition</h1>
          <GenerationDisplay generation={generation} />
        </div>
        
        <div className="controls-container">
          <SimulationControls />
          <SpeedControl />
          <PatternSelector />
          <ConfigPanel />
        </div>
        
        <div className="info-panel">
          <p>
            Watch as colors compete for territory in this 3D cellular automaton.
            {isRunning ? ' Simulation is running...' : ' Click Play to start.'}
          </p>
          <p className="instructions">
            • Click cells to change their color
            • Rotate cube with mouse/touch drag
            • Use arrow keys for precision rotation
          </p>
        </div>
        
        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </div>
    </ErrorBoundary>
  )
}