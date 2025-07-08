import { Hash, Activity } from 'lucide-react'
import { useIsRunning } from '../logic/simulationStore'

interface GenerationDisplayProps {
  generation: number
}

export const GenerationDisplay: React.FC<GenerationDisplayProps> = ({ generation }) => {
  const isRunning = useIsRunning()
  
  return (
    <div className="generation-display">
      <Hash size={16} />
      <span>Generation: {generation}</span>
      {isRunning && (
        <span className="running-indicator">
          <Activity size={16} className="pulse" />
          Running
        </span>
      )}
    </div>
  )
}