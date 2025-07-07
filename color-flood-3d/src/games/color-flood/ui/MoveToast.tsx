import React, { useEffect, useState } from 'react';
import { useCubeState } from '../logic/simpleGameStore';

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
  // const isWon = useIsWon(); // Handled by WinDialog now

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

  // Win handling is now done by WinDialog component
  // useEffect removed to prevent duplicate win notifications

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