import { BarChart3 } from 'lucide-react'
import { useMemo } from 'react'
import { useCells, useCubeSize } from '../logic/simulationStore'

const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Orange', 'Purple', 'Turquoise']
const COLOR_VALUES = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

export const CellStats: React.FC = () => {
  const cells = useCells()
  const cubeSize = useCubeSize()
  const totalCells = cubeSize * cubeSize * cubeSize
  
  const stats = useMemo(() => {
    const colorCounts: Record<number, number> = {}
    let emptyCount = 0
    
    for (const cell of cells) {
      if (cell === null) {
        emptyCount++
      } else {
        colorCounts[cell] = (colorCounts[cell] || 0) + 1
      }
    }
    
    const filledCells = totalCells - emptyCount
    const filledPercent = Math.round((filledCells / totalCells) * 100)
    
    return {
      colorCounts,
      emptyCount,
      filledCells,
      filledPercent,
    }
  }, [cells, totalCells])
  
  return (
    <div className="cell-stats">
      <h3>
        <BarChart3 size={20} />
        Statistics
      </h3>
      
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Filled:</span>
          <span className="stat-value">{stats.filledCells}/{totalCells} ({stats.filledPercent}%)</span>
        </div>
      </div>
      
      <div className="color-breakdown">
        {Object.entries(stats.colorCounts).map(([colorIndex, count]) => {
          const index = parseInt(colorIndex)
          const percent = Math.round((count / totalCells) * 100)
          return (
            <div key={colorIndex} className="color-stat">
              <div 
                className="color-dot" 
                style={{ backgroundColor: COLOR_VALUES[index] }}
              />
              <span className="color-name">{COLOR_NAMES[index]}:</span>
              <span className="color-count">{count} ({percent}%)</span>
            </div>
          )
        })}
        {stats.emptyCount > 0 && (
          <div className="color-stat">
            <div 
              className="color-dot" 
              style={{ backgroundColor: '#2c3e50' }}
            />
            <span className="color-name">Empty:</span>
            <span className="color-count">{stats.emptyCount} ({Math.round((stats.emptyCount / totalCells) * 100)}%)</span>
          </div>
        )}
      </div>
    </div>
  )
}