import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'
import type { Block } from '../logic/types'

interface SelectedBlockEffectProps {
  selectedBlock: Block | null
}

export const SelectedBlockEffect: React.FC<SelectedBlockEffectProps> = ({ selectedBlock }) => {
  const meshRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && selectedBlock) {
      const time = state.clock.elapsedTime
      const scale = 1.1 + Math.sin(time * 4) * 0.1
      meshRef.current.scale.setScalar(scale)
      meshRef.current.rotation.y = time * 0.5
    }
    if (glowRef.current && selectedBlock) {
      const time = state.clock.elapsedTime
      const scale = 1.3 + Math.sin(time * 2) * 0.2
      glowRef.current.scale.setScalar(scale)
    }
  })
  
  if (!selectedBlock) return null
  
  console.log('Rendering SelectedBlockEffect at position:', selectedBlock.position)
  
  return (
    <>
      <mesh
        ref={meshRef}
        position={[selectedBlock.position.x, selectedBlock.position.y, selectedBlock.position.z]}
      >
        <boxGeometry args={[1.15, 1.15, 1.15]} />
        <meshBasicMaterial 
          color="#FFD700"
          wireframe={true}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      
      {/* Additional glow effect */}
      <mesh
        ref={glowRef}
        position={[selectedBlock.position.x, selectedBlock.position.y, selectedBlock.position.z]}
      >
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshBasicMaterial 
          color="#FFD700"
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </>
  )
}