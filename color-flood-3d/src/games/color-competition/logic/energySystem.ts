import type { ColorIndex } from '../../color-flood/logic/types'
import type { CellState, EnergySystemConfig } from './types'
import { get3DNeighbors } from './automata'

/**
 * Energy & Resource System for Cellular Automata
 * 
 * This system adds metabolism-like behavior to cells:
 * - Cells consume energy to survive
 * - Energy diffuses through the system
 * - Cells can die from starvation
 * - Birth requires energy investment
 * - Competition for resources creates interesting dynamics
 */

// Default configuration for energy system
export const DEFAULT_ENERGY_CONFIG: EnergySystemConfig = {
  // Energy dynamics
  baseDecayRate: 0.02,          // 2% energy loss per generation
  birthEnergyCost: 0.3,         // 30% energy to create new cell
  deathThreshold: 0.05,         // Die if energy < 5%
  
  // Resource distribution
  diffusionRate: 0.2,           // 20% energy spreads to neighbors
  injectionPoints: [],          // No default injection points
  injectionRate: 0.5,           // 50% energy per injection
  
  // Competition
  energyTransferRate: 0.1,      // 10% energy transfer in competition
  competitionRadius: 1,         // Direct neighbors only
}

/**
 * Initialize energy for all cells
 */
export function initializeEnergy(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  initialEnergy: number = 0.5
): CellState[] {
  return cellStates.map((state, i) => ({
    ...state,
    energy: cells[i] !== null ? initialEnergy : 0,
    nutrients: 0,
    energyFlow: [0, 0, 0]
  }))
}

/**
 * Calculate energy diffusion between cells
 */
function calculateDiffusion(
  cellStates: CellState[],
  cubeSize: number,
  diffusionRate: number
): number[] {
  const newEnergies = cellStates.map(s => s.energy || 0)
  
  cellStates.forEach((state, index) => {
    if (state.color === null || !state.energy) return
    
    const neighbors = get3DNeighbors(index, cubeSize)
    const validNeighbors = neighbors.filter((n: number) => cellStates[n].color !== null)
    
    if (validNeighbors.length === 0) return
    
    // Calculate energy to spread
    const energyToSpread = state.energy * diffusionRate
    const energyPerNeighbor = energyToSpread / validNeighbors.length
    
    // Remove energy from current cell
    newEnergies[index] -= energyToSpread
    
    // Add energy to neighbors
    validNeighbors.forEach((n: number) => {
      newEnergies[n] += energyPerNeighbor
    })
  })
  
  return newEnergies
}

/**
 * Inject nutrients at specified points
 */
function injectNutrients(
  cellStates: CellState[],
  cubeSize: number,
  injectionPoints: [number, number, number][],
  injectionRate: number
): void {
  injectionPoints.forEach(([x, y, z]) => {
    const index = x + y * cubeSize + z * cubeSize * cubeSize
    if (index >= 0 && index < cellStates.length) {
      cellStates[index].nutrients = Math.min(1.0, (cellStates[index].nutrients || 0) + injectionRate)
    }
  })
}

/**
 * Calculate energy flow vectors for visualization
 */
function calculateEnergyFlow(
  cellStates: CellState[],
  cubeSize: number
): [number, number, number][] {
  return cellStates.map((state, index) => {
    if (state.color === null || !state.energy) return [0, 0, 0]
    
    const neighbors = get3DNeighbors(index, cubeSize)
    let flowX = 0, flowY = 0, flowZ = 0
    
    neighbors.forEach((n: number, i: number) => {
      const neighborEnergy = cellStates[n].energy || 0
      const energyDiff = neighborEnergy - (state.energy || 0)
      
      // Calculate direction based on neighbor position
      const dx = (i % 3) - 1  // -1, 0, 1
      const dy = Math.floor(i / 3) % 3 - 1
      const dz = Math.floor(i / 9) - 1
      
      flowX += energyDiff * dx
      flowY += energyDiff * dy
      flowZ += energyDiff * dz
    })
    
    // Normalize
    const magnitude = Math.sqrt(flowX * flowX + flowY * flowY + flowZ * flowZ)
    if (magnitude > 0) {
      return [flowX / magnitude, flowY / magnitude, flowZ / magnitude]
    }
    return [0, 0, 0]
  })
}

/**
 * Main evolution function for energy system
 */
export function evolveEnergySystem(
  cells: (ColorIndex | null)[],
  cellStates: CellState[],
  cubeSize: number,
  config: EnergySystemConfig
): { cells: (ColorIndex | null)[], cellStates: CellState[] } {
  const newCells = [...cells]
  const newStates = cellStates.map(s => ({ ...s }))
  
  // Step 1: Energy decay
  newStates.forEach((state) => {
    if (state.color !== null && state.energy !== undefined) {
      state.energy = Math.max(0, state.energy - config.baseDecayRate)
      
      // Convert nutrients to energy
      if (state.nutrients && state.nutrients > 0) {
        const nutrientConversion = Math.min(state.nutrients, 0.1)
        state.energy += nutrientConversion
        state.nutrients -= nutrientConversion
      }
    }
  })
  
  // Step 2: Energy diffusion
  const diffusedEnergies = calculateDiffusion(newStates, cubeSize, config.diffusionRate)
  newStates.forEach((state, i) => {
    if (state.color !== null) {
      state.energy = diffusedEnergies[i]
    }
  })
  
  // Step 3: Inject nutrients
  injectNutrients(newStates, cubeSize, config.injectionPoints, config.injectionRate)
  
  // Step 4: Cell death from energy starvation
  newStates.forEach((state, i) => {
    if (state.color !== null && state.energy !== undefined && state.energy < config.deathThreshold) {
      newCells[i] = null
      state.color = null
      state.energy = 0
    }
  })
  
  // Step 5: Birth with energy cost
  const birthCandidates: { index: number, parentIndex: number, color: ColorIndex }[] = []
  
  newStates.forEach((state, index) => {
    if (state.color === null) {
      const neighbors = get3DNeighbors(index, cubeSize)
      const livingNeighbors = neighbors.filter((n: number) => newCells[n] !== null && (newStates[n].energy || 0) > config.birthEnergyCost)
      
      if (livingNeighbors.length >= 2) {
        // Find neighbor with most energy
        const parentIndex = livingNeighbors.reduce((best: number, n: number) => 
          (newStates[n].energy || 0) > (newStates[best].energy || 0) ? n : best
        , livingNeighbors[0])
        
        birthCandidates.push({
          index,
          parentIndex,
          color: newCells[parentIndex] as ColorIndex
        })
      }
    }
  })
  
  // Process births
  birthCandidates.forEach(({ index, parentIndex, color }) => {
    if ((newStates[parentIndex].energy || 0) >= config.birthEnergyCost) {
      newCells[index] = color
      newStates[index].color = color
      newStates[index].energy = config.birthEnergyCost / 2  // Child gets half the cost
      if (newStates[parentIndex].energy !== undefined) {
        newStates[parentIndex].energy -= config.birthEnergyCost
      }
      newStates[index].age = 0
    }
  })
  
  // Step 6: Energy competition
  if (config.competitionRadius > 0) {
    newStates.forEach((state, index) => {
      if (state.color !== null && state.energy !== undefined) {
        const neighbors = get3DNeighbors(index, cubeSize)
        
        neighbors.forEach((n: number) => {
          const neighborState = newStates[n]
          if (neighborState.color !== null && 
              neighborState.color !== state.color &&
              neighborState.energy !== undefined) {
            
            // Transfer energy from weaker to stronger
            if (state.energy !== undefined && state.energy > neighborState.energy) {
              const transfer = (state.energy - neighborState.energy) * config.energyTransferRate * 0.5
              state.energy += transfer
              neighborState.energy -= transfer
            }
          }
        })
      }
    })
  }
  
  // Step 7: Calculate energy flow for visualization
  const flows = calculateEnergyFlow(newStates, cubeSize)
  newStates.forEach((state, i) => {
    state.energyFlow = flows[i]
  })
  
  // Ensure energy stays in valid range
  newStates.forEach(state => {
    if (state.energy !== undefined) {
      state.energy = Math.max(0, Math.min(1, state.energy))
    }
    if (state.nutrients !== undefined) {
      state.nutrients = Math.max(0, Math.min(1, state.nutrients))
    }
  })
  
  return { cells: newCells, cellStates: newStates }
}

/**
 * Create interesting energy patterns
 */
export const ENERGY_PATTERNS = {
  // Central energy source
  centralSource: (cubeSize: number): EnergySystemConfig => ({
    ...DEFAULT_ENERGY_CONFIG,
    injectionPoints: [[Math.floor(cubeSize/2), Math.floor(cubeSize/2), Math.floor(cubeSize/2)]],
    injectionRate: 0.8
  }),
  
  // Corner sources creating flow
  cornerSources: (cubeSize: number): EnergySystemConfig => ({
    ...DEFAULT_ENERGY_CONFIG,
    injectionPoints: [
      [0, 0, 0],
      [cubeSize-1, cubeSize-1, cubeSize-1]
    ],
    injectionRate: 0.6
  }),
  
  // Energy fountain
  fountain: (cubeSize: number): EnergySystemConfig => ({
    ...DEFAULT_ENERGY_CONFIG,
    baseDecayRate: 0.03,
    diffusionRate: 0.3,
    injectionPoints: [[Math.floor(cubeSize/2), 0, Math.floor(cubeSize/2)]],
    injectionRate: 1.0
  }),
  
  // Scarcity mode
  scarcity: (): EnergySystemConfig => ({
    ...DEFAULT_ENERGY_CONFIG,
    baseDecayRate: 0.05,
    birthEnergyCost: 0.5,
    energyTransferRate: 0.2,
    competitionRadius: 2
  })
}