import type { CubeState, ColorIndex } from './types';
import { CUBE_SIZE, TOTAL_CELLS, indexToVec3, vec3ToIndex } from './types';

export const getNeighbors = (index: number): number[] => {
  const neighbors: number[] = [];
  const [x, y, z] = indexToVec3(index);
  
  const directions = [
    [-1, 0, 0], [1, 0, 0], // left, right
    [0, -1, 0], [0, 1, 0], // down, up
    [0, 0, -1], [0, 0, 1], // back, front
  ];
  
  for (const [dx, dy, dz] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;
    
    if (nx >= 0 && nx < CUBE_SIZE && ny >= 0 && ny < CUBE_SIZE && nz >= 0 && nz < CUBE_SIZE) {
      neighbors.push(vec3ToIndex([nx as 0 | 1 | 2, ny as 0 | 1 | 2, nz as 0 | 1 | 2]));
    }
  }
  
  return neighbors;
};

export const floodFill = (state: CubeState, newColor: ColorIndex): CubeState => {
  const newCells = [...state.cells];
  const newFloodRegion = [...state.floodRegion];
  
  const currentColor = newCells[0];
  if (currentColor === newColor) {
    return state;
  }
  
  const queue: number[] = [];
  const visited = new Set<number>();
  
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (state.floodRegion[i]) {
      queue.push(i);
      visited.add(i);
      newCells[i] = newColor;
    }
  }
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && newCells[neighbor] === newColor) {
        visited.add(neighbor);
        queue.push(neighbor);
        newFloodRegion[neighbor] = true;
      }
    }
  }
  
  return {
    ...state,
    cells: newCells,
    floodRegion: newFloodRegion,
    moves: state.moves + 1,
  };
};

export const isWin = (state: CubeState): boolean => {
  const firstColor = state.cells[0];
  return state.cells.every(color => color === firstColor);
};

export const createInitialState = (cells: ColorIndex[], maxMoves: number): CubeState => {
  const floodRegion = new Array(TOTAL_CELLS).fill(false);
  
  const queue: number[] = [0];
  const visited = new Set<number>([0]);
  floodRegion[0] = true;
  
  const startColor = cells[0];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && cells[neighbor] === startColor) {
        visited.add(neighbor);
        queue.push(neighbor);
        floodRegion[neighbor] = true;
      }
    }
  }
  
  return {
    cells: [...cells],
    floodRegion,
    moves: 0,
    maxMoves,
  };
};

export const getStarRating = (moves: number, maxMoves: number): number => {
  if (moves <= Math.floor(maxMoves * 0.6)) return 3;
  if (moves <= Math.floor(maxMoves * 0.8)) return 2;
  if (moves <= maxMoves) return 1;
  return 0;
};