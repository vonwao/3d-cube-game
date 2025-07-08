import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSimulationStore } from './logic/simulationStore'

function Box() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export function ColorCompetitionMinimal() {
  const { toggleRunning, isRunning } = useSimulationStore()
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box />
        <OrbitControls />
        <gridHelper />
        <axesHelper args={[5]} />
      </Canvas>
      
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}>
        <h1>Minimal Test</h1>
        <button onClick={toggleRunning}>
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  )
}