/**
 * Modal Component
 * 
 * Accessible modal dialog using Radix UI Dialog primitive.
 * Provides consistent styling and behavior for overlays.
 * 
 * @example
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalContent title="Confirm Action">
 *     <p>Are you sure you want to proceed?</p>
 *     <ModalFooter>
 *       <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary">Confirm</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * 
 * @potential-issue: Portal may cause issues with CSS modules
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../Button';
import styles from './Modal.module.css';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open?: boolean;
  
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Trigger element (for uncontrolled usage)
   */
  trigger?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  trigger,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      {children}
    </Dialog.Root>
  );
};

export interface ModalContentProps {
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal description
   */
  description?: string;
  
  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Modal body content
   */
  children: React.ReactNode;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  title,
  description,
  showCloseButton = true,
  size = 'medium',
  className,
  children,
}) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content 
        className={clsx(
          styles.content,
          styles[size],
          className
        )}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            <div>
              {title && (
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              )}
              {description && (
                <Dialog.Description className={styles.description}>
                  {description}
                </Dialog.Description>
              )}
            </div>
            
            {showCloseButton && (
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="small"
                  iconOnly
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  <X />
                </Button>
              </Dialog.Close>
            )}
          </div>
        )}
        
        <div className={styles.body}>
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export interface ModalFooterProps {
  /**
   * Footer content (usually buttons)
   */
  children: React.ReactNode;
  
  /**
   * Alignment of footer content
   * @default 'right'
   */
  align?: 'left' | 'center' | 'right' | 'space-between';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  align = 'right',
  className,
}) => {
  return (
    <div 
      className={clsx(
        styles.footer,
        styles[`align-${align}`],
        className
      )}
    >
      {children}
    </div>
  );
};

// Export types
export type { ModalProps, ModalContentProps, ModalFooterProps };