import { create } from 'zustand';
import type { GameState, ColorIndex, Level, ColorPalette } from './types';
import { DEFAULT_PALETTES } from './types';
import { floodFill, isWin, createInitialState } from './flood';
import { DEFAULT_ANIMATION_CONFIG, type AnimationConfig, type AnimationPreset, ANIMATION_PRESETS } from '../config/animationConfig';

interface SimpleGameStore extends GameState {
  currentPalette: ColorPalette;
  isAnimating: boolean;
  animationProgress: number;
  animationConfig: AnimationConfig;
  animationStartTime: number | null;
  
  loadLevel: (level: Level) => void;
  applyColor: (color: ColorIndex) => void;
  undo: () => void;
  reset: () => void;
  setAnimationPreset: (preset: AnimationPreset) => void;
  setAnimationConfig: (config: Partial<AnimationConfig>) => void;
  updateAnimationProgress: (progress: number) => void;
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
  animationConfig: DEFAULT_ANIMATION_CONFIG,
  animationStartTime: null,
  
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
      animationStartTime: null,
    });
  },
  
  applyColor: (color: ColorIndex) => {
    const state = get();
    if (state.isWon || state.isGameOver || state.isAnimating) return;
    
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
      isAnimating: state.animationConfig.enabled,
      animationProgress: 0,
      animationStartTime: state.animationConfig.enabled ? performance.now() : null,
    });
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
      animationStartTime: null,
    });
  },
  
  setAnimationPreset: (preset: AnimationPreset) => {
    set({
      animationConfig: ANIMATION_PRESETS[preset]
    });
  },
  
  setAnimationConfig: (config: Partial<AnimationConfig>) => {
    const state = get();
    set({
      animationConfig: { ...state.animationConfig, ...config }
    });
  },
  
  updateAnimationProgress: (progress: number) => {
    const state = get();
    if (!state.isAnimating) return;
    
    set({ animationProgress: progress });
    
    if (progress >= 1) {
      set({ 
        isAnimating: false, 
        animationProgress: 1,
        animationStartTime: null
      });
    }
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
export const useIsAnimating = () => useSimpleGameStore(state => state.isAnimating);
export const useAnimationConfig = () => useSimpleGameStore(state => state.animationConfig);
export const useAnimationStartTime = () => useSimpleGameStore(state => state.animationStartTime);