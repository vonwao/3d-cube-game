import { createPortal } from 'react-dom';
import { TutorialOverlay } from './TutorialOverlay';

export const TutorialPortal: React.FC = () => {
  // Create a portal that renders the tutorial at the document body level
  // This ensures it's not affected by any parent CSS transforms or positioning
  return createPortal(
    <TutorialOverlay />,
    document.body
  );
};