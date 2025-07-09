import { useMemo } from 'react'
import { CubeMesh } from '../../../engine/CubeMesh'
import type { Block } from '../logic/types'
import type { CubeSize } from '../../../engine/types'

interface BlockRendererProps {
  blocks: Map<string, Block>
  colors: string[]
  selectedBlockId: string | null
  onBlockClick: (blockId: string) => void
  cubeSize: CubeSize
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks,
  colors,
  selectedBlockId,
  onBlockClick,
  cubeSize
}) => {
  // Convert blocks to array format for CubeMesh
  const { cells, blockIdMap } = useMemo(() => {
    const maxIndex = cubeSize ** 3
    const cells = new Array(maxIndex).fill(6) // 6 = empty/transparent
    const blockIdMap = new Map<number, string>()
    
    // Create position to index mapping
    const posToIndex = (x: number, y: number, z: number): number => {
      const halfSize = Math.floor(cubeSize / 2)
      const nx = x + halfSize
      const ny = y + halfSize
      const nz = z + halfSize
      
      if (nx < 0 || nx >= cubeSize || ny < 0 || ny >= cubeSize || nz < 0 || nz >= cubeSize) {
        return -1
      }
      
      return nx + ny * cubeSize + nz * cubeSize * cubeSize
    }
    
    blocks.forEach((block) => {
      const x = Math.round(block.position.x)
      const y = Math.round(block.position.y)
      const z = Math.round(block.position.z)
      const index = posToIndex(x, y, z)
      
      if (index >= 0 && index < maxIndex) {
        // Don't render exploding blocks with very low opacity
        if (block.isExploding && block.opacity < 0.1) {
          cells[index] = 6; // Empty
        } else {
          cells[index] = block.color
          blockIdMap.set(index, block.id)
        }
      }
    })
    
    return { cells, blockIdMap }
  }, [blocks, cubeSize])
  
  // Create highlight region for selected block
  const floodRegion = useMemo(() => {
    if (!selectedBlockId) return undefined
    
    const region = new Array(cubeSize ** 3).fill(false)
    const selectedBlock = blocks.get(selectedBlockId)
    
    if (selectedBlock) {
      const halfSize = Math.floor(cubeSize / 2)
      const x = Math.round(selectedBlock.position.x) + halfSize
      const y = Math.round(selectedBlock.position.y) + halfSize
      const z = Math.round(selectedBlock.position.z) + halfSize
      
      if (x >= 0 && x < cubeSize && y >= 0 && y < cubeSize && z >= 0 && z < cubeSize) {
        const index = x + y * cubeSize + z * cubeSize * cubeSize
        region[index] = true
      }
    }
    
    return region
  }, [selectedBlockId, blocks, cubeSize])
  
  const handleCellClick = (index: number) => {
    const blockId = blockIdMap.get(index)
    if (blockId) {
      onBlockClick(blockId)
    }
  }
  
  return (
    <CubeMesh
      cells={cells}
      colors={colors}
      floodRegion={floodRegion}
      spacing={1.1}
      onCellClick={handleCellClick}
      enableHover={true}
      cubeSize={cubeSize}
    />
  )
}