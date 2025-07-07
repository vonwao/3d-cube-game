import React, { useCallback } from 'react';
import { useShowDpad, useSimpleGameStore } from '../logic/simpleGameStore';

export const DpadControls: React.FC = () => {
  const showDpad = useShowDpad();

  // Rotation handlers that dispatch keyboard events
  const handleRotateUp = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  }, []);

  const handleRotateDown = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
  }, []);

  const handleRotateLeft = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  }, []);

  const handleRotateRight = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  }, []);

  const handleZoomIn = useCallback(() => {
    useSimpleGameStore.getState().zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    useSimpleGameStore.getState().zoomOut();
  }, []);

  if (!showDpad) return null;

  return (
    <div className="dpad-controls">
      <button
        className="dpad-button dpad-up"
        onClick={handleRotateUp}
        title="Rotate up (↑)"
      >
        ↑
      </button>
      <div className="dpad-horizontal">
        <button
          className="dpad-button dpad-left"
          onClick={handleRotateLeft}
          title="Rotate left (←)"
        >
          ←
        </button>
        <button
          className="dpad-button dpad-center"
          disabled
        >
          ●
        </button>
        <button
          className="dpad-button dpad-right"
          onClick={handleRotateRight}
          title="Rotate right (→)"
        >
          →
        </button>
      </div>
      <div className="dpad-zoom-row">
        <button
          className="dpad-button dpad-zoom"
          onClick={handleZoomOut}
          title="Zoom out (-)"
        >
          −
        </button>
        <button
          className="dpad-button dpad-down"
          onClick={handleRotateDown}
          title="Rotate down (↓)"
        >
          ↓
        </button>
        <button
          className="dpad-button dpad-zoom"
          onClick={handleZoomIn}
          title="Zoom in (+)"
        >
          +
        </button>
      </div>
    </div>
  );
};