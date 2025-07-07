import type { CubeSize } from '../../../engine/types';

export interface GameConfig {
  cubeSize: CubeSize;
  totalCells: number;
  difficultyMultiplier: number; // For scaling move counts
}

export const CUBE_CONFIGS: Record<CubeSize, GameConfig> = {
  3: { cubeSize: 3, totalCells: 27, difficultyMultiplier: 1.0 },
  4: { cubeSize: 4, totalCells: 64, difficultyMultiplier: 1.5 },
  5: { cubeSize: 5, totalCells: 125, difficultyMultiplier: 2.0 },
  6: { cubeSize: 6, totalCells: 216, difficultyMultiplier: 2.5 }
};

export const DEFAULT_CUBE_SIZE: CubeSize = 3;