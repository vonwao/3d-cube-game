import type { ColorIndex } from '../../color-flood/logic/types'
import type { Vec3 } from '../../../engine/types'
import { vec3ToIndex } from './automata'

// Based on research into 3D cellular automata
// References: 
// - Carter Bays' work on 3D Life (Life 4555, Life 5766)
// - 3D Majority Rule automata
// - Von Neumann neighborhood patterns

export function create3DLifePattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // 3D R-pentomino equivalent - known to produce complex behavior
  const center = Math.floor(cubeSize / 2)
  const patterns: Array<{ pos: Vec3; color: ColorIndex }> = [
    // R-pentomino in 3D
    { pos: [center, center-1, center], color: 0 },
    { pos: [center+1, center-1, center], color: 0 },
    { pos: [center-1, center, center], color: 0 },
    { pos: [center, center, center], color: 0 },
    { pos: [center, center+1, center], color: 0 },
    
    // Add some depth
    { pos: [center, center, center-1], color: 0 },
    { pos: [center, center, center+1], color: 0 },
  ]
  
  for (const { pos, color } of patterns) {
    if (pos[0] >= 0 && pos[0] < cubeSize &&
        pos[1] >= 0 && pos[1] < cubeSize &&
        pos[2] >= 0 && pos[2] < cubeSize) {
      const index = vec3ToIndex(pos, cubeSize)
      cells[index] = color
    }
  }
  
  return cells
}

export function createDiamondPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create a diamond/octahedron shape - stable in many 3D rules
  for (let i = 0; i < cells.length; i++) {
    const z = Math.floor(i / (cubeSize * cubeSize))
    const y = Math.floor((i % (cubeSize * cubeSize)) / cubeSize)
    const x = i % cubeSize
    
    // Manhattan distance from center
    const distance = Math.abs(x - center) + Math.abs(y - center) + Math.abs(z - center)
    
    if (distance <= 2) {
      // Color based on distance for visual effect
      cells[i] = (distance % 3) as ColorIndex
    }
  }
  
  return cells
}

export function createHelixPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  const radius = Math.min(2, Math.floor(cubeSize / 3))
  
  // Create a double helix pattern
  for (let z = 1; z < cubeSize - 1; z++) {
    const angle1 = (z / cubeSize) * Math.PI * 4
    const angle2 = angle1 + Math.PI
    
    // First helix strand
    const x1 = Math.round(center + radius * Math.cos(angle1))
    const y1 = Math.round(center + radius * Math.sin(angle1))
    
    // Second helix strand
    const x2 = Math.round(center + radius * Math.cos(angle2))
    const y2 = Math.round(center + radius * Math.sin(angle2))
    
    if (x1 >= 0 && x1 < cubeSize && y1 >= 0 && y1 < cubeSize) {
      const index1 = vec3ToIndex([x1, y1, z] as Vec3, cubeSize)
      cells[index1] = 0 // Red helix
    }
    
    if (x2 >= 0 && x2 < cubeSize && y2 >= 0 && y2 < cubeSize) {
      const index2 = vec3ToIndex([x2, y2, z] as Vec3, cubeSize)
      cells[index2] = 1 // Blue helix
    }
    
    // Connect the strands occasionally
    if (z % 3 === 0) {
      const midX = Math.round((x1 + x2) / 2)
      const midY = Math.round((y1 + y2) / 2)
      if (midX >= 0 && midX < cubeSize && midY >= 0 && midY < cubeSize) {
        const indexMid = vec3ToIndex([midX, midY, z] as Vec3, cubeSize)
        cells[indexMid] = 2 // Green connector
      }
    }
  }
  
  return cells
}

export function createPulsarPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create a 3D pulsar - oscillates in many CA rules
  // This is a 3D extension of the 2D pulsar
  const offsets = [
    // Horizontal bars
    [-2, 0, 0], [-1, 0, 0], [1, 0, 0], [2, 0, 0],
    [0, -2, 0], [0, -1, 0], [0, 1, 0], [0, 2, 0],
    [0, 0, -2], [0, 0, -1], [0, 0, 1], [0, 0, 2],
  ]
  
  // Place the pattern at multiple Z levels
  const zLevels = [center - 1, center, center + 1]
  
  for (const z of zLevels) {
    for (const [dx, dy, dz] of offsets) {
      const x = center + dx
      const y = center + dy
      const finalZ = z + dz
      
      if (x >= 0 && x < cubeSize && 
          y >= 0 && y < cubeSize && 
          finalZ >= 0 && finalZ < cubeSize) {
        const index = vec3ToIndex([x, y, finalZ] as Vec3, cubeSize)
        cells[index] = Math.abs(z - center) as ColorIndex
      }
    }
  }
  
  return cells
}

export function createCrystalGrowthPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Seed crystals at corners - they will grow and compete
  const seeds = [
    { x: 1, y: 1, z: 1, color: 0 },
    { x: cubeSize-2, y: 1, z: 1, color: 1 },
    { x: 1, y: cubeSize-2, z: 1, color: 2 },
    { x: 1, y: 1, z: cubeSize-2, color: 3 },
    { x: cubeSize-2, y: cubeSize-2, z: 1, color: 4 },
    { x: cubeSize-2, y: 1, z: cubeSize-2, color: 5 },
  ]
  
  // Place seed crystals
  for (const seed of seeds) {
    if (seed.x < cubeSize && seed.y < cubeSize && seed.z < cubeSize) {
      const index = vec3ToIndex([seed.x, seed.y, seed.z] as Vec3, cubeSize)
      cells[index] = seed.color as ColorIndex
      
      // Add a few neighbors to each seed
      const neighbors = [
        [seed.x+1, seed.y, seed.z],
        [seed.x, seed.y+1, seed.z],
        [seed.x, seed.y, seed.z+1],
      ]
      
      for (const [nx, ny, nz] of neighbors) {
        if (nx < cubeSize && ny < cubeSize && nz < cubeSize) {
          const nIndex = vec3ToIndex([nx, ny, nz] as Vec3, cubeSize)
          cells[nIndex] = seed.color as ColorIndex
        }
      }
    }
  }
  
  return cells
}