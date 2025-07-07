import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useIsExploded, useExplosionProgress, useSimpleGameStore } from '../logic/simpleGameStore';

export const useExplosionAnimation = () => {
  const isExploded = useIsExploded();
  const explosionProgress = useExplosionProgress();
  const animationStartTime = useRef<number | null>(null);
  const targetProgress = useRef(0);
  
  useEffect(() => {
    // Set target based on exploded state
    targetProgress.current = isExploded ? 1 : 0;
    animationStartTime.current = performance.now();
  }, [isExploded]);
  
  useFrame(() => {
    if (animationStartTime.current === null) return;
    
    const currentProgress = explosionProgress;
    const target = targetProgress.current;
    
    // If we're at the target, no need to animate
    if (Math.abs(currentProgress - target) < 0.001) {
      animationStartTime.current = null;
      return;
    }
    
    // Smooth animation with easing
    const elapsed = performance.now() - animationStartTime.current;
    const duration = 600; // 600ms animation
    const t = Math.min(elapsed / duration, 1);
    
    // Ease in-out cubic
    const eased = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const newProgress = currentProgress + (target - currentProgress) * eased * 0.15;
    
    useSimpleGameStore.getState().setExplosionProgress(newProgress);
  });
};