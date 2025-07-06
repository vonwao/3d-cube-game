import type { CubeState, ColorIndex, Level } from './types';
import { createInitialState, floodFill, isWin } from './flood';

export interface SolutionStep {
  color: ColorIndex;
  moveNumber: number;
}

export interface Solution {
  steps: SolutionStep[];
  optimalMoves: number;
  solvable: boolean;
}

/**
 * Creates a unique string key for a cube state for memoization
 */
const stateToKey = (state: CubeState): string => {
  return `${state.cells.join(',')}-${state.floodRegion.map(r => r ? '1' : '0').join('')}`;
};

/**
 * Gets all possible next moves (colors) from the current state
 */
const getPossibleMoves = (state: CubeState): ColorIndex[] => {
  const currentColor = state.cells.find((_, i) => state.floodRegion[i]);
  if (currentColor === undefined) return [];
  
  const possibleColors: ColorIndex[] = [];
  for (let color = 0; color <= 5; color++) {
    if (color !== currentColor) {
      possibleColors.push(color as ColorIndex);
    }
  }
  
  return possibleColors;
};

/**
 * Solves a level using BFS to find the optimal solution
 */
export const solveLevel = (level: Level): Solution => {
  const initialState = createInitialState(level.cells, level.maxMoves);
  
  // If already won, return empty solution
  if (isWin(initialState)) {
    return {
      steps: [],
      optimalMoves: 0,
      solvable: true,
    };
  }
  
  // BFS queue: [state, path to reach this state]
  const queue: [CubeState, SolutionStep[]][] = [[initialState, []]];
  const visited = new Set<string>();
  visited.add(stateToKey(initialState));
  
  // Reasonable limit to prevent infinite loops
  const maxDepth = 15;
  
  while (queue.length > 0) {
    const [currentState, path] = queue.shift()!;
    
    // Don't explore paths that are too deep
    if (path.length >= maxDepth) continue;
    
    // Try all possible moves
    const possibleMoves = getPossibleMoves(currentState);
    
    for (const color of possibleMoves) {
      const newState = floodFill(currentState, color);
      const newPath = [...path, { color, moveNumber: path.length + 1 }];
      
      // Check if we've won
      if (isWin(newState)) {
        return {
          steps: newPath,
          optimalMoves: newPath.length,
          solvable: true,
        };
      }
      
      // Check if we've seen this state before
      const stateKey = stateToKey(newState);
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push([newState, newPath]);
      }
    }
  }
  
  // No solution found
  return {
    steps: [],
    optimalMoves: -1,
    solvable: false,
  };
};

/**
 * Analyzes all levels to find their optimal solutions
 */
export const analyzeLevels = (levels: Level[]): Record<string, Solution> => {
  const results: Record<string, Solution> = {};
  
  for (const level of levels) {
    console.log(`Analyzing level ${level.id}...`);
    const solution = solveLevel(level);
    results[level.id] = solution;
    
    if (solution.solvable) {
      console.log(`Level ${level.id}: ${solution.optimalMoves} moves optimal (declared: ${level.maxMoves})`);
    } else {
      console.log(`Level ${level.id}: UNSOLVABLE!`);
    }
  }
  
  return results;
};

/**
 * Validates that all levels are solvable within their declared maxMoves
 */
export const validateLevels = (levels: Level[]): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const solutions = analyzeLevels(levels);
  
  for (const level of levels) {
    const solution = solutions[level.id];
    
    if (!solution.solvable) {
      issues.push(`Level ${level.id} is not solvable`);
    } else if (solution.optimalMoves > level.maxMoves) {
      issues.push(`Level ${level.id} requires ${solution.optimalMoves} moves but only allows ${level.maxMoves}`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * Gets a hint for the next best move from the current state
 */
export const getHint = (_level: Level, currentState: CubeState): ColorIndex | null => {
  // If already won, no hint needed
  if (isWin(currentState)) return null;
  
  // BFS queue: [state, next move to reach this state]
  const queue: [CubeState, ColorIndex | null][] = [[currentState, null]];
  const visited = new Set<string>();
  visited.add(stateToKey(currentState));
  
  // Reasonable limit to prevent infinite loops
  const maxDepth = 8;
  let depth = 0;
  
  while (queue.length > 0 && depth < maxDepth) {
    const queueSize = queue.length;
    
    for (let i = 0; i < queueSize; i++) {
      const [state, firstMove] = queue.shift()!;
      
      // Try all possible moves
      const possibleMoves = getPossibleMoves(state);
      
      for (const color of possibleMoves) {
        const newState = floodFill(state, color);
        const newFirstMove = firstMove || color;
        
        // Check if we've won
        if (isWin(newState)) {
          return newFirstMove;
        }
        
        // Check if we've seen this state before
        const stateKey = stateToKey(newState);
        if (!visited.has(stateKey)) {
          visited.add(stateKey);
          queue.push([newState, newFirstMove]);
        }
      }
    }
    
    depth++;
  }
  
  return null;
};