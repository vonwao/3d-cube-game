/**
 * Panel Component
 * 
 * A flexible container component with optional header, footer, and collapsible behavior.
 * Used as the base for cards, config panels, and other grouped content.
 * 
 * @example
 * <Panel title="Settings" collapsible>
 *   <SettingsForm />
 * </Panel>
 * 
 * @potential-issue: Collapse animation may cause layout shift
 * @deprecated: Consider using Radix UI Collapsible for better a11y
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './Panel.module.css';

export interface PanelProps {
  /**
   * Panel title displayed in header
   */
  title?: string;
  
  /**
   * Visual variant
   * @default 'glass'
   */
  variant?: 'glass' | 'elevated' | 'flat';
  
  /**
   * Whether the panel can be collapsed
   */
  collapsible?: boolean;
  
  /**
   * Controlled collapsed state
   */
  collapsed?: boolean;
  
  /**
   * Default collapsed state (uncontrolled)
   */
  defaultCollapsed?: boolean;
  
  /**
   * Callback when collapse state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  
  /**
   * Whether the panel is interactive (hover effects)
   */
  interactive?: boolean;
  
  /**
   * Click handler for interactive panels
   */
  onClick?: () => void;
  
  /**
   * Actions to display in the header
   */
  headerActions?: React.ReactNode;
  
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Content padding variant
   * @default 'normal'
   */
  padding?: 'none' | 'small' | 'normal';
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Panel content
   */
  children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  variant = 'glass',
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  interactive = false,
  onClick,
  headerActions,
  footer,
  padding = 'normal',
  loading = false,
  className,
  children,
}) => {
  // Handle controlled/uncontrolled collapse state
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;
  
  const handleToggleCollapse = useCallback(() => {
    if (!collapsible) return;
    
    const newValue = !isCollapsed;
    
    if (!isControlled) {
      setUncontrolledCollapsed(newValue);
    }
    
    onCollapsedChange?.(newValue);
  }, [collapsible, isCollapsed, isControlled, onCollapsedChange]);
  
  // Build className
  const panelClass = clsx(
    styles.panel,
    styles[variant],
    {
      [styles.interactive]: interactive,
      [styles.collapsed]: isCollapsed,
      [styles.loading]: loading,
      [styles.noPadding]: padding === 'none',
      [styles.smallPadding]: padding === 'small',
    },
    className
  );
  
  const hasHeader = title || headerActions || collapsible;
  const showContent = !isCollapsed || !collapsible;
  
  return (
    <div 
      className={panelClass}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {hasHeader && (
        <div className={clsx(styles.header, { [styles.headerOnly]: !showContent && !footer })}>
          {title && <h3 className={styles.title}>{title}</h3>}
          
          <div className={styles.headerActions}>
            {headerActions}
            
            {collapsible && (
              <button
                type="button"
                className={styles.collapseToggle}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent panel click when interactive
                  handleToggleCollapse();
                }}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <ChevronDown />
              </button>
            )}
          </div>
        </div>
      )}
      
      {showContent && children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
      
      {footer && !isCollapsed && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Component and types are exported inline above