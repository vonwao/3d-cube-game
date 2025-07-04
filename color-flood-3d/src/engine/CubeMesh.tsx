import { useRef, useMemo, useEffect } from 'react';
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
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const highlightMeshRef = useRef<InstancedMesh>(null);
  
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
  
  useFrame(() => {
    if (meshRef.current && animationProgress < 1) {
      const scale = 0.8 + 0.2 * animationProgress;
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  const handleClick = (event: any) => {
    if (!onCellClick) return;
    
    const instanceId = event.instanceId;
    if (instanceId !== undefined) {
      onCellClick(instanceId);
    }
  };
  
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, TOTAL_CELLS]}
        onClick={handleClick}
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
    </>
  );
};