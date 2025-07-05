import { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export type EasingFunction = (t: number) => number;

// Common easing functions
export const easing = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 + (--t) * t * t,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const p = 0.3;
    const s = p / 4;
    return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
  }
};

interface AnimationConfig {
  duration: number; // in milliseconds
  easing?: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

interface AnimationState {
  isAnimating: boolean;
  progress: number;
  startTime: number | null;
}

export const useAnimation = (config: AnimationConfig = { duration: 1000 }) => {
  const {
    duration,
    easing: easingFn = easing.easeInOut,
    delay = 0,
    onComplete,
    onUpdate
  } = config;

  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    startTime: null
  });

  const onCompleteRef = useRef(onComplete);
  const onUpdateRef = useRef(onUpdate);
  
  // Update refs when callbacks change
  onCompleteRef.current = onComplete;
  onUpdateRef.current = onUpdate;

  const start = useCallback(() => {
    setState({
      isAnimating: true,
      progress: 0,
      startTime: null // Will be set on first frame
    });
  }, []);

  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAnimating: false,
      startTime: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isAnimating: false,
      progress: 0,
      startTime: null
    });
  }, []);

  useFrame(() => {
    if (!state.isAnimating) return;

    const now = performance.now();
    
    // Set start time on first frame
    if (state.startTime === null) {
      setState(prev => ({
        ...prev,
        startTime: now + delay
      }));
      return;
    }

    // Check if we're still in delay period
    if (now < state.startTime) {
      return;
    }

    const elapsed = now - state.startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(rawProgress);

    setState(prev => ({
      ...prev,
      progress: easedProgress
    }));

    // Call update callback
    if (onUpdateRef.current) {
      onUpdateRef.current(easedProgress);
    }

    // Check if animation is complete
    if (rawProgress >= 1) {
      setState(prev => ({
        ...prev,
        isAnimating: false,
        progress: 1
      }));

      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  });

  return {
    ...state,
    start,
    stop,
    reset
  };
};

// Hook for animating between two values
export const useAnimatedValue = <T extends number | number[]>(
  from: T,
  to: T,
  config: AnimationConfig = { duration: 1000 }
): [T, () => void, boolean] => {
  const animation = useAnimation(config);
  
  const interpolate = useCallback((progress: number): T => {
    if (typeof from === 'number' && typeof to === 'number') {
      return (from + (to - from) * progress) as T;
    }
    
    if (Array.isArray(from) && Array.isArray(to)) {
      return from.map((fromVal, i) => 
        fromVal + (to[i] - fromVal) * progress
      ) as T;
    }
    
    return from;
  }, [from, to]);

  const currentValue = interpolate(animation.progress);
  
  return [currentValue, animation.start, animation.isAnimating];
};

// Spring animation for more natural movement
interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  precision?: number;
  onComplete?: () => void;
}

export const useSpring = (
  target: number,
  config: SpringConfig = {}
) => {
  const {
    tension = 170,
    friction = 26,
    mass = 1,
    precision = 0.01,
    onComplete
  } = config;

  const [value, setValue] = useState(target);
  const velocity = useRef(0);
  const lastTime = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  onCompleteRef.current = onComplete;

  useFrame(() => {
    const now = performance.now();
    
    if (lastTime.current === null) {
      lastTime.current = now;
      return;
    }

    const deltaTime = (now - lastTime.current) / 1000; // Convert to seconds
    lastTime.current = now;

    const force = -tension * (value - target);
    const damping = -friction * velocity.current;
    const acceleration = (force + damping) / mass;

    velocity.current += acceleration * deltaTime;
    const newValue = value + velocity.current * deltaTime;

    setValue(newValue);

    // Check if spring has settled
    const isSettled = Math.abs(newValue - target) < precision && Math.abs(velocity.current) < precision;
    
    if (isSettled && onCompleteRef.current) {
      onCompleteRef.current();
    }
  });

  return value;
};