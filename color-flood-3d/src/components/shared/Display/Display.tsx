/**
 * Display Component
 * 
 * Shows labeled values like scores, counters, stats, etc.
 * Supports icons, different layouts, and animated value changes.
 * 
 * @example
 * <Display label="Score" value={1234} icon={<Trophy />} />
 * <Display label="Moves" value={moveCount} variant="prominent" />
 * 
 * @potential-issue: Value animation may cause performance issues with rapid updates
 */

import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import styles from './Display.module.css';

export interface DisplayProps {
  /**
   * Display label
   */
  label?: string;
  
  /**
   * Display value
   */
  value: string | number;
  
  /**
   * Icon to show
   */
  icon?: React.ReactNode;
  
  /**
   * Layout direction
   * @default 'horizontal'
   */
  layout?: 'horizontal' | 'vertical';
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: 'default' | 'prominent' | 'minimal' | 'inline';
  
  /**
   * State variant for coloring
   */
  state?: 'success' | 'warning' | 'danger';
  
  /**
   * Whether to center align content
   */
  centered?: boolean;
  
  /**
   * Whether to use monospace font for value
   */
  mono?: boolean;
  
  /**
   * Whether to animate value changes
   */
  animateChange?: boolean;
  
  /**
   * Whether to use responsive layout
   */
  responsive?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Display: React.FC<DisplayProps> = ({
  label,
  value,
  icon,
  layout = 'horizontal',
  size = 'medium',
  variant = 'default',
  state,
  centered = false,
  mono = false,
  animateChange = false,
  responsive = false,
  className,
}) => {
  const prevValueRef = useRef(value);
  const valueRef = useRef<HTMLSpanElement>(null);
  
  // Trigger animation on value change
  useEffect(() => {
    if (animateChange && prevValueRef.current !== value && valueRef.current) {
      // Remove and re-add animation class to retrigger
      valueRef.current.classList.remove(styles.animateChange);
      void valueRef.current.offsetWidth; // Force reflow
      valueRef.current.classList.add(styles.animateChange);
    }
    prevValueRef.current = value;
  }, [value, animateChange]);
  
  // Build className
  const displayClass = clsx(
    styles.display,
    styles[layout],
    styles[size],
    variant !== 'default' && styles[variant],
    state && styles[state],
    {
      [styles.centered]: centered,
      [styles.mono]: mono,
      [styles.responsive]: responsive,
    },
    className
  );
  
  return (
    <div className={displayClass}>
      {icon && <span className={styles.icon}>{icon}</span>}
      
      <div className={styles.content}>
        {label && <span className={styles.label}>{label}</span>}
        <span 
          ref={valueRef} 
          className={styles.value}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

// Component and types are exported inline above