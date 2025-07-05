import { create } from 'zustand';
import type { GameState, ColorIndex, Level, ColorPalette } from './types';
import { DEFAULT_PALETTES } from './types';
import { floodFill, isWin, createInitialState } from './flood';

interface SimpleGameStore extends GameState {
  currentPalette: ColorPalette;
  isAnimating: boolean;
  animationProgress: number;
  
  loadLevel: (level: Level) => void;
  applyColor: (color: ColorIndex) => void;
  undo: () => void;
  reset: () => void;
}

export const useSimpleGameStore = create<SimpleGameStore>()((set, get) => ({
  currentLevel: null,
  cubeState: {
    cells: [],
    floodRegion: [],
    moves: 0,
    maxMoves: 0,
  },
  undoStack: [],
  isWon: false,
  isGameOver: false,
  selectedColor: null,
  currentPalette: DEFAULT_PALETTES[0],
  isAnimating: false,
  animationProgress: 1,
  
  loadLevel: (level: Level) => {
    const cubeState = createInitialState(level.cells, level.maxMoves);
    set({
      currentLevel: level,
      cubeState,
      undoStack: [],
      isWon: false,
      isGameOver: false,
      selectedColor: null,
      isAnimating: false,
      animationProgress: 1,
    });
  },
  
  applyColor: (color: ColorIndex) => {
    const state = get();
    if (state.isWon || state.isGameOver) return;
    
    const newState = floodFill(state.cubeState, color);
    if (newState === state.cubeState) return;
    
    const newUndoStack = [...state.undoStack, state.cubeState];
    const won = isWin(newState);
    const gameOver = newState.moves >= newState.maxMoves && !won;
    
    set({
      cubeState: newState,
      undoStack: newUndoStack,
      isWon: won,
      isGameOver: gameOver,
      selectedColor: color,
      isAnimating: true,
      animationProgress: 0,
    });
    
    // Simple animation without subscription
    setTimeout(() => {
      const currentState = get();
      if (currentState.isAnimating) {
        set({ isAnimating: false, animationProgress: 1 });
      }
    }, 200);
  },
  
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    
    const previousState = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    
    set({
      cubeState: previousState,
      undoStack: newUndoStack,
      isWon: false,
      isGameOver: false,
      selectedColor: null,
      isAnimating: false,
      animationProgress: 1,
    });
  },
  
  reset: () => {
    const state = get();
    if (!state.currentLevel) return;
    
    const cubeState = createInitialState(state.currentLevel.cells, state.currentLevel.maxMoves);
    set({
      cubeState,
      undoStack: [],
      isWon: false,
      isGameOver: false,
      selectedColor: null,
      isAnimating: false,
      animationProgress: 1,
    });
  },
}));

// Simple, individual selectors to avoid object recreation
export const useCurrentLevel = () => useSimpleGameStore(state => state.currentLevel);
export const useCubeState = () => useSimpleGameStore(state => state.cubeState);
export const useIsWon = () => useSimpleGameStore(state => state.isWon);
export const useIsGameOver = () => useSimpleGameStore(state => state.isGameOver);
export const useCanUndo = () => useSimpleGameStore(state => state.undoStack.length > 0);
export const useSelectedColor = () => useSimpleGameStore(state => state.selectedColor);
export const useCurrentPalette = () => useSimpleGameStore(state => state.currentPalette);
export const useAnimationProgress = () => useSimpleGameStore(state => state.animationProgress);