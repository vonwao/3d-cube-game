import styles from './GameInstructions.module.css'

export const GameInstructions: React.FC = () => {
  return (
    <div className={styles.instructions}>
      <h3>How to Play</h3>
      <ul>
        <li><strong>Click</strong> a block to select it</li>
        <li><strong>Click</strong> an adjacent block to swap</li>
        <li>Match <strong>3 or more</strong> blocks in a line</li>
        <li>Blocks fall towards the <strong>center gravity well</strong></li>
        <li>Create <strong>cascades</strong> for combo points!</li>
      </ul>
      <div className={styles.controls}>
        <p><strong>Rotate:</strong> Mouse drag or Arrow keys</p>
        <p><strong>Zoom:</strong> Mouse wheel</p>
      </div>
    </div>
  )
}