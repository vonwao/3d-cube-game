/**
 * Button Component
 * 
 * A reusable button component with multiple variants and sizes.
 * Supports icons, loading states, and full keyboard accessibility.
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>Click me</Button>
 * <Button variant="glass" size="small" icon={<Settings />}>Settings</Button>
 * 
 * @potential-issue: The component doesn't support ref forwarding yet
 * @deprecated: Consider migrating to Radix UI Button primitive for better a11y
 */

import React from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Icon element to display
   * @deprecated Use leftIcon or rightIcon for better control
   */
  icon?: React.ReactNode;
  
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Whether the button should take full width of its container
   */
  fullWidth?: boolean;
  
  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean;
  
  /**
   * Whether this is an icon-only button (affects padding)
   */
  iconOnly?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button content
   */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  iconOnly = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) => {
  // Determine if button should be treated as icon-only
  const isIconOnly = iconOnly || (icon && !children && !leftIcon && !rightIcon);
  
  // Build className
  const buttonClass = clsx(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: loading,
      [styles.iconOnly]: isIconOnly,
    },
    className
  );
  
  // Handle deprecated icon prop
  const deprecatedIcon = icon && !leftIcon && !rightIcon ? icon : null;
  
  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner is handled by CSS */}
      {!loading && (
        <>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          {deprecatedIcon && <span className={styles.icon}>{deprecatedIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

// Component and types are exported inline above