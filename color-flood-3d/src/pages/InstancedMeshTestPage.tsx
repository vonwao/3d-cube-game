import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect, useState } from 'react'
import { InstancedMesh, Object3D, Color } from 'three'

const tempObject = new Object3D()
const tempColor = new Color()

const TestInstancedMesh: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null)
  const [clickedInstances, setClickedInstances] = useState<number[]>([])
  const count = 8 // 2x2x2 cube
  
  const colors = useMemo(() => [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffffff', '#888888'
  ].map(c => new Color(c)), [])
  
  useEffect(() => {
    if (!meshRef.current) return
    
    let i = 0
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          tempObject.position.set(x * 2 - 1, y * 2 - 1, z * 2 - 1)
          tempObject.updateMatrix()
          meshRef.current.setMatrixAt(i, tempObject.matrix)
          meshRef.current.setColorAt(i, colors[i])
          i++
        }
      }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
    
    // Force update for raycasting
    meshRef.current.updateMatrixWorld(true)
  }, [colors])
  
  const handleClick = (event: any) => {
    console.log('InstancedMesh clicked:', {
      instanceId: event.instanceId,
      point: event.point,
      distance: event.distance,
      object: event.object?.type
    })
    
    if (event.instanceId !== undefined) {
      setClickedInstances(prev => [...prev, event.instanceId])
    }
  }
  
  const handlePointerDown = (event: any) => {
    console.log('InstancedMesh pointerDown:', {
      instanceId: event.instanceId,
      point: event.point,
      distance: event.distance
    })
  }
  
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        frustumCulled={false}
      >
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial />
      </instancedMesh>
    </>
  )
}

export const InstancedMeshTestPage: React.FC = () => {
  const [events, setEvents] = useState<string[]>([])
  
  const addEvent = (event: string) => {
    setEvents(prev => [...prev.slice(-9), event])
  }
  
  useEffect(() => {
    // Global click listener to see all clicks
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      addEvent(`Global click on: ${target.tagName} ${target.className}`)
    }
    
    window.addEventListener('click', handleGlobalClick, true)
    return () => window.removeEventListener('click', handleGlobalClick, true)
  }, [])
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Debug UI */}
      <div 
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 10,
          pointerEvents: 'none',
          maxWidth: '400px'
        }}
      >
        <h3>InstancedMesh Test</h3>
        <p>Click on the colored cubes</p>
        <h4>Events:</h4>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {events.map((event, i) => (
            <div key={i}>{event}</div>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#222222')
          console.log('Canvas created - InstancedMesh test')
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <TestInstancedMesh />
        
        <OrbitControls />
        
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  )
}