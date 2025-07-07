export type Coord = number; // 0 to cubeSize-1
export type Vec3 = [Coord, Coord, Coord];
export type CubeSize = 3 | 4 | 5 | 6;

export interface CubeConfig {
  size: number;
  spacing: number;
  colors: string[];
}

export interface CubePosition {
  x: number;
  y: number;
  z: number;
}

export interface CubeRotation {
  x: number;
  y: number;
  z: number;
}