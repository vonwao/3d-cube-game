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