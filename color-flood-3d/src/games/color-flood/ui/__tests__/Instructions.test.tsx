import { render, screen, fireEvent } from '@testing-library/react';
import { Instructions } from '../Instructions';

describe('Instructions', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders instructions modal initially', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    expect(screen.getByText('🎲 Color Flood 3D')).toBeInTheDocument();
    expect(screen.getByText('🎯 Goal')).toBeInTheDocument();
    expect(screen.getByText('🎮 How Flood Fill Works')).toBeInTheDocument();
    expect(screen.getByText('🌊 Flood Fill Strategy')).toBeInTheDocument();
    expect(screen.getByText('🎛️ Controls')).toBeInTheDocument();
    expect(screen.getByText('💡 Tips')).toBeInTheDocument();
  });

  it('explains flood fill mechanics clearly', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    expect(screen.getByText(/Your region instantly "floods" to all adjacent cells/)).toBeInTheDocument();
    expect(screen.getByText(/Only cells touching face-to-face count/)).toBeInTheDocument();
    expect(screen.getByText(/Think like water/)).toBeInTheDocument();
  });

  it('lists all control methods', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    // Cube rotation controls
    expect(screen.getByText(/Mouse\/Touch.*Drag to rotate/)).toBeInTheDocument();
    expect(screen.getByText(/Arrow Keys.*to rotate/)).toBeInTheDocument();
    expect(screen.getByText(/Q\/E.*Roll left\/right/)).toBeInTheDocument();
    
    // Game action controls
    expect(screen.getByText(/1-6 Keys.*Select colors/)).toBeInTheDocument();
    expect(screen.getByText(/U.*Undo last move/)).toBeInTheDocument();
    expect(screen.getByText(/R.*Reset level/)).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when start playing button is clicked', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    const startButton = screen.getByText('Start Playing! 🚀');
    fireEvent.click(startButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows help button when modal is closed', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByTitle('Show Instructions')).toBeInTheDocument();
  });

  it('reopens modal when help button is clicked', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    // Close the modal first
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    // Click the help button
    const helpButton = screen.getByText('?');
    fireEvent.click(helpButton);
    
    // Modal should be open again
    expect(screen.getByText('🎲 Color Flood 3D')).toBeInTheDocument();
  });

  it('includes strategic tips for players', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    expect(screen.getByText(/Plan ahead - you have limited moves!/)).toBeInTheDocument();
    expect(screen.getByText(/White wireframes show your current region/)).toBeInTheDocument();
    expect(screen.getByText(/Try to create large connected regions/)).toBeInTheDocument();
  });

  it('explains the 3D aspect clearly', () => {
    render(<Instructions onClose={mockOnClose} />);
    
    expect(screen.getByText(/Make the entire 3x3x3 cube the same color/)).toBeInTheDocument();
    expect(screen.getByText(/Use the 3D space.*cells connect through all 6 faces/)).toBeInTheDocument();
  });
});