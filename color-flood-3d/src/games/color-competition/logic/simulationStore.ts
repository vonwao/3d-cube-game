import { create } from 'zustand'
import type { ColorIndex } from '../../color-flood/logic/types'
import type { SimulationState, SimulationConfig, Pattern } from './types'
import { evolveGeneration, createRandomPattern, createGliderPattern, createColorWavePattern } from './automata'

interface SimulationStore extends SimulationState {
  config: SimulationConfig
  intervalId: number | null
  
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
  
  // Automatic evolution
  startEvolution: () => void
  stopEvolution: () => void
}

const DEFAULT_CONFIG: SimulationConfig = {
  minNeighborsToSurvive: 2,
  minNeighborsToBirth: 3,
  competitionThreshold: 4,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  cubeSize: 4,
  cells: createRandomPattern(4, 0.3),
  generation: 0,
  isRunning: false,
  speed: 500,
  config: DEFAULT_CONFIG,
  intervalId: null,

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
    const { cells, cubeSize, config } = get()
    console.log('🔄 Evolving generation', get().generation)
    const newCells = evolveGeneration(cells, cubeSize, config)
    const changed = newCells.some((cell, i) => cell !== cells[i])
    console.log('🎲 Generation evolved, changed cells:', changed)
    set(state => ({ 
      cells: newCells, 
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
  
  startEvolution: () => {
    const { intervalId } = get()
    if (intervalId !== null) {
      console.log('⚠️ Evolution already running')
      return
    }
    
    console.log('▶️ Starting evolution with speed:', get().speed, 'ms')
    const id = window.setInterval(() => {
      get().step()
    }, get().speed)
    
    set({ intervalId: id })
  },
  
  stopEvolution: () => {
    const { intervalId } = get()
    if (intervalId !== null) {
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

// Predefined patterns
export const PATTERNS: Pattern[] = [
  {
    name: 'Random',
    description: 'Random distribution of all colors',
    cubeSize: 4,
    cells: createRandomPattern(4, 0.3),
  },
  {
    name: 'Glider',
    description: 'A simple 3D glider pattern',
    cubeSize: 5,
    cells: createGliderPattern(5),
  },
  {
    name: 'Color Wave',
    description: 'Diagonal color bands',
    cubeSize: 4,
    cells: createColorWavePattern(4),
  },
]