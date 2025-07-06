import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useKeyboardManager, isColorKey, isArrowKey, isRotationKey, isActionKey, type KeyboardHandler } from '../useKeyboardManager';

describe('useKeyboardManager', () => {
  let mockAddEventListener: jest.MockedFunction<typeof window.addEventListener>;
  let mockRemoveEventListener: jest.MockedFunction<typeof window.removeEventListener>;
  
  beforeEach(() => {
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();
    
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add and remove event listeners correctly', () => {
    const handler = jest.fn().mockReturnValue(false) as KeyboardHandler;
    
    const { unmount } = renderHook(() => 
      useKeyboardManager(handler, { enabled: true, priority: 10 })
    );
    
    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('should not add listeners when disabled', () => {
    const handler = jest.fn().mockReturnValue(false) as KeyboardHandler;
    
    renderHook(() => 
      useKeyboardManager(handler, { enabled: false, priority: 10 })
    );
    
    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  test('should handle priority correctly', () => {
    const highPriorityHandler = jest.fn().mockReturnValue(true) as KeyboardHandler;
    const lowPriorityHandler = jest.fn().mockReturnValue(true) as KeyboardHandler;
    
    const { unmount: unmount1 } = renderHook(() => 
      useKeyboardManager(highPriorityHandler, { priority: 20 })
    );
    
    const { unmount: unmount2 } = renderHook(() => 
      useKeyboardManager(lowPriorityHandler, { priority: 10 })
    );
    
    // Simulate keydown event
    const event = new KeyboardEvent('keydown', { key: '1' });
    const addEventListenerCall = mockAddEventListener.mock.calls[0];
    const keydownHandler = addEventListenerCall[1] as (event: KeyboardEvent) => void;
    
    keydownHandler(event);
    
    expect(highPriorityHandler as any).toHaveBeenCalledWith(event);
    expect(lowPriorityHandler as any).not.toHaveBeenCalled(); // Should not be called because high priority handled it
    
    unmount1();
    unmount2();
  });
});

describe('Key Detection Functions', () => {
  describe('isColorKey', () => {
    test('should detect color keys 1-6', () => {
      expect(isColorKey('1')).toBe(0);
      expect(isColorKey('2')).toBe(1);
      expect(isColorKey('3')).toBe(2);
      expect(isColorKey('4')).toBe(3);
      expect(isColorKey('5')).toBe(4);
      expect(isColorKey('6')).toBe(5);
    });
    
    test('should return null for non-color keys', () => {
      expect(isColorKey('0')).toBe(null);
      expect(isColorKey('7')).toBe(null);
      expect(isColorKey('a')).toBe(null);
      expect(isColorKey('ArrowUp')).toBe(null);
    });
  });
  
  describe('isArrowKey', () => {
    test('should detect arrow keys', () => {
      expect(isArrowKey('ArrowUp')).toBe('ArrowUp');
      expect(isArrowKey('ArrowDown')).toBe('ArrowDown');
      expect(isArrowKey('ArrowLeft')).toBe('ArrowLeft');
      expect(isArrowKey('ArrowRight')).toBe('ArrowRight');
    });
    
    test('should return null for non-arrow keys', () => {
      expect(isArrowKey('1')).toBe(null);
      expect(isArrowKey('q')).toBe(null);
      expect(isArrowKey('Space')).toBe(null);
    });
  });
  
  describe('isRotationKey', () => {
    test('should detect rotation keys q/Q and e/E', () => {
      expect(isRotationKey('q')).toBe('q');
      expect(isRotationKey('Q')).toBe('q');
      expect(isRotationKey('e')).toBe('e');
      expect(isRotationKey('E')).toBe('e');
    });
    
    test('should return null for non-rotation keys', () => {
      expect(isRotationKey('1')).toBe(null);
      expect(isRotationKey('ArrowUp')).toBe(null);
      expect(isRotationKey('w')).toBe(null);
    });
  });
  
  describe('isActionKey', () => {
    test('should detect action keys u/U and r/R', () => {
      expect(isActionKey('u')).toBe('u');
      expect(isActionKey('U')).toBe('u');
      expect(isActionKey('r')).toBe('r');
      expect(isActionKey('R')).toBe('r');
    });
    
    test('should return null for non-action keys', () => {
      expect(isActionKey('1')).toBe(null);
      expect(isActionKey('q')).toBe(null);
      expect(isActionKey('Space')).toBe(null);
    });
  });
});