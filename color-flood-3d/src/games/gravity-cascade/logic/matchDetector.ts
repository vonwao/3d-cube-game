import type { Block, Match } from './types'
import type { CubePosition } from '../../../engine/types'

export function findMatches(
  blocks: Map<string, Block>
): Match[] {
  const matches: Match[] = []
  const processedBlocks = new Set<string>()
  
  // Convert blocks map to position lookup for efficiency
  const blockGrid = createBlockGrid(blocks)
  
  blocks.forEach((block) => {
    if (processedBlocks.has(block.id) || block.isExploding) return
    
    // Check for line matches in all 6 directions
    const lineMatches = findLineMatches(block, blockGrid)
    
    lineMatches.forEach((match) => {
      if (match.blockIds.length >= 3) {
        matches.push(match)
        match.blockIds.forEach(id => processedBlocks.add(id))
      }
    })
  })
  
  // Check for special patterns (cross, cube)
  const specialMatches = findSpecialMatches(blocks, blockGrid, processedBlocks)
  matches.push(...specialMatches)
  
  return matches
}

function createBlockGrid(blocks: Map<string, Block>): Map<string, Block> {
  const grid = new Map<string, Block>()
  
  blocks.forEach((block) => {
    const key = positionKey(block.position)
    grid.set(key, block)
  })
  
  return grid
}

function positionKey(pos: CubePosition): string {
  return `${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`
}

function findLineMatches(
  startBlock: Block,
  blockGrid: Map<string, Block>
): Match[] {
  const matches: Match[] = []
  const directions: CubePosition[] = [
    { x: 1, y: 0, z: 0 },  // X axis
    { x: 0, y: 1, z: 0 },  // Y axis
    { x: 0, y: 0, z: 1 },  // Z axis
  ]
  
  directions.forEach((dir) => {
    const lineBlocks: Block[] = [startBlock]
    
    // Check positive direction
    let pos = { ...startBlock.position }
    while (true) {
      pos.x += dir.x
      pos.y += dir.y
      pos.z += dir.z
      
      const block = blockGrid.get(positionKey(pos))
      if (!block || block.color !== startBlock.color || block.isExploding) break
      
      lineBlocks.push(block)
    }
    
    // Check negative direction
    pos = { ...startBlock.position }
    while (true) {
      pos.x -= dir.x
      pos.y -= dir.y
      pos.z -= dir.z
      
      const block = blockGrid.get(positionKey(pos))
      if (!block || block.color !== startBlock.color || block.isExploding) break
      
      lineBlocks.unshift(block)
    }
    
    if (lineBlocks.length >= 3) {
      matches.push({
        blockIds: lineBlocks.map(b => b.id),
        type: 'line',
        score: calculateLineScore(lineBlocks.length)
      })
    }
  })
  
  return matches
}

function findSpecialMatches(
  blocks: Map<string, Block>,
  blockGrid: Map<string, Block>,
  processedBlocks: Set<string>
): Match[] {
  const matches: Match[] = []
  
  // Check for cross patterns (T or L shapes)
  blocks.forEach((centerBlock) => {
    if (processedBlocks.has(centerBlock.id) || centerBlock.isExploding) return
    
    const cross = findCrossPattern(centerBlock, blockGrid)
    if (cross && cross.blockIds.length >= 5) {
      matches.push(cross)
      cross.blockIds.forEach(id => processedBlocks.add(id))
    }
  })
  
  // Check for cube patterns (2x2x2)
  blocks.forEach((cornerBlock) => {
    if (processedBlocks.has(cornerBlock.id) || cornerBlock.isExploding) return
    
    const cube = findCubePattern(cornerBlock, blockGrid)
    if (cube && cube.blockIds.length === 8) {
      matches.push(cube)
      cube.blockIds.forEach(id => processedBlocks.add(id))
    }
  })
  
  return matches
}

function findCrossPattern(
  centerBlock: Block,
  blockGrid: Map<string, Block>
): Match | null {
  const color = centerBlock.color
  const blocks: Block[] = [centerBlock]
  const pos = centerBlock.position
  
  // Check all 6 adjacent positions
  const adjacentPositions: CubePosition[] = [
    { x: pos.x + 1, y: pos.y, z: pos.z },
    { x: pos.x - 1, y: pos.y, z: pos.z },
    { x: pos.x, y: pos.y + 1, z: pos.z },
    { x: pos.x, y: pos.y - 1, z: pos.z },
    { x: pos.x, y: pos.y, z: pos.z + 1 },
    { x: pos.x, y: pos.y, z: pos.z - 1 },
  ]
  
  let adjacentCount = 0
  adjacentPositions.forEach((adjPos) => {
    const block = blockGrid.get(positionKey(adjPos))
    if (block && block.color === color && !block.isExploding) {
      blocks.push(block)
      adjacentCount++
    }
  })
  
  // Need at least 3 adjacent blocks of same color to form a cross
  if (adjacentCount >= 3) {
    return {
      blockIds: blocks.map(b => b.id),
      type: 'cross',
      score: 500 + adjacentCount * 100
    }
  }
  
  return null
}

function findCubePattern(
  cornerBlock: Block,
  blockGrid: Map<string, Block>
): Match | null {
  const color = cornerBlock.color
  const blocks: Block[] = [cornerBlock]
  const pos = cornerBlock.position
  
  // Check all 7 positions to form a 2x2x2 cube
  const cubePositions: CubePosition[] = [
    { x: pos.x + 1, y: pos.y, z: pos.z },
    { x: pos.x, y: pos.y + 1, z: pos.z },
    { x: pos.x, y: pos.y, z: pos.z + 1 },
    { x: pos.x + 1, y: pos.y + 1, z: pos.z },
    { x: pos.x + 1, y: pos.y, z: pos.z + 1 },
    { x: pos.x, y: pos.y + 1, z: pos.z + 1 },
    { x: pos.x + 1, y: pos.y + 1, z: pos.z + 1 },
  ]
  
  let validCount = 0
  cubePositions.forEach((cubePos) => {
    const block = blockGrid.get(positionKey(cubePos))
    if (block && block.color === color && !block.isExploding) {
      blocks.push(block)
      validCount++
    }
  })
  
  // Need all 8 blocks to form a complete cube
  if (validCount === 7) {
    return {
      blockIds: blocks.map(b => b.id),
      type: 'cube',
      score: 2000
    }
  }
  
  return null
}

function calculateLineScore(length: number): number {
  switch (length) {
    case 3: return 100
    case 4: return 200
    case 5: return 400
    default: return 800 + (length - 6) * 200
  }
}