import { Gauge } from 'lucide-react'
import { useSpeed, useSimulationStore } from '../logic/simulationStore'
import { SPEED_MAP, type SimulationSpeed } from '../logic/types'

export const SpeedControl: React.FC = () => {
  const speed = useSpeed()
  const { setSpeed } = useSimulationStore()
  
  const currentSpeedKey = Object.entries(SPEED_MAP).find(
    ([, value]) => value === speed
  )?.[0] as SimulationSpeed || 'normal'
  
  const handleSpeedChange = (newSpeed: SimulationSpeed) => {
    setSpeed(SPEED_MAP[newSpeed])
  }
  
  return (
    <div className="speed-control">
      <h3>
        <Gauge size={20} />
        Speed
      </h3>
      <div className="speed-buttons">
        {Object.keys(SPEED_MAP).map((speedKey) => (
          <button
            key={speedKey}
            onClick={() => handleSpeedChange(speedKey as SimulationSpeed)}
            className={`speed-button ${currentSpeedKey === speedKey ? 'active' : ''}`}
          >
            {speedKey}
          </button>
        ))}
      </div>
      <div className="speed-info">
        {speed}ms per generation
      </div>
    </div>
  )
}