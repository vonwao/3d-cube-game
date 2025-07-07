import React from 'react';
import type { CubeSize } from '../../../engine/types';
import { CUBE_CONFIGS } from '../logic/config';
import { useCubeSize, useSimpleGameStore } from '../logic/simpleGameStore';

interface CubeSizeSelectorProps {
  className?: string;
}

export const CubeSizeSelector: React.FC<CubeSizeSelectorProps> = ({ className = '' }) => {
  const currentSize = useCubeSize();
  const changeCubeSize = useSimpleGameStore(state => state.changeCubeSize);

  return (
    <div className={`cube-size-selector ${className}`}>
      <h3 className="text-sm font-semibold mb-2">Cube Size</h3>
      <div className="grid grid-cols-2 gap-2">
        {([3, 4, 5, 6] as CubeSize[]).map(size => {
          const config = CUBE_CONFIGS[size];
          const isActive = currentSize === size;
          
          return (
            <button
              key={size}
              onClick={() => changeCubeSize(size)}
              className={`
                p-2 rounded text-center transition-all
                ${isActive 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }
              `}
            >
              <div className="font-semibold">{size}×{size}×{size}</div>
              <div className="text-xs opacity-80">{config.totalCells} cells</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Larger cubes require more moves to complete
      </p>
    </div>
  );
};