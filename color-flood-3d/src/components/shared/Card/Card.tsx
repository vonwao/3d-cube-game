/**
 * Card Component
 * 
 * Interactive card for displaying selectable items like levels, patterns, etc.
 * Provides consistent hover effects and selection states.
 * 
 * @example
 * <Card
 *   title="Level 1"
 *   subtitle="Beginner"
 *   selected={selectedLevel === 1}
 *   onClick={() => selectLevel(1)}
 * >
 *   <p>Complete in 3 moves</p>
 * </Card>
 * 
 * @potential-issue: No keyboard navigation between cards yet
 */

import React from 'react';
import { clsx } from 'clsx';
import styles from './Card.module.css';

export interface CardProps {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Subtitle or category
   */
  subtitle?: string;
  
  /**
   * Badge content (e.g., "NEW", "PRO", star rating)
   */
  badge?: React.ReactNode;
  
  /**
   * Main card content
   */
  children?: React.ReactNode;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Meta information items
   */
  meta?: Array<{
    icon?: React.ReactNode;
    label: string;
    value: string | number;
  }>;
  
  /**
   * Header image URL
   */
  image?: string;
  
  /**
   * Icon element (alternative to image)
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the card is selected
   */
  selected?: boolean;
  
  /**
   * Whether the card is disabled
   */
  disabled?: boolean;
  
  /**
   * Layout variant
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal';
  
  /**
   * Size variant
   * @default 'normal'
   */
  size?: 'normal' | 'compact';
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  badge,
  children,
  description,
  meta,
  image,
  icon,
  selected = false,
  disabled = false,
  layout = 'vertical',
  size = 'normal',
  onClick,
  className,
}) => {
  // Build className
  const cardClass = clsx(
    styles.card,
    {
      [styles.selected]: selected,
      [styles.disabled]: disabled,
      [styles.horizontal]: layout === 'horizontal',
      [styles.compact]: size === 'compact',
    },
    className
  );
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <div
      className={cardClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      {image && (
        <img 
          src={image} 
          alt={title || 'Card image'} 
          className={styles.image}
        />
      )}
      
      {(title || subtitle || badge || icon) && (
        <div className={styles.header}>
          {icon && <div className={styles.icon}>{icon}</div>}
          
          <div style={{ flex: 1 }}>
            {title && <h4 className={styles.title}>{title}</h4>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          
          {badge && <div className={styles.badge}>{badge}</div>}
        </div>
      )}
      
      <div className={styles.content}>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        {children}
        
        {meta && meta.length > 0 && (
          <div className={styles.meta}>
            {meta.map((item, index) => (
              <div key={index} className={styles.metaItem}>
                {item.icon}
                <span>{item.label}:</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export types
export type { CardProps };