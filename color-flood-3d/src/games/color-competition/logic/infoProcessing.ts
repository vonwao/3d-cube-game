import type { ColorIndex } from '../../color-flood/logic/types'
import type { CellState, InfoProcessingConfig } from './types'
import { get3DNeighbors } from './automata'

/**
 * Information Processing System
 * 
 * This system turns cells into logic gates and computational elements:
 * - Each cell can have multiple states (0-15)
 * - Cells act as logic gates (AND, OR, XOR, etc.)
 * - Information flows through the network
 * - Can create complex circuits and computers
 * - Visual feedback shows signal propagation
 */

// Gate type constants
export const GateType = {
  WIRE: 0,      // Pass signal through
  AND: 1,       // Output if all inputs active
  OR: 2,        // Output if any input active
  XOR: 3,       // Output if odd number of inputs
  NOT: 4,       // Invert signal
  THRESHOLD: 5, // Output if inputs > threshold
  DELAY: 6,     // Delay signal by 1 generation
  SOURCE: 7,    // Signal generator
  SINK: 8       // Signal consumer
} as const

// Default configuration for information processing
export const DEFAULT_INFO_CONFIG: InfoProcessingConfig = {
  gateTypes: {
    0: 'WIRE',
    1: 'AND',
    2: 'OR',
    3: 'XOR',
    4: 'NOT',
    5: 'THRESHOLD'
  },
  signalDecay: 0.1,         // 10% signal loss per generation
  signalThreshold: 0.5,     // Activation threshold
  propagationDelay: 1,      // 1 generation delay
  circuitLayouts: []        // No predefined circuits
}

/**
 * Initialize information processing states
 */
export function initializeInfoStates(
  _cells: (ColorIndex | null)[],
  cellStates: CellState[],
  pattern: 'empty' | 'random' | 'circuit' = 'empty'
): CellState[] {
  return cellStates.map((state) => {
    let gateType = GateType.WIRE as number
    let initialSignal = 0
    
    if (state.color !== null) {
      switch (pattern) {
        case 'random':
          gateType = Math.floor(Math.random() * 6)
          initialSignal = Math.random() < 0.1 ? 1 : 0
          break
          
        case 'circuit':
          // Predefined circuit patterns can be added here
          gateType = GateType.WIRE
          break
          
        case 'empty':
        default:
          gateType = GateType.WIRE
          break
      }
    }
    
    return {
      ...state,
      state: 0,
      gateType,
      outputSignal: initialSignal,
      inputBuffer: []
    }
  })
}

/**
 * Process logic gate
 */
function processGate(
  inputs: number[],
  gateType: number,
  threshold: number = 0.5
): number {
  const activeInputs = inputs.filter(i => i > threshold).length
  
  switch (gateType) {
    case GateType.WIRE:
      return inputs.length > 0 ? Math.max(...inputs) : 0
      
    case GateType.AND:
      return inputs.length > 0 && activeInputs === inputs.length ? 1 : 0
      
    case GateType.OR:
      return activeInputs > 0 ? 1 : 0
      
    case GateType.XOR:
      return activeInputs % 2 === 1 ? 1 : 0
      
    case GateType.NOT:
      return inputs.length > 0 && activeInputs === 0 ? 1 : 0
      
    case GateType.THRESHOLD:
      return activeInputs >= 2 ? 1 : 0
      
    case GateType.DELAY:
      // Handled separately with buffer
      return 0
      
    case GateType.SOURCE:
      return 1 // Always output signal
      
    case GateType.SINK:
      return 0 // Always consume signal
      
    default:
      return 0
  }
}

/**
 * Get gate color based on type and signal
 */
function getGateColor(gateType: number, signal: number): ColorIndex {
  // Use different colors for different gate types
  const baseColor = gateType % 6
  // Brighten if signal is active
  return (signal > 0.5 ? baseColor : (baseColor + 3) % 6) as ColorIndex
}

/**
 * Create circuit patterns
 */
export function createCircuitPattern(
  cubeSize: number,
  circuitType: 'adder' | 'oscillator' | 'counter' | 'memory'
): { cells: (ColorIndex | null)[], gateTypes: number[] } {
  const totalCells = cubeSize ** 3
  const cells: (ColorIndex | null)[] = new Array(totalCells).fill(null)
  const gateTypes: number[] = new Array(totalCells).fill(GateType.WIRE)
  
  const center = Math.floor(cubeSize / 2)
  
  switch (circuitType) {
    case 'oscillator':
      // Simple ring oscillator
      const positions = [
        [center-1, center, center],
        [center, center, center],
        [center+1, center, center]
      ]
      positions.forEach(([x, y, z], i) => {
        const index = x + y * cubeSize + z * cubeSize * cubeSize
        cells[index] = 0 as ColorIndex
        gateTypes[index] = i === 1 ? GateType.NOT : GateType.WIRE
      })
      break
      
    case 'adder':
      // Half adder circuit
      // Would need more complex layout
      break
      
    case 'counter':
      // Binary counter
      break
      
    case 'memory':
      // SR latch
      break
  }
  
  return { cells, gateTypes }
}

/**
 * Main evolution function for information processing
 */
export function evolveInfoProcessing(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  cubeSize: number,
  config: InfoProcessingConfig
): { cells: (ColorIndex | null)[], cellStates: CellState[] } {
  const newCells = [...cells]
  const newStates = cellStates.map(s => ({ ...s }))
  
  // Collect inputs for each cell
  const cellInputs: number[][] = new Array(cells.length).fill(null).map(() => [])
  
  // Gather inputs from neighbors
  newStates.forEach((state, index) => {
    if (state.color === null) return
    
    const neighbors = get3DNeighbors(index, cubeSize)
    neighbors.forEach((n: number) => {
      const neighborState = cellStates[n]
      if (neighborState.color !== null && neighborState.outputSignal !== undefined) {
        // Apply signal decay
        const decayedSignal = neighborState.outputSignal * (1 - config.signalDecay)
        if (decayedSignal > 0.01) {
          cellInputs[index].push(decayedSignal)
        }
      }
    })
  })
  
  // Process gates and update outputs
  newStates.forEach((state, index) => {
    if (state.color === null || state.gateType === undefined) return
    
    const inputs = cellInputs[index]
    
    // Handle delay gates specially
    if (state.gateType === GateType.DELAY) {
      state.outputSignal = state.inputBuffer && state.inputBuffer[0] || 0
      state.inputBuffer = inputs
    } else {
      // Process gate logic
      state.outputSignal = processGate(inputs, state.gateType, config.signalThreshold)
    }
    
    // Update state value (for visualization)
    state.state = Math.floor(state.outputSignal * 15)
    
    // Update color based on gate type and signal
    newCells[index] = getGateColor(state.gateType, state.outputSignal || 0)
    
    // Track signal history in buffer
    if (state.inputBuffer) {
      state.inputBuffer.push(state.outputSignal || 0)
      if (state.inputBuffer.length > 10) {
        state.inputBuffer.shift()
      }
    }
  })
  
  // Handle special cells (sources and sinks)
  newStates.forEach((state) => {
    if (state.color !== null && state.gateType !== undefined) {
      if (state.gateType === GateType.SOURCE) {
        // Oscillating source
        const time = Date.now() / 1000
        state.outputSignal = Math.sin(time) > 0 ? 1 : 0
      }
    }
  })
  
  // Propagation delay simulation
  if (config.propagationDelay > 1) {
    // More complex delay handling would go here
  }
  
  return { cells: newCells, cellStates: newStates }
}

/**
 * Create interesting information processing patterns
 */
export const INFO_PATTERNS = {
  // Empty circuit board
  emptyBoard: (): InfoProcessingConfig => ({
    ...DEFAULT_INFO_CONFIG,
    signalDecay: 0.05,
    signalThreshold: 0.3
  }),
  
  // Fast signals
  fastSignals: (): InfoProcessingConfig => ({
    ...DEFAULT_INFO_CONFIG,
    signalDecay: 0.02,
    propagationDelay: 0,
    signalThreshold: 0.2
  }),
  
  // Noisy environment
  noisyCircuit: (): InfoProcessingConfig => ({
    ...DEFAULT_INFO_CONFIG,
    signalDecay: 0.2,
    signalThreshold: 0.7
  }),
  
  // Digital logic
  digitalLogic: (): InfoProcessingConfig => ({
    ...DEFAULT_INFO_CONFIG,
    signalDecay: 0.0,
    signalThreshold: 0.5,
    gateTypes: {
      0: 'WIRE',
      1: 'AND',
      2: 'OR',
      3: 'NOT',
      4: 'XOR',
      5: 'THRESHOLD',
      6: 'DELAY',
      7: 'SOURCE'
    }
  })
}

/**
 * Helper to design circuits visually
 */
export function placeGate(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  x: number,
  y: number,
  z: number,
  cubeSize: number,
  gateType: typeof GateType[keyof typeof GateType]
): void {
  const index = x + y * cubeSize + z * cubeSize * cubeSize
  if (index >= 0 && index < cells.length) {
    cells[index] = 0 as ColorIndex
    cellStates[index].gateType = gateType
    cellStates[index].outputSignal = 0
  }
}

/**
 * Connect gates with wires
 */
export function connectGates(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  from: [number, number, number],
  to: [number, number, number],
  cubeSize: number
): void {
  // Simple wire routing - just straight line for now
  const [x1, y1, z1] = from
  const [x2, y2, z2] = to
  
  // Place wire at each step
  const steps = Math.max(Math.abs(x2-x1), Math.abs(y2-y1), Math.abs(z2-z1))
  for (let i = 0; i <= steps; i++) {
    const t = steps > 0 ? i / steps : 0
    const x = Math.round(x1 + (x2 - x1) * t)
    const y = Math.round(y1 + (y2 - y1) * t)
    const z = Math.round(z1 + (z2 - z1) * t)
    
    placeGate(cells, cellStates, x, y, z, cubeSize, GateType.WIRE)
  }
}