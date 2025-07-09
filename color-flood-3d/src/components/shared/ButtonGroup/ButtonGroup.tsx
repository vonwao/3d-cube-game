/**
 * ButtonGroup Component
 * 
 * Groups related buttons together, typically for single or multi-selection.
 * Handles visual grouping and selection state management.
 * 
 * @example
 * // Single selection (radio-like)
 * <ButtonGroup
 *   value={selectedSize}
 *   onValueChange={setSelectedSize}
 * >
 *   <ButtonGroup.Item value="small">S</ButtonGroup.Item>
 *   <ButtonGroup.Item value="medium">M</ButtonGroup.Item>
 *   <ButtonGroup.Item value="large">L</ButtonGroup.Item>
 * </ButtonGroup>
 * 
 * @potential-issue: Consider migrating to Radix UI ToggleGroup for better a11y
 */

import React, { createContext, useContext, useCallback } from 'react';
import { clsx } from 'clsx';
import { Button, ButtonProps } from '../Button';
import styles from './ButtonGroup.module.css';

interface ButtonGroupContextValue {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue>({});

export interface ButtonGroupProps {
  /**
   * Current value(s)
   */
  value?: string | string[];
  
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | string[]) => void;
  
  /**
   * Whether multiple items can be selected
   */
  multiple?: boolean;
  
  /**
   * Orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Style variant
   * @default 'default'
   */
  variant?: 'default' | 'filled' | 'minimal';
  
  /**
   * Whether to take full width
   */
  fullWidth?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button items
   */
  children: React.ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroupProps> & {
  Item: typeof ButtonGroupItem;
} = ({
  value,
  onValueChange,
  multiple = false,
  orientation = 'horizontal',
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  className,
  children,
}) => {
  const contextValue: ButtonGroupContextValue = {
    value,
    onValueChange,
    multiple,
  };
  
  // Build className
  const groupClass = clsx(
    styles.buttonGroup,
    orientation === 'vertical' && styles.vertical,
    styles[size],
    variant !== 'default' && styles[variant],
    {
      [styles.fullWidth]: fullWidth,
    },
    className
  );
  
  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <div 
        className={groupClass}
        role={multiple ? 'group' : 'radiogroup'}
        aria-orientation={orientation}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

export interface ButtonGroupItemProps extends Omit<ButtonProps, 'variant'> {
  /**
   * Value for this item
   */
  value: string;
}

const ButtonGroupItem: React.FC<ButtonGroupItemProps> = ({
  value,
  onClick,
  className,
  ...props
}) => {
  const context = useContext(ButtonGroupContext);
  
  const isSelected = context.multiple
    ? Array.isArray(context.value) && context.value.includes(value)
    : context.value === value;
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    
    if (context.onValueChange) {
      if (context.multiple && Array.isArray(context.value)) {
        // Multi-select toggle
        const newValue = isSelected
          ? context.value.filter(v => v !== value)
          : [...context.value, value];
        context.onValueChange(newValue);
      } else {
        // Single select
        context.onValueChange(value);
      }
    }
  }, [context, value, isSelected, onClick]);
  
  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={clsx(isSelected && styles.selected, className)}
      aria-pressed={isSelected}
      role={context.multiple ? 'checkbox' : 'radio'}
      aria-checked={isSelected}
      {...props}
    />
  );
};

// Attach Item component
ButtonGroup.Item = ButtonGroupItem;

// Export types
export type { ButtonGroupProps, ButtonGroupItemProps };