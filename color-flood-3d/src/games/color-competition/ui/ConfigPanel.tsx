import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useConfig, useSimulationStore } from '../logic/simulationStore'

export const ConfigPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const config = useConfig()
  const { setConfig } = useSimulationStore()
  
  const handleConfigChange = (key: keyof typeof config, value: number) => {
    setConfig({ [key]: value })
  }
  
  return (
    <div className="config-panel">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="config-toggle"
      >
        <Settings size={20} />
        Rules
      </button>
      
      {isOpen && (
        <div className="config-content">
          <div className="config-item">
            <label>
              Min neighbors to survive:
              <input
                type="range"
                min="0"
                max="10"
                value={config.minNeighborsToSurvive}
                onChange={(e) => handleConfigChange('minNeighborsToSurvive', parseInt(e.target.value))}
              />
              <span>{config.minNeighborsToSurvive}</span>
            </label>
          </div>
          
          <div className="config-item">
            <label>
              Min neighbors for birth:
              <input
                type="range"
                min="1"
                max="10"
                value={config.minNeighborsToBirth}
                onChange={(e) => handleConfigChange('minNeighborsToBirth', parseInt(e.target.value))}
              />
              <span>{config.minNeighborsToBirth}</span>
            </label>
          </div>
          
          <div className="config-item">
            <label>
              Competition threshold:
              <input
                type="range"
                min="1"
                max="15"
                value={config.competitionThreshold}
                onChange={(e) => handleConfigChange('competitionThreshold', parseInt(e.target.value))}
              />
              <span>{config.competitionThreshold}</span>
            </label>
          </div>
          
          <div className="config-info">
            <p>• Cells die if they have fewer neighbors than the survival threshold</p>
            <p>• Empty cells become colored if enough neighbors share the same color</p>
            <p>• Cells change color when overwhelmed by neighbors of another color</p>
          </div>
        </div>
      )}
    </div>
  )
}