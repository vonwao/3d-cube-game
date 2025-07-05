import { easing, type EasingFunction } from '../../../engine/useAnimation';

export interface AnimationConfig {
  // Move animation settings
  moveAnimation: {
    duration: number;
    easing: EasingFunction;
    stagger: number; // Delay between each cell animation in ms
  };
  
  // Color transition settings
  colorTransition: {
    duration: number;
    easing: EasingFunction;
  };
  
  // Scale animation for feedback
  scaleAnimation: {
    duration: number;
    easing: EasingFunction;
    maxScale: number;
  };
  
  // Win animation
  winAnimation: {
    duration: number;
    easing: EasingFunction;
    bounceHeight: number;
  };
  
  // Global animation toggle
  enabled: boolean;
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  moveAnimation: {
    duration: 800, // Slower to see the flood fill process
    easing: easing.easeOutCubic,
    stagger: 50 // Each cell animates 50ms after the previous
  },
  
  colorTransition: {
    duration: 300,
    easing: easing.easeInOut
  },
  
  scaleAnimation: {
    duration: 200,
    easing: easing.easeOut,
    maxScale: 1.1
  },
  
  winAnimation: {
    duration: 1000,
    easing: easing.bounce,
    bounceHeight: 0.5
  },
  
  enabled: true
};

// Preset configurations for different preferences
export const ANIMATION_PRESETS = {
  disabled: {
    ...DEFAULT_ANIMATION_CONFIG,
    enabled: false
  },
  
  fast: {
    ...DEFAULT_ANIMATION_CONFIG,
    moveAnimation: {
      ...DEFAULT_ANIMATION_CONFIG.moveAnimation,
      duration: 300,
      stagger: 20
    },
    colorTransition: {
      ...DEFAULT_ANIMATION_CONFIG.colorTransition,
      duration: 150
    }
  },
  
  slow: {
    ...DEFAULT_ANIMATION_CONFIG,
    moveAnimation: {
      ...DEFAULT_ANIMATION_CONFIG.moveAnimation,
      duration: 1200,
      stagger: 100
    },
    colorTransition: {
      ...DEFAULT_ANIMATION_CONFIG.colorTransition,
      duration: 500
    }
  },
  
  minimal: {
    ...DEFAULT_ANIMATION_CONFIG,
    moveAnimation: {
      duration: 400,
      easing: easing.linear,
      stagger: 0
    },
    colorTransition: {
      duration: 200,
      easing: easing.linear
    },
    scaleAnimation: {
      duration: 100,
      easing: easing.linear,
      maxScale: 1.05
    }
  }
} as const;

export type AnimationPreset = keyof typeof ANIMATION_PRESETS;