import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Group } from 'three'
import type { SpringValue } from '@react-spring/three'
// import { CubeMesh } from '../../engine/CubeMesh'
import { TransparentCubeMesh } from './components/TransparentCubeMesh'
import { useCubeControls } from '../../engine/useCubeControls'
import type { CubeSize } from '../../engine/types'
import type { ColorIndex } from '../color-flood/logic/types'
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
import { CellStats } from './ui/CellStats'
import { VisualSettings } from './ui/VisualSettings'
import { AlgorithmSelector } from './ui/AlgorithmSelector'
import { SimulationAnalysis } from './ui/SimulationAnalysis'
import { useCellOpacity, useShowEmptyCells, useEmptyOpacity } from './logic/visualStore'
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

const CubeScene: React.FC = () => {
  const cells = useCells()
  const cubeSize = useCubeSize()
  const { setCells } = useSimulationStore()
  
  // Visual settings
  const cellOpacity = useCellOpacity()
  const showEmptyCells = useShowEmptyCells()
  const emptyOpacity = useEmptyOpacity()
  
  console.log('🎨 CubeScene render - cells:', cells.length, 'cubeSize:', cubeSize, 'opacity:', cellOpacity)
  
  // Convert cells array to format expected by CubeMesh (null becomes 6 for empty)
  const meshCells = useMemo(() => {
    return cells.map(cell => cell !== null ? cell : 6)
  }, [cells])
  
  const { rotation } = useCubeControls({
    rotationSpeed: 1.2,
    keyboardSpeed: 45,
    enableKeyboard: true,
    enableMouse: true,
    enableTouch: true
  })
  
  
  // Dynamic scale based on cube size
  const groupScale = useMemo(() => {
    const scale = cubeSize <= 4 ? 1.5 : 1.5 * (4 / cubeSize)
    return [scale, scale, scale] as [number, number, number]
  }, [cubeSize])
  
  // Handle cell click to toggle cell state
  const handleCellClick = (index: number) => {
    const newCells = [...cells]
    if (newCells[index] === null) {
      // Add a random color
      newCells[index] = Math.floor(Math.random() * 6) as ColorIndex
    } else {
      // Cycle to next color or back to empty
      const nextValue = (newCells[index]! + 1) % 7
      newCells[index] = nextValue === 0 ? null : (nextValue - 1) as ColorIndex
    }
    setCells(newCells)
  }
  
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <group scale={groupScale}>
        <AnimatedGroup rotation={rotation}>
          <TransparentCubeMesh
            cells={meshCells}
            colors={DEFAULT_PALETTE.colors}
            spacing={1.1}
            cubeSize={cubeSize as CubeSize}
            onCellClick={handleCellClick}
            cellOpacity={cellOpacity}
            showEmptyCells={showEmptyCells}
            emptyOpacity={emptyOpacity}
          />
        </AnimatedGroup>
      </group>
    </>
  )
}

export const ColorCompetitionGame: React.FC = () => {
  const generation = useGeneration()
  const isRunning = useIsRunning()
  const cubeSize = useCubeSize()
  
  // Dynamic camera position based on cube size
  const cameraDistance = cubeSize * 2.7
  const cameraPosition = [cameraDistance, cameraDistance, cameraDistance] as [number, number, number]
  
  return (
    <div className="color-competition-game">
      <div className="canvas-container">
        <Canvas camera={{ position: cameraPosition, fov: 50 }}>
          <Suspense fallback={null}>
            <CubeScene />
          </Suspense>
        </Canvas>
      </div>
      
      <div className="ui-overlay">
        <div className="top-bar">
          <h1>Color Competition</h1>
          <GenerationDisplay generation={generation} />
        </div>
        
        <div className="controls-container">
          <AlgorithmSelector />
          <SimulationControls />
          <SpeedControl />
          <PatternSelector />
          <ConfigPanel />
          <VisualSettings />
        </div>
        
        <div className="right-panel">
          <SimulationAnalysis />
          <CellStats />
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
        </div>
      </div>
    </div>
  )
}