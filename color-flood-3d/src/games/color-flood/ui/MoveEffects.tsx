import React, { useEffect, useState } from 'react';
import { useCubeState, useSelectedColor, useCurrentPalette, useAnimationProgress } from '../logic/simpleGameStore';

interface FloatingNumber {
  id: string;
  value: number;
  color: string;
  startTime: number;
  duration: number;
}

interface PulseEffect {
  id: string;
  color: string;
  startTime: number;
  duration: number;
}

export const MoveEffects: React.FC = () => {
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [pulseEffects, setPulseEffects] = useState<PulseEffect[]>([]);
  const [lastFloodSize, setLastFloodSize] = useState(0);
  const cubeState = useCubeState();
  const selectedColor = useSelectedColor();
  const palette = useCurrentPalette();
  const animationProgress = useAnimationProgress();

  useEffect(() => {
    const currentFloodSize = cubeState.floodRegion.length;
    const expansion = currentFloodSize - lastFloodSize;
    
    if (expansion > 0 && selectedColor !== null && animationProgress > 0.5) {
      const colorHex = palette.colors[selectedColor];
      
      // Add floating number effect
      const floatingNumber: FloatingNumber = {
        id: `float-${Date.now()}`,
        value: expansion,
        color: colorHex,
        startTime: Date.now(),
        duration: 2000,
      };
      
      setFloatingNumbers(prev => [...prev, floatingNumber]);
      
      // Add pulse effect for large expansions
      if (expansion >= 5) {
        const pulseEffect: PulseEffect = {
          id: `pulse-${Date.now()}`,
          color: colorHex,
          startTime: Date.now(),
          duration: 1000,
        };
        
        setPulseEffects(prev => [...prev, pulseEffect]);
      }
      
      // Clean up after animation
      setTimeout(() => {
        setFloatingNumbers(prev => prev.filter(fn => fn.id !== floatingNumber.id));
      }, floatingNumber.duration);
      
      if (expansion >= 5) {
        setTimeout(() => {
          setPulseEffects(prev => prev.filter(pe => pe.id !== `pulse-${Date.now()}`));
        }, 1000);
      }
    }
    
    setLastFloodSize(currentFloodSize);
  }, [cubeState.floodRegion.length, selectedColor, palette.colors, animationProgress, lastFloodSize]);

  const now = Date.now();

  return (
    <div className="move-effects">
      {/* Floating Numbers */}
      {floatingNumbers.map(fn => {
        const elapsed = now - fn.startTime;
        const progress = Math.min(elapsed / fn.duration, 1);
        const opacity = 1 - progress;
        const translateY = -progress * 50;
        const scale = 1 + progress * 0.5;
        
        return (
          <div
            key={fn.id}
            className="floating-number"
            style={{
              color: fn.color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              fontSize: fn.value >= 8 ? '2rem' : '1.5rem',
              fontWeight: fn.value >= 8 ? 'bold' : 'normal',
            }}
          >
            +{fn.value}
          </div>
        );
      })}
      
      {/* Pulse Effects */}
      {pulseEffects.map(pe => {
        const elapsed = now - pe.startTime;
        const progress = Math.min(elapsed / pe.duration, 1);
        const scale = 1 + progress * 2;
        const opacity = 1 - progress;
        
        return (
          <div
            key={pe.id}
            className="pulse-effect"
            style={{
              borderColor: pe.color,
              opacity,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </div>
  );
};