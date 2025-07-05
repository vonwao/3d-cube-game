import { render, screen, fireEvent } from '@testing-library/react';
import { LevelSelector } from '../LevelSelector';
import { useSimpleGameStore } from '../../logic/simpleGameStore';

// Mock the store
jest.mock('../../logic/simpleGameStore');
const mockUseSimpleGameStore = useSimpleGameStore as jest.MockedFunction<typeof useSimpleGameStore>;

// Mock React Three Fiber Canvas component
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
}));

describe('LevelSelector', () => {
  const mockOnLevelSelect = jest.fn();
  const mockOnClose = jest.fn();

  const mockLevelProgress = {
    'tutorial-01': 3,
    'easy-01': 2,
    'easy-02': 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: {
          name: 'Test Palette',
          colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
        },
        levelProgress: mockLevelProgress,
        totalStars: 6, // 3 + 2 + 1
      };
      return selector(state);
    });
  });

  it('renders level selector modal', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('🎲 Select a Level')).toBeInTheDocument();
    expect(screen.getByText('⭐ 6 stars earned')).toBeInTheDocument();
  });

  it('shows difficulty tier filters', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText(/All Levels/)).toBeInTheDocument();
    expect(screen.getByText(/Tutorial/)).toBeInTheDocument();
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
  });

  it('displays level cards with progress', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Three Colors')).toBeInTheDocument();
    
    // Check for completed levels
    expect(screen.getAllByText('Completed!').length).toBeGreaterThan(0);
  });

  it('shows star ratings for completed levels', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    // Should show filled stars for completed levels
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('shows locked levels with lock icon', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    // Should show locked levels for higher tiers
    const lockIcons = screen.getAllByText('🔒');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('filters levels by difficulty', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    const tutorialFilter = screen.getByText(/Tutorial/);
    fireEvent.click(tutorialFilter);
    
    // Should only show tutorial levels
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.queryByText('Three Colors')).not.toBeInTheDocument();
  });

  it('calls onLevelSelect when level is clicked', async () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    const levelCard = screen.getByText('First Steps').closest('.level-card');
    if (levelCard) {
      fireEvent.click(levelCard);
      
      // Wait for the timeout delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(mockOnLevelSelect).toHaveBeenCalled();
    }
  });

  it('prevents clicking locked levels', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    // Find a locked level and try to click it
    const lockedHint = screen.getByText('🔒 Earn more stars to unlock');
    const lockedCard = lockedHint.closest('.level-card');
    
    if (lockedCard) {
      fireEvent.click(lockedCard);
      expect(mockOnLevelSelect).not.toHaveBeenCalled();
    }
  });

  it('shows random level button', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    const randomButton = screen.getByText('🎲 Random Level');
    expect(randomButton).toBeInTheDocument();
    expect(randomButton).not.toBeDisabled();
  });

  it('closes modal when close button is clicked', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close level selector');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows level descriptions and metadata', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('Learn how flood fill works with a simple 2-color cube')).toBeInTheDocument();
    expect(screen.getByText(/Max Moves:/)).toBeInTheDocument();
    expect(screen.getByText(/Colors:/)).toBeInTheDocument();
  });

  it('updates tier filter counts based on progress', () => {
    render(<LevelSelector onLevelSelect={mockOnLevelSelect} onClose={mockOnClose} />);
    
    // Should show unlocked count vs total count
    expect(screen.getByText(/Tutorial/)).toBeInTheDocument();
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
    
    // Check that filters show progress (e.g., "1/1" for tutorial)
    const tutorialFilter = screen.getByText(/Tutorial/).closest('button');
    expect(tutorialFilter?.textContent).toMatch(/\d+\/\d+/);
  });
});