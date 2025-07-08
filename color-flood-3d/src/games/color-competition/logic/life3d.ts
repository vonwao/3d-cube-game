import type { ColorIndex } from '../../color-flood/logic/types'
import type { CellState, Life3DConfig } from './types'
import { vec3ToIndex, indexToVec3 } from './automata'

// Classic 3D Game of Life implementation with enhancements

export function evolveLife3D(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  cubeSize: number,
  config: Life3DConfig
): { cells: (ColorIndex | null)[], cellStates: CellState[] } {
  const totalCells = cubeSize ** 3
  const newCells = new Array(totalCells).fill(null) as (ColorIndex | null)[]
  const newCellStates = cellStates.map(state => ({ ...state }))
  
  // Mark edge cells
  for (let i = 0; i < totalCells; i++) {
    const [x, y, z] = indexToVec3(i, cubeSize)
    newCellStates[i].isEdge = isEdgeCell(x, y, z, cubeSize)
  }
  
  for (let i = 0; i < totalCells; i++) {
    const currentCell = cells[i]
    const currentState = cellStates[i] || { color: null, age: 0 }
    const neighbors = countLife3DNeighbors(i, cells, cubeSize)
    
    // Apply edge bias
    const edgeModifier = newCellStates[i].isEdge ? config.edgeBias : 1.0
    const effectiveNeighbors = Math.round(neighbors * edgeModifier)
    
    if (currentCell !== null) {
      // Cell is alive - check survival
      if (config.survivalNeighbors.includes(effectiveNeighbors)) {
        newCells[i] = currentCell
        newCellStates[i].age = Math.min((currentState.age || 0) + 1, config.maxAge)
      } else {
        // Cell dies
        newCells[i] = null
        newCellStates[i].age = 0
      }
    } else {
      // Cell is dead - check birth
      if (config.birthNeighbors.includes(effectiveNeighbors)) {
        // Birth - determine color based on neighbors
        const neighborColor = getMostCommonNeighborColor(i, cells, cubeSize)
        newCells[i] = neighborColor
        newCellStates[i].age = 0
      }
    }
    
    // Update color based on age if enabled
    if (config.useAgeColors && newCells[i] !== null) {
      newCells[i] = getAgeBasedColor(newCellStates[i].age || 0, config.maxAge)
    }
  }
  
  return { cells: newCells, cellStates: newCellStates }
}

function countLife3DNeighbors(index: number, cells: (ColorIndex | null)[], cubeSize: number): number {
  const [x, y, z] = indexToVec3(index, cubeSize)
  let count = 0
  
  // Check all 26 neighbors (Moore neighborhood in 3D)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue // Skip self
        
        const nx = x + dx
        const ny = y + dy
        const nz = z + dz
        
        if (nx >= 0 && nx < cubeSize && ny >= 0 && ny < cubeSize && nz >= 0 && nz < cubeSize) {
          const neighborIndex = vec3ToIndex([nx, ny, nz], cubeSize)
          if (cells[neighborIndex] !== null) {
            count++
          }
        }
      }
    }
  }
  
  return count
}

function getMostCommonNeighborColor(index: number, cells: (ColorIndex | null)[], cubeSize: number): ColorIndex {
  const [x, y, z] = indexToVec3(index, cubeSize)
  const colorCounts: { [color: number]: number } = {}
  
  // Count neighbor colors
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue
        
        const nx = x + dx
        const ny = y + dy
        const nz = z + dz
        
        if (nx >= 0 && nx < cubeSize && ny >= 0 && ny < cubeSize && nz >= 0 && nz < cubeSize) {
          const neighborIndex = vec3ToIndex([nx, ny, nz], cubeSize)
          const neighborColor = cells[neighborIndex]
          if (neighborColor !== null) {
            colorCounts[neighborColor] = (colorCounts[neighborColor] || 0) + 1
          }
        }
      }
    }
  }
  
  // Find most common color
  let maxCount = 0
  let dominantColor: ColorIndex = 0
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count
      dominantColor = parseInt(color) as ColorIndex
    }
  }
  
  return dominantColor
}

function getAgeBasedColor(age: number, maxAge: number): ColorIndex {
  // Map age to color index (0-5)
  // Younger cells are warmer colors, older cells are cooler
  const normalizedAge = Math.min(age / maxAge, 1)
  
  if (normalizedAge < 0.2) return 0      // Red (newborn)
  if (normalizedAge < 0.4) return 3      // Orange (young)
  if (normalizedAge < 0.6) return 2      // Green (mature)
  if (normalizedAge < 0.8) return 1      // Blue (old)
  return 4                               // Purple (ancient)
}

function isEdgeCell(x: number, y: number, z: number, cubeSize: number): boolean {
  return x === 0 || x === cubeSize - 1 ||
         y === 0 || y === cubeSize - 1 ||
         z === 0 || z === cubeSize - 1
}

// Predefined Life 3D configurations
export const LIFE3D_PRESETS = {
  classic: {
    birthNeighbors: [5],
    survivalNeighbors: [5, 6, 7],
    useAgeColors: true,
    maxAge: 50,
    edgeBias: 0.8,
  } as Life3DConfig,
  
  stable: {
    birthNeighbors: [6],
    survivalNeighbors: [4, 5, 6, 7],
    useAgeColors: true,
    maxAge: 30,
    edgeBias: 0.9,
  } as Life3DConfig,
  
  growth: {
    birthNeighbors: [4, 5],
    survivalNeighbors: [4, 5, 6, 7, 8],
    useAgeColors: true,
    maxAge: 20,
    edgeBias: 1.2, // Edge cells are more likely to survive
  } as Life3DConfig,
  
  decay: {
    birthNeighbors: [6, 7],
    survivalNeighbors: [5, 6],
    useAgeColors: true,
    maxAge: 15,
    edgeBias: 0.6, // Edge cells die faster
  } as Life3DConfig,
};