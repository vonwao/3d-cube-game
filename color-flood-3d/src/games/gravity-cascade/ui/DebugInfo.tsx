import { useBlocks, useIsAnimating, useCurrentLevel } from '../logic/gameStore'
import styles from './DebugInfo.module.css'

export const DebugInfo: React.FC = () => {
  const blocks = useBlocks()
  const isAnimating = useIsAnimating()
  const currentLevel = useCurrentLevel()
  
  const blockArray = Array.from(blocks.values())
  
  return (
    <div className={styles.debugInfo}>
      <h4>Debug Info</h4>
      <div>Blocks: {blocks.size}</div>
      <div>Animating: {isAnimating ? 'Yes' : 'No'}</div>
      <div>Max Blocks: {currentLevel?.maxBlocks || 0}</div>
      <div>Spawn Rate: {currentLevel?.spawnRate || 0}</div>
      <details>
        <summary>Block Positions</summary>
        {blockArray.slice(0, 10).map((block, i) => (
          <div key={block.id} style={{ fontSize: '11px' }}>
            {i}: ({Math.round(block.position.x)}, {Math.round(block.position.y)}, {Math.round(block.position.z)}) 
            - Color: {block.color} {block.isFalling ? '↓' : ''} {block.isExploding ? '💥' : ''}
          </div>
        ))}
        {blockArray.length > 10 && <div>...and {blockArray.length - 10} more</div>}
      </details>
    </div>
  )
}