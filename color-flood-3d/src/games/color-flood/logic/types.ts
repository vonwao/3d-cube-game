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
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Orange
      '#98D8C8', // Green
      '#F7DC6F', // Yellow
    ],
  },
  {
    name: 'Neon',
    colors: [
      '#FF073A', // Electric Red
      '#39FF14', // Electric Green
      '#0080FF', // Electric Blue
      '#FF5F00', // Electric Orange
      '#FF00FF', // Electric Magenta
      '#FFFF00', // Electric Yellow
    ],
  },
  {
    name: 'Pastel',
    colors: [
      '#FFB3BA', // Pastel Pink
      '#BAFFC9', // Pastel Green
      '#BAE1FF', // Pastel Blue
      '#FFFFBA', // Pastel Yellow
      '#FFDFBA', // Pastel Orange
      '#E0BBE4', // Pastel Purple
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