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
  
  // React Spring animation for smooth rotation
  const [springs, api] = useSpring(() => ({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    config: {
      tension: 120,
      friction: 14,
      mass: 1,
    },
  }));
  
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
    
    // Get current rotation and add delta
    const currentRotX = springs.rotationX.get();
    const currentRotY = springs.rotationY.get();
    
    api.start({
      rotationX: currentRotX + rotationX,
      rotationY: currentRotY + rotationY,
      config: { tension: 200, friction: 20 }, // Immediate response for dragging
    });
    
    console.log('🎯 New rotation from mouse:', currentRotX + rotationX, currentRotY + rotationY);
    
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
    const currentRotX = springs.rotationX.get();
    const currentRotY = springs.rotationY.get();
    
    api.start({
      rotationX: currentRotX + momentumY,
      rotationY: currentRotY + momentumX,
      config: { tension: 120, friction: 14 }, // Smooth deceleration
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
        
        switch (arrowKey) {
          case 'ArrowUp':
            api.start({
              rotationX: springs.rotationX.get() - radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
          case 'ArrowDown':
            api.start({
              rotationX: springs.rotationX.get() + radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
          case 'ArrowLeft':
            api.start({
              rotationY: springs.rotationY.get() - radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
          case 'ArrowRight':
            api.start({
              rotationY: springs.rotationY.get() + radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
        }
        
        console.log('🎯 New rotation:', springs.rotationX.get(), springs.rotationY.get(), springs.rotationZ.get());
        setTimeout(() => setIsRotating(false), 1000);
        return true; // Event handled
      }
      
      if (rotationKey) {
        console.log('🔄 Rotation key detected:', rotationKey);
        
        switch (rotationKey) {
          case 'q':
            api.start({
              rotationZ: springs.rotationZ.get() - radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
          case 'e':
            api.start({
              rotationZ: springs.rotationZ.get() + radians,
              config: { tension: 120, friction: 14 },
            });
            setIsRotating(true);
            break;
        }
        
        console.log('🎯 New rotation:', springs.rotationX.get(), springs.rotationY.get(), springs.rotationZ.get());
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
        api.start({
          rotationX: springs.rotationX.get() + radians,
          config: { tension: 120, friction: 14 },
        });
        break;
      case 'y':
        api.start({
          rotationY: springs.rotationY.get() + radians,
          config: { tension: 120, friction: 14 },
        });
        break;
      case 'z':
        api.start({
          rotationZ: springs.rotationZ.get() + radians,
          config: { tension: 120, friction: 14 },
        });
        break;
    }
    
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);
  };
  
  const reset = () => {
    api.start({
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      config: { tension: 120, friction: 14 },
    });
    setIsRotating(false);
  };
  
  return {
    rotation: [springs.rotationX, springs.rotationY, springs.rotationZ],
    isRotating,
    rotateTo,
    reset,
  };
};