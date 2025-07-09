import type { CubePosition } from '../../../engine/types'

export type ColorIndex = number

export interface Block {
  id: string
  position: CubePosition
  targetPosition: CubePosition
  color: ColorIndex
  isFalling: boolean
  isMatched: boolean
  isExploding: boolean
  opacity: number
}

export interface GameState {
  blocks: Map<string, Block>
  score: number
  combo: number
  level: number
  selectedBlockId: string | null
  isAnimating: boolean
  gameStatus: 'playing' | 'won' | 'lost' | 'paused'
}

export interface LevelConfig {
  id: number
  name: string
  cubeSize: number
  colorCount: number
  targetScore: number
  maxBlocks: number
  spawnRate: number
  spawnPattern: 'edge' | 'random' | 'corners'
  gravity: number
}

export interface ColorPalette {
  colors: string[]
}

export interface Match {
  blockIds: string[]
  type: 'line' | 'cross' | 'cube'
  score: number
}

export interface SpawnZone {
  layer: 'edge' | 'mid' | 'inner'
  probability: number
}