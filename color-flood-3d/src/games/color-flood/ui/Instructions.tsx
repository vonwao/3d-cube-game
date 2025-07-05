import React, { useState } from 'react';

export const Instructions: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
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
            onClick={() => setIsVisible(false)}
          >
            ×
          </button>
        </div>
        
        <div className="instructions-content">
          <div className="goal">
            <h3>🎯 Goal</h3>
            <p>Make the entire cube the same color by expanding your region!</p>
          </div>
          
          <div className="how-to-play">
            <h3>🎮 How to Play</h3>
            <ol>
              <li><strong>Start:</strong> You control the region shown with white wireframes</li>
              <li><strong>Choose a color:</strong> Click any color button below</li>
              <li><strong>Expand:</strong> Your region grows to include connected cells of that color</li>
              <li><strong>Win:</strong> Make the entire cube one color within the move limit!</li>
            </ol>
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
            onClick={() => setIsVisible(false)}
          >
            Start Playing! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};