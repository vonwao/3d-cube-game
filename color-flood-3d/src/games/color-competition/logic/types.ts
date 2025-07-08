import type { ColorIndex } from '../../color-flood/logic/types'

export interface SimulationState {
  cubeSize: number
  cells: (ColorIndex | null)[]
  generation: number
  isRunning: boolean
  speed: number // milliseconds between generations
}

export interface CellNeighborCount {
  [color: number]: number
  total: number
  empty: number
}

export interface SimulationConfig {
  minNeighborsToSurvive: number
  minNeighborsToBirth: number
  competitionThreshold: number // minimum neighbors of a color to take over
}

// Enhanced cell state for advanced algorithms
export interface CellState {
  color: ColorIndex | null
  age?: number           // Age-based coloring for Life algorithms
  energy?: number        // Energy fields for resource-based CA (0.0 to 1.0)
  isEdge?: boolean       // Edge detection for surface bias
  // Energy system fields
  nutrients?: number     // Optional resource layer (0.0 to 1.0)
  energyFlow?: [number, number, number] // Direction of energy gradient
  // Flow system fields (Phase 2)
  spin?: [number, number, number]      // Direction vector (normalized)
  spinStrength?: number                 // 0.0 to 1.0
  temperature?: number                  // For phase transitions
  // Information system fields (Phase 3)
  state?: number                        // 0-15 (4-bit state)
  inputBuffer?: number[]                // Recent neighbor states
  outputSignal?: number                 // Current output
  gateType?: number                     // Logic gate type
}

// Algorithm types
export type AlgorithmType = 'competition' | 'life3d' | 'energy' | 'magnet' | 'info'

export interface Life3DConfig {
  birthNeighbors: number[]      // e.g., [5] - birth if exactly 5 neighbors
  survivalNeighbors: number[]   // e.g., [5,6,7] - survive if 5-7 neighbors
  useAgeColors: boolean         // Color based on cell age
  maxAge: number               // Maximum age for color scaling
  edgeBias: number             // Edge cell survival modifier
}

// Energy & Resource System Configuration
export interface EnergySystemConfig {
  // Energy dynamics
  baseDecayRate: number         // 0.01 to 0.1 per generation
  birthEnergyCost: number       // 0.1 to 0.5
  deathThreshold: number        // 0.01 to 0.1
  
  // Resource distribution
  diffusionRate: number         // 0.1 to 0.5
  injectionPoints: [number, number, number][]  // Nutrient sources
  injectionRate: number         // 0.1 to 1.0
  
  // Competition
  energyTransferRate: number    // How much energy transfers between cells
  competitionRadius: number     // How far cells compete for resources
}

// Magnet Automata Configuration (Phase 2)
export interface MagnetAutomataConfig {
  // Alignment dynamics
  alignmentStrength: number     // 0.1 to 1.0
  alignmentRadius: number       // 1 to 3 cells
  
  // Flow behavior
  viscosity: number            // 0.0 to 1.0 (resistance to change)
  turbulence: number           // 0.0 to 0.5 (random perturbations)
  
  // External fields
  globalField?: [number, number, number]      // Optional external magnetic field
  vortexCenters?: [number, number, number][]  // Predefined vortex locations
}

// Information Processing Configuration (Phase 3)
export interface InfoProcessingConfig {
  // Gate types
  gateTypes: Record<number, 'WIRE' | 'AND' | 'OR' | 'XOR' | 'NOT' | 'THRESHOLD' | 'DELAY' | 'SOURCE' | 'SINK'>
  
  // Signal processing
  signalDecay: number          // 0.0 to 1.0
  signalThreshold: number      // Activation threshold
  propagationDelay: number     // Generations before signal propagates
  
  // Circuit patterns
  circuitLayouts: string[]     // Predefined circuit patterns
}

export interface Pattern {
  name: string
  description: string
  cubeSize: number
  cells: (ColorIndex | null)[]
}

export type SimulationSpeed = 'slow' | 'normal' | 'fast' | 'ultra'

export const SPEED_MAP: Record<SimulationSpeed, number> = {
  slow: 1000,
  normal: 500,
  fast: 200,
  ultra: 50,
}