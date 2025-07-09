import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { TransparentCubeMesh } from './components/TransparentCubeMesh'
import { useCubeControls } from '../../engine/useCubeControls'
import type { CubeSize } from '../../engine/types'
import type { ColorIndex } from '../color-flood/logic/types'
import { 
  useCells, 
  useCubeSize, 
  useGeneration,
  useSimulationStore,
  useCellStates,
  useCurrentAlgorithm
} from './logic/simulationStore'
import { SimplePresetSelector } from './ui/SimplePresetSelector'
import { PresetDetailsPanel } from './ui/PresetDetailsPanel'
import { SimpleControls } from './ui/SimpleControls'
import { VisualSettings } from './ui/VisualSettings'
import { GenerationDisplay } from './ui/GenerationDisplay'
import { getPresetById, type UnifiedPreset } from './logic/allPresets'
import { useCellOpacity, useShowEmptyCells, useEmptyOpacity } from './logic/visualStore'
import './ColorCompetitionSimple.css'

// Default color palette
const DEFAULT_PALETTE = {
  colors: [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // teal
  ] as const,
}

// 3D Scene Component
interface CubeSceneProps {
  cells: (ColorIndex | null)[]
  cubeSize: CubeSize
  cellStates: any[]
  currentAlgorithm: string
  cellOpacity: number
  showEmptyCells: boolean
  emptyOpacity: number
}

const CubeScene: React.FC<CubeSceneProps> = ({ 
  cells, 
  cubeSize, 
  cellStates, 
  currentAlgorithm,
  cellOpacity,
  showEmptyCells,
  emptyOpacity
}) => {
  const { rotation } = useCubeControls()
  
  return (
    <group rotation={[rotation[0].get(), rotation[1].get(), 0]}>
      <TransparentCubeMesh
        cells={cells.map(c => c ?? -1)}
        cubeSize={cubeSize}
        colors={[...DEFAULT_PALETTE.colors]}
        cellStates={cellStates}
        currentAlgorithm={currentAlgorithm}
        cellOpacity={cellOpacity}
        showEmptyCells={showEmptyCells}
        emptyOpacity={emptyOpacity}
      />
    </group>
  )
}

export function ColorCompetitionSimple() {
  const cells = useCells()
  const cubeSize = useCubeSize()
  const generation = useGeneration()
  const cellStates = useCellStates()
  const currentAlgorithm = useCurrentAlgorithm()
  const cellOpacity = useCellOpacity()
  const showEmptyCells = useShowEmptyCells()
  const emptyOpacity = useEmptyOpacity()
  
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [currentPreset, setCurrentPreset] = useState<UnifiedPreset | null>(null)
  
  const { setAlgorithm, setCubeSize, setCells, setLife3DConfig, setEnergyConfig, setMagnetConfig, setInfoConfig, setConfig, setSpeed } = useSimulationStore()
  
  // Handle preset selection
  const handleSelectPreset = (preset: UnifiedPreset) => {
    setSelectedPresetId(preset.id)
    setCurrentPreset(preset)
    
    // Apply preset configuration
    setAlgorithm(preset.algorithm)
    setCubeSize(preset.cubeSize)
    setCells([...preset.pattern])
    
    // Apply algorithm-specific config
    switch (preset.algorithm) {
      case 'life3d':
        setLife3DConfig(preset.config)
        break
      case 'energy':
        setEnergyConfig(preset.config)
        break
      case 'magnet':
        setMagnetConfig(preset.config)
        break
      case 'info':
        setInfoConfig(preset.config)
        break
      case 'competition':
        setConfig(preset.config)
        break
    }
    
    // Set recommended speed
    const speedMap = {
      slow: 1000,
      normal: 500,
      fast: 200,
      ultra: 50
    }
    setSpeed(speedMap[preset.bestSpeed])
  }
  
  // Load default preset on mount
  useEffect(() => {
    const defaultPreset = getPresetById('energy-fountain')
    if (defaultPreset && !selectedPresetId) {
      handleSelectPreset(defaultPreset)
    }
  }, [])
  
  return (
    <div className="color-competition-simple">
      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <Suspense fallback={null}>
            <CubeScene
              cells={cells}
              cubeSize={cubeSize as CubeSize}
              cellStates={cellStates}
              currentAlgorithm={currentAlgorithm}
              cellOpacity={cellOpacity}
              showEmptyCells={showEmptyCells}
              emptyOpacity={emptyOpacity}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>Cellular Automata Explorer</h1>
          <GenerationDisplay generation={generation} />
        </div>
        
        {/* Left Panel - Presets & Controls */}
        <div className="left-panel">
          <SimplePresetSelector
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
          />
          <SimpleControls />
          <VisualSettings />
        </div>
        
        {/* Right Panel - Details */}
        <div className="right-panel">
          <PresetDetailsPanel preset={currentPreset} />
        </div>
      </div>
    </div>
  )
}