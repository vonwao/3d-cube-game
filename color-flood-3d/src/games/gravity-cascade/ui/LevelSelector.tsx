import { useState } from 'react'
import type { LevelConfig } from '../logic/types'
import styles from './LevelSelector.module.css'

interface LevelSelectorProps {
  levels: LevelConfig[]
  currentLevelId: number
  onSelectLevel: (level: LevelConfig) => void
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  currentLevelId,
  onSelectLevel
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleLevelSelect = (level: LevelConfig) => {
    onSelectLevel(level)
    setIsOpen(false)
  }
  
  return (
    <div className={styles.levelSelector}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.icon}>🎮</span>
        <span>Levels</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.levelGrid}>
            {levels.map((level) => (
              <button
                key={level.id}
                className={`${styles.levelButton} ${
                  level.id === currentLevelId ? styles.active : ''
                }`}
                onClick={() => handleLevelSelect(level)}
              >
                <span className={styles.levelNumber}>{level.id}</span>
                <span className={styles.levelName}>{level.name}</span>
                <span className={styles.levelInfo}>
                  {level.colorCount} colors • {level.targetScore.toLocaleString()} pts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}