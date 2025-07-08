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
  energy?: number        // Energy fields for resource-based CA
  isEdge?: boolean       // Edge detection for surface bias
}

// Algorithm types
export type AlgorithmType = 'competition' | 'life3d' | 'energy' | 'magnet'

export interface Life3DConfig {
  birthNeighbors: number[]      // e.g., [5] - birth if exactly 5 neighbors
  survivalNeighbors: number[]   // e.g., [5,6,7] - survive if 5-7 neighbors
  useAgeColors: boolean         // Color based on cell age
  maxAge: number               // Maximum age for color scaling
  edgeBias: number             // Edge cell survival modifier
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