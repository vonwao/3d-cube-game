import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';

type ColorIndex = number;

const CUBE_SIZE = 3;
const TOTAL_CELLS = CUBE_SIZE ** 3;

const indexToVec3 = (index: number): [number, number, number] => {
  const x = index % CUBE_SIZE;
  const y = Math.floor(index / CUBE_SIZE) % CUBE_SIZE;
  const z = Math.floor(index / (CUBE_SIZE * CUBE_SIZE));
  return [x, y, z];
};

interface CubeMeshProps {
  cells: ColorIndex[];
  colors: string[];
  floodRegion?: boolean[];
  spacing?: number;
  animationProgress?: number;
  onCellClick?: (index: number) => void;
  enableHover?: boolean;
}

const tempObject = new Object3D();
const tempColor = new Color();

export const CubeMesh: React.FC<CubeMeshProps> = ({
  cells,
  colors,
  floodRegion = new Array(TOTAL_CELLS).fill(false),
  spacing = 1.1,
  animationProgress = 1,
  onCellClick,
  enableHover = true,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const highlightMeshRef = useRef<InstancedMesh>(null);
  const hoverMeshRef = useRef<InstancedMesh>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  
  const positions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const [x, y, z] = indexToVec3(i);
      positions.push([
        (x - 1) * spacing,
        (y - 1) * spacing,
        (z - 1) * spacing,
      ]);
    }
    return positions;
  }, [spacing]);
  
  const colorArray = useMemo(() => {
    return colors.map(color => new Color(color));
  }, [colors]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const [x, y, z] = positions[i];
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      const colorIndex = cells[i];
      const color = colorArray[colorIndex];
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [cells, colorArray, positions]);
  
  useEffect(() => {
    if (!highlightMeshRef.current) return;
    
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const [x, y, z] = positions[i];
      const isHighlighted = floodRegion[i];
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(isHighlighted ? 1.05 : 0.001);
      tempObject.updateMatrix();
      
      highlightMeshRef.current.setMatrixAt(i, tempObject.matrix);
      
      tempColor.setRGB(1, 1, 1);
      highlightMeshRef.current.setColorAt(i, tempColor);
    }
    
    highlightMeshRef.current.instanceMatrix.needsUpdate = true;
    if (highlightMeshRef.current.instanceColor) {
      highlightMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [floodRegion, positions]);

  // Update hover mesh
  useEffect(() => {
    if (!hoverMeshRef.current) return;
    
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const [x, y, z] = positions[i];
      const isHovered = hoveredCell === i;
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(isHovered ? 1.08 : 0.001);
      tempObject.updateMatrix();
      
      hoverMeshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Use the cell's color but brighter for hover
      if (isHovered) {
        const colorIndex = cells[i];
        const cellColor = colorArray[colorIndex];
        tempColor.copy(cellColor).multiplyScalar(1.5); // Brighten the color
      } else {
        tempColor.setRGB(0, 0, 0);
      }
      hoverMeshRef.current.setColorAt(i, tempColor);
    }
    
    hoverMeshRef.current.instanceMatrix.needsUpdate = true;
    if (hoverMeshRef.current.instanceColor) {
      hoverMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [hoveredCell, positions, cells, colorArray]);
  
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
    if (instanceId !== undefined) {
      onCellClick(instanceId);
    }
  };

  const handlePointerEnter = (event: any) => {
    if (!enableHover) return;
    
    const instanceId = event.instanceId;
    if (instanceId !== undefined) {
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
        args={[undefined, undefined, TOTAL_CELLS]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.1}
          transparent={false}
        />
      </instancedMesh>
      
      <instancedMesh
        ref={highlightMeshRef}
        args={[undefined, undefined, TOTAL_CELLS]}
        renderOrder={1}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          transparent
          opacity={0.3}
          color="white"
          wireframe={true}
        />
      </instancedMesh>
      
      {enableHover && (
        <instancedMesh
          ref={hoverMeshRef}
          args={[undefined, undefined, TOTAL_CELLS]}
          renderOrder={2}
        >
          <boxGeometry args={[1.02, 1.02, 1.02]} />
          <meshBasicMaterial
            transparent
            opacity={0.4}
            wireframe={false}
          />
        </instancedMesh>
      )}
    </>
  );
};