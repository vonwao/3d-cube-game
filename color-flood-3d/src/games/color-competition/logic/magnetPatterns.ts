import type { ColorIndex } from '../../color-flood/logic/types'
import type { Pattern } from './types'

/**
 * Create a vortex pattern for Magnet Automata
 * Shows spinning flow around a central axis
 */
export function createMagnetVortexPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create a cylindrical pattern around Y axis
  for (let y = 0; y < cubeSize; y++) {
    for (let x = 0; x < cubeSize; x++) {
      for (let z = 0; z < cubeSize; z++) {
        const dx = x - center
        const dz = z - center
        const distance = Math.sqrt(dx * dx + dz * dz)
        
        // Create rings at different radii
        if (distance < cubeSize / 2 && distance > 0.5) {
          const index = x + y * cubeSize + z * cubeSize * cubeSize
          // Color based on angle for initial variety
          const angle = Math.atan2(dz, dx)
          const colorIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 6) as ColorIndex
          cells[index] = colorIndex
        }
      }
    }
  }
  
  return cells
}

/**
 * Create a double helix pattern for Magnet Automata
 * Shows two intertwined spirals
 */
export function createMagnetHelixPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  for (let y = 0; y < cubeSize; y++) {
    const angle1 = (y / cubeSize) * Math.PI * 4 // First helix
    const angle2 = angle1 + Math.PI // Second helix, 180° offset
    
    // First helix
    const x1 = Math.round(center + Math.cos(angle1) * (cubeSize / 4))
    const z1 = Math.round(center + Math.sin(angle1) * (cubeSize / 4))
    
    // Second helix
    const x2 = Math.round(center + Math.cos(angle2) * (cubeSize / 4))
    const z2 = Math.round(center + Math.sin(angle2) * (cubeSize / 4))
    
    // Place cells with thickness
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const idx1 = (x1 + dx) + y * cubeSize + (z1 + dz) * cubeSize * cubeSize
        const idx2 = (x2 + dx) + y * cubeSize + (z2 + dz) * cubeSize * cubeSize
        
        if (idx1 >= 0 && idx1 < cells.length && 
            x1 + dx >= 0 && x1 + dx < cubeSize &&
            z1 + dz >= 0 && z1 + dz < cubeSize) {
          cells[idx1] = 0 as ColorIndex // Red helix
        }
        
        if (idx2 >= 0 && idx2 < cells.length &&
            x2 + dx >= 0 && x2 + dx < cubeSize &&
            z2 + dz >= 0 && z2 + dz < cubeSize) {
          cells[idx2] = 3 as ColorIndex // Blue helix
        }
      }
    }
  }
  
  return cells
}

/**
 * Create a flow field pattern
 * Multiple sources creating interesting flow dynamics
 */
export function createMagnetFlowFieldPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  
  // Create several flow sources
  const sources = [
    { x: 0, y: 0, z: 0, color: 0 },
    { x: cubeSize - 1, y: 0, z: cubeSize - 1, color: 1 },
    { x: 0, y: cubeSize - 1, z: cubeSize - 1, color: 2 },
    { x: cubeSize - 1, y: cubeSize - 1, z: 0, color: 3 }
  ]
  
  // Fill from each source
  sources.forEach(source => {
    for (let y = 0; y < cubeSize; y++) {
      for (let x = 0; x < cubeSize; x++) {
        for (let z = 0; z < cubeSize; z++) {
          const dx = x - source.x
          const dy = y - source.y
          const dz = z - source.z
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
          
          if (distance < cubeSize / 2) {
            const index = x + y * cubeSize + z * cubeSize * cubeSize
            if (cells[index] === null || Math.random() < 0.3) {
              cells[index] = source.color as ColorIndex
            }
          }
        }
      }
    }
  })
  
  return cells
}

export const MAGNET_SHOWCASE_PATTERNS: Pattern[] = [
  {
    name: 'Magnet Vortex',
    description: 'Spinning vortex pattern for magnetic flow',
    cubeSize: 6,
    cells: createMagnetVortexPattern(6)
  },
  {
    name: 'Magnet Helix',
    description: 'Double helix with magnetic alignment',
    cubeSize: 7,
    cells: createMagnetHelixPattern(7)
  },
  {
    name: 'Flow Field',
    description: 'Multiple flow sources creating dynamics',
    cubeSize: 5,
    cells: createMagnetFlowFieldPattern(5)
  }
]