import { render, screen, fireEvent } from '@testing-library/react';
import { GameHUD } from '../GameHUD';
import { useSimpleGameStore } from '../../logic/simpleGameStore';

// Mock the store
jest.mock('../../logic/simpleGameStore');
const mockUseSimpleGameStore = useSimpleGameStore as jest.MockedFunction<typeof useSimpleGameStore>;

describe('GameHUD', () => {
  const mockUndo = jest.fn();
  const mockReset = jest.fn();

  const mockLevel = {
    id: 'test-level',
    name: 'Test Level',
    description: 'A test level',
    tier: 'easy',
    cells: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    maxMoves: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentLevel: mockLevel,
        cubeState: { moves: 2, maxMoves: 5 },
        canUndo: true,
        isWon: false,
        isGameOver: false,
        undo: mockUndo,
        reset: mockReset,
      };
      return selector(state);
    });
  });

  it('renders level information', () => {
    render(<GameHUD />);
    
    expect(screen.getByText('Test Level')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('displays move counter', () => {
    render(<GameHUD />);
    
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    expect(screen.getByText('Moves')).toBeInTheDocument();
  });

  it('shows undo button when moves are available', () => {
    render(<GameHUD />);
    
    const undoButton = screen.getByText('↶ Undo');
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).not.toBeDisabled();
  });

  it('disables undo button when no moves to undo', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentLevel: mockLevel,
        cubeState: { moves: 0, maxMoves: 5 },
        canUndo: false,
        isWon: false,
        isGameOver: false,
        undo: mockUndo,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<GameHUD />);
    
    const undoButton = screen.getByText('↶ Undo');
    expect(undoButton).toBeDisabled();
  });

  it('calls undo when undo button is clicked', () => {
    render(<GameHUD />);
    
    const undoButton = screen.getByText('↶ Undo');
    fireEvent.click(undoButton);
    
    expect(mockUndo).toHaveBeenCalled();
  });

  it('shows reset button', () => {
    render(<GameHUD />);
    
    const resetButton = screen.getByText('⟲ Reset');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).not.toBeDisabled();
  });

  it('calls reset when reset button is clicked', () => {
    render(<GameHUD />);
    
    const resetButton = screen.getByText('⟲ Reset');
    fireEvent.click(resetButton);
    
    expect(mockReset).toHaveBeenCalled();
  });

  it('shows level selector button', () => {
    render(<GameHUD />);
    
    const levelButton = screen.getByText('📋 Levels');
    expect(levelButton).toBeInTheDocument();
  });

  it('opens level selector when levels button is clicked', () => {
    // Mock window event dispatch
    const mockDispatchEvent = jest.fn();
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true
    });

    render(<GameHUD />);
    
    const levelButton = screen.getByText('📋 Levels');
    fireEvent.click(levelButton);
    
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      new CustomEvent('openLevelSelector')
    );
  });

  it('shows win state correctly', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentLevel: mockLevel,
        cubeState: { moves: 3, maxMoves: 5 },
        canUndo: true,
        isWon: true,
        isGameOver: false,
        undo: mockUndo,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<GameHUD />);
    
    // Should show victory indication
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('shows game over state correctly', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentLevel: mockLevel,
        cubeState: { moves: 5, maxMoves: 5 },
        canUndo: true,
        isWon: false,
        isGameOver: true,
        undo: mockUndo,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<GameHUD />);
    
    // Should show all moves used
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });

  it('handles missing level gracefully', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentLevel: null,
        cubeState: { moves: 0, maxMoves: 0 },
        canUndo: false,
        isWon: false,
        isGameOver: false,
        undo: mockUndo,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<GameHUD />);
    
    // Should still render without crashing
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GameHUD className="custom-hud" />);
    
    expect(container.firstChild).toHaveClass('game-hud', 'custom-hud');
  });
});