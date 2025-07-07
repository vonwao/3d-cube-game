import React, { useMemo } from 'react';
import { useCubeState, useCurrentPalette, useCubeSize } from '../logic/simpleGameStore';
import { indexToVec3 } from '../logic/flood';
import type { Vec3 } from '../../../engine/types';

export const CubeAnalyzer: React.FC = () => {
  const cubeState = useCubeState();
  const palette = useCurrentPalette();
  const cubeSize = useCubeSize();
  
  const analysis = useMemo(() => {
    const totalCells = cubeSize ** 3;
    const colorCounts: Record<number, number> = {};
    const layerInfo: Array<{ layer: string; cells: Array<{ pos: Vec3; color: number; inFlood: boolean }> }> = [];
    
    // Count colors and analyze layers
    for (let z = 0; z < cubeSize; z++) {
      const layerCells: Array<{ pos: Vec3; color: number; inFlood: boolean }> = [];
      
      for (let y = 0; y < cubeSize; y++) {
        for (let x = 0; x < cubeSize; x++) {
          const index = x + y * cubeSize + z * cubeSize * cubeSize;
          const color = cubeState.cells[index];
          const inFlood = cubeState.floodRegion[index];
          
          colorCounts[color] = (colorCounts[color] || 0) + 1;
          layerCells.push({ pos: [x, y, z], color, inFlood });
        }
      }
      
      layerInfo.push({
        layer: `Z=${z}`,
        cells: layerCells
      });
    }
    
    // Identify interior cells (not on any face)
    const interiorCells = [];
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = indexToVec3(i, cubeSize);
      if (x > 0 && x < cubeSize - 1 && 
          y > 0 && y < cubeSize - 1 && 
          z > 0 && z < cubeSize - 1) {
        interiorCells.push({
          index: i,
          pos: [x, y, z] as Vec3,
          color: cubeState.cells[i],
          inFlood: cubeState.floodRegion[i]
        });
      }
    }
    
    const floodedCount = cubeState.floodRegion.filter(Boolean).length;
    const progress = (floodedCount / totalCells * 100).toFixed(1);
    
    return {
      totalCells,
      floodedCount,
      progress,
      colorCounts,
      interiorCells,
      layerInfo
    };
  }, [cubeState, cubeSize]);
  
  return (
    <div className="cube-analyzer" style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Cube Interior Analysis</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Progress:</strong> {analysis.floodedCount}/{analysis.totalCells} cells ({analysis.progress}%)
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Color Distribution:</strong>
        {Object.entries(analysis.colorCounts).map(([color, count]) => (
          <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: palette.colors[parseInt(color)],
              border: '1px solid white'
            }} />
            <span>Color {parseInt(color) + 1}: {count} cells</span>
          </div>
        ))}
      </div>
      
      {cubeSize > 3 && analysis.interiorCells.length > 0 && (
        <div>
          <strong>Interior Cells ({analysis.interiorCells.length} hidden):</strong>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            {analysis.interiorCells.map((cell, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                marginBottom: '2px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: palette.colors[cell.color],
                  border: cell.inFlood ? '2px solid white' : '1px solid gray'
                }} />
                <span>
                  [{cell.pos.join(',')}] {cell.inFlood ? '✓ Captured' : '○ Not captured'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.8 }}>
        💡 Tip: Interior cells are completely hidden but still part of the game!
      </div>
    </div>
  );
};