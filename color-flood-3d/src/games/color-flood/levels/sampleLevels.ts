import type { Level, ColorIndex } from '../logic/types';

export const SAMPLE_LEVELS: Level[] = [
  {
    id: 'tutorial-01',
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

export const getLevelById = (id: string): Level | null => {
  return SAMPLE_LEVELS.find(level => level.id === id) || null;
};

export const getRandomLevel = (): Level => {
  const randomIndex = Math.floor(Math.random() * SAMPLE_LEVELS.length);
  return SAMPLE_LEVELS[randomIndex];
};