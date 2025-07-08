import { create } from 'zustand'
import type { ColorIndex } from '../../color-flood/logic/types'
import type { SimulationState, SimulationConfig, Pattern } from './types'
import { evolveGeneration, createRandomPattern, createGliderPattern, createColorWavePattern } from './automata'
import { createWelcomePattern } from './patterns'
import { createOscillatorPattern, createStillLifePattern } from './additionalPatterns'
import { create3DLifePattern, createDiamondPattern, createHelixPattern, createPulsarPattern, createCrystalGrowthPattern } from './proven3DPatterns'
import { createLife3DSeedPattern, createLife3DCornerPattern, createLife3DLayeredPattern, createLife3DSpiralPattern } from './life3dPatterns'
import { evolveLife3D, LIFE3D_PRESETS } from './life3d'
import type { AlgorithmType, CellState, Life3DConfig } from './types'

interface SimulationStore extends SimulationState {
  config: SimulationConfig
  intervalId: number | null
  
  // Algorithm state
  currentAlgorithm: AlgorithmType
  cellStates: CellState[]
  life3dConfig: Life3DConfig
  
  // Actions
  setCells: (cells: (ColorIndex | null)[]) => void
  setCubeSize: (size: number) => void
  setSpeed: (speed: number) => void
  setRunning: (running: boolean) => void
  toggleRunning: () => void
  step: () => void
  reset: () => void
  loadPattern: (pattern: Pattern) => void
  randomize: (density?: number) => void
  setConfig: (config: Partial<SimulationConfig>) => void
  
  // Algorithm actions
  setAlgorithm: (algorithm: AlgorithmType) => void
  setLife3DConfig: (config: Partial<Life3DConfig>) => void
  loadLife3DPreset: (presetName: keyof typeof LIFE3D_PRESETS) => void
  
  // Automatic evolution
  startEvolution: () => void
  stopEvolution: () => void
}

const DEFAULT_CONFIG: SimulationConfig = {
  minNeighborsToSurvive: 4,
  minNeighborsToBirth: 5,
  competitionThreshold: 7,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  cubeSize: 4,
  cells: createWelcomePattern(4),
  generation: 0,
  isRunning: false,
  speed: 500,
  config: DEFAULT_CONFIG,
  intervalId: null,
  
  // Algorithm state
  currentAlgorithm: 'competition',
  cellStates: [],
  life3dConfig: LIFE3D_PRESETS.classic,

  // Actions
  setCells: (cells) => set({ cells, generation: 0 }),
  
  setCubeSize: (cubeSize) => {
    set({ 
      cubeSize, 
      cells: createRandomPattern(cubeSize, 0.3),
      generation: 0,
      isRunning: false
    })
    get().stopEvolution()
  },
  
  setSpeed: (speed) => {
    set({ speed })
    // Restart evolution if running to apply new speed
    if (get().isRunning) {
      get().stopEvolution()
      get().startEvolution()
    }
  },
  
  setRunning: (isRunning) => {
    set({ isRunning })
    if (isRunning) {
      get().startEvolution()
    } else {
      get().stopEvolution()
    }
  },
  
  toggleRunning: () => {
    const { isRunning } = get()
    get().setRunning(!isRunning)
  },
  
  step: () => {
    const { cells, cubeSize, config, currentAlgorithm, cellStates, life3dConfig } = get()
    console.log('🔄 Evolving generation', get().generation, 'with algorithm:', currentAlgorithm)
    
    let newCells: (ColorIndex | null)[]
    let newCellStates: CellState[]
    
    switch (currentAlgorithm) {
      case 'life3d':
        const result = evolveLife3D(cells, cellStates, cubeSize, life3dConfig)
        newCells = result.cells
        newCellStates = result.cellStates
        break
      
      case 'competition':
      default:
        newCells = evolveGeneration(cells, cubeSize, config)
        newCellStates = cellStates.map((state, i) => ({
          ...state,
          color: newCells[i]
        }))
        break
    }
    
    const changed = newCells.some((cell, i) => cell !== cells[i])
    console.log('🎲 Generation evolved, changed cells:', changed)
    set(state => ({ 
      cells: newCells,
      cellStates: newCellStates,
      generation: state.generation + 1 
    }))
  },
  
  reset: () => {
    const { cubeSize } = get()
    set({ 
      cells: createRandomPattern(cubeSize, 0.3),
      generation: 0,
      isRunning: false
    })
    get().stopEvolution()
  },
  
  loadPattern: (pattern) => {
    set({ 
      cells: [...pattern.cells],
      cubeSize: pattern.cubeSize,
      generation: 0,
      isRunning: false
    })
    get().stopEvolution()
  },
  
  randomize: (density = 0.3) => {
    const { cubeSize } = get()
    set({ 
      cells: createRandomPattern(cubeSize, density),
      generation: 0
    })
  },
  
  setConfig: (config) => {
    set(state => ({
      config: { ...state.config, ...config }
    }))
  },
  
  // Algorithm actions
  setAlgorithm: (algorithm) => {
    const { cells } = get()
    set({ 
      currentAlgorithm: algorithm,
      cellStates: cells.map((color) => ({
        color,
        age: 0,
        energy: 100,
        isEdge: false,
      } as CellState))
    })
  },
  
  setLife3DConfig: (config) => {
    set(state => ({
      life3dConfig: { ...state.life3dConfig, ...config }
    }))
  },
  
  loadLife3DPreset: (presetName) => {
    set({ life3dConfig: LIFE3D_PRESETS[presetName] })
  },
  
  startEvolution: () => {
    const { intervalId } = get()
    if (intervalId !== null) {
      console.log('⚠️ Evolution already running')
      return
    }
    
      console.log('▶️ Starting evolution with speed:', get().speed)
    const id = window.setInterval(() => {
      get().step()
    }, get().speed)
    
    set({ intervalId: id })
  },
  
  stopEvolution: () => {
    const { intervalId } = get()
    if (intervalId !== null) {
      console.log('⏸️ Stopping evolution')
      window.clearInterval(intervalId)
      set({ intervalId: null })
    }
  },
}))

// Selectors for performance
export const useCells = () => useSimulationStore(state => state.cells)
export const useCubeSize = () => useSimulationStore(state => state.cubeSize)
export const useGeneration = () => useSimulationStore(state => state.generation)
export const useIsRunning = () => useSimulationStore(state => state.isRunning)
export const useSpeed = () => useSimulationStore(state => state.speed)
export const useConfig = () => useSimulationStore(state => state.config)

// Algorithm selectors
export const useCurrentAlgorithm = () => useSimulationStore(state => state.currentAlgorithm)
export const useCellStates = () => useSimulationStore(state => state.cellStates)
export const useLife3DConfig = () => useSimulationStore(state => state.life3dConfig)

// Predefined patterns
export const PATTERNS: Pattern[] = [
  {
    name: 'Welcome',
    description: 'Interactive demo pattern',
    cubeSize: 4,
    cells: createWelcomePattern(4),
  },
  {
    name: 'Random',
    description: 'Random distribution of all colors',
    cubeSize: 4,
    cells: createRandomPattern(4, 0.3),
  },
  {
    name: 'Sparse',
    description: 'Sparse random pattern',
    cubeSize: 5,
    cells: createRandomPattern(5, 0.15),
  },
  {
    name: 'Clusters',
    description: 'Small stable clusters',
    cubeSize: 5,
    cells: createGliderPattern(5),
  },
  {
    name: 'Oscillator',
    description: 'Patterns that change periodically',
    cubeSize: 5,
    cells: createOscillatorPattern(5),
  },
  {
    name: 'Still Life',
    description: 'Stable block patterns',
    cubeSize: 6,
    cells: createStillLifePattern(6),
  },
  {
    name: 'Color Wave',
    description: 'Diagonal color bands',
    cubeSize: 4,
    cells: createColorWavePattern(4),
  },
  {
    name: '3D Life',
    description: 'R-pentomino in 3D space',
    cubeSize: 7,
    cells: create3DLifePattern(7),
  },
  {
    name: 'Diamond',
    description: 'Octahedron crystal structure',
    cubeSize: 5,
    cells: createDiamondPattern(5),
  },
  {
    name: 'Double Helix',
    description: 'DNA-like spiral pattern',
    cubeSize: 6,
    cells: createHelixPattern(6),
  },
  {
    name: 'Pulsar',
    description: '3D oscillating pattern',
    cubeSize: 7,
    cells: createPulsarPattern(7),
  },
  {
    name: 'Crystal Seeds',
    description: 'Growing crystals from corners',
    cubeSize: 8,
    cells: createCrystalGrowthPattern(8),
  },
  {
    name: 'Life Seed',
    description: '3D Life central cross pattern',
    cubeSize: 5,
    cells: createLife3DSeedPattern(5),
  },
  {
    name: 'Life Corners',
    description: '3D Life corner clusters',
    cubeSize: 6,
    cells: createLife3DCornerPattern(6),
  },
  {
    name: 'Life Layers',
    description: '3D Life alternating layers',
    cubeSize: 5,
    cells: createLife3DLayeredPattern(5),
  },
  {
    name: 'Life Spiral',
    description: '3D Life vertical spiral',
    cubeSize: 6,
    cells: createLife3DSpiralPattern(6),
  },
]