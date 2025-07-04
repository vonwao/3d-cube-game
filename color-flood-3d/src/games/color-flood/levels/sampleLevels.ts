import type { Level, ColorIndex } from '../logic/types';

export const SAMPLE_LEVELS: Level[] = [
  {
    id: 'level-01',
    cells: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
      
      1, 0, 1,
      0, 0, 0,
      1, 0, 1,
      
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
    ] as ColorIndex[],
    maxMoves: 3,
  },
  {
    id: 'level-02',
    cells: [
      0, 0, 1,
      0, 1, 1,
      1, 1, 2,
      
      0, 1, 2,
      1, 2, 2,
      2, 2, 3,
      
      1, 2, 3,
      2, 3, 3,
      3, 3, 4,
    ] as ColorIndex[],
    maxMoves: 6,
  },
  {
    id: 'level-03',
    cells: [
      0, 2, 4,
      1, 0, 3,
      5, 1, 2,
      
      2, 1, 0,
      3, 2, 1,
      4, 3, 0,
      
      1, 3, 5,
      0, 4, 2,
      2, 0, 1,
    ] as ColorIndex[],
    maxMoves: 8,
  },
  {
    id: 'level-04',
    cells: [
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
    id: 'level-05',
    cells: [
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
    maxMoves: 10,
  },
  {
    id: 'level-06',
    cells: [
      0, 0, 1,
      0, 1, 1,
      1, 1, 2,
      
      0, 1, 2,
      1, 2, 2,
      2, 2, 3,
      
      1, 2, 3,
      2, 3, 3,
      3, 3, 0,
    ] as ColorIndex[],
    maxMoves: 7,
  },
  {
    id: 'level-07',
    cells: [
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
    id: 'level-08',
    cells: [
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
    id: 'level-09',
    cells: [
      0, 2, 0,
      2, 1, 2,
      0, 2, 0,
      
      2, 1, 2,
      1, 3, 1,
      2, 1, 2,
      
      0, 2, 0,
      2, 1, 2,
      0, 2, 0,
    ] as ColorIndex[],
    maxMoves: 6,
  },
  {
    id: 'level-10',
    cells: [
      0, 1, 2,
      1, 2, 3,
      2, 3, 4,
      
      1, 2, 3,
      2, 3, 4,
      3, 4, 5,
      
      2, 3, 4,
      3, 4, 5,
      4, 5, 0,
    ] as ColorIndex[],
    maxMoves: 11,
  },
];

export const getLevelById = (id: string): Level | null => {
  return SAMPLE_LEVELS.find(level => level.id === id) || null;
};

export const getRandomLevel = (): Level => {
  const randomIndex = Math.floor(Math.random() * SAMPLE_LEVELS.length);
  return SAMPLE_LEVELS[randomIndex];
};