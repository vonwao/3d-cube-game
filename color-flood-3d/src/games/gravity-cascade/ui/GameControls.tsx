import { useGameStore, useGameStatus, useCurrentLevel } from '../logic/gameStore'
import { LEVELS } from '../config/levels'
import styles from './GameControls.module.css'

export const GameControls: React.FC = () => {
  const { initLevel, pauseGame, resumeGame, spawnBlocks } = useGameStore()
  const gameStatus = useGameStatus()
  const currentLevel = useCurrentLevel()
  
  const handleReset = () => {
    if (currentLevel) {
      initLevel(currentLevel)
    }
  }
  
  const handlePauseResume = () => {
    if (gameStatus === 'playing') {
      pauseGame()
    } else if (gameStatus === 'paused') {
      resumeGame()
    }
  }
  
  const handleSpawnTest = () => {
    // Debug function to manually spawn blocks
    spawnBlocks(3)
  }
  
  return (
    <div className={styles.controls}>
      <div className={styles.section}>
        <h3>Game Controls</h3>
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.button}
            onClick={handleReset}
          >
            🔄 Reset Level
          </button>
          
          <button 
            className={styles.button}
            onClick={handlePauseResume}
            disabled={gameStatus === 'won'}
          >
            {gameStatus === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          
          <button 
            className={styles.button}
            onClick={handleSpawnTest}
            disabled={gameStatus !== 'playing'}
          >
            ➕ Spawn Blocks
          </button>
        </div>
      </div>
      
      <div className={styles.section}>
        <h4>Quick Start</h4>
        <div className={styles.levelGrid}>
          {LEVELS.slice(0, 6).map((level) => (
            <button
              key={level.id}
              className={`${styles.levelButton} ${
                currentLevel?.id === level.id ? styles.active : ''
              }`}
              onClick={() => initLevel(level)}
              title={level.name}
            >
              Level {level.id}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.status}>
        Status: <span className={styles[gameStatus]}>{gameStatus}</span>
      </div>
    </div>
  )
}