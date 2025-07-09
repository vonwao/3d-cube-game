import { create } from 'zustand'
import type { Block, GameState, LevelConfig } from './types'
import { generateBlock } from './blockGenerator'
import { findMatches } from './matchDetector'
import { applyGravity } from './gravitySystem'

interface GameStore extends GameState {
  // Actions
  initLevel: (config: LevelConfig) => void
  selectBlock: (blockId: string | null) => void
  swapBlocks: (blockId1: string, blockId2: string) => void
  spawnBlocks: (count: number) => void
  updatePhysics: () => void
  processMatches: () => void
  pauseGame: () => void
  resumeGame: () => void
  
  // Level config
  currentLevel: LevelConfig | null
}

export const useGameStore = create<GameStore>()((set, get) => ({
  // Initial state
  blocks: new Map(),
  score: 0,
  combo: 0,
  level: 1,
  selectedBlockId: null,
  isAnimating: false,
  gameStatus: 'playing',
  currentLevel: null,

  initLevel: (config: LevelConfig) => {
    set(() => {
      const newBlocks = new Map<string, Block>()
      
      // Spawn initial center block
      const centerBlock = generateBlock(
        { x: 0, y: 0, z: 0 },
        Math.floor(Math.random() * config.colorCount),
        config.cubeSize
      )
      newBlocks.set(centerBlock.id, centerBlock)
      
      return {
        blocks: newBlocks,
        score: 0,
        combo: 0,
        level: config.id,
        selectedBlockId: null,
        isAnimating: false,
        gameStatus: 'playing',
        currentLevel: config
      }
    })
  },

  selectBlock: (blockId: string | null) => {
    set((state) => {
      if (state.isAnimating || state.gameStatus !== 'playing') return state
      return { selectedBlockId: blockId }
    })
  },

  swapBlocks: (blockId1: string, blockId2: string) => {
    set((state) => {
      if (state.isAnimating || state.gameStatus !== 'playing') return state
      
      const block1 = state.blocks.get(blockId1)
      const block2 = state.blocks.get(blockId2)
      
      if (!block1 || !block2) return state
      if (block1.isFalling || block2.isFalling) return state
      
      // Check if blocks are adjacent
      const dx = Math.abs(block1.position.x - block2.position.x)
      const dy = Math.abs(block1.position.y - block2.position.y)
      const dz = Math.abs(block1.position.z - block2.position.z)
      const distance = dx + dy + dz
      
      if (distance !== 1) return state
      
      // Create new blocks map with swapped positions
      const newBlocks = new Map(state.blocks)
      const newBlock1 = { ...block1, position: { ...block2.position }, targetPosition: { ...block2.position } }
      const newBlock2 = { ...block2, position: { ...block1.position }, targetPosition: { ...block1.position } }
      
      newBlocks.set(blockId1, newBlock1)
      newBlocks.set(blockId2, newBlock2)
      
      // Check for matches after swap animation
      setTimeout(() => {
        get().processMatches()
      }, 300)
      
      return {
        blocks: newBlocks,
        selectedBlockId: null,
        isAnimating: true
      }
    })
  },

  spawnBlocks: (count: number) => {
    set((state) => {
      if (!state.currentLevel) return state
      
      const newBlocks = new Map(state.blocks)
      
      for (let i = 0; i < count; i++) {
        const block = generateBlock(
          null, // Random spawn position
          Math.floor(Math.random() * state.currentLevel.colorCount),
          state.currentLevel.cubeSize
        )
        
        // Check if position is occupied
        let occupied = false
        newBlocks.forEach((b: Block) => {
          if (b.position.x === block.position.x &&
              b.position.y === block.position.y &&
              b.position.z === block.position.z) {
            occupied = true
          }
        })
        
        if (!occupied && newBlocks.size < state.currentLevel.maxBlocks) {
          newBlocks.set(block.id, block)
        }
      }
      
      return { blocks: newBlocks }
    })
  },

  updatePhysics: () => {
    set((state) => {
      if (!state.currentLevel) return state
      
      let anyBlockFalling = false
      const newBlocks = new Map<string, Block>()
      const blocksToDelete = new Set<string>()
      
      state.blocks.forEach((block: Block) => {
        if (block.isExploding) {
          const newOpacity = block.opacity - 0.1
          if (newOpacity <= 0) {
            blocksToDelete.add(block.id)
          } else {
            newBlocks.set(block.id, { ...block, opacity: newOpacity })
          }
          return
        }
        
        const gravityResult = applyGravity(
          block,
          state.blocks,
          state.currentLevel!.cubeSize
        )
        
        let newBlock = { ...block }
        
        if (gravityResult.isFalling) {
          newBlock.targetPosition = gravityResult.targetPosition
          newBlock.isFalling = true
          anyBlockFalling = true
        } else {
          newBlock.isFalling = false
        }
        
        // Interpolate position
        const speed = 0.15
        newBlock.position = {
          x: block.position.x + (block.targetPosition.x - block.position.x) * speed,
          y: block.position.y + (block.targetPosition.y - block.position.y) * speed,
          z: block.position.z + (block.targetPosition.z - block.position.z) * speed
        }
        
        newBlocks.set(block.id, newBlock)
      })
      
      // Remove deleted blocks
      blocksToDelete.forEach(id => newBlocks.delete(id))
      
      const blocksArray: Block[] = Array.from(newBlocks.values())
      const newIsAnimating = anyBlockFalling || blocksArray.some(b => b.isExploding)
      
      // Process matches when animation stops
      if (!newIsAnimating && !anyBlockFalling && state.isAnimating) {
        setTimeout(() => {
          get().processMatches()
        }, 100)
      }
      
      return {
        blocks: newBlocks,
        isAnimating: newIsAnimating
      }
    })
  },

  processMatches: () => {
    set((state) => {
      if (!state.currentLevel) return state
      
      const matches = findMatches(state.blocks)
      
      if (matches.length > 0) {
        let totalScore = 0
        const newCombo = state.combo + 1
        const newBlocks = new Map(state.blocks)
        
        matches.forEach((match) => {
          const matchScore = match.score * newCombo
          totalScore += matchScore
          
          match.blockIds.forEach((blockId) => {
            const block = newBlocks.get(blockId)
            if (block) {
              newBlocks.set(blockId, {
                ...block,
                isExploding: true,
                isMatched: true
              })
            }
          })
        })
        
        const newScore = state.score + totalScore
        
        return {
          blocks: newBlocks,
          score: newScore,
          combo: newCombo,
          isAnimating: true,
          gameStatus: newScore >= state.currentLevel.targetScore ? 'won' : state.gameStatus
        }
      } else {
        return { combo: 0 }
      }
    })
  },

  pauseGame: () => {
    set((state) => {
      if (state.gameStatus === 'playing') {
        return { gameStatus: 'paused' }
      }
      return state
    })
  },

  resumeGame: () => {
    set((state) => {
      if (state.gameStatus === 'paused') {
        return { gameStatus: 'playing' }
      }
      return state
    })
  },
}))

// Selectors
export const useBlocks = () => useGameStore((state) => state.blocks)
export const useScore = () => useGameStore((state) => state.score)
export const useCombo = () => useGameStore((state) => state.combo)
export const useSelectedBlockId = () => useGameStore((state) => state.selectedBlockId)
export const useGameStatus = () => useGameStore((state) => state.gameStatus)
export const useIsAnimating = () => useGameStore((state) => state.isAnimating)
export const useCurrentLevel = () => useGameStore((state) => state.currentLevel)