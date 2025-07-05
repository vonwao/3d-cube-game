import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPalette } from '../ColorPalette';
import { useSimpleGameStore } from '../../logic/simpleGameStore';

// Mock the store
jest.mock('../../logic/simpleGameStore');
const mockUseSimpleGameStore = useSimpleGameStore as jest.MockedFunction<typeof useSimpleGameStore>;

describe('ColorPalette', () => {
  const mockApplyColor = jest.fn();
  const mockPalette = {
    name: 'Test Palette',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: mockPalette,
        cubeState: { moves: 2, maxMoves: 5 },
        isWon: false,
        isGameOver: false,
        applyColor: mockApplyColor
      };
      return selector(state);
    });
  });

  it('renders all color buttons', () => {
    render(<ColorPalette />);
    
    const colorButtons = screen.getAllByRole('button');
    expect(colorButtons).toHaveLength(6);
  });

  it('displays keyboard shortcuts', () => {
    render(<ColorPalette />);
    
    // Check for keyboard number indicators
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('applies color when button is clicked', () => {
    render(<ColorPalette />);
    
    const firstColorButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstColorButton);
    
    expect(mockApplyColor).toHaveBeenCalledWith(0);
  });

  it('shows game state correctly', () => {
    render(<ColorPalette />);
    
    expect(screen.getByText('Moves: 2/5')).toBeInTheDocument();
  });

  it('disables buttons when game is won', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: mockPalette,
        cubeState: { moves: 3, maxMoves: 5 },
        isWon: true,
        isGameOver: false,
        applyColor: mockApplyColor
      };
      return selector(state);
    });

    render(<ColorPalette />);
    
    const colorButtons = screen.getAllByRole('button');
    colorButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('disables buttons when game is over', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: mockPalette,
        cubeState: { moves: 5, maxMoves: 5 },
        isWon: false,
        isGameOver: true,
        applyColor: mockApplyColor
      };
      return selector(state);
    });

    render(<ColorPalette />);
    
    const colorButtons = screen.getAllByRole('button');
    colorButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows win message when game is won', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: mockPalette,
        cubeState: { moves: 3, maxMoves: 5 },
        isWon: true,
        isGameOver: false,
        applyColor: mockApplyColor
      };
      return selector(state);
    });

    render(<ColorPalette />);
    
    expect(screen.getByText(/You win!/)).toBeInTheDocument();
  });

  it('shows game over message when moves exceeded', () => {
    mockUseSimpleGameStore.mockImplementation((selector: any) => {
      const state = {
        currentPalette: mockPalette,
        cubeState: { moves: 5, maxMoves: 5 },
        isWon: false,
        isGameOver: true,
        applyColor: mockApplyColor
      };
      return selector(state);
    });

    render(<ColorPalette />);
    
    expect(screen.getByText(/Game over!/)).toBeInTheDocument();
  });
});