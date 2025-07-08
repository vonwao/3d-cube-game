import type { SimulationConfig } from '../logic/types'

export const RULE_PRESETS: Record<string, SimulationConfig> = {
  // Classic Conway-like rules adapted for color competition
  classic: {
    minNeighborsToSurvive: 4,
    minNeighborsToBirth: 5,
    competitionThreshold: 6,
  },
  
  // More stable, slower evolution
  stable: {
    minNeighborsToSurvive: 5,
    minNeighborsToBirth: 6,
    competitionThreshold: 8,
  },
  
  // Aggressive expansion and competition
  aggressive: {
    minNeighborsToSurvive: 2,
    minNeighborsToBirth: 3,
    competitionThreshold: 4,
  },
  
  // Balanced for interesting patterns
  balanced: {
    minNeighborsToSurvive: 4,
    minNeighborsToBirth: 5,
    competitionThreshold: 7,
  },
  
  // Very restrictive - creates isolated colonies
  restrictive: {
    minNeighborsToSurvive: 6,
    minNeighborsToBirth: 8,
    competitionThreshold: 10,
  },
}

export const DEFAULT_RULE_PRESET = 'balanced'