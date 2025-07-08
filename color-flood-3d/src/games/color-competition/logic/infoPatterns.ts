import type { ColorIndex } from '../../color-flood/logic/types'
import type { Pattern } from './types'

/**
 * Create a simple oscillator circuit
 * NOT gate in a loop creates blinking pattern
 */
export function createInfoOscillatorPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create a ring of cells
  const positions = [
    [center-1, center, center],
    [center, center, center-1],
    [center+1, center, center],
    [center, center, center+1]
  ]
  
  positions.forEach(([x, y, z], i) => {
    const index = x + y * cubeSize + z * cubeSize * cubeSize
    cells[index] = (i % 2) as ColorIndex // Alternate colors for visibility
  })
  
  // Add a NOT gate in the center
  const centerIndex = center + center * cubeSize + center * cubeSize * cubeSize
  cells[centerIndex] = 4 as ColorIndex // NOT gate color
  
  return cells
}

/**
 * Create a signal propagation line
 * Shows how signals travel through wires
 */
export function createInfoSignalLinePattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  const y = Math.floor(cubeSize / 2)
  const z = Math.floor(cubeSize / 2)
  
  // Create a line of cells across X axis
  for (let x = 0; x < cubeSize; x++) {
    const index = x + y * cubeSize + z * cubeSize * cubeSize
    // Source at one end, rest are wires
    cells[index] = x === 0 ? 5 : 0 as ColorIndex
  }
  
  // Add some branches
  if (cubeSize >= 5) {
    // Upper branch
    for (let x = 2; x < cubeSize - 1; x++) {
      const index = x + (y + 1) * cubeSize + z * cubeSize * cubeSize
      cells[index] = 1 as ColorIndex
    }
    
    // Lower branch
    for (let x = 2; x < cubeSize - 1; x++) {
      const index = x + (y - 1) * cubeSize + z * cubeSize * cubeSize
      cells[index] = 2 as ColorIndex
    }
  }
  
  return cells
}

/**
 * Create a logic gate demonstration
 * Shows AND/OR gates in action
 */
export function createInfoLogicGatesPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Layer 1: Input sources
  const y1 = 1
  cells[1 + y1 * cubeSize + center * cubeSize * cubeSize] = 5 as ColorIndex // Source 1
  cells[(cubeSize - 2) + y1 * cubeSize + center * cubeSize * cubeSize] = 5 as ColorIndex // Source 2
  
  // Layer 2: Wires to gates
  const y2 = 2
  for (let x = 1; x < center; x++) {
    cells[x + y2 * cubeSize + center * cubeSize * cubeSize] = 0 as ColorIndex
  }
  for (let x = center + 1; x < cubeSize - 1; x++) {
    cells[x + y2 * cubeSize + center * cubeSize * cubeSize] = 0 as ColorIndex
  }
  
  // Layer 3: Logic gates
  const y3 = 3
  cells[center + y3 * cubeSize + (center - 1) * cubeSize * cubeSize] = 1 as ColorIndex // AND gate
  cells[center + y3 * cubeSize + (center + 1) * cubeSize * cubeSize] = 2 as ColorIndex // OR gate
  
  // Layer 4: Output wires
  const y4 = 4
  cells[center + y4 * cubeSize + (center - 1) * cubeSize * cubeSize] = 3 as ColorIndex
  cells[center + y4 * cubeSize + (center + 1) * cubeSize * cubeSize] = 4 as ColorIndex
  
  return cells
}

/**
 * Create a 3D circuit network
 * Complex interconnected logic
 */
export function createInfo3DCircuitPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells: (ColorIndex | null)[] = new Array(cubeSize ** 3).fill(null)
  
  // Create a 3D grid of interconnected nodes
  const step = Math.max(2, Math.floor(cubeSize / 3))
  
  for (let x = step; x < cubeSize; x += step) {
    for (let y = step; y < cubeSize; y += step) {
      for (let z = step; z < cubeSize; z += step) {
        const index = x + y * cubeSize + z * cubeSize * cubeSize
        
        // Place different gate types
        const gateType = ((x + y + z) / step) % 4
        cells[index] = gateType as ColorIndex
        
        // Connect to neighbors with wires
        if (x + step < cubeSize) {
          for (let dx = 1; dx < step; dx++) {
            const wireIndex = (x + dx) + y * cubeSize + z * cubeSize * cubeSize
            if (cells[wireIndex] === null) {
              cells[wireIndex] = 0 as ColorIndex
            }
          }
        }
        
        if (y + step < cubeSize) {
          for (let dy = 1; dy < step; dy++) {
            const wireIndex = x + (y + dy) * cubeSize + z * cubeSize * cubeSize
            if (cells[wireIndex] === null) {
              cells[wireIndex] = 0 as ColorIndex
            }
          }
        }
      }
    }
  }
  
  // Add some signal sources
  cells[0] = 5 as ColorIndex
  cells[cubeSize - 1] = 5 as ColorIndex
  cells[(cubeSize - 1) * cubeSize * cubeSize] = 5 as ColorIndex
  
  return cells
}

export const INFO_SHOWCASE_PATTERNS: Pattern[] = [
  {
    name: 'Info Oscillator',
    description: 'Ring oscillator with NOT gate',
    cubeSize: 5,
    cells: createInfoOscillatorPattern(5)
  },
  {
    name: 'Signal Line',
    description: 'Signal propagation demonstration',
    cubeSize: 7,
    cells: createInfoSignalLinePattern(7)
  },
  {
    name: 'Logic Gates',
    description: 'AND/OR gate demonstration',
    cubeSize: 6,
    cells: createInfoLogicGatesPattern(6)
  },
  {
    name: '3D Circuit',
    description: 'Complex 3D logic network',
    cubeSize: 8,
    cells: createInfo3DCircuitPattern(8)
  }
]