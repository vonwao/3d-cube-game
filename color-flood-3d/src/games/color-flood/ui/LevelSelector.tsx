import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SAMPLE_LEVELS, LEVEL_TIERS, type ExtendedLevel } from '../levels/sampleLevels';
import { CubeMesh } from '../../../engine/CubeMesh';
import { useCurrentPalette, useTotalStars, useLevelStars } from '../logic/simpleGameStore';
import { createInitialState } from '../logic/flood';
import type { Level } from '../logic/types';
import { DEFAULT_CUBE_SIZE } from '../logic/config';

interface MiniCubePreviewProps {
  level: Level;
  size?: number;
}

const MiniCubePreview: React.FC<MiniCubePreviewProps> = ({ level, size = 80 }) => {
  const palette = useCurrentPalette();
  
  const cubeState = useMemo(() => {
    return createInitialState(level.cells, level.maxMoves, DEFAULT_CUBE_SIZE);
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
            cubeSize={DEFAULT_CUBE_SIZE}
          />
        </group>
      </Canvas>
    </div>
  );
};

interface LevelCardProps {
  level: ExtendedLevel;
  isSelected?: boolean;
  onClick: () => void;
}

const StarDisplay: React.FC<{ stars: number }> = ({ stars }) => (
  <div className="star-display">
    {[1, 2, 3].map(i => (
      <span key={i} className={`star ${i <= stars ? 'filled' : 'empty'}`}>
        ★
      </span>
    ))}
  </div>
);

const LevelCard: React.FC<LevelCardProps> = ({ level, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const stars = useLevelStars(level.id);
  
  const tier = useMemo(() => {
    return LEVEL_TIERS.find(t => t.id === level.tier) || LEVEL_TIERS[0];
  }, [level.tier]);

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
          <div className="level-title-section">
            <h3 className="level-title">{level.name}</h3>
            <p className="level-description">{level.description}</p>
          </div>
          <div 
            className="difficulty-badge"
            style={{ backgroundColor: tier.color }}
          >
            {tier.name}
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
        
        <div className="level-progress">
          {stars > 0 ? (
            <div className="completed-status">
              <StarDisplay stars={stars} />
              <span className="completion-text">Completed!</span>
            </div>
          ) : (
            <span className="play-hint">Click to play →</span>
          )}
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
  const [filterDifficulty, setFilterDifficulty] = useState<string>('any');
  const totalStars = useTotalStars();
  
  // ESC key handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  const filteredLevels = useMemo(() => {
    if (filterDifficulty === 'any' || filterDifficulty === 'all') {
      return SAMPLE_LEVELS;
    }
    return SAMPLE_LEVELS.filter(level => level.tier === filterDifficulty);
  }, [filterDifficulty]);

  const handleLevelClick = (level: ExtendedLevel) => {
    setSelectedLevelId(level.id);
    // Small delay to show selection before starting level
    setTimeout(() => {
      onLevelSelect(level);
    }, 150);
  };

  const handleRandomLevel = () => {
    let availableLevels = SAMPLE_LEVELS;
    
    // Filter by difficulty if not "any"
    if (filterDifficulty !== 'any' && filterDifficulty !== 'all') {
      availableLevels = SAMPLE_LEVELS.filter(level => level.tier === filterDifficulty);
    }
    
    const randomLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)];
    handleLevelClick(randomLevel);
  };

  const tierFilters = useMemo(() => {
    const filters: Array<{
      key: string;
      name: string;
      color?: string;
    }> = [
      { key: 'any', name: 'Any Level' }
    ];
    
    LEVEL_TIERS.forEach(tier => {
      if (tier.id !== 'tutorial') {
        filters.push({
          key: tier.id,
          name: tier.name,
          color: tier.color,
        });
      }
    });
    
    return filters;
  }, []);
  
  const getButtonLabel = () => {
    if (filterDifficulty === 'any') {
      return '🎲 Random Any Level';
    }
    const selectedTier = tierFilters.find(f => f.key === filterDifficulty);
    return `🎲 Random ${selectedTier?.name || 'Easy'} Game`;
  };

  return (
    <div className="level-selector-overlay">
      <div className="level-selector-modal">
        <div className="level-selector-header">
          <div className="header-content">
            <h2>🎮 New Game</h2>
            <div className="progress-display">
              <span className="star-count">⭐ {totalStars} stars earned</span>
            </div>
          </div>
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
            {tierFilters.map(filter => (
              <button
                key={filter.key}
                className={`difficulty-filter ${filterDifficulty === filter.key ? 'active' : ''}`}
                onClick={() => setFilterDifficulty(filter.key)}
                style={{ borderColor: filter.color }}
              >
                <span className="filter-name">{filter.name}</span>
              </button>
            ))}
          </div>
          
          <button 
            className="primary-random-button"
            onClick={handleRandomLevel}
            title={`Start a ${filterDifficulty === 'any' ? 'random level from any difficulty' : `random ${filterDifficulty} level`}`}
          >
            {getButtonLabel()}
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