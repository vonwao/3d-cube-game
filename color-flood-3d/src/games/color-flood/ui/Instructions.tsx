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
            <p>Make the entire 3x3x3 cube the same color by strategically expanding your flood region!</p>
          </div>
          
          <div className="how-to-play">
            <h3>🎮 How Flood Fill Works</h3>
            <ol>
              <li><strong>Your Territory:</strong> You start controlling one corner cell (shown with white wireframes)</li>
              <li><strong>Choose a Color:</strong> Click any color from the palette below the cube</li>
              <li><strong>Flood Expansion:</strong> Your region changes to that color AND expands to capture any adjacent cells that already have that color</li>
              <li><strong>Adjacent Cells:</strong> Only cells touching face-to-face count (not diagonal or corner-touching)</li>
              <li><strong>Strategy:</strong> Look for colors that will give you the biggest expansion - plan your path to victory!</li>
              <li><strong>Win Condition:</strong> Flood the entire cube within the move limit for maximum stars!</li>
            </ol>
          </div>
          
          <div className="flood-strategy">
            <h3>🌊 Flood Fill Strategy</h3>
            <div className="strategy-tips">
              <p><strong>Think like water:</strong> Your color "flows" through connected cells of the same color</p>
              <p><strong>Look for clusters:</strong> Target colors that form large connected regions</p>
              <p><strong>Plan your path:</strong> Consider which colors will give you the biggest expansion</p>
              <p><strong>Use the 3D space:</strong> Remember cells connect through all 6 faces of the cube</p>
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