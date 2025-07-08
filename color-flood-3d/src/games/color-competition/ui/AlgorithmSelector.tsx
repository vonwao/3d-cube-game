import { Zap } from 'lucide-react'
import { useState } from 'react'
import { useSimulationStore, useCurrentAlgorithm, useLife3DConfig } from '../logic/simulationStore'
import { LIFE3D_PRESETS } from '../logic/life3d'
import type { AlgorithmType } from '../logic/types'

export const AlgorithmSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const currentAlgorithm = useCurrentAlgorithm()
  const life3dConfig = useLife3DConfig()
  const { setAlgorithm, setLife3DConfig, loadLife3DPreset } = useSimulationStore()
  
  const algorithms: Array<{ id: AlgorithmType; name: string; description: string }> = [
    {
      id: 'competition',
      name: 'Color Competition',
      description: 'Colors compete for territory based on neighbor count'
    },
    {
      id: 'life3d',
      name: '3D Game of Life',
      description: 'Classic cellular automaton with age-based colors'
    }
  ]
  
  const handleAlgorithmChange = (algorithm: AlgorithmType) => {
    setAlgorithm(algorithm)
    // Auto-start simulation when changing algorithm
    if (!useSimulationStore.getState().isRunning) {
      useSimulationStore.getState().setRunning(true)
    }
  }
  
  const handleLife3DPresetChange = (presetName: keyof typeof LIFE3D_PRESETS) => {
    loadLife3DPreset(presetName)
    // Auto-start simulation when changing preset
    if (!useSimulationStore.getState().isRunning) {
      useSimulationStore.getState().setRunning(true)
    }
  }
  
  const currentAlgorithmName = algorithms.find(a => a.id === currentAlgorithm)?.name || 'Unknown'
  
  return (
    <div className="algorithm-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="algorithm-toggle"
        title={`Current: ${currentAlgorithmName}`}
      >
        <Zap size={20} />
        Algorithm: {currentAlgorithmName}
      </button>
      
      {isOpen && (
        <div className="algorithm-content">
          <div className="algorithm-list">
            <h4>Select Algorithm:</h4>
            {algorithms.map(({ id, name, description }) => (
              <button
                key={id}
                onClick={() => handleAlgorithmChange(id)}
                className={`algorithm-button ${currentAlgorithm === id ? 'active' : ''}`}
                title={description}
              >
                <strong>{name}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>
          
          {currentAlgorithm === 'life3d' && (
            <div className="life3d-controls">
              <h4>3D Life Settings:</h4>
              
              <div className="preset-section">
                <label>Presets:</label>
                <div className="preset-buttons">
                  {Object.keys(LIFE3D_PRESETS).map(presetName => (
                    <button
                      key={presetName}
                      onClick={() => handleLife3DPresetChange(presetName as keyof typeof LIFE3D_PRESETS)}
                      className="preset-button"
                      title={`Apply ${presetName} rules`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="config-section">
                <div className="config-item">
                  <label>
                    Birth Neighbors: {life3dConfig.birthNeighbors.join(', ')}
                  </label>
                  <small>Neighbors needed for new cell birth</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Survival Neighbors: {life3dConfig.survivalNeighbors.join(', ')}
                  </label>
                  <small>Neighbors needed for cell survival</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Max Age: {life3dConfig.maxAge}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={life3dConfig.maxAge}
                    onChange={(e) => setLife3DConfig({ maxAge: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="config-item">
                  <label>
                    Edge Bias: {life3dConfig.edgeBias.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.1"
                    value={life3dConfig.edgeBias}
                    onChange={(e) => setLife3DConfig({ edgeBias: parseFloat(e.target.value) })}
                  />
                  <small>How edge cells survive (0.3=die faster, 1.5=survive better)</small>
                </div>
                
                <div className="config-item checkbox-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={life3dConfig.useAgeColors}
                      onChange={(e) => setLife3DConfig({ useAgeColors: e.target.checked })}
                    />
                    Use Age-Based Colors
                  </label>
                  <small>Color cells based on their age</small>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}