import type { Block, SpawnZone } from './types'
import type { CubePosition } from '../../../engine/types'

const SPAWN_ZONES: SpawnZone[] = [
  { layer: 'edge', probability: 0.8 },
  { layer: 'mid', probability: 0.15 },
  { layer: 'inner', probability: 0.05 }
]

export function generateBlock(
  position: CubePosition | null,
  color: number,
  cubeSize: number
): Block {
  const id = `block-${Date.now()}-${Math.random()}`
  
  // If no position provided, generate random spawn position
  const pos = position || generateSpawnPosition(cubeSize)
  
  return {
    id,
    position: { ...pos },
    targetPosition: { ...pos },
    color,
    isFalling: false,
    isMatched: false,
    isExploding: false,
    opacity: 1.0
  }
}

function generateSpawnPosition(cubeSize: number): CubePosition {
  const layer = selectSpawnLayer()
  const halfSize = Math.floor(cubeSize / 2)
  
  let x: number, y: number, z: number
  
  switch (layer) {
    case 'edge':
      // Spawn on the outer edges of the cube
      const face = Math.floor(Math.random() * 6)
      switch (face) {
        case 0: // Top
          x = Math.floor(Math.random() * cubeSize) - halfSize
          y = halfSize
          z = Math.floor(Math.random() * cubeSize) - halfSize
          break
        case 1: // Bottom
          x = Math.floor(Math.random() * cubeSize) - halfSize
          y = -halfSize
          z = Math.floor(Math.random() * cubeSize) - halfSize
          break
        case 2: // Front
          x = Math.floor(Math.random() * cubeSize) - halfSize
          y = Math.floor(Math.random() * cubeSize) - halfSize
          z = halfSize
          break
        case 3: // Back
          x = Math.floor(Math.random() * cubeSize) - halfSize
          y = Math.floor(Math.random() * cubeSize) - halfSize
          z = -halfSize
          break
        case 4: // Right
          x = halfSize
          y = Math.floor(Math.random() * cubeSize) - halfSize
          z = Math.floor(Math.random() * cubeSize) - halfSize
          break
        case 5: // Left
          x = -halfSize
          y = Math.floor(Math.random() * cubeSize) - halfSize
          z = Math.floor(Math.random() * cubeSize) - halfSize
          break
        default:
          x = y = z = 0
      }
      break
      
    case 'mid':
      // Spawn in the middle layer (1 block from edge)
      const midLayer = halfSize - 1
      x = Math.floor(Math.random() * (cubeSize - 2)) - midLayer
      y = Math.floor(Math.random() * (cubeSize - 2)) - midLayer
      z = Math.floor(Math.random() * (cubeSize - 2)) - midLayer
      
      // Ensure at least one coordinate is at the mid layer
      const coord = Math.floor(Math.random() * 3)
      if (coord === 0) x = Math.random() > 0.5 ? midLayer : -midLayer
      else if (coord === 1) y = Math.random() > 0.5 ? midLayer : -midLayer
      else z = Math.random() > 0.5 ? midLayer : -midLayer
      break
      
    case 'inner':
      // Spawn closer to center
      const innerRange = Math.max(1, halfSize - 2)
      x = Math.floor(Math.random() * (innerRange * 2 + 1)) - innerRange
      y = Math.floor(Math.random() * (innerRange * 2 + 1)) - innerRange
      z = Math.floor(Math.random() * (innerRange * 2 + 1)) - innerRange
      break
      
    default:
      x = y = z = 0
  }
  
  return { x, y, z }
}

function selectSpawnLayer(): 'edge' | 'mid' | 'inner' {
  const random = Math.random()
  let cumulative = 0
  
  for (const zone of SPAWN_ZONES) {
    cumulative += zone.probability
    if (random <= cumulative) {
      return zone.layer
    }
  }
  
  return 'edge'
}

export function isPositionOccupied(
  position: CubePosition,
  blocks: Map<string, Block>
): boolean {
  for (const block of blocks.values()) {
    if (
      Math.round(block.position.x) === position.x &&
      Math.round(block.position.y) === position.y &&
      Math.round(block.position.z) === position.z
    ) {
      return true
    }
  }
  return false
}