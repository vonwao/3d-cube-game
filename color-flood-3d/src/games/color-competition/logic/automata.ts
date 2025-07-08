import type { Vec3 } from '../../../engine/types'
import type { ColorIndex } from '../../color-flood/logic/types'
import type { CellNeighborCount, SimulationConfig } from './types'

export function indexToVec3(index: number, cubeSize: number): Vec3 {
  const z = Math.floor(index / (cubeSize * cubeSize))
  const y = Math.floor((index % (cubeSize * cubeSize)) / cubeSize)
  const x = index % cubeSize
  return [x, y, z]
}

export function vec3ToIndex(vec: Vec3, cubeSize: number): number {
  const [x, y, z] = vec
  return z * cubeSize * cubeSize + y * cubeSize + x
}

// Get all 26 neighbors in 3D Moore neighborhood
export function get3DNeighbors(index: number, cubeSize: number): number[] {
  return getNeighbors(index, cubeSize)
}

export function getNeighbors(index: number, cubeSize: number): number[] {
  const [x, y, z] = indexToVec3(index, cubeSize)
  const neighbors: number[] = []

  // Check all 26 possible neighbors in 3D
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        // Skip the center cell
        if (dx === 0 && dy === 0 && dz === 0) continue

        const nx = x + dx
        const ny = y + dy
        const nz = z + dz

        // Check bounds
        if (nx >= 0 && nx < cubeSize && 
            ny >= 0 && ny < cubeSize && 
            nz >= 0 && nz < cubeSize) {
          neighbors.push(vec3ToIndex([nx, ny, nz], cubeSize))
        }
      }
    }
  }

  return neighbors
}

export function countNeighborsByColor(
  cells: (ColorIndex | null)[],
  neighbors: number[]
): CellNeighborCount {
  const count: CellNeighborCount = {
    total: 0,
    empty: 0,
  }

  for (const neighborIndex of neighbors) {
    const color = cells[neighborIndex]
    if (color === null) {
      count.empty++
    } else {
      count[color] = (count[color] || 0) + 1
      count.total++
    }
  }

  return count
}

export function getNextCellState(
  currentColor: ColorIndex | null,
  neighborCount: CellNeighborCount,
  config: SimulationConfig
): ColorIndex | null {
  // Find the dominant color among neighbors
  let dominantColor: ColorIndex | null = null
  let maxCount = 0

  for (const [colorStr, count] of Object.entries(neighborCount)) {
    // Skip 'total' and 'empty' properties
    if (colorStr === 'total' || colorStr === 'empty') continue
    
    const color = parseInt(colorStr) as ColorIndex
    if (count > maxCount) {
      maxCount = count
      dominantColor = color
    }
  }

  // Apply rules
  if (currentColor === null) {
    // Birth: Empty cell can become colored if enough neighbors of same color
    if (dominantColor !== null && maxCount >= config.minNeighborsToBirth) {
      return dominantColor
    }
    return null
  } else {
    // Competition: Cell changes color if overwhelmed by another color
    if (dominantColor !== null && 
        dominantColor !== currentColor &&
        maxCount >= config.competitionThreshold) {
      return dominantColor
    }
    
    // Death: Cell dies if too few neighbors
    if (neighborCount.total < config.minNeighborsToSurvive) {
      return null
    }
    
    // Survival: Cell keeps its color
    return currentColor
  }
}

export function evolveGeneration(
  cells: (ColorIndex | null)[],
  cubeSize: number,
  config: SimulationConfig
): (ColorIndex | null)[] {
  const newCells = new Array(cells.length)
  let changedCount = 0

  for (let i = 0; i < cells.length; i++) {
    const neighbors = getNeighbors(i, cubeSize)
    const neighborCount = countNeighborsByColor(cells, neighbors)
    const oldState = cells[i]
    const newState = getNextCellState(oldState, neighborCount, config)
    
    if (oldState !== newState) {
      changedCount++
      if (changedCount <= 5) { // Log first few changes
        console.log(`Cell ${i}: ${oldState} → ${newState}, neighbors:`, neighborCount)
      }
    }
    
    newCells[i] = newState
  }

  console.log(`Evolution complete: ${changedCount} cells changed`)
  return newCells
}

export function createRandomPattern(
  cubeSize: number,
  density: number = 0.3,
  numColors: number = 6
): (ColorIndex | null)[] {
  const totalCells = cubeSize * cubeSize * cubeSize
  const cells = new Array(totalCells)
  
  let coloredCount = 0
  for (let i = 0; i < cells.length; i++) {
    if (Math.random() < density) {
      cells[i] = Math.floor(Math.random() * numColors) as ColorIndex
      coloredCount++
    } else {
      cells[i] = null
    }
  }
  
  console.log(`🎲 Created random pattern: ${coloredCount}/${totalCells} colored cells (${Math.round(coloredCount/totalCells*100)}%)`)
  return cells
}

export function createGliderPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Create several small, stable configurations that might move or oscillate
  // These are 3D adaptations of classic 2D patterns
  
  // Pattern 1: Small cluster in one corner
  const patterns: Array<{ pos: Vec3; color: ColorIndex }> = [
    // Red cluster - minimal stable configuration
    { pos: [1, 1, 1], color: 0 },
    { pos: [2, 1, 1], color: 0 },
    { pos: [1, 2, 1], color: 0 },
    { pos: [1, 1, 2], color: 0 },
    
    // Blue cluster - offset position
    { pos: [cubeSize-2, cubeSize-2, 1], color: 1 },
    { pos: [cubeSize-3, cubeSize-2, 1], color: 1 },
    { pos: [cubeSize-2, cubeSize-3, 1], color: 1 },
    { pos: [cubeSize-2, cubeSize-2, 2], color: 1 },
    
    // Green oscillator in the middle
    { pos: [Math.floor(cubeSize/2), Math.floor(cubeSize/2), Math.floor(cubeSize/2)], color: 2 },
    { pos: [Math.floor(cubeSize/2)+1, Math.floor(cubeSize/2), Math.floor(cubeSize/2)], color: 2 },
    { pos: [Math.floor(cubeSize/2), Math.floor(cubeSize/2)+1, Math.floor(cubeSize/2)], color: 2 },
    { pos: [Math.floor(cubeSize/2), Math.floor(cubeSize/2), Math.floor(cubeSize/2)+1], color: 2 },
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

export function createColorWavePattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Create color bands along the diagonal
  for (let i = 0; i < cells.length; i++) {
    const [x, y, z] = indexToVec3(i, cubeSize)
    const distance = (x + y + z) % 6
    if ((x + y + z) % 2 === 0) {
      cells[i] = distance as ColorIndex
    }
  }
  
  return cells
}