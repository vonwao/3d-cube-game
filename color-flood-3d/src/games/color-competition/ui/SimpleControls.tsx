import { Play, Pause, RotateCcw } from 'lucide-react'
import { useSimulationStore, useIsRunning, useSpeed } from '../logic/simulationStore'

export const SimpleControls: React.FC = () => {
  const isRunning = useIsRunning()
  const speed = useSpeed()
  const { setRunning, reset, setSpeed } = useSimulationStore()
  
  const speeds = [
    { label: 'Slow', value: 1000 },
    { label: 'Normal', value: 500 },
    { label: 'Fast', value: 200 },
    { label: 'Ultra', value: 50 }
  ]
  
  return (
    <div className="simple-controls">
      <h3>Controls</h3>
      
      <div className="control-buttons">
        <button
          onClick={() => setRunning(!isRunning)}
          className={`control-btn ${isRunning ? 'pause' : 'play'}`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={reset}
          className="control-btn reset"
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>
      
      <div className="speed-control">
        <label>Speed:</label>
        <div className="speed-buttons">
          {speeds.map(s => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`speed-btn ${speed === s.value ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}