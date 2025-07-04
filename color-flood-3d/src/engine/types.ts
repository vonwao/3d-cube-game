export type Vec3 = [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2];

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