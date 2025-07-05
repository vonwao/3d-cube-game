import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { useSpring, SpringValue } from '@react-spring/three';
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
  rotation: [SpringValue<number>, SpringValue<number>, SpringValue<number>];
  isRotating: boolean;
  rotateTo: (axis: 'x' | 'y' | 'z', degrees: number) => void;
  reset: () => void;
}

export const useCubeControls = (config: CubeControlsConfig = {}): CubeControlsReturn => {
  const {
    rotationSpeed = 1,
    keyboardSpeed = 45,
    enableKeyboard = true,
    enableMouse = true,
    enableTouch = true,
  } = config;
  
  const { gl } = useThree();
  
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // State-driven approach - spring automatically follows these values
  const [springRotation, setSpringRotation] = useState({ x: 0, y: 0, z: 0 });

  // React Spring animation for smooth rotation
  const springs = useSpring({
    rotationX: springRotation.x,
    rotationY: springRotation.y,
    rotationZ: springRotation.z,
    config: {
      tension: 200,
      friction: 25,
      mass: 1,
    },
  });
  
  const lastPointer = useRef(new Vector2());
  const velocity = useRef(new Vector2());
  
  // Keep track of target rotation values to avoid spring conflicts
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  
  // Add a setter that logs when targetRotation changes
  const setTargetRotation = (newTarget: { x: number, y: number, z: number }) => {
    console.log('🎯 TARGET ROTATION CHANGING FROM:', targetRotation.current, 'TO:', newTarget);
    targetRotation.current = newTarget;
  };
  
  
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
    
    // Update target rotation values
    targetRotation.current.x += rotationX;
    targetRotation.current.y += rotationY;
    
    // Use state-driven approach like arrow keys
    setSpringRotation({
      x: targetRotation.current.x,
      y: targetRotation.current.y,
      z: targetRotation.current.z,
    });
    
    console.log('🎯 New rotation from mouse:', targetRotation.current.x, targetRotation.current.y);
    
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
    
    // Apply momentum with smooth deceleration
    targetRotation.current.x += momentumY;
    targetRotation.current.y += momentumX;
    
    // Use state-driven approach for momentum
    setSpringRotation({
      x: targetRotation.current.x,
      y: targetRotation.current.y,
      z: targetRotation.current.z,
    });
    
    gl.domElement.releasePointerCapture(event.pointerId);
    
    setTimeout(() => setIsRotating(false), 800);
    
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
        
        console.log('🎯 Before assignment - targetRotation.current:', targetRotation.current);
        switch (arrowKey) {
          case 'ArrowUp':
            console.log('🎯 ArrowUp - subtracting', radians, 'from x');
            targetRotation.current.x -= radians;
            console.log('🎯 ArrowUp - new x:', targetRotation.current.x);
            break;
          case 'ArrowDown':
            console.log('🎯 ArrowDown - adding', radians, 'to x');
            targetRotation.current.x += radians;
            console.log('🎯 ArrowDown - new x:', targetRotation.current.x);
            break;
          case 'ArrowLeft':
            console.log('🎯 ArrowLeft - subtracting', radians, 'from y');
            targetRotation.current.y -= radians;
            console.log('🎯 ArrowLeft - new y:', targetRotation.current.y);
            break;
          case 'ArrowRight':
            console.log('🎯 ArrowRight - adding', radians, 'to y');
            targetRotation.current.y += radians;
            console.log('🎯 ArrowRight - new y:', targetRotation.current.y);
            break;
        }
        console.log('🎯 After assignment - targetRotation.current:', targetRotation.current);
        
        console.log('🎯 ARROW KEY - Setting spring rotation state to:', targetRotation.current);
        
        const newSpringRotation = {
          x: targetRotation.current.x,
          y: targetRotation.current.y,
          z: targetRotation.current.z,
        };
        
        console.log('🎯 ARROW KEY - Setting springRotation state to:', newSpringRotation);
        setSpringRotation(newSpringRotation);
        
        setIsRotating(true);
        
        console.log('🎯 Arrow key - New target rotation:', targetRotation.current);
        console.log('🎯 Arrow key - Spring values before animation:', springs.rotationX.get(), springs.rotationY.get(), springs.rotationZ.get());
        
        // Check spring values after a short delay
        setTimeout(() => {
          console.log('🎯 Arrow key - Spring values after 100ms:', springs.rotationX.get(), springs.rotationY.get(), springs.rotationZ.get());
          console.log('🎯 Arrow key - Target should be:', targetRotation.current);
        }, 100);
        
        setTimeout(() => setIsRotating(false), 1000);
        return true; // Event handled
      }
      
      if (rotationKey) {
        console.log('🔄 Q/E rotation:', rotationKey);
        
        switch (rotationKey) {
          case 'q':
            targetRotation.current.z -= radians;
            break;
          case 'e':
            targetRotation.current.z += radians;
            break;
        }
        
        setSpringRotation({
          x: targetRotation.current.x,
          y: targetRotation.current.y,
          z: targetRotation.current.z,
        });
        
        setIsRotating(true);
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
  
  
  const rotateTo = (axis: 'x' | 'y' | 'z', degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    
    switch (axis) {
      case 'x':
        targetRotation.current.x += radians;
        break;
      case 'y':
        targetRotation.current.y += radians;
        break;
      case 'z':
        targetRotation.current.z += radians;
        break;
    }
    
    setSpringRotation({
      x: targetRotation.current.x,
      y: targetRotation.current.y,
      z: targetRotation.current.z,
    });
    
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);
  };
  
  const reset = () => {
    console.log('🔄 RESET CALLED - resetting target rotation to 0,0,0');
    setTargetRotation({ x: 0, y: 0, z: 0 });
    setSpringRotation({ x: 0, y: 0, z: 0 });
    setIsRotating(false);
  };
  
  return {
    rotation: [springs.rotationX, springs.rotationY, springs.rotationZ],
    isRotating,
    rotateTo,
    reset,
  };
};