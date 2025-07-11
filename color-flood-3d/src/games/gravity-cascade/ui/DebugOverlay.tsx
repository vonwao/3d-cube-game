import { useSelectedBlockId, useBlocks } from '../logic/gameStore'
import styles from './DebugOverlay.module.css'

export const DebugOverlay: React.FC = () => {
  const selectedBlockId = useSelectedBlockId()
  const blocks = useBlocks()
  
  return (
    <div className={`${styles.debugOverlay} clickable`}>
      <h3>Debug Info</h3>
      <p>Selected Block ID: {selectedBlockId || 'None'}</p>
      <p>Total Blocks: {blocks.size}</p>
      
      <div className={styles.blockList}>
        <h4>All Blocks:</h4>
        {Array.from(blocks.entries()).map(([id, block]) => (
          <div 
            key={id} 
            className={styles.blockInfo}
          >
            <span>{id.substring(0, 15)}...</span>
            <span>Pos: ({Math.round(block.position.x)}, {Math.round(block.position.y)}, {Math.round(block.position.z)})</span>
            <span>Color: {block.color}</span>
            {selectedBlockId === id && <span className={styles.selected}>SELECTED</span>}
          </div>
        ))}
      </div>
    </div>
  )
}