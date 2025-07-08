import type { ColorIndex } from '../../color-flood/logic/types'
import type { Vec3 } from '../../../engine/types'
import { vec3ToIndex } from './automata'

export function createOscillatorPattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  const center = Math.floor(cubeSize / 2)
  
  // Create a 3D blinker/oscillator pattern
  const patterns: Array<{ pos: Vec3; color: ColorIndex }> = [
    // Horizontal bar (will oscillate to vertical)
    { pos: [center - 1, center, center], color: 0 },
    { pos: [center, center, center], color: 0 },
    { pos: [center + 1, center, center], color: 0 },
    
    // Another oscillator offset in space
    { pos: [center, center - 1, center - 2], color: 1 },
    { pos: [center, center, center - 2], color: 1 },
    { pos: [center, center + 1, center - 2], color: 1 },
    
    // 3D cross pattern
    { pos: [1, 1, center], color: 2 },
    { pos: [2, 1, center], color: 2 },
    { pos: [1, 2, center], color: 2 },
    { pos: [1, 1, center + 1], color: 2 },
  ]
  
  for (const { pos, color } of patterns) {
    if (pos[0] >= 0 && pos[0] < cubeSize &&
        pos[1] >= 0 && pos[1] < cubeSize &&
        pos[2] >= 0 && pos[2] < cubeSize) {
      const index = vec3ToIndex(pos, cubeSize)
      cells[index] = color
    }
  }
  
  return cells
}

export function createStillLifePattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Create stable "still life" patterns that shouldn't change
  const patterns: Array<{ pos: Vec3; color: ColorIndex }> = []
  
  // Create 3D "blocks" - stable 2x2x2 configurations
  const blockPositions = [
    { x: 1, y: 1, z: 1, color: 0 },
    { x: cubeSize - 3, y: 1, z: 1, color: 1 },
    { x: 1, y: cubeSize - 3, z: 1, color: 2 },
    { x: 1, y: 1, z: cubeSize - 3, color: 3 },
  ]
  
  for (const block of blockPositions) {
    if (block.color > 5) continue // Skip if color index too high
    
    // Create a 2x2x2 block
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        for (let dz = 0; dz < 2; dz++) {
          patterns.push({
            pos: [block.x + dx, block.y + dy, block.z + dz] as Vec3,
            color: block.color as ColorIndex
          })
        }
      }
    }
  }
  
  for (const { pos, color } of patterns) {
    if (pos[0] >= 0 && pos[0] < cubeSize &&
        pos[1] >= 0 && pos[1] < cubeSize &&
        pos[2] >= 0 && pos[2] < cubeSize) {
      const index = vec3ToIndex(pos, cubeSize)
      cells[index] = color
    }
  }
  
  return cells
}