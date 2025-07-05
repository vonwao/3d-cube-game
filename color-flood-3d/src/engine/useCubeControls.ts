import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector2 } from 'three';
import { useKeyboardManager, isArrowKey, isRotationKey } from './useKeyboardManager';

interface CubeControlsConfig {
  rotationSpeed?: number;
  dampingFactor?: number;
  keyboardSpeed?: number;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
  enableTouch?: boolean;
}

interface CubeControlsReturn {
  rotation: [number, number, number];
  isRotating: boolean;
  rotateTo: (axis: 'x' | 'y' | 'z', degrees: number) => void;
  reset: () => void;
}

export const useCubeControls = (config: CubeControlsConfig = {}): CubeControlsReturn => {
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
    console.log('🖱️ Pointer down:', event.pointerType, 'enableMouse:', enableMouse, 'enableTouch:', enableTouch);
    
    if (!enableMouse && event.pointerType === 'mouse') return;
    if (!enableTouch && event.pointerType === 'touch') return;
    
    setIsDragging(true);
    lastPointer.current.set(event.clientX, event.clientY);
    velocity.current.set(0, 0);
    
    gl.domElement.setPointerCapture(event.pointerId);
    event.preventDefault();
    
    console.log('🖱️ Drag started at:', event.clientX, event.clientY);
  };
  
  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastPointer.current.x;
    const deltaY = event.clientY - lastPointer.current.y;
    
    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      console.log('🖱️ Mouse drag:', deltaX, deltaY);
    }
    
    velocity.current.set(deltaX, deltaY);
    
    const rotationX = (deltaY * rotationSpeed) / 200;
    const rotationY = (deltaX * rotationSpeed) / 200;
    
    targetRotation.current.y += rotationY;
    targetRotation.current.x += rotationX;
    
    console.log('🎯 Target rotation from mouse:', targetRotation.current);
    
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
  
  // Keyboard handler using the centralized keyboard manager
  useKeyboardManager(
    (event: KeyboardEvent) => {
      console.log('⌨️ Cube controls received key:', event.key, 'enableKeyboard:', enableKeyboard);
      
      if (!enableKeyboard) return false;
      
      const radians = (keyboardSpeed * Math.PI) / 180;
      const arrowKey = isArrowKey(event.key);
      const rotationKey = isRotationKey(event.key);
      
      if (arrowKey) {
        console.log('⬆️ Arrow key detected:', arrowKey, 'applying rotation:', radians);
        switch (arrowKey) {
          case 'ArrowUp':
            targetRotation.current.x -= radians;
            setIsRotating(true);
            break;
          case 'ArrowDown':
            targetRotation.current.x += radians;
            setIsRotating(true);
            break;
          case 'ArrowLeft':
            targetRotation.current.y -= radians;
            setIsRotating(true);
            break;
          case 'ArrowRight':
            targetRotation.current.y += radians;
            setIsRotating(true);
            break;
        }
        
        console.log('🎯 New target rotation:', targetRotation.current);
        setTimeout(() => setIsRotating(false), 1000);
        return true; // Event handled
      }
      
      if (rotationKey) {
        console.log('🔄 Rotation key detected:', rotationKey);
        switch (rotationKey) {
          case 'q':
            targetRotation.current.z -= radians;
            setIsRotating(true);
            break;
          case 'e':
            targetRotation.current.z += radians;
            setIsRotating(true);
            break;
        }
        
        console.log('🎯 New target rotation:', targetRotation.current);
        setTimeout(() => setIsRotating(false), 1000);
        return true; // Event handled
      }
      
      return false; // Event not handled by this component
    },
    { 
      enabled: enableKeyboard,
      priority: 10 // Lower priority than color selection
    }
  );
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, enableMouse, enableTouch]);
  
  useFrame(() => {
    const oldX = currentRotation.current.x;
    const oldY = currentRotation.current.y;
    const oldZ = currentRotation.current.z;
    
    currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, dampingFactor);
    currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, dampingFactor);
    currentRotation.current.z = lerp(currentRotation.current.z, targetRotation.current.z, dampingFactor);
    
    // Log if rotation changed
    if (Math.abs(oldX - currentRotation.current.x) > 0.001 || 
        Math.abs(oldY - currentRotation.current.y) > 0.001 || 
        Math.abs(oldZ - currentRotation.current.z) > 0.001) {
      console.log('🔄 Rotation updating:', {
        current: [currentRotation.current.x.toFixed(3), currentRotation.current.y.toFixed(3), currentRotation.current.z.toFixed(3)],
        target: [targetRotation.current.x.toFixed(3), targetRotation.current.y.toFixed(3), targetRotation.current.z.toFixed(3)]
      });
    }
    
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
    rotation: [currentRotation.current.x, currentRotation.current.y, currentRotation.current.z] as [number, number, number],
    isRotating,
    rotateTo,
    reset,
  };
};

const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};