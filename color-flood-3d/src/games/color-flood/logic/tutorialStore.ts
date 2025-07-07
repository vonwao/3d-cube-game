import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  action?: string; // Optional action the user needs to take
  highlightElements?: string[]; // CSS selectors for elements to highlight
  requiresAction?: boolean; // If true, won't auto-advance
  onComplete?: () => boolean; // Optional validation function
}

interface TutorialStore {
  // Tutorial state
  isActive: boolean;
  currentStepIndex: number;
  hasCompletedTutorial: boolean;
  hasSeenTutorial: boolean;
  
  // Tutorial flow
  steps: TutorialStep[];
  
  // Actions
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  setStep: (index: number) => void;
  completeTutorial: () => void;
  
  // Action tracking
  registerAction: (action: string) => void;
  lastAction: string | null;
}

// Define tutorial steps
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Color Flood 3D!',
    content: 'Your goal is to make the entire cube one color. Let\'s learn how to play!',
  },
  {
    id: 'rotate-cube',
    title: 'Rotate the Cube',
    content: 'Click and drag to rotate the cube. Try it now!',
    action: 'rotate-cube',
    requiresAction: true,
  },
  {
    id: 'flood-region',
    title: 'Your Territory',
    content: 'The white wireframe shows your current territory. It starts at the center of the cube.',
    highlightElements: ['.flood-region'],
  },
  {
    id: 'color-selection',
    title: 'Choose a Color',
    content: 'Click a color below or press keys 1-6. Adjacent cells of that color will join your territory.',
    highlightElements: ['.color-palette'],
  },
  {
    id: 'make-move',
    title: 'Make Your First Move',
    content: 'Select a color to expand your territory. Watch how it grows!',
    action: 'make-move',
    requiresAction: true,
    highlightElements: ['.color-palette'],
  },
  {
    id: 'move-counter',
    title: 'Move Counter',
    content: 'You have limited moves to complete each level. Plan carefully!',
    highlightElements: ['.game-hud'],
  },
  {
    id: 'strategy',
    title: 'Pro Tip',
    content: 'Look for colors that connect to many cells. Corners and edges are strategic!',
  },
  {
    id: 'advanced-controls',
    title: 'Advanced Controls',
    content: 'Press E for exploded view, Z to undo, and R to reset. Check the menu for more!',
    highlightElements: ['.hamburger-menu'],
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    content: 'You\'ve learned the basics. Good luck conquering the cube!',
  },
];

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      hasCompletedTutorial: false,
      hasSeenTutorial: false,
      steps: TUTORIAL_STEPS,
      lastAction: null,
      
      startTutorial: () => {
        set({
          isActive: true,
          currentStepIndex: 0,
          hasSeenTutorial: true,
        });
      },
      
      nextStep: () => {
        const state = get();
        const nextIndex = state.currentStepIndex + 1;
        
        if (nextIndex >= state.steps.length) {
          get().completeTutorial();
        } else {
          set({ currentStepIndex: nextIndex });
        }
      },
      
      previousStep: () => {
        const state = get();
        if (state.currentStepIndex > 0) {
          set({ currentStepIndex: state.currentStepIndex - 1 });
        }
      },
      
      skipTutorial: () => {
        set({
          isActive: false,
          hasSeenTutorial: true,
        });
      },
      
      resetTutorial: () => {
        set({
          isActive: false,
          currentStepIndex: 0,
          hasCompletedTutorial: false,
          hasSeenTutorial: false,
          lastAction: null,
        });
      },
      
      setStep: (index: number) => {
        const state = get();
        if (index >= 0 && index < state.steps.length) {
          set({ currentStepIndex: index });
        }
      },
      
      completeTutorial: () => {
        set({
          isActive: false,
          hasCompletedTutorial: true,
          hasSeenTutorial: true,
        });
      },
      
      registerAction: (action: string) => {
        const state = get();
        set({ lastAction: action });
        
        // Check if this action completes the current step
        if (state.isActive) {
          const currentStep = state.steps[state.currentStepIndex];
          if (currentStep.action === action && currentStep.requiresAction) {
            // Auto-advance after a short delay
            setTimeout(() => {
              get().nextStep();
            }, 500);
          }
        }
      },
    }),
    {
      name: 'color-flood-tutorial',
      partialize: (state) => ({
        hasCompletedTutorial: state.hasCompletedTutorial,
        hasSeenTutorial: state.hasSeenTutorial,
      }),
    }
  )
);

// Selectors
export const useIsTutorialActive = () => useTutorialStore(state => state.isActive);
export const useCurrentTutorialStep = () => useTutorialStore(state => state.steps[state.currentStepIndex]);
export const useTutorialStepIndex = () => useTutorialStore(state => state.currentStepIndex);
export const useTutorialSteps = () => useTutorialStore(state => state.steps);
export const useHasSeenTutorial = () => useTutorialStore(state => state.hasSeenTutorial);