import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector2 } from 'three';

interface CubeControlsConfig {
  rotationSpeed?: number;
  dampingFactor?: number;
  keyboardSpeed?: number;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
  enableTouch?: boolean;
}

interface CubeControlsReturn {
  rotation: Euler;
  isRotating: boolean;
  rotateTo: (axis: 'x' | 'y' | 'z', degrees: number) => void;
  reset: () => void;
}

export const useCubeControlsOriginal = (config: CubeControlsConfig = {}): CubeControlsReturn => {
  const {
    rotationSpeed = 1,
    dampingFactor = 0.05,
    keyboardSpeed = 90,
    enableKeyboard = true,
    enableMouse = true,
    enableTouch = true,
  } = config;
  
  const { gl } = useThree();
  
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const currentRotation = useRef(new Euler(0, 0, 0));
  const targetRotation = useRef(new Euler(0, 0, 0));
  
  const lastPointer = useRef(new Vector2());
  const velocity = useRef(new Vector2());
  
  
  const handlePointerDown = (event: PointerEvent) => {
    console.log('Original controls - Pointer down:', event.pointerType);
    
    if (!enableMouse && event.pointerType === 'mouse') return;
    if (!enableTouch && event.pointerType === 'touch') return;
    
    setIsDragging(true);
    lastPointer.current.set(event.clientX, event.clientY);
    velocity.current.set(0, 0);
    
    gl.domElement.setPointerCapture(event.pointerId);
    event.preventDefault();
    
    console.log('Original controls - Dragging started');
  };
  
  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastPointer.current.x;
    const deltaY = event.clientY - lastPointer.current.y;
    
    console.log('Original controls - Pointer move:', deltaX, deltaY);
    
    velocity.current.set(deltaX, deltaY);
    
    const rotationX = (deltaY * rotationSpeed) / 200;
    const rotationY = (deltaX * rotationSpeed) / 200;
    
    targetRotation.current.y += rotationY;
    targetRotation.current.x += rotationX;
    
    console.log('Original controls - Target rotation:', targetRotation.current);
    
    lastPointer.current.set(event.clientX, event.clientY);
    
    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      setIsRotating(true);
    }
    
    event.preventDefault();
  };
  
  const handlePointerUp = (event: PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const momentumX = velocity.current.x * 0.02;
    const momentumY = velocity.current.y * 0.02;
    
    targetRotation.current.x += momentumY;
    targetRotation.current.y += momentumX;
    
    gl.domElement.releasePointerCapture(event.pointerId);
    
    setTimeout(() => setIsRotating(false), 200);
    
    event.preventDefault();
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enableKeyboard) return;
    
    console.log('Original controls - Key down:', event.key);
    
    const radians = (keyboardSpeed * Math.PI) / 180;
    
    switch (event.key) {
      case 'ArrowUp':
        targetRotation.current.x -= radians;
        setIsRotating(true);
        console.log('Original controls - Arrow Up');
        break;
      case 'ArrowDown':
        targetRotation.current.x += radians;
        setIsRotating(true);
        console.log('Original controls - Arrow Down');
        break;
      case 'ArrowLeft':
        targetRotation.current.y -= radians;
        setIsRotating(true);
        console.log('Original controls - Arrow Left');
        break;
      case 'ArrowRight':
        targetRotation.current.y += radians;
        setIsRotating(true);
        console.log('Original controls - Arrow Right');
        break;
      case 'q':
      case 'Q':
        targetRotation.current.z -= radians;
        setIsRotating(true);
        console.log('Original controls - Q');
        break;
      case 'e':
      case 'E':
        targetRotation.current.z += radians;
        setIsRotating(true);
        console.log('Original controls - E');
        break;
      default:
        return;
    }
    
    console.log('Original controls - Target rotation from keyboard:', targetRotation.current);
    
    setTimeout(() => setIsRotating(false), 300);
    event.preventDefault();
  };
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    
    if (enableKeyboard) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      
      if (enableKeyboard) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isDragging, enableKeyboard, enableMouse, enableTouch]);
  
  useFrame(() => {
    currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, dampingFactor);
    currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, dampingFactor);
    currentRotation.current.z = lerp(currentRotation.current.z, targetRotation.current.z, dampingFactor);
    
    const deltaX = Math.abs(currentRotation.current.x - targetRotation.current.x);
    const deltaY = Math.abs(currentRotation.current.y - targetRotation.current.y);
    const deltaZ = Math.abs(currentRotation.current.z - targetRotation.current.z);
    
    if (deltaX < 0.001 && deltaY < 0.001 && deltaZ < 0.001) {
      setIsRotating(false);
    }
  });
  
  const rotateTo = (axis: 'x' | 'y' | 'z', degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    targetRotation.current[axis] += radians;
    setIsRotating(true);
    
    setTimeout(() => setIsRotating(false), 500);
  };
  
  const reset = () => {
    currentRotation.current.set(0, 0, 0);
    targetRotation.current.set(0, 0, 0);
    setIsRotating(false);
  };
  
  return {
    rotation: currentRotation.current,
    isRotating,
    rotateTo,
    reset,
  };
};

const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};