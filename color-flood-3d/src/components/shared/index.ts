/**
 * Shared Components Barrel Export
 * 
 * Central export point for all shared components.
 * Enables clean imports throughout the application.
 * 
 * @example
 * import { Button, Panel, Card } from '@/components/shared';
 * 
 * @deprecated Consider using direct imports for better tree-shaking
 */

// Core UI Components
export { Button } from './Button';
export { Panel } from './Panel';
export { Card } from './Card';
export { Modal, ModalContent, ModalFooter } from './Modal';
export { Display } from './Display';
export { ButtonGroup } from './ButtonGroup';

// Export types
export type { ButtonProps } from './Button';
export type { PanelProps } from './Panel';
export type { CardProps } from './Card';
export type { ModalProps, ModalContentProps, ModalFooterProps } from './Modal';
export type { DisplayProps } from './Display';
export type { ButtonGroupProps, ButtonGroupItemProps } from './ButtonGroup';