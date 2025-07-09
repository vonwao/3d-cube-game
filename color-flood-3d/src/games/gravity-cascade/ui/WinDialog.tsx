import styles from './WinDialog.module.css'

interface WinDialogProps {
  score: number
  targetScore: number
  onNextLevel: () => void
  onReplay: () => void
}

export const WinDialog: React.FC<WinDialogProps> = ({
  score,
  targetScore,
  onNextLevel,
  onReplay
}) => {
  const bonusScore = Math.max(0, score - targetScore)
  const stars = score >= targetScore * 1.5 ? 3 : score >= targetScore * 1.2 ? 2 : 1
  
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>Level Complete!</h2>
        
        <div className={styles.stars}>
          {[1, 2, 3].map((star) => (
            <span 
              key={star} 
              className={`${styles.star} ${star <= stars ? styles.filled : ''}`}
            >
              ⭐
            </span>
          ))}
        </div>
        
        <div className={styles.scoreDetails}>
          <div className={styles.scoreLine}>
            <span>Target Score:</span>
            <span>{targetScore.toLocaleString()}</span>
          </div>
          <div className={styles.scoreLine}>
            <span>Your Score:</span>
            <span className={styles.highlight}>{score.toLocaleString()}</span>
          </div>
          {bonusScore > 0 && (
            <div className={styles.scoreLine}>
              <span>Bonus:</span>
              <span className={styles.bonus}>+{bonusScore.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.button}
            onClick={onReplay}
          >
            Replay Level
          </button>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onNextLevel}
          >
            Next Level
          </button>
        </div>
      </div>
    </div>
  )
}