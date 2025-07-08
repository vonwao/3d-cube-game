import { Zap } from 'lucide-react'
import { useState } from 'react'
import { useSimulationStore, useCurrentAlgorithm, useLife3DConfig, useEnergyConfig, useMagnetConfig, useInfoConfig } from '../logic/simulationStore'
import { LIFE3D_PRESETS } from '../logic/life3d'
import { ENERGY_PATTERNS } from '../logic/energySystem'
import { MAGNET_PATTERNS } from '../logic/magnetAutomata'
import { INFO_PATTERNS } from '../logic/infoProcessing'
import type { AlgorithmType } from '../logic/types'

export const AlgorithmSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const currentAlgorithm = useCurrentAlgorithm()
  const life3dConfig = useLife3DConfig()
  const energyConfig = useEnergyConfig()
  const magnetConfig = useMagnetConfig()
  const infoConfig = useInfoConfig()
  const { setAlgorithm, setLife3DConfig, loadLife3DPreset, setEnergyConfig, loadEnergyPreset, setMagnetConfig, loadMagnetPreset, setInfoConfig, loadInfoPreset } = useSimulationStore()
  
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
    },
    {
      id: 'energy',
      name: 'Energy & Resources',
      description: 'Cells consume energy to survive and reproduce'
    },
    {
      id: 'magnet',
      name: 'Magnet Automata',
      description: 'Cells align spins creating flowing patterns'
    },
    {
      id: 'info',
      name: 'Information Processing',
      description: 'Logic gates and circuits in 3D space'
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
          
          {currentAlgorithm === 'energy' && (
            <div className="energy-controls">
              <h4>Energy System Settings:</h4>
              
              <div className="preset-section">
                <label>Presets:</label>
                <div className="preset-buttons">
                  {Object.keys(ENERGY_PATTERNS).map(presetName => (
                    <button
                      key={presetName}
                      onClick={() => loadEnergyPreset(presetName as keyof typeof ENERGY_PATTERNS)}
                      className="preset-button"
                      title={`Apply ${presetName} pattern`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="config-section">
                <div className="config-item">
                  <label>
                    Energy Decay: {(energyConfig.baseDecayRate * 100).toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.01"
                    value={energyConfig.baseDecayRate}
                    onChange={(e) => setEnergyConfig({ baseDecayRate: parseFloat(e.target.value) })}
                  />
                  <small>Energy loss per generation</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Birth Cost: {(energyConfig.birthEnergyCost * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={energyConfig.birthEnergyCost}
                    onChange={(e) => setEnergyConfig({ birthEnergyCost: parseFloat(e.target.value) })}
                  />
                  <small>Energy required to create new cell</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Diffusion Rate: {(energyConfig.diffusionRate * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={energyConfig.diffusionRate}
                    onChange={(e) => setEnergyConfig({ diffusionRate: parseFloat(e.target.value) })}
                  />
                  <small>Energy spread to neighbors</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Competition Radius: {energyConfig.competitionRadius}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={energyConfig.competitionRadius}
                    onChange={(e) => setEnergyConfig({ competitionRadius: parseInt(e.target.value) })}
                  />
                  <small>How far cells compete for resources</small>
                </div>
              </div>
            </div>
          )}
          
          {currentAlgorithm === 'magnet' && (
            <div className="magnet-controls">
              <h4>Magnet Automata Settings:</h4>
              
              <div className="preset-section">
                <label>Presets:</label>
                <div className="preset-buttons">
                  {Object.keys(MAGNET_PATTERNS).map(presetName => (
                    <button
                      key={presetName}
                      onClick={() => loadMagnetPreset(presetName as keyof typeof MAGNET_PATTERNS)}
                      className="preset-button"
                      title={`Apply ${presetName} pattern`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="config-section">
                <div className="config-item">
                  <label>
                    Alignment Strength: {(magnetConfig.alignmentStrength * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={magnetConfig.alignmentStrength}
                    onChange={(e) => setMagnetConfig({ alignmentStrength: parseFloat(e.target.value) })}
                  />
                  <small>How strongly cells align with neighbors</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Viscosity: {(magnetConfig.viscosity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={magnetConfig.viscosity}
                    onChange={(e) => setMagnetConfig({ viscosity: parseFloat(e.target.value) })}
                  />
                  <small>Resistance to change</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Turbulence: {(magnetConfig.turbulence * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.01"
                    value={magnetConfig.turbulence}
                    onChange={(e) => setMagnetConfig({ turbulence: parseFloat(e.target.value) })}
                  />
                  <small>Random perturbations</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Alignment Radius: {magnetConfig.alignmentRadius}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={magnetConfig.alignmentRadius}
                    onChange={(e) => setMagnetConfig({ alignmentRadius: parseInt(e.target.value) })}
                  />
                  <small>How far cells sense neighbors</small>
                </div>
              </div>
            </div>
          )}
          
          {currentAlgorithm === 'info' && (
            <div className="info-controls">
              <h4>Information Processing Settings:</h4>
              
              <div className="preset-section">
                <label>Presets:</label>
                <div className="preset-buttons">
                  {Object.keys(INFO_PATTERNS).map(presetName => (
                    <button
                      key={presetName}
                      onClick={() => loadInfoPreset(presetName as keyof typeof INFO_PATTERNS)}
                      className="preset-button"
                      title={`Apply ${presetName} configuration`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="config-section">
                <div className="config-item">
                  <label>
                    Signal Decay: {(infoConfig.signalDecay * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.02"
                    value={infoConfig.signalDecay}
                    onChange={(e) => setInfoConfig({ signalDecay: parseFloat(e.target.value) })}
                  />
                  <small>Signal strength loss per generation</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Signal Threshold: {(infoConfig.signalThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={infoConfig.signalThreshold}
                    onChange={(e) => setInfoConfig({ signalThreshold: parseFloat(e.target.value) })}
                  />
                  <small>Minimum signal strength to activate</small>
                </div>
                
                <div className="config-item">
                  <label>
                    Propagation Delay: {infoConfig.propagationDelay} gen
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={infoConfig.propagationDelay}
                    onChange={(e) => setInfoConfig({ propagationDelay: parseInt(e.target.value) })}
                  />
                  <small>Delay between signal hops</small>
                </div>
                
                <div className="gate-types">
                  <label>Active Gate Types:</label>
                  <div className="gate-type-grid">
                    {Object.entries(infoConfig.gateTypes).map(([id, type]) => (
                      <div key={id} className="gate-type-item">
                        <span className="gate-id">{id}:</span>
                        <span className="gate-name">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}