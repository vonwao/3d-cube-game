import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import type { CubeSize } from './types';

type ColorIndex = number;

interface CubeMeshProps {
  cells: ColorIndex[];
  colors: string[];
  floodRegion?: boolean[];
  spacing?: number;
  animationProgress?: number;
  onCellClick?: (index: number) => void;
  enableHover?: boolean;
  cubeSize: CubeSize;
  explosionProgress?: number;
}

const tempObject = new Object3D();
const tempColor = new Color();

export const CubeMesh: React.FC<CubeMeshProps> = ({
  cells,
  colors,
  floodRegion,
  spacing = 1.1,
  animationProgress = 1,
  onCellClick,
  enableHover = true,
  cubeSize,
  explosionProgress = 0,
}) => {
  const totalCells = cubeSize ** 3;
  const defaultFloodRegion = useMemo(() => new Array(totalCells).fill(false), [totalCells]);
  const actualFloodRegion = floodRegion || defaultFloodRegion;
  
  const indexToVec3 = (index: number): [number, number, number] => {
    const x = index % cubeSize;
    const y = Math.floor(index / cubeSize) % cubeSize;
    const z = Math.floor(index / (cubeSize * cubeSize));
    return [x, y, z];
  };
  const meshRef = useRef<InstancedMesh>(null);
  const highlightMeshRef = useRef<InstancedMesh>(null);
  
  const positions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const offset = (cubeSize - 1) / 2;
    const adjustedSpacing = cubeSize > 4 ? spacing * 0.9 : spacing;
    
    // Calculate explosion offset based on layer and cube size
    // Larger cubes need more separation to see inner layers
    const explosionMultiplier = cubeSize <= 3 ? 2 : cubeSize <= 4 ? 2.5 : 3;
    const explosionOffset = explosionProgress * adjustedSpacing * explosionMultiplier;
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = indexToVec3(i);
      
      // Apply explosion offset to each Z layer
      const zOffset = (z - offset) * explosionOffset;
      
      positions.push([
        (x - offset) * adjustedSpacing,
        (y - offset) * adjustedSpacing,
        (z - offset) * adjustedSpacing + zOffset,
      ]);
    }
    return positions;
  }, [spacing, cubeSize, totalCells, indexToVec3, explosionProgress]);
  
  const colorArray = useMemo(() => {
    return colors.map(color => new Color(color));
  }, [colors]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = positions[i];
      
      tempObject.position.set(x, y, z);
      tempObject.rotation.set(0, 0, 0);
      
      const colorIndex = cells[i];
      const isEmpty = colorIndex === 6; // Empty cells
      
      // Make empty cells invisible by scaling to 0
      tempObject.scale.setScalar(isEmpty ? 0.001 : 1);
      tempObject.updateMatrix();
      
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      const color = colorArray[colorIndex] || tempColor.setRGB(0, 0, 0);
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    
    // Critical: Force update matrices for raycasting
    meshRef.current.updateMatrixWorld(true);
    meshRef.current.matrixWorldNeedsUpdate = true;
    
    // Update bounding for raycasting
    meshRef.current.geometry.computeBoundingSphere();
  }, [cells, colorArray, positions, totalCells]);
  
  useEffect(() => {
    if (!highlightMeshRef.current) return;
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = positions[i];
      const isHighlighted = actualFloodRegion[i];
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(isHighlighted ? 1.08 : 0.001);
      tempObject.updateMatrix();
      
      highlightMeshRef.current.setMatrixAt(i, tempObject.matrix);
      
      tempColor.setRGB(1, 1, 1);
      highlightMeshRef.current.setColorAt(i, tempColor);
    }
    
    highlightMeshRef.current.instanceMatrix.needsUpdate = true;
    if (highlightMeshRef.current.instanceColor) {
      highlightMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [actualFloodRegion, positions, totalCells]);

  
  useFrame(() => {
    if (meshRef.current && animationProgress < 1) {
      // Smooth scale animation that emphasizes the flood-fill process
      const scale = 0.9 + 0.1 * animationProgress;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current && animationProgress >= 1) {
      // Ensure we end at normal scale
      meshRef.current.scale.setScalar(1);
    }
  });
  
  const handlePointerDown = (event: any) => {
    console.log('[CubeMesh] handlePointerDown event:', {
      instanceId: event.instanceId,
      point: event.point,
      distance: event.distance,
      face: event.face,
      object: event.object?.type
    });
    
    if (!onCellClick) {
      console.log('[CubeMesh] No onCellClick handler');
      return;
    }
    
    // Stop event propagation to prevent conflicts
    event.stopPropagation();
    
    const instanceId = event.instanceId;
    
    if (instanceId !== undefined && instanceId >= 0 && instanceId < totalCells) {
      const cellValue = cells[instanceId];
      console.log(`[CubeMesh] Instance ${instanceId} clicked, cell value: ${cellValue}`);
      
      if (cellValue !== 6) { // Not empty
        console.log(`[CubeMesh] Calling onCellClick with instanceId: ${instanceId}`);
        onCellClick(instanceId);
      } else {
        console.log('[CubeMesh] Cell is empty (value 6), ignoring click');
      }
    } else {
      console.log(`[CubeMesh] Invalid instanceId: ${instanceId}, totalCells: ${totalCells}`);
    }
  };

  const handlePointerMove = (event: any) => {
    if (!enableHover) return;
    
    const instanceId = event.instanceId;
    if (instanceId !== undefined && cells[instanceId] !== 6) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  };
  
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalCells]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => { if (enableHover) document.body.style.cursor = 'default'; }}
        castShadow
        receiveShadow
        frustumCulled={false}
        matrixAutoUpdate={false}
      >
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.15}
        />
      </instancedMesh>
      
      {/* Highlight mesh for selected blocks */}
      {floodRegion && (
        <instancedMesh
          ref={highlightMeshRef}
          args={[undefined, undefined, totalCells]}
          renderOrder={1}
          raycast={() => null} // Disable raycasting
          frustumCulled={false}
          matrixAutoUpdate={false}
        >
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial
            transparent
            opacity={0.6}
            color="white"
            wireframe={true}
          />
        </instancedMesh>
      )}
    </>
  );
};