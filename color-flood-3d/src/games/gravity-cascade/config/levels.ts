import type { LevelConfig } from '../logic/types'

export const LEVELS: LevelConfig[] = [
  // Tutorial levels
  {
    id: 1,
    name: "Getting Started",
    cubeSize: 5,
    colorCount: 3,
    targetScore: 500,
    maxBlocks: 15,
    spawnRate: 0.5,
    spawnPattern: 'edge',
    gravity: 1.0
  },
  {
    id: 2,
    name: "Learning to Match",
    cubeSize: 5,
    colorCount: 3,
    targetScore: 1000,
    maxBlocks: 20,
    spawnRate: 0.7,
    spawnPattern: 'edge',
    gravity: 1.0
  },
  {
    id: 3,
    name: "Gravity Pulls",
    cubeSize: 5,
    colorCount: 4,
    targetScore: 1500,
    maxBlocks: 25,
    spawnRate: 0.8,
    spawnPattern: 'edge',
    gravity: 1.2
  },
  
  // Easy levels
  {
    id: 4,
    name: "Color Cascade",
    cubeSize: 6,
    colorCount: 4,
    targetScore: 2000,
    maxBlocks: 30,
    spawnRate: 1.0,
    spawnPattern: 'edge',
    gravity: 1.0
  },
  {
    id: 5,
    name: "Chain Reaction",
    cubeSize: 6,
    colorCount: 4,
    targetScore: 3000,
    maxBlocks: 35,
    spawnRate: 1.2,
    spawnPattern: 'edge',
    gravity: 1.0
  },
  {
    id: 6,
    name: "Orbital Dance",
    cubeSize: 6,
    colorCount: 5,
    targetScore: 4000,
    maxBlocks: 40,
    spawnRate: 1.3,
    spawnPattern: 'random',
    gravity: 1.1
  },
  
  // Medium levels
  {
    id: 7,
    name: "Cosmic Storm",
    cubeSize: 6,
    colorCount: 5,
    targetScore: 5000,
    maxBlocks: 45,
    spawnRate: 1.5,
    spawnPattern: 'edge',
    gravity: 1.2
  },
  {
    id: 8,
    name: "Nebula Burst",
    cubeSize: 6,
    colorCount: 5,
    targetScore: 7000,
    maxBlocks: 50,
    spawnRate: 1.7,
    spawnPattern: 'random',
    gravity: 1.3
  },
  {
    id: 9,
    name: "Star Collapse",
    cubeSize: 6,
    colorCount: 6,
    targetScore: 9000,
    maxBlocks: 55,
    spawnRate: 2.0,
    spawnPattern: 'corners',
    gravity: 1.4
  },
  {
    id: 10,
    name: "Gravity Well",
    cubeSize: 6,
    colorCount: 6,
    targetScore: 12000,
    maxBlocks: 60,
    spawnRate: 2.2,
    spawnPattern: 'edge',
    gravity: 1.5
  }
]

export const COLOR_PALETTE = {
  colors: [
    '#FF006E', // Neon Pink
    '#3A86FF', // Electric Blue
    '#8FE1A5', // Mint Green
    '#FFBE0B', // Solar Yellow
    '#C77DFF', // Cosmic Purple
    '#FB5607', // Nebula Orange
    '#000000', // Empty/transparent cells (index 6)
  ]
}