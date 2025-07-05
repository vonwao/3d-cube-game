import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimpleGameStore, useIsAnimating, useAnimationConfig, useAnimationStartTime } from '../logic/simpleGameStore';

/**
 * Hook that manages the game's animation loop.
 * This should be used in a component that's inside the Canvas (has access to useFrame).
 */
export const useGameAnimation = () => {
  const isAnimating = useIsAnimating();
  const animationConfig = useAnimationConfig();
  const animationStartTime = useAnimationStartTime();

  useFrame(() => {
    if (!isAnimating || !animationStartTime || !animationConfig.enabled) {
      return;
    }

    const now = performance.now();
    const elapsed = now - animationStartTime;
    const duration = animationConfig.moveAnimation.duration;
    
    // Calculate raw progress (0 to 1)
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Apply easing function
    const easedProgress = animationConfig.moveAnimation.easing(rawProgress);
    
    // Update the store with current progress
    useSimpleGameStore.getState().updateAnimationProgress(easedProgress);
  });

  return {
    isAnimating,
    animationConfig
  };
};

/**
 * Hook for components outside the Canvas that need to react to animation state.
 * This version uses useEffect with requestAnimationFrame instead of useFrame.
 */
export const useGameAnimationExternal = () => {
  const isAnimating = useIsAnimating();
  const animationConfig = useAnimationConfig();
  const animationStartTime = useAnimationStartTime();

  useEffect(() => {
    if (!isAnimating || !animationStartTime || !animationConfig.enabled) {
      return;
    }

    let animationFrameId: number;

    const updateAnimation = () => {
      const now = performance.now();
      const elapsed = now - animationStartTime;
      const duration = animationConfig.moveAnimation.duration;
      
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = animationConfig.moveAnimation.easing(rawProgress);
      
      useSimpleGameStore.getState().updateAnimationProgress(easedProgress);
      
      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(updateAnimation);
      }
    };

    animationFrameId = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAnimating, animationStartTime, animationConfig]);

  return {
    isAnimating,
    animationConfig
  };
};