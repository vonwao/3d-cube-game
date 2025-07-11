import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '../gameStore'
import type { LevelConfig } from '../types'

describe('GameStore - Selection and Clicking', () => {
  const testLevel: LevelConfig = {
    id: 1,
    name: 'Test Level',
    cubeSize: 3,
    colorCount: 3,
    targetScore: 1000,
    spawnRate: 1,
    maxBlocks: 10,
    spawnPattern: 'random',
    gravity: 1
  }

  beforeEach(() => {
    // Reset the store before each test
    useGameStore.setState({
      blocks: new Map(),
      score: 0,
      combo: 0,
      level: 1,
      selectedBlockId: null,
      isAnimating: false,
      gameStatus: 'playing',
      currentLevel: null
    })
  })

  test('selectBlock should set selectedBlockId when no block is selected', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initLevel(testLevel)
    })

    // Get the first block ID
    const blockId = Array.from(result.current.blocks.keys())[0]
    
    act(() => {
      result.current.selectBlock(blockId)
    })

    expect(result.current.selectedBlockId).toBe(blockId)
  })

  test('selectBlock should deselect when same block is clicked', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initLevel(testLevel)
    })

    const blockId = Array.from(result.current.blocks.keys())[0]
    
    // Select block
    act(() => {
      result.current.selectBlock(blockId)
    })
    
    expect(result.current.selectedBlockId).toBe(blockId)
    
    // Click same block again
    act(() => {
      result.current.selectBlock(null)
    })
    
    expect(result.current.selectedBlockId).toBeNull()
  })

  test('selectBlock should auto-swap when block has only one neighbor', () => {
    const { result } = renderHook(() => useGameStore())
    
    // Create a custom level with specific block placement
    act(() => {
      result.current.initLevel(testLevel)
      // Clear existing blocks
      result.current.blocks.clear()
      
      // Add two blocks that are neighbors
      const block1 = {
        id: 'block1',
        position: { x: 0, y: 0, z: 0 },
        targetPosition: { x: 0, y: 0, z: 0 },
        color: 0,
        isFalling: false,
        isMatched: false,
        isExploding: false,
        opacity: 1
      }
      
      const block2 = {
        id: 'block2',
        position: { x: 1, y: 0, z: 0 },
        targetPosition: { x: 1, y: 0, z: 0 },
        color: 1,
        isFalling: false,
        isMatched: false,
        isExploding: false,
        opacity: 1
      }
      
      useGameStore.setState({
        blocks: new Map([
          ['block1', block1],
          ['block2', block2]
        ])
      })
    })
    
    // Click on block1 which has only one neighbor
    act(() => {
      result.current.selectBlock('block1')
    })
    
    // Check that blocks were swapped
    const block1After = result.current.blocks.get('block1')
    const block2After = result.current.blocks.get('block2')
    
    expect(block1After?.position.x).toBe(1) // block1 moved to block2's position
    expect(block2After?.position.x).toBe(0) // block2 moved to block1's position
    expect(result.current.selectedBlockId).toBeNull() // No selection after auto-swap
  })

  test('swapBlocks should swap two blocks when both are provided', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initLevel(testLevel)
      result.current.blocks.clear()
      
      const block1 = {
        id: 'block1',
        position: { x: 0, y: 0, z: 0 },
        targetPosition: { x: 0, y: 0, z: 0 },
        color: 0,
        isFalling: false,
        isMatched: false,
        isExploding: false,
        opacity: 1
      }
      
      const block2 = {
        id: 'block2',
        position: { x: 1, y: 0, z: 0 },
        targetPosition: { x: 1, y: 0, z: 0 },
        color: 1,
        isFalling: false,
        isMatched: false,
        isExploding: false,
        opacity: 1
      }
      
      useGameStore.setState({
        blocks: new Map([
          ['block1', block1],
          ['block2', block2]
        ])
      })
    })
    
    act(() => {
      result.current.swapBlocks('block1', 'block2')
    })
    
    const block1After = result.current.blocks.get('block1')
    const block2After = result.current.blocks.get('block2')
    
    expect(block1After?.position.x).toBe(1)
    expect(block2After?.position.x).toBe(0)
    expect(result.current.isAnimating).toBe(true)
  })

  test('blocks should not be selectable when game is not playing', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initLevel(testLevel)
      useGameStore.setState({ gameStatus: 'paused' })
    })
    
    const blockId = Array.from(result.current.blocks.keys())[0]
    
    act(() => {
      result.current.selectBlock(blockId)
    })
    
    expect(result.current.selectedBlockId).toBeNull()
  })
})