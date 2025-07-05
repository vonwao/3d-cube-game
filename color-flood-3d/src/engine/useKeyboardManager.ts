import { useEffect, useRef } from 'react';

export type KeyboardHandler = (event: KeyboardEvent) => boolean; // Return true if handled

interface KeyboardManagerConfig {
  enabled?: boolean;
  priority?: number; // Higher priority handlers run first
}

class KeyboardManager {
  private handlers: Array<{ handler: KeyboardHandler; priority: number; id: string }> = [];
  private isSetup = false;

  setup() {
    if (this.isSetup) return;
    
    window.addEventListener('keydown', this.handleKeyDown);
    this.isSetup = true;
  }

  cleanup() {
    if (!this.isSetup) return;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    this.isSetup = false;
    this.handlers = [];
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Sort handlers by priority (higher priority first)
    const sortedHandlers = [...this.handlers].sort((a, b) => b.priority - a.priority);
    
    for (const { handler } of sortedHandlers) {
      try {
        const handled = handler(event);
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      } catch (error) {
        console.error('Keyboard handler error:', error);
      }
    }
  };

  addHandler(handler: KeyboardHandler, priority: number, id: string) {
    // Remove existing handler with same ID
    this.removeHandler(id);
    
    this.handlers.push({ handler, priority, id });
    this.setup();
  }

  removeHandler(id: string) {
    this.handlers = this.handlers.filter(h => h.id !== id);
    
    if (this.handlers.length === 0) {
      this.cleanup();
    }
  }
}

const keyboardManager = new KeyboardManager();

export const useKeyboardManager = (
  handler: KeyboardHandler,
  config: KeyboardManagerConfig = {}
) => {
  const { enabled = true, priority = 0 } = config;
  const handlerRef = useRef(handler);
  const idRef = useRef(Math.random().toString(36).substr(2, 9));

  // Update handler ref when handler changes
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const wrappedHandler: KeyboardHandler = (event) => {
      return handlerRef.current(event);
    };

    keyboardManager.addHandler(wrappedHandler, priority, idRef.current);

    return () => {
      keyboardManager.removeHandler(idRef.current);
    };
  }, [enabled, priority]);
};

// Predefined key checkers for common patterns
export const isColorKey = (key: string): number | null => {
  if (key >= '1' && key <= '6') {
    return parseInt(key) - 1;
  }
  return null;
};

export const isArrowKey = (key: string): string | null => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    return key;
  }
  return null;
};

export const isRotationKey = (key: string): string | null => {
  if (['q', 'Q', 'e', 'E'].includes(key)) {
    return key.toLowerCase();
  }
  return null;
};

export const isActionKey = (key: string): string | null => {
  if (['u', 'U', 'r', 'R'].includes(key)) {
    return key.toLowerCase();
  }
  return null;
};