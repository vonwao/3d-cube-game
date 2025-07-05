import type { Level, ColorIndex } from '../logic/types';

export interface LevelTier {
  id: string;
  name: string;
  description: string;
  color: string;
  minStarsToUnlock: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Learn the basics of flood fill',
    color: '#4CAF50',
    minStarsToUnlock: 0,
  },
  {
    id: 'easy', 
    name: 'Easy',
    description: 'Simple patterns to get started',
    color: '#2196F3',
    minStarsToUnlock: 2,
  },
  {
    id: 'medium',
    name: 'Medium', 
    description: 'More complex challenges',
    color: '#FF9800',
    minStarsToUnlock: 8,
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Serious strategic thinking required',
    color: '#F44336',
    minStarsToUnlock: 18,
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Maximum difficulty puzzles',
    color: '#9C27B0',
    minStarsToUnlock: 30,
  },
];

export interface ExtendedLevel extends Level {
  tier: string;
  name: string;
  description: string;
}

export const SAMPLE_LEVELS: ExtendedLevel[] = [
  {
    id: 'tutorial-01',
    tier: 'tutorial',
    name: 'First Steps',
    description: 'Learn how flood fill works with a simple 2-color cube',
    cells: [
      // A simple 2-color cube to teach basics
      0, 0, 0,
      0, 0, 0,
      0, 0, 1,
      
      0, 0, 0,
      0, 0, 0,
      0, 1, 1,
      
      0, 0, 0,
      0, 0, 0,
      1, 1, 1,
    ] as ColorIndex[],
    maxMoves: 2,
  },
  {
    id: 'easy-01',
    tier: 'easy',
    name: 'Three Colors',
    description: 'Practice with a simple 3-color pattern',
    cells: [
      // Simple pattern with 3 colors
      0, 1, 1,
      0, 1, 1,
      0, 2, 2,
      
      0, 1, 1,
      0, 1, 2,
      0, 2, 2,
      
      0, 0, 1,
      0, 2, 2,
      0, 2, 2,
    ] as ColorIndex[],
    maxMoves: 4,
  },
  {
    id: 'easy-02',
    tier: 'easy',
    name: 'Cross Pattern',
    description: 'Navigate a symmetric cross formation',
    cells: [
      // Cross pattern
      1, 0, 1,
      0, 0, 0,
      1, 0, 1,
      
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
      
      1, 0, 1,
      0, 0, 0,
      1, 0, 1,
    ] as ColorIndex[],
    maxMoves: 3,
  },
  {
    id: 'medium-01',
    tier: 'medium',
    name: 'Layer Cake',
    description: 'Think in 3D layers to solve this puzzle',
    cells: [
      // Layer-based challenge
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
      
      1, 1, 1,
      1, 2, 1,
      1, 1, 1,
      
      2, 2, 2,
      2, 3, 2,
      2, 2, 2,
    ] as ColorIndex[],
    maxMoves: 5,
  },
  {
    id: 'medium-02',
    tier: 'medium',
    name: 'Diagonal Flow',
    description: 'Follow the diagonal pattern to victory',
    cells: [
      // Diagonal pattern
      0, 1, 2,
      1, 2, 3,
      2, 3, 0,
      
      1, 2, 3,
      2, 3, 0,
      3, 0, 1,
      
      2, 3, 0,
      3, 0, 1,
      0, 1, 2,
    ] as ColorIndex[],
    maxMoves: 6,
  },
  {
    id: 'medium-03',
    tier: 'medium',
    name: 'Corner Challenge',
    description: 'Navigate the corner connections carefully',
    cells: [
      // Corners challenge
      0, 1, 0,
      1, 2, 1,
      0, 1, 0,
      
      1, 2, 1,
      2, 3, 2,
      1, 2, 1,
      
      0, 1, 0,
      1, 2, 1,
      0, 1, 0,
    ] as ColorIndex[],
    maxMoves: 4,
  },
  {
    id: 'hard-01',
    tier: 'hard',
    name: 'Rainbow Stripes',
    description: 'Six colors create a complex multicolor challenge',
    cells: [
      // Complex multicolor
      0, 1, 2,
      3, 4, 5,
      0, 1, 2,
      
      3, 4, 5,
      0, 1, 2,
      3, 4, 5,
      
      0, 1, 2,
      3, 4, 5,
      0, 1, 2,
    ] as ColorIndex[],
    maxMoves: 8,
  },
  {
    id: 'hard-02',
    tier: 'hard',
    name: 'Color Spiral',
    description: 'Follow the spiraling colors through 3D space',
    cells: [
      // Spiral pattern
      0, 0, 0,
      0, 1, 1,
      0, 1, 2,
      
      0, 1, 2,
      1, 2, 3,
      2, 3, 4,
      
      2, 3, 4,
      3, 4, 5,
      4, 5, 5,
    ] as ColorIndex[],
    maxMoves: 9,
  },
  {
    id: 'expert-01',
    tier: 'expert',
    name: 'Checkerboard',
    description: 'The ultimate 3D checkerboard puzzle',
    cells: [
      // Checkerboard challenge
      0, 1, 0,
      1, 0, 1,
      0, 1, 0,
      
      1, 0, 1,
      0, 1, 0,
      1, 0, 1,
      
      0, 1, 0,
      1, 0, 1,
      0, 1, 0,
    ] as ColorIndex[],
    maxMoves: 6,
  },
  {
    id: 'expert-02',
    tier: 'expert',
    name: 'Chaos Cube',
    description: 'Maximum complexity - only for true masters',
    cells: [
      // Maximum complexity
      0, 1, 2,
      3, 4, 5,
      2, 1, 0,
      
      5, 0, 3,
      2, 1, 4,
      1, 5, 3,
      
      4, 3, 1,
      0, 2, 5,
      3, 4, 0,
    ] as ColorIndex[],
    maxMoves: 12,
  },
];

export const getLevelById = (id: string): ExtendedLevel | null => {
  return SAMPLE_LEVELS.find(level => level.id === id) || null;
};

export const getRandomLevel = (): ExtendedLevel => {
  const randomIndex = Math.floor(Math.random() * SAMPLE_LEVELS.length);
  return SAMPLE_LEVELS[randomIndex];
};

export const getLevelsByTier = (tier: string): ExtendedLevel[] => {
  return SAMPLE_LEVELS.filter(level => level.tier === tier);
};

export const getUnlockedLevels = (totalStars: number): ExtendedLevel[] => {
  return SAMPLE_LEVELS.filter(level => {
    const tier = LEVEL_TIERS.find(t => t.id === level.tier);
    return tier ? totalStars >= tier.minStarsToUnlock : false;
  });
};

export const getUnlockedTiers = (totalStars: number): LevelTier[] => {
  return LEVEL_TIERS.filter(tier => totalStars >= tier.minStarsToUnlock);
};

export const getStarsForLevel = (level: ExtendedLevel, moves: number): number => {
  if (moves > level.maxMoves) return 0;
  
  // Star rating based on efficiency
  const efficiency = moves / level.maxMoves;
  if (efficiency <= 0.6) return 3; // Perfect efficiency
  if (efficiency <= 0.8) return 2; // Good efficiency  
  return 1; // Completed within limit
};

export const calculateTotalStars = (levelProgress: Record<string, number>): number => {
  return Object.values(levelProgress).reduce((sum, stars) => sum + stars, 0);
};