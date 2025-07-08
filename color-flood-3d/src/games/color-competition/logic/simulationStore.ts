import { create } from 'zustand'
import type { ColorIndex } from '../../color-flood/logic/types'
import type { SimulationState, SimulationConfig, Pattern } from './types'
import { evolveGeneration, createRandomPattern, createGliderPattern, createColorWavePattern } from './automata'
import { createWelcomePattern } from './patterns'
import { createOscillatorPattern, createStillLifePattern } from './additionalPatterns'
import { create3DLifePattern, createDiamondPattern, createHelixPattern, createPulsarPattern, createCrystalGrowthPattern } from './proven3DPatterns'
import { createLife3DSeedPattern, createLife3DCornerPattern, createLife3DLayeredPattern, createLife3DSpiralPattern } from './life3dPatterns'
import { evolveLife3D, LIFE3D_PRESETS } from './life3d'
import { evolveEnergySystem, DEFAULT_ENERGY_CONFIG, ENERGY_PATTERNS, initializeEnergy } from './energySystem'
import { evolveMagnetAutomata, DEFAULT_MAGNET_CONFIG, MAGNET_PATTERNS, initializeSpins } from './magnetAutomata'
import { evolveInfoProcessing, DEFAULT_INFO_CONFIG, INFO_PATTERNS, initializeInfoStates } from './infoProcessing'
import { MAGNET_SHOWCASE_PATTERNS } from './magnetPatterns'
import { INFO_SHOWCASE_PATTERNS } from './infoPatterns'
import type { AlgorithmType, CellState, Life3DConfig, EnergySystemConfig, MagnetAutomataConfig, InfoProcessingConfig } from './types'

interface SimulationStore extends SimulationState {
  config: SimulationConfig
  intervalId: number | null
  
  // Algorithm state
  currentAlgorithm: AlgorithmType
  cellStates: CellState[]
  life3dConfig: Life3DConfig
  energyConfig: EnergySystemConfig
  magnetConfig: MagnetAutomataConfig
  infoConfig: InfoProcessingConfig
  
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
  setEnergyConfig: (config: Partial<EnergySystemConfig>) => void
  loadEnergyPreset: (presetName: keyof typeof ENERGY_PATTERNS) => void
  setMagnetConfig: (config: Partial<MagnetAutomataConfig>) => void
  loadMagnetPreset: (presetName: keyof typeof MAGNET_PATTERNS) => void
  setInfoConfig: (config: Partial<InfoProcessingConfig>) => void
  loadInfoPreset: (presetName: keyof typeof INFO_PATTERNS) => void
  
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
  energyConfig: DEFAULT_ENERGY_CONFIG,
  magnetConfig: DEFAULT_MAGNET_CONFIG,
  infoConfig: DEFAULT_INFO_CONFIG,

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
    const { cells, cubeSize, config, currentAlgorithm, cellStates, life3dConfig, energyConfig, magnetConfig, infoConfig } = get()
    console.log('🔄 Evolving generation', get().generation, 'with algorithm:', currentAlgorithm)
    
    let newCells: (ColorIndex | null)[]
    let newCellStates: CellState[]
    
    switch (currentAlgorithm) {
      case 'life3d':
        const life3dResult = evolveLife3D(cells, cellStates, cubeSize, life3dConfig)
        newCells = life3dResult.cells
        newCellStates = life3dResult.cellStates
        break
      
      case 'energy':
        const energyResult = evolveEnergySystem(cells, cellStates, cubeSize, energyConfig)
        newCells = energyResult.cells
        newCellStates = energyResult.cellStates
        break
      
      case 'magnet':
        const magnetResult = evolveMagnetAutomata(cells, cellStates, cubeSize, magnetConfig)
        newCells = magnetResult.cells
        newCellStates = magnetResult.cellStates
        break
      
      case 'info':
        const infoResult = evolveInfoProcessing(cells, cellStates, cubeSize, infoConfig)
        newCells = infoResult.cells
        newCellStates = infoResult.cellStates
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
    // Auto-switch to appropriate algorithm based on pattern name
    if (pattern.name.startsWith('Magnet')) {
      get().setAlgorithm('magnet')
      // Apply good settings for magnet patterns
      if (pattern.name === 'Magnet Vortex') {
        get().loadMagnetPreset('singleVortex')
      } else if (pattern.name === 'Flow Field') {
        get().loadMagnetPreset('turbulentFlow')
      }
    } else if (pattern.name.startsWith('Info')) {
      get().setAlgorithm('info')
      // Apply good settings for info patterns
      if (pattern.name === 'Info Oscillator' || pattern.name === 'Signal Line') {
        get().loadInfoPreset('fastSignals')
      } else if (pattern.name === '3D Circuit') {
        get().loadInfoPreset('digitalLogic')
      }
    } else if (pattern.name.startsWith('Life') || pattern.name.includes('3D Life')) {
      get().setAlgorithm('life3d')
    }
    
    set({ 
      cells: [...pattern.cells],
      cubeSize: pattern.cubeSize,
      generation: 0,
      isRunning: false
    })
    get().stopEvolution()
    
    // Auto-start for showcase patterns
    if (pattern.name.startsWith('Magnet') || pattern.name.startsWith('Info')) {
      setTimeout(() => get().setRunning(true), 100)
    }
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
    let cellStates: CellState[]
    
    switch (algorithm) {
      case 'energy':
        cellStates = initializeEnergy(cells, cells.map(color => ({
          color,
          age: 0,
          isEdge: false
        })), 0.5)
        break
      
      case 'magnet':
        cellStates = initializeSpins(cells, cells.map(color => ({
          color,
          age: 0,
          energy: 1.0,
          isEdge: false
        })), 'random')
        break
      
      case 'info':
        cellStates = initializeInfoStates(cells, cells.map(color => ({
          color,
          age: 0,
          energy: 1.0,
          isEdge: false
        })), 'random')
        break
      
      default:
        cellStates = cells.map((color) => ({
          color,
          age: 0,
          energy: 1.0,
          isEdge: false,
        }))
        break
    }
    
    set({ 
      currentAlgorithm: algorithm,
      cellStates
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
  
  setEnergyConfig: (config) => {
    set(state => ({
      energyConfig: { ...state.energyConfig, ...config }
    }))
  },
  
  loadEnergyPreset: (presetName) => {
    const { cubeSize } = get()
    set({ energyConfig: ENERGY_PATTERNS[presetName](cubeSize) })
  },
  
  setMagnetConfig: (config) => {
    set(state => ({
      magnetConfig: { ...state.magnetConfig, ...config }
    }))
  },
  
  loadMagnetPreset: (presetName) => {
    const { cubeSize } = get()
    let config: MagnetAutomataConfig
    
    switch (presetName) {
      case 'uniformField':
        config = MAGNET_PATTERNS.uniformField([0, 1, 0])
        break
      case 'singleVortex':
      case 'doubleVortex':
        config = MAGNET_PATTERNS[presetName](cubeSize)
        break
      case 'turbulentFlow':
      case 'magneticDomains':
        config = MAGNET_PATTERNS[presetName]()
        break
      default:
        config = DEFAULT_MAGNET_CONFIG
    }
    
    set({ magnetConfig: config })
  },
  
  setInfoConfig: (config) => {
    set(state => ({
      infoConfig: { ...state.infoConfig, ...config }
    }))
  },
  
  loadInfoPreset: (presetName) => {
    set({ infoConfig: INFO_PATTERNS[presetName]() })
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
export const useEnergyConfig = () => useSimulationStore(state => state.energyConfig)
export const useMagnetConfig = () => useSimulationStore(state => state.magnetConfig)
export const useInfoConfig = () => useSimulationStore(state => state.infoConfig)

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
  
  // Magnet Automata showcase patterns
  ...MAGNET_SHOWCASE_PATTERNS,
  
  // Information Processing showcase patterns
  ...INFO_SHOWCASE_PATTERNS,
]