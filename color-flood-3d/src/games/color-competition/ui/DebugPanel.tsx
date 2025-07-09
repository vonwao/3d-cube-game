import { Activity } from 'lucide-react'
import { useCurrentAlgorithm, useCellStates } from '../logic/simulationStore'

export const DebugPanel: React.FC = () => {
  const algorithm = useCurrentAlgorithm()
  const cellStates = useCellStates()
  
  // Calculate algorithm-specific metrics
  const getAlgorithmMetrics = () => {
    switch (algorithm) {
      case 'energy': {
        const totalEnergy = cellStates.reduce((sum, cell) => sum + (cell.energy || 0), 0)
        const avgEnergy = totalEnergy / cellStates.filter(c => c.color !== null).length || 0
        const livingCells = cellStates.filter(c => c.color !== null).length
        const starvingCells = cellStates.filter(c => c.color !== null && (c.energy || 0) < 0.1).length
        
        return {
          'Total Energy': totalEnergy.toFixed(2),
          'Avg Energy/Cell': avgEnergy.toFixed(3),
          'Living Cells': livingCells,
          'Starving Cells': starvingCells,
        }
      }
      
      case 'magnet': {
        // Calculate average alignment
        let totalAlignment = 0
        let alignmentCount = 0
        
        cellStates.forEach((cell, i) => {
          if (cell.color !== null && cell.spin) {
            // Check alignment with neighbors (simplified)
            const neighbors = cellStates.filter((_, j) => Math.abs(i - j) === 1)
            neighbors.forEach(neighbor => {
              if (neighbor.spin && cell.spin) {
                const dot = cell.spin[0] * neighbor.spin[0] + 
                           cell.spin[1] * neighbor.spin[1] + 
                           cell.spin[2] * neighbor.spin[2]
                totalAlignment += dot
                alignmentCount++
              }
            })
          }
        })
        
        const avgAlignment = alignmentCount > 0 ? totalAlignment / alignmentCount : 0
        const activeCells = cellStates.filter(c => c.color !== null).length
        
        return {
          'Active Cells': activeCells,
          'Avg Alignment': avgAlignment.toFixed(3),
          'Spin Variance': (1 - Math.abs(avgAlignment)).toFixed(3),
          'Flow Activity': avgAlignment > 0.5 ? 'High' : avgAlignment > 0.2 ? 'Medium' : 'Low'
        }
      }
      
      case 'info': {
        const activeSignals = cellStates.filter(c => (c.outputSignal || 0) > 0.5).length
        const totalSignal = cellStates.reduce((sum, cell) => sum + (cell.outputSignal || 0), 0)
        const gateTypes = cellStates.reduce((acc, cell) => {
          if (cell.gateType !== undefined && cell.color !== null) {
            acc[cell.gateType] = (acc[cell.gateType] || 0) + 1
          }
          return acc
        }, {} as Record<number, number>)
        
        return {
          'Active Signals': activeSignals,
          'Total Signal': totalSignal.toFixed(2),
          'Gate Count': Object.keys(gateTypes).length,
          'Signal Coverage': `${((activeSignals / cellStates.length) * 100).toFixed(1)}%`
        }
      }
      
      default:
        return {
          'Algorithm': algorithm,
          'Cells': cellStates.length
        }
    }
  }
  
  const metrics = getAlgorithmMetrics()
  
  return (
    <div className="debug-panel">
      <h4>
        <Activity size={16} />
        System Metrics
      </h4>
      <div className="debug-metrics">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="debug-metric">
            <span className="metric-label">{key}:</span>
            <span className="metric-value">{value}</span>
          </div>
        ))}
      </div>
      
      {/* Algorithm-specific indicators */}
      <div className="debug-indicators">
        {algorithm === 'energy' && (
          <div className="indicator-bar">
            <label>Energy Distribution</label>
            <div className="energy-bar">
              {cellStates.filter(c => c.color !== null).map((cell, i) => (
                <div
                  key={i}
                  className="energy-cell"
                  style={{
                    backgroundColor: `rgba(255, 255, 0, ${cell.energy || 0})`,
                    width: '2px',
                    height: '20px'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {algorithm === 'magnet' && (
          <div className="flow-indicator">
            <label>Flow Direction</label>
            <div className="flow-arrows">
              {/* Simplified flow visualization */}
              <span style={{ 
                color: metrics['Flow Activity'] === 'High' ? '#2ecc71' : 
                       metrics['Flow Activity'] === 'Medium' ? '#f39c12' : '#e74c3c'
              }}>
                {metrics['Flow Activity']} Activity
              </span>
            </div>
          </div>
        )}
        
        {algorithm === 'info' && (() => {
          const activeSignals = cellStates.filter(c => (c.outputSignal || 0) > 0.5).length
          return (
            <div className="signal-indicator">
              <label>Signal Activity</label>
              <div className="signal-pulse" style={{
                animation: activeSignals > 0 ? 'pulse 1s infinite' : 'none',
                backgroundColor: activeSignals > 5 ? '#2ecc71' : activeSignals > 0 ? '#f39c12' : '#555'
              }}>
                {activeSignals > 0 ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}