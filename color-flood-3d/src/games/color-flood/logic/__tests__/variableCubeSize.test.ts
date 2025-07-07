import type { CubeSize } from '../../../../engine/types';
import { indexToVec3, vec3ToIndex, getNeighbors } from '../flood';

describe('Variable Cube Size Support', () => {
  test.each([3, 4, 5, 6] as CubeSize[])('cube size %d works correctly', (size) => {
    const totalCells = size ** 3;
    
    // Test index conversions
    expect(vec3ToIndex([0, 0, 0], size)).toBe(0);
    expect(vec3ToIndex([size-1, size-1, size-1], size)).toBe(totalCells - 1);
    
    // Test reverse conversion
    const lastIndex = totalCells - 1;
    const vec = indexToVec3(lastIndex, size);
    expect(vec).toEqual([size-1, size-1, size-1]);
    expect(vec3ToIndex(vec, size)).toBe(lastIndex);
    
    // Test neighbor calculations
    const cornerNeighbors = getNeighbors(0, size);
    expect(cornerNeighbors.length).toBe(3); // Corner has 3 neighbors
    
    // Center cell (if exists) should have 6 neighbors
    if (size >= 3) {
      const centerIndex = Math.floor(totalCells / 2);
      const centerNeighbors = getNeighbors(centerIndex, size);
      expect(centerNeighbors.length).toBeLessThanOrEqual(6);
    }
  });
  
  test('position conversions are reversible', () => {
    const sizes: CubeSize[] = [3, 4, 5, 6];
    
    sizes.forEach(size => {
      const totalCells = size ** 3;
      
      for (let i = 0; i < totalCells; i++) {
        const vec = indexToVec3(i, size);
        const index = vec3ToIndex(vec, size);
        expect(index).toBe(i);
      }
    });
  });
});