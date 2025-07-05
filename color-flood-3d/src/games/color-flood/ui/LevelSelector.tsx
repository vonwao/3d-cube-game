import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SAMPLE_LEVELS, getRandomLevel } from '../levels/sampleLevels';
import { CubeMesh } from '../../../engine/CubeMesh';
import { useCurrentPalette } from '../logic/simpleGameStore';
import { createInitialState } from '../logic/flood';
import type { Level } from '../logic/types';

interface MiniCubePreviewProps {
  level: Level;
  size?: number;
}

const MiniCubePreview: React.FC<MiniCubePreviewProps> = ({ level, size = 80 }) => {
  const palette = useCurrentPalette();
  
  const cubeState = useMemo(() => {
    return createInitialState(level.cells, level.maxMoves);
  }, [level]);

  return (
    <div 
      className="mini-cube-preview" 
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{
          position: [3, 3, 3],
          fov: 50,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={0.8} />
        
        <group rotation={[0.2, 0.4, 0]}>
          <CubeMesh
            cells={cubeState.cells}
            colors={palette.colors}
            floodRegion={cubeState.floodRegion}
            spacing={0.9}
            animationProgress={1}
          />
        </group>
      </Canvas>
    </div>
  );
};

interface LevelCardProps {
  level: Level;
  isSelected?: boolean;
  onClick: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const difficulty = useMemo(() => {
    if (level.id.startsWith('tutorial')) return { name: 'Tutorial', color: '#4CAF50' };
    if (level.id.startsWith('easy')) return { name: 'Easy', color: '#2196F3' };
    if (level.id.startsWith('medium')) return { name: 'Medium', color: '#FF9800' };
    if (level.id.startsWith('hard')) return { name: 'Hard', color: '#F44336' };
    if (level.id.startsWith('expert')) return { name: 'Expert', color: '#9C27B0' };
    return { name: 'Unknown', color: '#666' };
  }, [level.id]);

  const uniqueColors = useMemo(() => {
    return new Set(level.cells).size;
  }, [level.cells]);

  return (
    <div 
      className={`level-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="level-preview">
        <MiniCubePreview level={level} size={isHovered ? 100 : 80} />
      </div>
      
      <div className="level-info">
        <div className="level-header">
          <h3 className="level-title">{level.id}</h3>
          <div 
            className="difficulty-badge"
            style={{ backgroundColor: difficulty.color }}
          >
            {difficulty.name}
          </div>
        </div>
        
        <div className="level-stats">
          <div className="stat">
            <span className="stat-label">Max Moves:</span>
            <span className="stat-value">{level.maxMoves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Colors:</span>
            <span className="stat-value">{uniqueColors}</span>
          </div>
        </div>
        
        {/* TODO: Add completed status and star rating */}
        <div className="level-progress">
          <span className="play-hint">Click to play →</span>
        </div>
      </div>
    </div>
  );
};

interface LevelSelectorProps {
  onLevelSelect: (level: Level) => void;
  onClose: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ onLevelSelect, onClose }) => {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredLevels = useMemo(() => {
    if (filterDifficulty === 'all') return SAMPLE_LEVELS;
    return SAMPLE_LEVELS.filter(level => level.id.startsWith(filterDifficulty));
  }, [filterDifficulty]);

  const handleLevelClick = (level: Level) => {
    setSelectedLevelId(level.id);
    // Small delay to show selection before starting level
    setTimeout(() => {
      onLevelSelect(level);
    }, 150);
  };

  const handleRandomLevel = () => {
    const randomLevel = getRandomLevel();
    handleLevelClick(randomLevel);
  };

  const difficulties = [
    { key: 'all', name: 'All Levels', count: SAMPLE_LEVELS.length },
    { key: 'tutorial', name: 'Tutorial', count: SAMPLE_LEVELS.filter(l => l.id.startsWith('tutorial')).length },
    { key: 'easy', name: 'Easy', count: SAMPLE_LEVELS.filter(l => l.id.startsWith('easy')).length },
    { key: 'medium', name: 'Medium', count: SAMPLE_LEVELS.filter(l => l.id.startsWith('medium')).length },
    { key: 'hard', name: 'Hard', count: SAMPLE_LEVELS.filter(l => l.id.startsWith('hard')).length },
    { key: 'expert', name: 'Expert', count: SAMPLE_LEVELS.filter(l => l.id.startsWith('expert')).length },
  ];

  return (
    <div className="level-selector-overlay">
      <div className="level-selector-modal">
        <div className="level-selector-header">
          <h2>🎲 Select a Level</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close level selector"
          >
            ×
          </button>
        </div>

        <div className="level-selector-controls">
          <div className="difficulty-filters">
            {difficulties.map(diff => (
              <button
                key={diff.key}
                className={`difficulty-filter ${filterDifficulty === diff.key ? 'active' : ''}`}
                onClick={() => setFilterDifficulty(diff.key)}
              >
                {diff.name} ({diff.count})
              </button>
            ))}
          </div>
          
          <button 
            className="random-level-button"
            onClick={handleRandomLevel}
          >
            🎲 Random Level
          </button>
        </div>

        <div className="levels-grid">
          {filteredLevels.map(level => (
            <LevelCard
              key={level.id}
              level={level}
              isSelected={selectedLevelId === level.id}
              onClick={() => handleLevelClick(level)}
            />
          ))}
        </div>

        {filteredLevels.length === 0 && (
          <div className="no-levels-message">
            <p>No levels found for the selected difficulty.</p>
          </div>
        )}
      </div>
    </div>
  );
};