import type { Vec3 } from '../../../engine/types';

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface CubeState {
  cells: ColorIndex[];
  floodRegion: boolean[];
  moves: number;
  maxMoves: number;
}

export interface Level {
  id: string;
  cells: ColorIndex[];
  maxMoves: number;
}

export interface GameState {
  currentLevel: Level | null;
  cubeState: CubeState;
  undoStack: CubeState[];
  isWon: boolean;
  isGameOver: boolean;
  selectedColor: ColorIndex | null;
}

export interface ColorPalette {
  name: string;
  colors: [string, string, string, string, string, string];
}

export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    name: 'Vibrant',
    colors: [
      '#E74C3C', // Bright Red
      '#3498DB', // Bright Blue  
      '#2ECC71', // Bright Green
      '#F39C12', // Bright Orange
      '#9B59B6', // Bright Purple
      '#FFFFFF', // White for better contrast
    ],
  },
  {
    name: 'Ocean',
    colors: [
      '#FF6B6B', // Coral Red
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Peach
      '#FFFFFF', // White for better contrast
    ],
  },
  {
    name: 'Sunset',
    colors: [
      '#FF5722', // Deep Orange
      '#FF9800', // Orange
      '#FFC107', // Amber
      '#8BC34A', // Light Green
      '#00BCD4', // Cyan
      '#FFFFFF', // White for better contrast
    ],
  },
];

export const CUBE_SIZE = 3;
export const TOTAL_CELLS = CUBE_SIZE ** 3;

export const indexToVec3 = (index: number): Vec3 => {
  const x = index % CUBE_SIZE;
  const y = Math.floor(index / CUBE_SIZE) % CUBE_SIZE;
  const z = Math.floor(index / (CUBE_SIZE * CUBE_SIZE));
  return [x as 0 | 1 | 2, y as 0 | 1 | 2, z as 0 | 1 | 2];
};

export const vec3ToIndex = (vec: Vec3): number => {
  return vec[0] + vec[1] * CUBE_SIZE + vec[2] * CUBE_SIZE * CUBE_SIZE;
};