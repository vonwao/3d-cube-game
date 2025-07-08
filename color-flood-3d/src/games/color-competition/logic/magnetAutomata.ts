import type { ColorIndex } from '../../color-flood/logic/types'
import type { CellState, MagnetAutomataConfig } from './types'
import { get3DNeighbors } from './automata'

/**
 * Magnet Automata - Dynamic Flow System
 * 
 * This system adds magnetic-like spin alignment to cells:
 * - Each cell has a 3D direction vector (spin)
 * - Cells tend to align with their neighbors
 * - Creates beautiful flowing patterns
 * - Color represents direction in HSV space
 * - Can create vortices and flow fields
 */

// Default configuration for magnet automata
export const DEFAULT_MAGNET_CONFIG: MagnetAutomataConfig = {
  // Alignment dynamics
  alignmentStrength: 0.3,      // 30% alignment per generation
  alignmentRadius: 1,          // Direct neighbors only
  
  // Flow behavior
  viscosity: 0.1,              // 10% resistance to change
  turbulence: 0.05,            // 5% random perturbation
  
  // External fields
  globalField: undefined,      // No external field by default
  vortexCenters: []           // No predefined vortices
}

/**
 * Initialize spin states for all cells
 */
export function initializeSpins(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  pattern: 'random' | 'uniform' | 'radial' | 'vortex' = 'random'
): CellState[] {
  const cubeSize = Math.round(Math.pow(cells.length, 1/3))
  const center = cubeSize / 2
  
  return cellStates.map((state, i) => {
    let spin: [number, number, number] = [0, 0, 0]
    
    if (state.color !== null) {
      switch (pattern) {
        case 'random':
          // Random direction
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          spin = [
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
          ]
          break
          
        case 'uniform':
          // All pointing up
          spin = [0, 1, 0]
          break
          
        case 'radial':
          // Pointing outward from center
          const x = i % cubeSize - center
          const y = Math.floor(i / cubeSize) % cubeSize - center
          const z = Math.floor(i / (cubeSize * cubeSize)) - center
          const mag = Math.sqrt(x*x + y*y + z*z) || 1
          spin = [x/mag, y/mag, z/mag]
          break
          
        case 'vortex':
          // Circular pattern around Y axis
          const vx = i % cubeSize - center
          const vz = Math.floor(i / (cubeSize * cubeSize)) - center
          const vmag = Math.sqrt(vx*vx + vz*vz) || 1
          spin = [-vz/vmag, 0, vx/vmag]
          break
      }
    }
    
    return {
      ...state,
      spin,
      spinStrength: state.color !== null ? 1.0 : 0,
      temperature: 1.0  // Start hot for easier alignment
    }
  })
}

/**
 * Normalize a 3D vector
 */
function normalize(vec: [number, number, number]): [number, number, number] {
  const mag = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2])
  if (mag === 0) return [0, 0, 0]
  return [vec[0]/mag, vec[1]/mag, vec[2]/mag]
}

/**
 * Calculate average spin of neighbors
 */
function calculateAverageNeighborSpin(
  cellStates: CellState[],
  index: number,
  cubeSize: number,
  _radius: number
): [number, number, number] {
  let sumX = 0, sumY = 0, sumZ = 0
  let count = 0
  
  const neighbors = get3DNeighbors(index, cubeSize)
  
  neighbors.forEach((n: number) => {
    const neighborState = cellStates[n]
    if (neighborState.color !== null && neighborState.spin) {
      const weight = neighborState.spinStrength || 1
      sumX += neighborState.spin[0] * weight
      sumY += neighborState.spin[1] * weight
      sumZ += neighborState.spin[2] * weight
      count += weight
    }
  })
  
  if (count === 0) return [0, 0, 0]
  return [sumX/count, sumY/count, sumZ/count]
}

/**
 * Apply external field influence
 */
function applyExternalField(
  spin: [number, number, number],
  field: [number, number, number],
  strength: number
): [number, number, number] {
  return [
    spin[0] + field[0] * strength,
    spin[1] + field[1] * strength,
    spin[2] + field[2] * strength
  ]
}

/**
 * Apply vortex influence
 */
function applyVortexInfluence(
  position: [number, number, number],
  spin: [number, number, number],
  vortexCenter: [number, number, number],
  strength: number
): [number, number, number] {
  const dx = position[0] - vortexCenter[0]
  const dy = position[1] - vortexCenter[1]
  const dz = position[2] - vortexCenter[2]
  
  // Calculate tangential direction (perpendicular to radial)
  const radialMag = Math.sqrt(dx*dx + dy*dy + dz*dz)
  if (radialMag < 0.1) return spin // Too close to center
  
  // Vortex around Y axis
  const tangent: [number, number, number] = [-dz/radialMag, 0, dx/radialMag]
  
  // Blend with current spin
  return [
    spin[0] + tangent[0] * strength,
    spin[1] + tangent[1] * strength,
    spin[2] + tangent[2] * strength
  ]
}

/**
 * Convert spin direction to color
 */
export function spinToColor(spin: [number, number, number]): ColorIndex {
  // Convert 3D direction to hue
  const angle = Math.atan2(spin[2], spin[0])
  const hue = (angle + Math.PI) / (2 * Math.PI) // 0 to 1
  
  // Map to color index (0-5)
  return Math.floor(hue * 6) as ColorIndex
}

/**
 * Main evolution function for magnet automata
 */
export function evolveMagnetAutomata(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  cubeSize: number,
  config: MagnetAutomataConfig
): { cells: (ColorIndex | null)[], cellStates: CellState[] } {
  const newCells = [...cells]
  const newStates = cellStates.map(s => ({ ...s }))
  
  // Calculate cell positions
  const positions: [number, number, number][] = cells.map((_, i) => [
    i % cubeSize,
    Math.floor(i / cubeSize) % cubeSize,
    Math.floor(i / (cubeSize * cubeSize))
  ])
  
  // Update spins
  newStates.forEach((state, index) => {
    if (state.color === null || !state.spin) return
    
    // Get average neighbor spin
    const neighborSpin = calculateAverageNeighborSpin(newStates, index, cubeSize, config.alignmentRadius)
    
    // Blend with current spin based on alignment strength and viscosity
    const alignmentFactor = config.alignmentStrength * (1 - config.viscosity)
    let newSpin: [number, number, number] = [
      state.spin[0] * (1 - alignmentFactor) + neighborSpin[0] * alignmentFactor,
      state.spin[1] * (1 - alignmentFactor) + neighborSpin[1] * alignmentFactor,
      state.spin[2] * (1 - alignmentFactor) + neighborSpin[2] * alignmentFactor
    ]
    
    // Apply external field if present
    if (config.globalField) {
      newSpin = applyExternalField(newSpin, config.globalField, 0.1)
    }
    
    // Apply vortex influences
    if (config.vortexCenters) {
      config.vortexCenters.forEach(vortex => {
        newSpin = applyVortexInfluence(positions[index], newSpin, vortex, 0.2)
      })
    }
    
    // Add turbulence
    if (config.turbulence > 0) {
      newSpin[0] += (Math.random() - 0.5) * config.turbulence
      newSpin[1] += (Math.random() - 0.5) * config.turbulence
      newSpin[2] += (Math.random() - 0.5) * config.turbulence
    }
    
    // Normalize and store
    state.spin = normalize(newSpin)
    
    // Update temperature (cooling over time)
    if (state.temperature !== undefined) {
      state.temperature = Math.max(0.1, state.temperature * 0.99)
    }
    
    // Update color based on spin direction
    if (state.spinStrength && state.spinStrength > 0.1) {
      newCells[index] = spinToColor(state.spin)
    }
  })
  
  // Handle cell birth/death based on energy (if available)
  if (cellStates[0].energy !== undefined) {
    // Cells with aligned spins share energy better
    newStates.forEach((state, index) => {
      if (state.color !== null && state.energy !== undefined && state.spin) {
        const neighborSpin = calculateAverageNeighborSpin(newStates, index, cubeSize, 1)
        const alignment = state.spin[0] * neighborSpin[0] + 
                         state.spin[1] * neighborSpin[1] + 
                         state.spin[2] * neighborSpin[2]
        
        // Better alignment = better energy efficiency
        const efficiencyBonus = (alignment + 1) * 0.1 // 0 to 0.2 bonus
        state.energy = Math.min(1, state.energy + efficiencyBonus)
      }
    })
  }
  
  return { cells: newCells, cellStates: newStates }
}

/**
 * Create interesting magnet patterns
 */
export const MAGNET_PATTERNS = {
  // Uniform field
  uniformField: (direction: [number, number, number] = [0, 1, 0]): MagnetAutomataConfig => ({
    ...DEFAULT_MAGNET_CONFIG,
    globalField: normalize(direction),
    alignmentStrength: 0.5
  }),
  
  // Single vortex
  singleVortex: (cubeSize: number): MagnetAutomataConfig => ({
    ...DEFAULT_MAGNET_CONFIG,
    vortexCenters: [[cubeSize/2, cubeSize/2, cubeSize/2]],
    alignmentStrength: 0.4,
    turbulence: 0.02
  }),
  
  // Double vortex
  doubleVortex: (cubeSize: number): MagnetAutomataConfig => ({
    ...DEFAULT_MAGNET_CONFIG,
    vortexCenters: [
      [cubeSize/3, cubeSize/2, cubeSize/3],
      [2*cubeSize/3, cubeSize/2, 2*cubeSize/3]
    ],
    alignmentStrength: 0.35,
    turbulence: 0.03
  }),
  
  // Turbulent flow
  turbulentFlow: (): MagnetAutomataConfig => ({
    ...DEFAULT_MAGNET_CONFIG,
    alignmentStrength: 0.2,
    turbulence: 0.15,
    viscosity: 0.05
  }),
  
  // Magnetic domains
  magneticDomains: (): MagnetAutomataConfig => ({
    ...DEFAULT_MAGNET_CONFIG,
    alignmentStrength: 0.6,
    alignmentRadius: 2,
    viscosity: 0.3,
    turbulence: 0.01
  })
}