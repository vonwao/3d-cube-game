import styles from './GameHUD.module.css'

interface GameHUDProps {
  score: number
  combo: number
  level: number
  targetScore: number
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  level,
  targetScore
}) => {
  const progress = (score / targetScore) * 100
  
  return (
    <div className={styles.hud}>
      <div className={styles.scoreSection}>
        <div className={styles.score}>
          <span className={styles.label}>Score</span>
          <span className={styles.value}>{score.toLocaleString()}</span>
        </div>
        
        {combo > 1 && (
          <div className={styles.combo}>
            <span className={styles.comboText}>COMBO x{combo}</span>
          </div>
        )}
      </div>
      
      <div className={styles.levelSection}>
        <div className={styles.level}>
          <span className={styles.label}>Level {level}</span>
        </div>
        
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {score.toLocaleString()} / {targetScore.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}