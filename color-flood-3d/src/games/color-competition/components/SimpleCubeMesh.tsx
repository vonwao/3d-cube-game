import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color } from 'three'

interface SimpleCubeMeshProps {
  cubeSize: number
  cells: (number | null)[]
  colors: string[]
}

const tempObject = new Object3D()
const tempColor = new Color()

export const SimpleCubeMesh: React.FC<SimpleCubeMeshProps> = ({ cubeSize, cells, colors }) => {
  console.log('🎲 SimpleCubeMesh render', { cubeSize, cellCount: cells.length, colors: colors.length })
  const meshRef = useRef<InstancedMesh>(null)
  const totalCells = cubeSize ** 3
  
  // Convert colors to Color objects
  const colorObjects = useMemo(() => {
    return colors.map(c => new Color(c))
  }, [colors])
  
  // Calculate positions
  const positions = useMemo(() => {
    const pos: [number, number, number][] = []
    const offset = (cubeSize - 1) / 2
    
    for (let i = 0; i < totalCells; i++) {
      const x = i % cubeSize
      const y = Math.floor(i / cubeSize) % cubeSize
      const z = Math.floor(i / (cubeSize * cubeSize))
      
      pos.push([
        (x - offset) * 1.1,
        (y - offset) * 1.1,
        (z - offset) * 1.1,
      ])
    }
    
    console.log('📦 SimpleCubeMesh positions calculated:', pos.length)
    return pos
  }, [cubeSize, totalCells])
  
  // Update instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = positions[i]
      tempObject.position.set(x, y, z)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      
      const colorIndex = cells[i]
      if (colorIndex !== null && colorIndex < colorObjects.length) {
        meshRef.current.setColorAt(i, colorObjects[colorIndex])
      } else {
        meshRef.current.setColorAt(i, new Color('#222'))
      }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
    
    console.log('🎨 SimpleCubeMesh updated')
  }, [cells, positions, totalCells, colorObjects])
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalCells]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}