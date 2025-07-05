import React, { useEffect, useState } from 'react';
import { useCubeState } from '../logic/simpleGameStore';

interface ComboState {
  count: number;
  lastMoveTime: number;
  isActive: boolean;
  bestCombo: number;
}

export const ComboTracker: React.FC = () => {
  const [combo, setCombo] = useState<ComboState>({
    count: 0,
    lastMoveTime: 0,
    isActive: false,
    bestCombo: 0,
  });
  const [lastMoves, setLastMoves] = useState(0);
  const [lastFloodSize, setLastFloodSize] = useState(0);
  const cubeState = useCubeState();

  useEffect(() => {
    // Track moves and flood expansion
    if (cubeState.moves > lastMoves) {
      const currentFloodSize = cubeState.floodRegion.length;
      const expansion = currentFloodSize - lastFloodSize;
      const now = Date.now();
      
      // Consider a move "good" if it expands by 3+ cells
      const isGoodMove = expansion >= 3;
      
      if (isGoodMove) {
        setCombo(prev => {
          const newCount = prev.count + 1;
          const newBest = Math.max(newCount, prev.bestCombo);
          
          return {
            count: newCount,
            lastMoveTime: now,
            isActive: true,
            bestCombo: newBest,
          };
        });
        
        // Reset combo visibility after 3 seconds
        setTimeout(() => {
          setCombo(prev => ({
            ...prev,
            isActive: false,
          }));
        }, 3000);
      } else {
        // Reset combo on poor move
        setCombo(prev => ({
          count: 0,
          lastMoveTime: now,
          isActive: false,
          bestCombo: prev.bestCombo,
        }));
      }
      
      setLastFloodSize(currentFloodSize);
    }
    
    setLastMoves(cubeState.moves);
  }, [cubeState.moves, cubeState.floodRegion.length, lastMoves, lastFloodSize]);

  // Reset combo when level resets
  useEffect(() => {
    if (cubeState.moves === 0) {
      setCombo({
        count: 0,
        lastMoveTime: 0,
        isActive: false,
        bestCombo: combo.bestCombo, // Keep best combo across resets
      });
      setLastMoves(0);
      setLastFloodSize(cubeState.floodRegion.length);
    }
  }, [cubeState.moves, cubeState.floodRegion.length, combo.bestCombo]);

  if (!combo.isActive || combo.count < 2) return null;

  const getComboMessage = (count: number) => {
    if (count >= 5) return `🔥 ON FIRE! ${count}x COMBO!`;
    if (count >= 4) return `⚡ INCREDIBLE! ${count}x COMBO!`;
    if (count >= 3) return `✨ AMAZING! ${count}x COMBO!`;
    return `🎯 NICE! ${count}x COMBO!`;
  };

  const getComboClass = (count: number) => {
    if (count >= 5) return 'combo-fire';
    if (count >= 4) return 'combo-incredible';
    if (count >= 3) return 'combo-amazing';
    return 'combo-nice';
  };

  return (
    <div className="combo-tracker">
      <div className={`combo-display ${getComboClass(combo.count)}`}>
        <div className="combo-message">
          {getComboMessage(combo.count)}
        </div>
        {combo.bestCombo > combo.count && (
          <div className="best-combo">
            Best: {combo.bestCombo}x
          </div>
        )}
      </div>
    </div>
  );
};