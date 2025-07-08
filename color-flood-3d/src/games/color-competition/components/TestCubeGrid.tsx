import { useMemo } from 'react'
import * as THREE from 'three'

interface TestCubeGridProps {
  size: number
}

export const TestCubeGrid: React.FC<TestCubeGridProps> = ({ size }) => {
  const positions = useMemo(() => {
    const pos: [number, number, number][] = []
    const offset = (size - 1) / 2
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          pos.push([
            (x - offset) * 1.1,
            (y - offset) * 1.1,
            (z - offset) * 1.1,
          ])
        }
      }
    }
    return pos
  }, [size])
  
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow']
  
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={colors[i % colors.length]} />
        </mesh>
      ))}
    </group>
  )
}