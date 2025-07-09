import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
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

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
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
      set((state) => {
        state.blocks.clear()
        state.score = 0
        state.combo = 0
        state.level = config.id
        state.selectedBlockId = null
        state.isAnimating = false
        state.gameStatus = 'playing'
        state.currentLevel = config
        
        // Spawn initial center block
        const centerBlock = generateBlock(
          { x: 0, y: 0, z: 0 },
          Math.floor(Math.random() * config.colorCount),
          config.cubeSize
        )
        state.blocks.set(centerBlock.id, centerBlock)
      })
    },

    selectBlock: (blockId: string | null) => {
      set((state) => {
        if (state.isAnimating || state.gameStatus !== 'playing') return
        state.selectedBlockId = blockId
      })
    },

    swapBlocks: (blockId1: string, blockId2: string) => {
      set((state) => {
        if (state.isAnimating || state.gameStatus !== 'playing') return
        
        const block1 = state.blocks.get(blockId1)
        const block2 = state.blocks.get(blockId2)
        
        if (!block1 || !block2) return
        if (block1.isFalling || block2.isFalling) return
        
        // Check if blocks are adjacent
        const dx = Math.abs(block1.position.x - block2.position.x)
        const dy = Math.abs(block1.position.y - block2.position.y)
        const dz = Math.abs(block1.position.z - block2.position.z)
        const distance = dx + dy + dz
        
        if (distance !== 1) return
        
        // Swap positions
        const tempPos = { ...block1.position }
        block1.position = { ...block2.position }
        block2.position = tempPos
        
        // Update target positions
        block1.targetPosition = { ...block1.position }
        block2.targetPosition = { ...block2.position }
        
        state.selectedBlockId = null
        state.isAnimating = true
        
        // Check for matches after swap animation
        setTimeout(() => {
          get().processMatches()
        }, 300)
      })
    },

    spawnBlocks: (count: number) => {
      set((state) => {
        if (!state.currentLevel) return
        
        for (let i = 0; i < count; i++) {
          const block = generateBlock(
            null, // Random spawn position
            Math.floor(Math.random() * state.currentLevel.colorCount),
            state.currentLevel.cubeSize
          )
          
          // Check if position is occupied
          let occupied = false
          state.blocks.forEach((b: Block) => {
            if (b.position.x === block.position.x &&
                b.position.y === block.position.y &&
                b.position.z === block.position.z) {
              occupied = true
            }
          })
          
          if (!occupied && state.blocks.size < state.currentLevel.maxBlocks) {
            state.blocks.set(block.id, block)
          }
        }
      })
    },

    updatePhysics: () => {
      set((state) => {
        if (!state.currentLevel) return
        
        let anyBlockFalling = false
        
        state.blocks.forEach((block: Block) => {
          if (block.isExploding) {
            block.opacity -= 0.1
            if (block.opacity <= 0) {
              state.blocks.delete(block.id)
            }
            return
          }
          
          const gravityResult = applyGravity(
            block,
            state.blocks,
            state.currentLevel!.cubeSize
          )
          
          if (gravityResult.isFalling) {
            block.targetPosition = gravityResult.targetPosition
            block.isFalling = true
            anyBlockFalling = true
          } else {
            block.isFalling = false
          }
          
          // Interpolate position
          const speed = 0.15
          block.position.x += (block.targetPosition.x - block.position.x) * speed
          block.position.y += (block.targetPosition.y - block.position.y) * speed
          block.position.z += (block.targetPosition.z - block.position.z) * speed
        })
        
        const blocksArray: Block[] = Array.from(state.blocks.values())
        state.isAnimating = anyBlockFalling || blocksArray.some(b => b.isExploding)
        
        // Process matches when animation stops
        if (!state.isAnimating && !anyBlockFalling) {
          setTimeout(() => {
            get().processMatches()
          }, 100)
        }
      })
    },

    processMatches: () => {
      set((state) => {
        if (!state.currentLevel) return
        
        const matches = findMatches(state.blocks)
        
        if (matches.length > 0) {
          let totalScore = 0
          state.combo += 1
          
          matches.forEach((match) => {
            const matchScore = match.score * state.combo
            totalScore += matchScore
            
            match.blockIds.forEach((blockId) => {
              const block = state.blocks.get(blockId)
              if (block) {
                block.isExploding = true
                block.isMatched = true
              }
            })
          })
          
          state.score += totalScore
          state.isAnimating = true
          
          // Check win condition
          if (state.score >= state.currentLevel.targetScore) {
            state.gameStatus = 'won'
          }
        } else {
          state.combo = 0
        }
      })
    },

    pauseGame: () => {
      set((state) => {
        if (state.gameStatus === 'playing') {
          state.gameStatus = 'paused'
        }
      })
    },

    resumeGame: () => {
      set((state) => {
        if (state.gameStatus === 'paused') {
          state.gameStatus = 'playing'
        }
      })
    },
  }))
)

// Selectors
export const useBlocks = () => useGameStore((state) => state.blocks)
export const useScore = () => useGameStore((state) => state.score)
export const useCombo = () => useGameStore((state) => state.combo)
export const useSelectedBlockId = () => useGameStore((state) => state.selectedBlockId)
export const useGameStatus = () => useGameStore((state) => state.gameStatus)
export const useIsAnimating = () => useGameStore((state) => state.isAnimating)
export const useCurrentLevel = () => useGameStore((state) => state.currentLevel)