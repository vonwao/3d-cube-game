import { Play, Pause, SkipForward, RotateCcw, Shuffle } from 'lucide-react'
import { useSimulationStore, useIsRunning } from '../logic/simulationStore'

export const SimulationControls: React.FC = () => {
  const isRunning = useIsRunning()
  const { toggleRunning, step, reset, randomize } = useSimulationStore()
  
  return (
    <div className="simulation-controls">
      <h3>Controls</h3>
      <div className="button-group">
        <button
          onClick={toggleRunning}
          className={`control-button ${isRunning ? 'pause' : 'play'}`}
          title={isRunning ? 'Pause' : 'Play'}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={step}
          className="control-button"
          disabled={isRunning}
          title="Step forward one generation"
        >
          <SkipForward size={20} />
          Step
        </button>
        
        <button
          onClick={reset}
          className="control-button"
          title="Reset simulation"
        >
          <RotateCcw size={20} />
          Reset
        </button>
        
        <button
          onClick={() => randomize()}
          className="control-button"
          title="Randomize cells"
        >
          <Shuffle size={20} />
          Random
        </button>
      </div>
    </div>
  )
}