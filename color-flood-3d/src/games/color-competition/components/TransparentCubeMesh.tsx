import { useRef, useMemo, useEffect } from 'react'
import { InstancedMesh, Object3D, Color, MeshStandardMaterial } from 'three'
import type { CubeSize } from '../../../engine/types'

type ColorIndex = number

interface TransparentCubeMeshProps {
  cells: ColorIndex[]
  colors: string[]
  spacing?: number
  onCellClick?: (index: number) => void
  cubeSize: CubeSize
  cellOpacity: number
  showEmptyCells: boolean
  emptyOpacity: number
}

const tempObject = new Object3D()
const tempColor = new Color()

export const TransparentCubeMesh: React.FC<TransparentCubeMeshProps> = ({
  cells,
  colors,
  spacing = 1.1,
  onCellClick,
  cubeSize,
  cellOpacity,
  showEmptyCells,
  emptyOpacity,
}) => {
  const totalCells = cubeSize ** 3
  const meshRef = useRef<InstancedMesh>(null)
  const materialRef = useRef<MeshStandardMaterial>(null)
  
  const indexToVec3 = (index: number): [number, number, number] => {
    const x = index % cubeSize
    const y = Math.floor(index / cubeSize) % cubeSize
    const z = Math.floor(index / (cubeSize * cubeSize))
    return [x, y, z]
  }
  
  const positions = useMemo(() => {
    const positions: [number, number, number][] = []
    const offset = (cubeSize - 1) / 2
    const adjustedSpacing = cubeSize > 4 ? spacing * 0.9 : spacing
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = indexToVec3(i)
      positions.push([
        (x - offset) * adjustedSpacing,
        (y - offset) * adjustedSpacing,
        (z - offset) * adjustedSpacing,
      ])
    }
    return positions
  }, [spacing, cubeSize, totalCells])
  
  const colorArray = useMemo(() => {
    return colors.map(color => new Color(color))
  }, [colors])
  
  // Update material transparency
  useEffect(() => {
    if (materialRef.current) {
      // Enable transparency if opacity is less than 1
      const needsTransparency = cellOpacity < 1 || (showEmptyCells && emptyOpacity < 1)
      materialRef.current.transparent = needsTransparency
      materialRef.current.opacity = cellOpacity
      materialRef.current.needsUpdate = true
    }
  }, [cellOpacity, showEmptyCells, emptyOpacity])
  
  useEffect(() => {
    if (!meshRef.current) return
    
    for (let i = 0; i < totalCells; i++) {
      const [x, y, z] = positions[i]
      tempObject.position.set(x, y, z)
      tempObject.updateMatrix()
      
      const cellValue = cells[i]
      const isEmpty = cellValue === 6
      
      // Handle visibility and opacity
      if (isEmpty && !showEmptyCells) {
        // Hide empty cells by scaling to 0
        tempObject.scale.set(0, 0, 0)
        tempObject.updateMatrix()
      } else {
        // Normal scale
        tempObject.scale.set(1, 1, 1)
        tempObject.updateMatrix()
      }
      
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      
      // Set color
      if (cellValue < colorArray.length) {
        tempColor.copy(colorArray[cellValue])
      } else {
        tempColor.setRGB(0.1, 0.1, 0.1) // Dark gray for empty
      }
      
      meshRef.current.setColorAt(i, tempColor)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [positions, cells, colorArray, totalCells, showEmptyCells])
  
  const handleClick = (event: { instanceId?: number }) => {
    if (!onCellClick) return
    
    const instanceId = event.instanceId
    if (instanceId !== undefined && cells[instanceId] !== 6) {
      onCellClick(instanceId)
    }
  }
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, totalCells]}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial 
        ref={materialRef}
        transparent={cellOpacity < 1}
        opacity={cellOpacity}
        depthWrite={cellOpacity >= 0.9} // Disable depth write for very transparent objects
        roughness={0.4}
        metalness={0.15}
      />
    </instancedMesh>
  )
}