import React, { useEffect } from 'react';
import { 
  useIsTutorialActive, 
  useCurrentTutorialStep, 
  useTutorialStepIndex,
  useTutorialSteps,
  useTutorialStore 
} from '../logic/tutorialStore';
import './TutorialOverlay.css';

export const TutorialOverlay: React.FC = () => {
  const isActive = useIsTutorialActive();
  const currentStep = useCurrentTutorialStep();
  const stepIndex = useTutorialStepIndex();
  const steps = useTutorialSteps();
  const { nextStep, previousStep, skipTutorial } = useTutorialStore();
  
  useEffect(() => {
    if (!isActive || !currentStep?.highlightElements) return;
    
    // Add highlight class to elements
    const elements = currentStep.highlightElements.flatMap(selector => 
      Array.from(document.querySelectorAll(selector))
    );
    
    elements.forEach(el => el.classList.add('tutorial-highlight'));
    
    return () => {
      elements.forEach(el => el.classList.remove('tutorial-highlight'));
    };
  }, [isActive, currentStep]);
  
  if (!isActive || !currentStep) return null;
  
  const canGoNext = !currentStep.requiresAction;
  const canGoPrevious = stepIndex > 0;
  const isLastStep = stepIndex === steps.length - 1;
  
  return (
    <>
      {/* Dark overlay for the rest of the screen */}
      <div className="tutorial-backdrop" onClick={skipTutorial} />
      
      {/* Tutorial bar at the top */}
      <div className="tutorial-overlay">
        <div className="tutorial-content">
          <h3 className="tutorial-title">{currentStep.title}</h3>
          <p className="tutorial-text">{currentStep.content}</p>
          
          {currentStep.requiresAction && (
            <p className="tutorial-action">
              <span className="action-indicator">👆</span>
              {currentStep.action === 'rotate-cube' && 'Drag to rotate the cube'}
              {currentStep.action === 'make-move' && 'Select a color below'}
            </p>
          )}
        </div>
        
        <div className="tutorial-controls">
          <button 
            className="tutorial-btn tutorial-btn-skip"
            onClick={skipTutorial}
          >
            Skip Tutorial
          </button>
          
          <div className="tutorial-nav">
            <button 
              className="tutorial-btn tutorial-btn-prev"
              onClick={previousStep}
              disabled={!canGoPrevious}
            >
              ← Previous
            </button>
            
            <div className="tutorial-progress">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`progress-dot ${index === stepIndex ? 'active' : ''} ${index < stepIndex ? 'completed' : ''}`}
                />
              ))}
            </div>
            
            <button 
              className="tutorial-btn tutorial-btn-next"
              onClick={nextStep}
              disabled={!canGoNext && !isLastStep}
            >
              {isLastStep ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};