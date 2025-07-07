import { describe, test, expect } from '@jest/globals';
import { getNeighbors, floodFill, isWin, createInitialState } from '../flood';
import type { CubeState, ColorIndex } from '../types';

describe('Flood Fill Logic', () => {
  describe('getNeighbors', () => {
    test('should return correct neighbors for center cell (13)', () => {
      const neighbors = getNeighbors(13, 3);
      expect(neighbors).toHaveLength(6);
      expect(neighbors.sort()).toEqual([10, 12, 14, 16, 4, 22].sort());
    });

    test('should return correct neighbors for corner cell (0)', () => {
      const neighbors = getNeighbors(0, 3);
      expect(neighbors).toHaveLength(3);
      expect(neighbors.sort()).toEqual([1, 3, 9].sort());
    });

    test('should return correct neighbors for edge cell (1)', () => {
      const neighbors = getNeighbors(1, 3);
      expect(neighbors).toHaveLength(4);
      expect(neighbors.sort()).toEqual([0, 2, 4, 10].sort());
    });

    test('should return correct neighbors for face center (4)', () => {
      const neighbors = getNeighbors(4, 3);
      expect(neighbors).toHaveLength(5);
      expect(neighbors.sort()).toEqual([1, 3, 5, 7, 13].sort());
    });
  });

  describe('floodFill', () => {
    test('should be idempotent when applying same color twice', () => {
      const initialCells: ColorIndex[] = new Array(27).fill(0) as ColorIndex[];
      initialCells[0] = 1;
      initialCells[1] = 1;
      initialCells[3] = 1;
      
      const state = createInitialState(initialCells, 10, 3);
      
      const result1 = floodFill(state, 1, 3);
      const result2 = floodFill(result1, 1, 3);
      
      expect(result1).toEqual(result2);
    });

    test('should expand flood region when applying new color', () => {
      const initialCells: ColorIndex[] = new Array(27).fill(0) as ColorIndex[];
      initialCells[1] = 1;
      initialCells[2] = 1;
      
      const state = createInitialState(initialCells, 10, 3);
      const result = floodFill(state, 1, 3);
      
      expect(result.floodRegion[0]).toBe(true);
      expect(result.floodRegion[1]).toBe(true);
      expect(result.floodRegion[2]).toBe(true);
      expect(result.moves).toBe(1);
    });

    test('should not change state when applying current color', () => {
      const initialCells: ColorIndex[] = new Array(27).fill(0) as ColorIndex[];
      const state = createInitialState(initialCells, 10, 3);
      
      const result = floodFill(state, 0, 3);
      
      expect(result).toBe(state);
    });

    test('should increment move counter', () => {
      const initialCells: ColorIndex[] = new Array(27).fill(0) as ColorIndex[];
      initialCells[1] = 1;
      
      const state = createInitialState(initialCells, 10, 3);
      const result = floodFill(state, 1, 3);
      
      expect(result.moves).toBe(state.moves + 1);
    });
  });

  describe('isWin', () => {
    test('should return true when all cells are same color', () => {
      const state: CubeState = {
        cells: new Array(27).fill(2) as ColorIndex[],
        floodRegion: new Array(27).fill(true),
        moves: 5,
        maxMoves: 10,
      };
      
      expect(isWin(state)).toBe(true);
    });

    test('should return false when cells have different colors', () => {
      const cells: ColorIndex[] = new Array(27).fill(0) as ColorIndex[];
      cells[26] = 1;
      
      const state: CubeState = {
        cells,
        floodRegion: new Array(27).fill(false),
        moves: 5,
        maxMoves: 10,
      };
      
      expect(isWin(state)).toBe(false);
    });
  });

  describe('createInitialState', () => {
    test('should create valid initial state', () => {
      const cells: ColorIndex[] = [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0,
        // ... rest filled with 0s
        ...new Array(18).fill(0)
      ] as ColorIndex[];
      
      const state = createInitialState(cells, 5, 3);
      
      expect(state.cells).toEqual(cells);
      expect(state.moves).toBe(0);
      expect(state.maxMoves).toBe(5);
      expect(state.floodRegion[0]).toBe(true);
      
      // Count how many cells are connected to the starting position (index 0)
      const connectedCells = state.floodRegion.filter(Boolean).length;
      expect(connectedCells).toBeGreaterThan(0);
    });

    test('should connect adjacent cells of same color in initial flood region', () => {
      const cells: ColorIndex[] = [
        0, 0, 1,
        0, 1, 1,
        1, 1, 0,
        // ... rest filled with different colors
        ...new Array(18).fill(2)
      ] as ColorIndex[];
      
      const state = createInitialState(cells, 8, 3);
      
      expect(state.floodRegion[0]).toBe(true);
      expect(state.floodRegion[1]).toBe(true);
      expect(state.floodRegion[3]).toBe(true);
      expect(state.floodRegion[2]).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single-cell game', () => {
      const cells: ColorIndex[] = [0, ...new Array(26).fill(1)] as ColorIndex[];
      const state = createInitialState(cells, 1, 3);
      const result = floodFill(state, 1, 3);
      
      expect(isWin(result)).toBe(true);
    });

    test('should handle already won game', () => {
      const cells: ColorIndex[] = new Array(27).fill(3) as ColorIndex[];
      const state = createInitialState(cells, 1, 3);
      
      expect(isWin(state)).toBe(true);
    });
  });
});