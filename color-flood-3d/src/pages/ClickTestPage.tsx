import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'

interface TestCubeProps {
  position: [number, number, number]
  color: string
  id: string
  onClick: (id: string) => void
}

const TestCube: React.FC<TestCubeProps> = ({ position, color, id, onClick }) => {
  const [hovered, setHovered] = useState(false)
  
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        console.log('Mesh clicked:', id, e)
        onClick(id)
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        console.log('Pointer down:', id, e)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={hovered ? 'hotpink' : color}
        emissive={hovered ? color : 'black'}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  )
}

export const ClickTestPage: React.FC = () => {
  const [clickedCubes, setClickedCubes] = useState<string[]>([])
  const [lastClicked, setLastClicked] = useState<string>('')
  
  const handleCubeClick = (id: string) => {
    console.log('handleCubeClick called with:', id)
    setLastClicked(id)
    setClickedCubes(prev => [...prev, id])
  }
  
  // Log to window for Playwright access
  if (typeof window !== 'undefined') {
    (window as any).clickTestData = {
      clickedCubes,
      lastClicked
    }
  }
  
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
          pointerEvents: 'none'
        }}
      >
        <h3>Click Test Debug</h3>
        <p>Last clicked: <span id="last-clicked">{lastClicked || 'none'}</span></p>
        <p>Total clicks: <span id="total-clicks">{clickedCubes.length}</span></p>
        <p>Click history: {clickedCubes.join(', ')}</p>
      </div>
      
      {/* Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#f0f0f0')
          console.log('Canvas created')
          
          // Add raycaster debugging
          const raycaster = new THREE.Raycaster()
          
          gl.domElement.addEventListener('click', (e) => {
            const rect = gl.domElement.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
            
            console.log('Raw canvas click at:', { x, y })
          })
        }}
        onPointerMissed={() => {
          console.log('Pointer missed all objects')
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Test cubes */}
        <TestCube 
          position={[0, 0, 0]} 
          color="red" 
          id="cube-red" 
          onClick={handleCubeClick}
        />
        <TestCube 
          position={[2, 0, 0]} 
          color="green" 
          id="cube-green" 
          onClick={handleCubeClick}
        />
        <TestCube 
          position={[-2, 0, 0]} 
          color="blue" 
          id="cube-blue" 
          onClick={handleCubeClick}
        />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
        />
        
        {/* Grid helper */}
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  )
}