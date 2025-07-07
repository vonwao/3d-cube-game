import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, ColorIndex, Level, ColorPalette } from './types';
import { DEFAULT_PALETTES } from './types';
import { floodFill, isWin, createInitialState } from './flood';
import { DEFAULT_ANIMATION_CONFIG, type AnimationConfig, type AnimationPreset, ANIMATION_PRESETS } from '../config/animationConfig';
import { getStarsForLevel, calculateTotalStars, type ExtendedLevel } from '../levels/sampleLevels';
import type { CubeSize } from '../../../engine/types';
import { DEFAULT_CUBE_SIZE } from './config';
import { generateLevelForSize } from './levelGenerator';

interface SimpleGameStore extends GameState {
  cubeSize: CubeSize;
  currentPalette: ColorPalette;
  isAnimating: boolean;
  animationProgress: number;
  animationConfig: AnimationConfig;
  animationStartTime: number | null;
  
  // View state
  isExploded: boolean;
  explosionProgress: number;
  showDpad: boolean;
  cameraFov: number;
  
  // Progress tracking
  levelProgress: Record<string, number>; // level id -> stars earned
  totalStars: number;
  
  loadLevel: (level: Level) => void;
  applyColor: (color: ColorIndex) => void;
  undo: () => void;
  reset: () => void;
  changeCubeSize: (size: CubeSize) => void;
  toggleExplodedView: () => void;
  setExplosionProgress: (progress: number) => void;
  toggleShowDpad: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCameraFov: (fov: number) => void;
  setAnimationPreset: (preset: AnimationPreset) => void;
  setAnimationConfig: (config: Partial<AnimationConfig>) => void;
  updateAnimationProgress: (progress: number) => void;
  completLevel: (levelId: string, moves: number) => void;
}

export const useSimpleGameStore = create<SimpleGameStore>()(
  persist(
    (set, get) => ({
      cubeSize: DEFAULT_CUBE_SIZE,
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
      
      // View state
      isExploded: false,
      explosionProgress: 0,
      showDpad: true,
      cameraFov: 50,
      
      // Progress tracking
      levelProgress: {},
      totalStars: 0,
      
      loadLevel: (level: Level) => {
        const state = get();
        const cubeState = createInitialState(level.cells, level.maxMoves, state.cubeSize);
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
        if (state.isWon || state.isAnimating) return;
        
        const newState = floodFill(state.cubeState, color, state.cubeSize);
        if (newState === state.cubeState) return;
        
        const newUndoStack = [...state.undoStack, state.cubeState];
        const won = isWin(newState);
        const gameOver = false; // Never end the game, allow playing beyond max moves
        
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
        
        // Auto-complete level if won
        if (won && state.currentLevel) {
          get().completLevel(state.currentLevel.id, newState.moves);
        }
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
        
        const cubeState = createInitialState(state.currentLevel.cells, state.currentLevel.maxMoves, state.cubeSize);
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
      
      changeCubeSize: (size: CubeSize) => {
        const level = generateLevelForSize(size, 5); // Medium difficulty
        
        const cubeState = createInitialState(level.cells, level.maxMoves, size);
        set({
          cubeSize: size,
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
      
      toggleExplodedView: () => {
        const state = get();
        set({ 
          isExploded: !state.isExploded,
          explosionProgress: !state.isExploded ? 0 : 1 // Start animation
        });
      },
      
      setExplosionProgress: (progress: number) => {
        set({ explosionProgress: progress });
      },
      
      toggleShowDpad: () => {
        const state = get();
        set({ showDpad: !state.showDpad });
      },
      
      zoomIn: () => {
        const state = get();
        const newFov = Math.max(20, state.cameraFov - 5);
        set({ cameraFov: newFov });
      },
      
      zoomOut: () => {
        const state = get();
        const newFov = Math.min(80, state.cameraFov + 5);
        set({ cameraFov: newFov });
      },
      
      setCameraFov: (fov: number) => {
        const clampedFov = Math.max(20, Math.min(80, fov));
        set({ cameraFov: clampedFov });
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
      
      completLevel: (levelId: string, moves: number) => {
        const state = get();
        const level = state.currentLevel as ExtendedLevel;
        if (!level || level.id !== levelId) return;
        
        const stars = getStarsForLevel(level, moves);
        const currentStars = state.levelProgress[levelId] || 0;
        
        // Only update if we got more stars than before
        if (stars > currentStars) {
          const newLevelProgress = { ...state.levelProgress, [levelId]: stars };
          const newTotalStars = calculateTotalStars(newLevelProgress);
          
          set({
            levelProgress: newLevelProgress,
            totalStars: newTotalStars,
          });
        }
      },
    }),
    {
      name: 'color-flood-progress', // localStorage key
      partialize: (state) => ({ 
        levelProgress: state.levelProgress,
        totalStars: state.totalStars,
        showDpad: state.showDpad,
        cameraFov: state.cameraFov,
      }),
    }
  )
);

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

// Progress tracking selectors
export const useLevelProgress = () => useSimpleGameStore(state => state.levelProgress);
export const useTotalStars = () => useSimpleGameStore(state => state.totalStars);
export const useLevelStars = (levelId: string) => useSimpleGameStore(state => state.levelProgress[levelId] || 0);

// Cube size selector
export const useCubeSize = () => useSimpleGameStore(state => state.cubeSize);

// Exploded view selectors
export const useIsExploded = () => useSimpleGameStore(state => state.isExploded);
export const useExplosionProgress = () => useSimpleGameStore(state => state.explosionProgress);

// UI preference selectors
export const useShowDpad = () => useSimpleGameStore(state => state.showDpad);

// Camera controls
export const useCameraFov = () => useSimpleGameStore(state => state.cameraFov);