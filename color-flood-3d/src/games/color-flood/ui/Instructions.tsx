import React, { useState } from 'react';

interface InstructionsProps {
  onClose?: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };
  
  // ESC key handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);
  
  if (!isVisible) {
    return (
      <button 
        className="help-button"
        onClick={() => setIsVisible(true)}
        title="Show Instructions"
      >
        ?
      </button>
    );
  }
  
  return (
    <div className="instructions-overlay">
      <div className="instructions-modal">
        <div className="instructions-header">
          <h2>🎲 Color Flood 3D</h2>
          <button 
            className="close-button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        
        <div className="instructions-content">
          <div className="goal">
            <h3>🎯 Goal</h3>
            <p>Capture the entire 3x3x3 cube by flooding into different colored regions!</p>
          </div>
          
          <div className="how-to-play">
            <h3>🎮 How Flood Fill Works</h3>
            <ol>
              <li><strong>Your Territory:</strong> You start controlling one corner (shown with white wireframes)</li>
              <li><strong>Choose a Target Color:</strong> Click any color from the palette to attack that color</li>
              <li><strong>Flood & Capture:</strong> Your territory expands to capture all adjacent cells of that target color</li>
              <li><strong>Convert to Your Color:</strong> Captured cells turn into your color and join your territory</li>
              <li><strong>Adjacent Rule:</strong> Only cells touching face-to-face count (not diagonal)</li>
              <li><strong>Win Condition:</strong> Capture the entire cube within the move limit!</li>
            </ol>
          </div>
          
          <div className="flood-strategy">
            <h3>🌊 Flood Fill Strategy</h3>
            <div className="strategy-tips">
              <p><strong>Think like conquest:</strong> You're capturing enemy territory by targeting their colors</p>
              <p><strong>Look for big targets:</strong> Target colors that have large connected regions adjacent to you</p>
              <p><strong>Plan your expansion:</strong> Consider which color will give you the most new territory</p>
              <p><strong>Use 3D thinking:</strong> Remember cells connect through all 6 faces of the cube</p>
            </div>
          </div>
          
          <div className="controls">
            <h3>🎛️ Controls</h3>
            <div className="control-grid">
              <div className="control-group">
                <h4>Cube Rotation</h4>
                <p><strong>Mouse/Touch:</strong> Drag to rotate</p>
                <p><strong>Arrow Keys:</strong> ← ↑ ↓ → to rotate</p>
                <p><strong>Q/E:</strong> Roll left/right</p>
              </div>
              
              <div className="control-group">
                <h4>Game Actions</h4>
                <p><strong>1-6 Keys:</strong> Select colors</p>
                <p><strong>U:</strong> Undo last move</p>
                <p><strong>R:</strong> Reset level</p>
              </div>
            </div>
          </div>
          
          <div className="tips">
            <h3>💡 Tips</h3>
            <ul>
              <li>Rotate the cube to see all sides</li>
              <li>Plan ahead - you have limited moves!</li>
              <li>White wireframes show your current region</li>
              <li>Try to create large connected regions</li>
            </ul>
          </div>
        </div>
        
        <div className="instructions-footer">
          <button 
            className="start-playing-button"
            onClick={handleClose}
          >
            Start Playing! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};