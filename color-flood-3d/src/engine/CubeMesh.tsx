import { useRef, useMemo, useEffect, useState } from 'react';
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
  const hoverMeshRef = useRef<InstancedMesh>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  
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
    
    // Force update geometry bounds for proper raycasting
    meshRef.current.geometry.computeBoundingSphere();
    meshRef.current.geometry.computeBoundingBox();
    
    // Force update the instanced mesh itself
    meshRef.current.updateMatrixWorld(true);
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

  // Update hover mesh
  useEffect(() => {
    if (!hoverMeshRef.current) return;
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = positions[i];
      const isHovered = hoveredCell === i;
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(isHovered ? 1.08 : 0.001);
      tempObject.updateMatrix();
      
      hoverMeshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Use the cell's color but slightly brighter for hover
      if (isHovered) {
        const colorIndex = cells[i];
        const cellColor = colorArray[colorIndex];
        if (cellColor) {
          tempColor.copy(cellColor).multiplyScalar(1.2); // Subtle brightness increase
        } else {
          tempColor.setRGB(0.5, 0.5, 0.5); // Gray for empty cells
        }
      } else {
        tempColor.setRGB(0, 0, 0);
      }
      hoverMeshRef.current.setColorAt(i, tempColor);
    }
    
    hoverMeshRef.current.instanceMatrix.needsUpdate = true;
    if (hoverMeshRef.current.instanceColor) {
      hoverMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [hoveredCell, positions, cells, colorArray, totalCells]);
  
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
  
  const handleClick = (event: any) => {
    if (!onCellClick) return;
    
    const instanceId = event.instanceId;
    
    if (instanceId !== undefined && cells[instanceId] !== 6) {
      onCellClick(instanceId);
    }
  };

  const handlePointerEnter = (event: { instanceId?: number }) => {
    if (!enableHover) return;
    
    const instanceId = event.instanceId;
    if (instanceId !== undefined && cells[instanceId] !== 6) {
      setHoveredCell(instanceId);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerLeave = () => {
    if (!enableHover) return;
    
    setHoveredCell(null);
    document.body.style.cursor = 'default';
  };
  
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalCells]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.15}
          transparent={false}
        />
      </instancedMesh>
      
      <instancedMesh
        ref={highlightMeshRef}
        args={[undefined, undefined, totalCells]}
        renderOrder={1}
        raycast={() => null} // Disable raycasting for highlight mesh
      >
        <boxGeometry args={[1.05, 1.05, 1.05]} />
        <meshBasicMaterial
          transparent
          opacity={0.6}
          color="white"
          wireframe={true}
          wireframeLinewidth={2}
        />
      </instancedMesh>
      
      {enableHover && (
        <instancedMesh
          ref={hoverMeshRef}
          args={[undefined, undefined, totalCells]}
          renderOrder={2}
          raycast={() => null} // Disable raycasting for hover mesh
        >
          <boxGeometry args={[1.02, 1.02, 1.02]} />
          <meshBasicMaterial
            transparent
            opacity={0.2}
            wireframe={false}
          />
        </instancedMesh>
      )}
    </>
  );
};