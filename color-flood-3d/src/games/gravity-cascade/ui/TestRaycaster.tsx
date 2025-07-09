import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export const TestRaycaster: React.FC = () => {
  const { camera, scene, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
    
    const handleClick = (event: MouseEvent) => {
      console.log('TestRaycaster - click detected')
      
      raycaster.current.setFromCamera(mouse.current, camera)
      const intersects = raycaster.current.intersectObjects(scene.children, true)
      
      console.log('TestRaycaster - intersects:', intersects)
      console.log('TestRaycaster - scene children:', scene.children)
      
      if (intersects.length > 0) {
        const first = intersects[0]
        console.log('TestRaycaster - first intersection:', first)
        console.log('TestRaycaster - instanceId:', first.instanceId)
        console.log('TestRaycaster - object type:', first.object.type)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [camera, scene, gl])
  
  return null
}