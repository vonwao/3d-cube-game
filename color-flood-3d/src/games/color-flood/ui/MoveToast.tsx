import React, { useEffect, useState } from 'react';
import { useCubeState, useIsWon } from '../logic/simpleGameStore';

interface ToastMessage {
  id: string;
  type: 'success' | 'win' | 'efficient' | 'stars';
  message: string;
  duration: number;
  stars?: number;
}

export const MoveToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastMoveCount, setLastMoveCount] = useState(0);
  const [lastFloodSize, setLastFloodSize] = useState(0);
  const cubeState = useCubeState();
  const isWon = useIsWon();

  useEffect(() => {
    // Check for successful moves (excluding the initial state)
    if (cubeState.moves > lastMoveCount && lastMoveCount > 0) {
      const currentFloodSize = cubeState.floodRegion.length;
      const expansion = currentFloodSize - lastFloodSize;
      
      if (expansion > 0) {
        const newToast: ToastMessage = {
          id: `move-${cubeState.moves}-${Date.now()}`,
          type: expansion >= 8 ? 'efficient' : 'success',
          message: expansion >= 8 
            ? `Excellent! +${expansion} cells` 
            : `+${expansion} cells`,
          duration: expansion >= 8 ? 2000 : 1500,
        };
        
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove toast after duration
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
        }, newToast.duration);
      }
    }
    
    setLastMoveCount(cubeState.moves);
    setLastFloodSize(cubeState.floodRegion.length);
  }, [cubeState.moves, cubeState.floodRegion.length, lastMoveCount, lastFloodSize]);

  useEffect(() => {
    // Show win toast with star rating
    if (isWon) {
      const efficiency = cubeState.moves / cubeState.maxMoves;
      let stars = 0;
      if (efficiency <= 0.6) stars = 3;
      else if (efficiency <= 0.8) stars = 2;
      else if (efficiency <= 1.0) stars = 1;
      
      let message = 'Victory!';
      let type: 'win' | 'efficient' | 'stars' = 'stars';
      
      if (stars === 3) {
        message = '🌟 Perfect! 3 Stars!';
        type = 'efficient';
      } else if (stars === 2) {
        message = '⭐ Great! 2 Stars!';
      } else if (stars === 1) {
        message = '🎉 Victory! 1 Star!';
      } else {
        message = '💪 Try again for stars!';
        type = 'win';
      }
      
      const winToast: ToastMessage = {
        id: `win-${Date.now()}`,
        type,
        message,
        duration: 4000,
        stars: stars,
      };
      
      setToasts(prev => [...prev, winToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== winToast.id));
      }, winToast.duration);
    }
  }, [isWon, cubeState.moves, cubeState.maxMoves]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            {toast.message}
            {toast.stars !== undefined && toast.stars > 0 && (
              <div className="toast-stars">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={`star ${i < (toast.stars || 0) ? 'filled' : 'empty'}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
          <div 
            className="toast-progress"
            style={{
              animationDuration: `${toast.duration}ms`
            }}
          />
        </div>
      ))}
    </div>
  );
};