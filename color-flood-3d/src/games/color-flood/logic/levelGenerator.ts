import type { CubeSize } from '../../../engine/types';
import { CUBE_CONFIGS } from './config';
import type { Level, ColorIndex } from './types';
import { createInitialState, floodFill, isWin } from './flood';

export interface GeneratedLevel extends Level {
  optimalMoves?: number;
}

export function generateLevelForSize(
  cubeSize: CubeSize, 
  difficulty: number
): GeneratedLevel {
  const config = CUBE_CONFIGS[cubeSize];
  
  // Calculate target moves based on cube size and difficulty
  const baseMoves = Math.floor(3 + difficulty * 0.7);
  const targetMoves = Math.floor(baseMoves * config.difficultyMultiplier);
  
  // Generate a solvable level
  let attempts = 0;
  while (attempts < 50) {
    const level = generateRandomLevel(cubeSize, targetMoves);
    const solution = findSimpleSolution(level.cells, cubeSize);
    
    if (solution && solution.length <= targetMoves && solution.length >= Math.floor(targetMoves * 0.6)) {
      return {
        ...level,
        maxMoves: targetMoves + Math.floor(targetMoves * 0.3), // 30% buffer
        optimalMoves: solution.length
      };
    }
    attempts++;
  }
  
  // Fallback to simple level
  return generateSimpleLevel(cubeSize, targetMoves);
}

function generateRandomLevel(cubeSize: CubeSize, targetComplexity: number): Level {
  const totalCells = cubeSize ** 3;
  const numColors = Math.min(6, 3 + Math.floor(targetComplexity / 4)) as 3 | 4 | 5 | 6;
  const cells = new Array(totalCells);
  
  // Generate color distribution with some clustering
  for (let i = 0; i < totalCells; i++) {
    cells[i] = Math.floor(Math.random() * numColors) as ColorIndex;
  }
  
  // Apply some smoothing to create color regions
  for (let smoothPass = 0; smoothPass < 2; smoothPass++) {
    const newCells = [...cells];
    for (let i = 0; i < totalCells; i++) {
      if (Math.random() < 0.3) { // 30% chance to adopt neighbor color
        const neighbors = getNeighborIndices(i, cubeSize);
        if (neighbors.length > 0) {
          const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
          newCells[i] = cells[randomNeighbor];
        }
      }
    }
    cells.splice(0, cells.length, ...newCells);
  }
  
  return {
    id: `generated-${cubeSize}x${cubeSize}x${cubeSize}-${Date.now()}`,
    cells: cells as ColorIndex[],
    maxMoves: targetComplexity,
  };
}

function generateSimpleLevel(cubeSize: CubeSize, targetMoves: number): GeneratedLevel {
  const totalCells = cubeSize ** 3;
  const cells = new Array(totalCells).fill(0) as ColorIndex[];
  
  // Create a simple pattern that's solvable in targetMoves
  const numColors = Math.min(targetMoves + 1, 6);
  
  // Fill with alternating colors in layers
  for (let i = 0; i < totalCells; i++) {
    const layer = Math.floor(i / (cubeSize * cubeSize));
    cells[i] = (layer % numColors) as ColorIndex;
  }
  
  return {
    id: `simple-${cubeSize}x${cubeSize}x${cubeSize}-${Date.now()}`,
    cells,
    maxMoves: targetMoves + 2,
    optimalMoves: targetMoves,
  };
}

function getNeighborIndices(index: number, cubeSize: CubeSize): number[] {
  const x = index % cubeSize;
  const y = Math.floor(index / cubeSize) % cubeSize;
  const z = Math.floor(index / (cubeSize * cubeSize));
  
  const neighbors: number[] = [];
  const offsets = [[-1,0,0], [1,0,0], [0,-1,0], [0,1,0], [0,0,-1], [0,0,1]];
  
  for (const [dx, dy, dz] of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;
    
    if (nx >= 0 && nx < cubeSize && ny >= 0 && ny < cubeSize && nz >= 0 && nz < cubeSize) {
      neighbors.push(nx + ny * cubeSize + nz * cubeSize * cubeSize);
    }
  }
  
  return neighbors;
}

// Simple greedy solver to validate levels
function findSimpleSolution(cells: ColorIndex[], cubeSize: CubeSize): ColorIndex[] | null {
  let state = createInitialState(cells, 999, cubeSize);
  const moves: ColorIndex[] = [];
  const maxTries = 50;
  
  while (!isWin(state) && moves.length < maxTries) {
    let bestColor: ColorIndex | null = null;
    let bestGain = 0;
    
    // Try each color and pick the one that captures the most new cells
    for (let color = 0; color < 6; color++) {
      const testState = floodFill(state, color as ColorIndex, cubeSize);
      const newCells = testState.floodRegion.filter(Boolean).length;
      const currentCells = state.floodRegion.filter(Boolean).length;
      const gain = newCells - currentCells;
      
      if (gain > bestGain) {
        bestGain = gain;
        bestColor = color as ColorIndex;
      }
    }
    
    if (bestColor === null || bestGain === 0) {
      return null; // No progress possible
    }
    
    state = floodFill(state, bestColor, cubeSize);
    moves.push(bestColor);
  }
  
  return isWin(state) ? moves : null;
}