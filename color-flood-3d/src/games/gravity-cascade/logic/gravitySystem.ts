import type { Block } from './types'
import type { CubePosition } from '../../../engine/types'

interface GravityResult {
  isFalling: boolean
  targetPosition: CubePosition
}

export function applyGravity(
  block: Block,
  allBlocks: Map<string, Block>,
  cubeSize: number
): GravityResult {
  // Calculate direction towards center (0,0,0)
  const currentPos = block.position
  const centerDirection = normalizeToCenter(currentPos)
  
  // Calculate next position one step towards center
  const nextPos: CubePosition = {
    x: currentPos.x + centerDirection.x,
    y: currentPos.y + centerDirection.y,
    z: currentPos.z + centerDirection.z
  }
  
  // Check if we're already at center
  if (isAtCenter(currentPos)) {
    return {
      isFalling: false,
      targetPosition: currentPos
    }
  }
  
  // Check if next position is occupied or would be out of bounds
  if (isPositionOccupied(nextPos, allBlocks, block.id) || !isInBounds(nextPos, cubeSize)) {
    return {
      isFalling: false,
      targetPosition: currentPos
    }
  }
  
  // Block can fall
  return {
    isFalling: true,
    targetPosition: nextPos
  }
}

function normalizeToCenter(position: CubePosition): CubePosition {
  // Calculate the direction vector towards center
  const dx = -Math.sign(position.x)
  const dy = -Math.sign(position.y)
  const dz = -Math.sign(position.z)
  
  // For diagonal movement, we need to choose which axis to move along
  // Priority: move along the axis with the greatest distance from center
  const distances = [
    { axis: 'x', dist: Math.abs(position.x), dir: dx },
    { axis: 'y', dist: Math.abs(position.y), dir: dy },
    { axis: 'z', dist: Math.abs(position.z), dir: dz }
  ]
  
  // Sort by distance (descending)
  distances.sort((a, b) => b.dist - a.dist)
  
  // Move along the axis with greatest distance
  const result = { x: 0, y: 0, z: 0 }
  if (distances[0].dist > 0) {
    result[distances[0].axis as keyof CubePosition] = distances[0].dir
  }
  
  return result
}

function isAtCenter(position: CubePosition): boolean {
  return position.x === 0 && position.y === 0 && position.z === 0
}

function isPositionOccupied(
  position: CubePosition,
  blocks: Map<string, Block>,
  excludeBlockId?: string
): boolean {
  for (const [id, block] of blocks.entries()) {
    if (id === excludeBlockId) continue
    
    const blockPos = block.targetPosition
    if (
      Math.round(blockPos.x) === Math.round(position.x) &&
      Math.round(blockPos.y) === Math.round(position.y) &&
      Math.round(blockPos.z) === Math.round(position.z)
    ) {
      return true
    }
  }
  return false
}

function isInBounds(position: CubePosition, cubeSize: number): boolean {
  const halfSize = Math.floor(cubeSize / 2)
  return (
    position.x >= -halfSize && position.x <= halfSize &&
    position.y >= -halfSize && position.y <= halfSize &&
    position.z >= -halfSize && position.z <= halfSize
  )
}

export function getGravityDirection(position: CubePosition): CubePosition {
  // Returns a normalized vector pointing towards center
  const length = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2)
  
  if (length === 0) return { x: 0, y: 0, z: 0 }
  
  return {
    x: -position.x / length,
    y: -position.y / length,
    z: -position.z / length
  }
}