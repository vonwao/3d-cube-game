import type { ColorIndex } from '../../color-flood/logic/types'
import type { AlgorithmType, Life3DConfig, EnergySystemConfig, MagnetAutomataConfig, InfoProcessingConfig } from './types'
import { LIFE3D_PRESETS } from './life3d'
import { DEFAULT_INFO_CONFIG } from './infoProcessing'
import { createMagnetVortexPattern, createMagnetHelixPattern, createMagnetFlowFieldPattern } from './magnetPatterns'
import { createInfoOscillatorPattern, createInfoSignalLinePattern, createInfoLogicGatesPattern, createInfo3DCircuitPattern } from './infoPatterns'
import { createRandomPattern, createGliderPattern, createColorWavePattern } from './automata'
import { create3DLifePattern, createDiamondPattern, createHelixPattern, createPulsarPattern } from './proven3DPatterns'

export interface UnifiedPreset {
  id: string
  name: string
  category: 'energy' | 'magnetic' | 'digital' | 'classic' | 'life'
  description: string
  algorithm: AlgorithmType
  cubeSize: number
  pattern: (ColorIndex | null)[]
  config: Life3DConfig | EnergySystemConfig | MagnetAutomataConfig | InfoProcessingConfig | any
  expectedBehavior: string
  bestSpeed: 'slow' | 'normal' | 'fast' | 'ultra'
}

export const UNIFIED_PRESETS: UnifiedPreset[] = [
  // Energy System Presets
  {
    id: 'energy-fountain',
    name: 'Energy Fountain',
    category: 'energy',
    description: 'Energy erupts from the bottom like a fountain, creating waves of life',
    algorithm: 'energy',
    cubeSize: 6,
    pattern: createRandomPattern(6, 0.3),
    config: {
      baseDecayRate: 0.025,
      birthEnergyCost: 0.25,
      deathThreshold: 0.05,
      diffusionRate: 0.35,
      injectionPoints: [[3, 0, 3]],
      injectionRate: 1.0,
      energyTransferRate: 0.1,
      competitionRadius: 1
    } as EnergySystemConfig,
    expectedBehavior: 'Continuous upward flow with pulsing growth patterns',
    bestSpeed: 'normal'
  },
  {
    id: 'energy-corners',
    name: 'Corner Competition',
    category: 'energy',
    description: 'Two energy sources compete from opposite corners',
    algorithm: 'energy',
    cubeSize: 7,
    pattern: createRandomPattern(7, 0.2),
    config: {
      baseDecayRate: 0.03,
      birthEnergyCost: 0.3,
      deathThreshold: 0.05,
      diffusionRate: 0.25,
      injectionPoints: [[0, 0, 0], [6, 6, 6]],
      injectionRate: 0.7,
      energyTransferRate: 0.15,
      competitionRadius: 2
    } as EnergySystemConfig,
    expectedBehavior: 'Two expanding regions meet and compete in the middle',
    bestSpeed: 'normal'
  },
  {
    id: 'energy-scarce',
    name: 'Scarce Resources',
    category: 'energy',
    description: 'Limited energy creates fierce competition for survival',
    algorithm: 'energy',
    cubeSize: 5,
    pattern: createRandomPattern(5, 0.4),
    config: {
      baseDecayRate: 0.05,
      birthEnergyCost: 0.45,
      deathThreshold: 0.08,
      diffusionRate: 0.2,
      injectionPoints: [[2, 2, 2]],
      injectionRate: 0.4,
      energyTransferRate: 0.2,
      competitionRadius: 2
    } as EnergySystemConfig,
    expectedBehavior: 'Cells struggle to survive, creating dynamic clusters',
    bestSpeed: 'fast'
  },

  // Magnetic Flow Presets
  {
    id: 'magnet-vortex',
    name: 'Magnetic Vortex',
    category: 'magnetic',
    description: 'Swirling magnetic field creates a spinning vortex',
    algorithm: 'magnet',
    cubeSize: 6,
    pattern: createMagnetVortexPattern(6),
    config: {
      alignmentStrength: 0.4,
      alignmentRadius: 1,
      viscosity: 0.08,
      turbulence: 0.03,
      vortexCenters: [[3, 3, 3]]
    } as MagnetAutomataConfig,
    expectedBehavior: 'Continuous rotation with smooth color gradients',
    bestSpeed: 'fast'
  },
  {
    id: 'magnet-helix',
    name: 'Double Helix Flow',
    category: 'magnetic',
    description: 'Two magnetic spirals dance around each other',
    algorithm: 'magnet',
    cubeSize: 7,
    pattern: createMagnetHelixPattern(7),
    config: {
      alignmentStrength: 0.35,
      alignmentRadius: 1,
      viscosity: 0.12,
      turbulence: 0.02,
      globalField: [0, 1, 0]
    } as MagnetAutomataConfig,
    expectedBehavior: 'Helixes merge and flow creating beautiful patterns',
    bestSpeed: 'normal'
  },
  {
    id: 'magnet-turbulent',
    name: 'Turbulent Flow',
    category: 'magnetic',
    description: 'Chaotic magnetic fields create unpredictable flows',
    algorithm: 'magnet',
    cubeSize: 5,
    pattern: createMagnetFlowFieldPattern(5),
    config: {
      alignmentStrength: 0.25,
      alignmentRadius: 1,
      viscosity: 0.05,
      turbulence: 0.15,
      vortexCenters: [[1, 2, 1], [3, 2, 3]]
    } as MagnetAutomataConfig,
    expectedBehavior: 'Constantly changing turbulent patterns',
    bestSpeed: 'fast'
  },
  {
    id: 'magnet-domains',
    name: 'Magnetic Domains',
    category: 'magnetic',
    description: 'Magnetic regions slowly align into large domains',
    algorithm: 'magnet',
    cubeSize: 8,
    pattern: createRandomPattern(8, 0.6),
    config: {
      alignmentStrength: 0.6,
      alignmentRadius: 2,
      viscosity: 0.3,
      turbulence: 0.01
    } as MagnetAutomataConfig,
    expectedBehavior: 'Small regions merge into large aligned domains',
    bestSpeed: 'slow'
  },

  // Digital Circuit Presets
  {
    id: 'info-oscillator',
    name: 'Ring Oscillator',
    category: 'digital',
    description: 'Digital signal travels in a loop, creating a clock',
    algorithm: 'info',
    cubeSize: 5,
    pattern: createInfoOscillatorPattern(5),
    config: {
      ...DEFAULT_INFO_CONFIG,
      signalDecay: 0.02,
      signalThreshold: 0.3,
      propagationDelay: 1
    } as InfoProcessingConfig,
    expectedBehavior: 'Signal pulses around the ring continuously',
    bestSpeed: 'slow'
  },
  {
    id: 'info-network',
    name: 'Signal Network',
    category: 'digital',
    description: 'Complex network of signals branching and merging',
    algorithm: 'info',
    cubeSize: 7,
    pattern: createInfoSignalLinePattern(7),
    config: {
      ...DEFAULT_INFO_CONFIG,
      signalDecay: 0.05,
      signalThreshold: 0.25,
      propagationDelay: 0
    } as InfoProcessingConfig,
    expectedBehavior: 'Signals propagate through branching network',
    bestSpeed: 'normal'
  },
  {
    id: 'info-logic',
    name: 'Logic Gates Demo',
    category: 'digital',
    description: 'AND and OR gates process binary signals',
    algorithm: 'info',
    cubeSize: 6,
    pattern: createInfoLogicGatesPattern(6),
    config: {
      ...DEFAULT_INFO_CONFIG,
      signalDecay: 0.0,
      signalThreshold: 0.5,
      propagationDelay: 1
    } as InfoProcessingConfig,
    expectedBehavior: 'Gates produce different outputs based on inputs',
    bestSpeed: 'slow'
  },
  {
    id: 'info-computer',
    name: '3D Computer',
    category: 'digital',
    description: 'Complex 3D circuit with interconnected logic gates',
    algorithm: 'info',
    cubeSize: 8,
    pattern: createInfo3DCircuitPattern(8),
    config: {
      ...DEFAULT_INFO_CONFIG,
      signalDecay: 0.03,
      signalThreshold: 0.4,
      propagationDelay: 0
    } as InfoProcessingConfig,
    expectedBehavior: 'Complex signal patterns flow through 3D network',
    bestSpeed: 'fast'
  },

  // Classic 3D Life Presets
  {
    id: 'life-classic',
    name: 'Classic 3D Life',
    category: 'life',
    description: 'Conway\'s Game of Life extended to 3D space',
    algorithm: 'life3d',
    cubeSize: 7,
    pattern: create3DLifePattern(7),
    config: LIFE3D_PRESETS.classic,
    expectedBehavior: 'Cells birth and die creating evolving 3D structures',
    bestSpeed: 'normal'
  },
  {
    id: 'life-crystal',
    name: 'Crystal Growth',
    category: 'life',
    description: 'Life forms grow like crystals from seed points',
    algorithm: 'life3d',
    cubeSize: 6,
    pattern: createDiamondPattern(6),
    config: {
      birthNeighbors: [1, 2, 3],
      survivalNeighbors: [1, 2, 3, 4, 5],
      useAgeColors: true,
      maxAge: 30,
      edgeBias: 1.2
    } as Life3DConfig,
    expectedBehavior: 'Symmetric crystal-like growth patterns',
    bestSpeed: 'slow'
  },
  {
    id: 'life-clouds',
    name: 'Cloud Life',
    category: 'life',
    description: 'Sparse life creates cloud-like formations',
    algorithm: 'life3d',
    cubeSize: 8,
    pattern: createRandomPattern(8, 0.1),
    config: {
      birthNeighbors: [4, 5, 6, 7],
      survivalNeighbors: [2, 3, 4],
      useAgeColors: true,
      maxAge: 20,
      edgeBias: 0.8
    } as Life3DConfig,
    expectedBehavior: 'Wispy, cloud-like structures float and evolve',
    bestSpeed: 'normal'
  },
  {
    id: 'life-stable',
    name: 'Stable Structures',
    category: 'life',
    description: 'Life rules that favor stable, long-lived patterns',
    algorithm: 'life3d',
    cubeSize: 5,
    pattern: createPulsarPattern(5),
    config: {
      birthNeighbors: [4, 5],
      survivalNeighbors: [5, 6, 7],
      useAgeColors: true,
      maxAge: 100,
      edgeBias: 1.0
    } as Life3DConfig,
    expectedBehavior: 'Forms stable oscillating structures',
    bestSpeed: 'normal'
  },

  // Classic Competition Presets
  {
    id: 'classic-gliders',
    name: 'Glider Clusters',
    category: 'classic',
    description: 'Small moving patterns compete for space',
    algorithm: 'competition',
    cubeSize: 6,
    pattern: createGliderPattern(6),
    config: {
      minNeighborsToSurvive: 4,
      minNeighborsToBirth: 5,
      competitionThreshold: 6
    },
    expectedBehavior: 'Small patterns move and interact',
    bestSpeed: 'normal'
  },
  {
    id: 'classic-waves',
    name: 'Color Waves',
    category: 'classic',
    description: 'Diagonal bands of color compete and merge',
    algorithm: 'competition',
    cubeSize: 5,
    pattern: createColorWavePattern(5),
    config: {
      minNeighborsToSurvive: 3,
      minNeighborsToBirth: 4,
      competitionThreshold: 7
    },
    expectedBehavior: 'Wave patterns collide and create interference',
    bestSpeed: 'fast'
  },
  {
    id: 'classic-territorial',
    name: 'Territorial Wars',
    category: 'classic',
    description: 'Colors fight for territory in brutal competition',
    algorithm: 'competition',
    cubeSize: 7,
    pattern: createRandomPattern(7, 0.5),
    config: {
      minNeighborsToSurvive: 5,
      minNeighborsToBirth: 6,
      competitionThreshold: 8
    },
    expectedBehavior: 'Aggressive expansion and territory battles',
    bestSpeed: 'fast'
  },
  {
    id: 'classic-peaceful',
    name: 'Peaceful Coexistence',
    category: 'classic',
    description: 'Colors find balance and coexist peacefully',
    algorithm: 'competition',
    cubeSize: 5,
    pattern: createRandomPattern(5, 0.3),
    config: {
      minNeighborsToSurvive: 4,
      minNeighborsToBirth: 5,
      competitionThreshold: 10
    },
    expectedBehavior: 'Stable boundaries form between colors',
    bestSpeed: 'normal'
  },

  // Special Combined Presets
  {
    id: 'special-helix',
    name: 'DNA Helix',
    category: 'life',
    description: 'Double helix structure with life-like rules',
    algorithm: 'life3d',
    cubeSize: 6,
    pattern: createHelixPattern(6),
    config: {
      birthNeighbors: [4],
      survivalNeighbors: [3, 4, 5],
      useAgeColors: true,
      maxAge: 50,
      edgeBias: 0.8
    } as Life3DConfig,
    expectedBehavior: 'Helix structure evolves and twists',
    bestSpeed: 'slow'
  }
]

// Helper to get preset by ID
export function getPresetById(id: string): UnifiedPreset | undefined {
  return UNIFIED_PRESETS.find(p => p.id === id)
}

// Helper to get presets by category
export function getPresetsByCategory(category: string): UnifiedPreset[] {
  return UNIFIED_PRESETS.filter(p => p.category === category)
}