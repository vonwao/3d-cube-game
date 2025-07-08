import type { ColorIndex } from '../../color-flood/logic/types'
import { vec3ToIndex } from './automata'

// Create patterns specifically designed for 3D Life algorithms

export function createLife3DSeedPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Small cross pattern that should evolve interestingly
  const pattern = [
    [center, center, center],     // Center
    [center-1, center, center],   // Left
    [center+1, center, center],   // Right
    [center, center-1, center],   // Back
    [center, center+1, center],   // Front
  ]
  
  pattern.forEach(([x, y, z], i) => {
    if (x >= 0 && x < cubeSize && y >= 0 && y < cubeSize && z >= 0 && z < cubeSize) {
      const index = vec3ToIndex([x, y, z], cubeSize)
      cells[index] = (i % 6) as ColorIndex // Different colors
    }
  })
  
  return cells
}

export function createLife3DCornerPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Place small clusters in corners to see how they evolve
  const corners = [
    [1, 1, 1],
    [cubeSize-2, 1, 1],
    [1, cubeSize-2, 1],
    [1, 1, cubeSize-2],
  ]
  
  corners.forEach(([x, y, z], cornerIndex) => {
    // Create small L-shape at each corner
    const pattern = [
      [x, y, z],
      [x+1, y, z],
      [x, y+1, z],
      [x, y, z+1],
    ]
    
    pattern.forEach(([px, py, pz]) => {
      if (px < cubeSize && py < cubeSize && pz < cubeSize) {
        const index = vec3ToIndex([px, py, pz], cubeSize)
        cells[index] = cornerIndex as ColorIndex
      }
    })
  })
  
  return cells
}

export function createLife3DLayeredPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create alternating layers to see vertical propagation
  for (let z = 1; z < cubeSize - 1; z++) {
    if (z % 2 === 1) { // Odd layers only
      // Small cross in each layer
      const pattern = [
        [center, center, z],
        [center-1, center, z],
        [center+1, center, z],
        [center, center-1, z],
        [center, center+1, z],
      ]
      
      pattern.forEach(([x, y, zPos]) => {
        if (x >= 0 && x < cubeSize && y >= 0 && y < cubeSize) {
          const index = vec3ToIndex([x, y, zPos], cubeSize)
          cells[index] = z as ColorIndex
        }
      })
    }
  }
  
  return cells
}

export function createLife3DSpiralPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  const radius = Math.min(2, Math.floor(cubeSize / 3))
  
  // Create a vertical spiral
  for (let z = 1; z < cubeSize - 1; z++) {
    const angle = (z / cubeSize) * Math.PI * 2
    const x = Math.round(center + radius * Math.cos(angle))
    const y = Math.round(center + radius * Math.sin(angle))
    
    if (x >= 0 && x < cubeSize && y >= 0 && y < cubeSize) {
      const index = vec3ToIndex([x, y, z], cubeSize)
      cells[index] = (z % 6) as ColorIndex
      
      // Add a neighbor for stability
      const neighbor = vec3ToIndex([x + 1, y, z], cubeSize)
      if (x + 1 < cubeSize) {
        cells[neighbor] = (z % 6) as ColorIndex
      }
    }
  }
  
  return cells
}