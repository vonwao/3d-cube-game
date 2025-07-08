import { Canvas } from '@react-three/fiber'

function Box() {
  return (
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color="hotpink" />
    </mesh>
  )
}

export function ColorCompetitionSimple() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <h1 style={{ color: 'white', position: 'absolute', zIndex: 1 }}>Simple Three.js Test</h1>
      <Canvas>
        <Box />
      </Canvas>
    </div>
  )
}