import { useRef, useEffect, useState, useCallback } from 'react';
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
  const [hasMoved, setHasMoved] = useState(false);
  const [pointerDown, setPointerDown] = useState(false);
  const [startPointer, setStartPointer] = useState(new Vector2());
  
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
  
  const setTargetRotation = (newTarget: { x: number, y: number, z: number }) => {
    targetRotation.current = newTarget;
  };
  
  
  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!enableMouse && event.pointerType === 'mouse') return;
    if (!enableTouch && event.pointerType === 'touch') return;
    
    // Store initial position but don't start dragging yet
    lastPointer.current.set(event.clientX, event.clientY);
    startPointer.set(event.clientX, event.clientY);
    velocity.current.set(0, 0);
    
    // Set a flag that we're ready to start dragging (but not dragging yet)
    setPointerDown(true);
  }, [enableMouse, enableTouch]);
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    // Only process if pointer is down
    if (!pointerDown) return;
    
    const deltaX = event.clientX - lastPointer.current.x;
    const deltaY = event.clientY - lastPointer.current.y;
    
    // Check if user has moved enough to consider it a drag (not a click)
    const totalDelta = Math.abs(event.clientX - startPointer.x) + Math.abs(event.clientY - startPointer.y);
    
    // Start dragging only after significant movement AND pointer is down
    if (!isDragging && totalDelta > 5) {
      setIsDragging(true);
      setHasMoved(true);
      // Now capture the pointer for smooth dragging
      gl.domElement.setPointerCapture(event.pointerId);
    }
    
    // Only rotate if actually dragging
    if (isDragging) {
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
      
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        setIsRotating(true);
      }
      
      event.preventDefault();
    }
    
    lastPointer.current.set(event.clientX, event.clientY);
  }, [pointerDown, isDragging, rotationSpeed, gl.domElement]);
  
  const handlePointerUp = useCallback((event: PointerEvent) => {
    // Reset all states
    setPointerDown(false);
    setIsDragging(false);
    setHasMoved(false);
    
    // Only release capture if we had it
    if (isDragging && hasMoved) {
      gl.domElement.releasePointerCapture(event.pointerId);
      
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
      
      setTimeout(() => setIsRotating(false), 800);
      event.preventDefault();
    }
  }, [isDragging, hasMoved, gl.domElement]);
  
  // Keyboard handler using the centralized keyboard manager
  useKeyboardManager(
    (event: KeyboardEvent) => {
      if (!enableKeyboard) return false;
      
      const radians = (keyboardSpeed * Math.PI) / 180;
      const arrowKey = isArrowKey(event.key);
      const rotationKey = isRotationKey(event.key);
      
      if (arrowKey) {
        switch (arrowKey) {
          case 'ArrowUp':
            targetRotation.current.x -= radians;
            break;
          case 'ArrowDown':
            targetRotation.current.x += radians;
            break;
          case 'ArrowLeft':
            targetRotation.current.y -= radians;
            break;
          case 'ArrowRight':
            targetRotation.current.y += radians;
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
      
      if (rotationKey) {
        
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
    
    // Add touch event listeners to prevent page scrolling during rotation
    const handleTouchStart = (e: TouchEvent) => {
      if (enableTouch) {
        e.preventDefault();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (enableTouch && isDragging) {
        e.preventDefault();
      }
    };
    
    // Reset state when window loses focus (e.g., clicking menu)
    const handleWindowBlur = () => {
      setPointerDown(false);
      setIsDragging(false);
      setHasMoved(false);
    };
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handleWindowBlur);
    
    // Add touch-specific event listeners to prevent scrolling
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl.domElement, enableMouse, enableTouch, handlePointerDown, handlePointerMove, handlePointerUp, isDragging]);
  
  
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