import { Info, Activity } from 'lucide-react'
import type { UnifiedPreset } from '../logic/allPresets'
import { useCellStates, useGeneration } from '../logic/simulationStore'

interface Props {
  preset: UnifiedPreset | null
}

export const PresetDetailsPanel: React.FC<Props> = ({ preset }) => {
  const cellStates = useCellStates()
  const generation = useGeneration()
  
  if (!preset) {
    return (
      <div className="preset-details-panel">
        <h3>
          <Info size={16} />
          Simulation Details
        </h3>
        <div className="no-preset">
          Select a preset to see details
        </div>
      </div>
    )
  }
  
  // Extract all parameters based on algorithm type
  const renderParameters = () => {
    const config = preset.config
    const params: Array<{ label: string; value: string | number }> = []
    
    switch (preset.algorithm) {
      case 'energy':
        params.push(
          { label: 'Energy Decay', value: `${(config.baseDecayRate * 100).toFixed(1)}%` },
          { label: 'Birth Cost', value: `${(config.birthEnergyCost * 100).toFixed(0)}%` },
          { label: 'Death Threshold', value: `${(config.deathThreshold * 100).toFixed(0)}%` },
          { label: 'Diffusion Rate', value: `${(config.diffusionRate * 100).toFixed(0)}%` },
          { label: 'Competition Radius', value: config.competitionRadius },
          { label: 'Energy Transfer', value: `${(config.energyTransferRate * 100).toFixed(0)}%` },
          { label: 'Injection Rate', value: `${(config.injectionRate * 100).toFixed(0)}%` },
          { label: 'Injection Points', value: config.injectionPoints.length }
        )
        break
        
      case 'magnet':
        params.push(
          { label: 'Alignment Strength', value: `${(config.alignmentStrength * 100).toFixed(0)}%` },
          { label: 'Alignment Radius', value: config.alignmentRadius },
          { label: 'Viscosity', value: `${(config.viscosity * 100).toFixed(0)}%` },
          { label: 'Turbulence', value: `${(config.turbulence * 100).toFixed(0)}%` }
        )
        if (config.globalField) {
          params.push({ label: 'Global Field', value: 'Active' })
        }
        if (config.vortexCenters?.length > 0) {
          params.push({ label: 'Vortex Centers', value: config.vortexCenters.length })
        }
        break
        
      case 'info':
        params.push(
          { label: 'Signal Decay', value: `${(config.signalDecay * 100).toFixed(0)}%` },
          { label: 'Signal Threshold', value: `${(config.signalThreshold * 100).toFixed(0)}%` },
          { label: 'Propagation Delay', value: `${config.propagationDelay} gen` },
          { label: 'Gate Types', value: Object.keys(config.gateTypes).length }
        )
        break
        
      case 'life3d':
        params.push(
          { label: 'Birth Neighbors', value: config.birthNeighbors.join(', ') },
          { label: 'Survival Neighbors', value: config.survivalNeighbors.join(', ') },
          { label: 'Max Age', value: config.maxAge },
          { label: 'Edge Bias', value: config.edgeBias.toFixed(1) },
          { label: 'Age Colors', value: config.useAgeColors ? 'Yes' : 'No' }
        )
        break
        
      case 'competition':
        params.push(
          { label: 'Min to Survive', value: config.minNeighborsToSurvive },
          { label: 'Min to Birth', value: config.minNeighborsToBirth },
          { label: 'Competition Threshold', value: config.competitionThreshold }
        )
        break
    }
    
    return params
  }
  
  // Calculate live metrics
  const getLiveMetrics = () => {
    const metrics: Array<{ label: string; value: string | number }> = []
    const livingCells = cellStates.filter(c => c.color !== null).length
    
    metrics.push(
      { label: 'Generation', value: generation },
      { label: 'Living Cells', value: livingCells },
      { label: 'Fill Rate', value: `${((livingCells / cellStates.length) * 100).toFixed(1)}%` }
    )
    
    // Algorithm-specific metrics
    switch (preset.algorithm) {
      case 'energy':
        const totalEnergy = cellStates.reduce((sum, cell) => sum + (cell.energy || 0), 0)
        metrics.push(
          { label: 'Total Energy', value: totalEnergy.toFixed(1) },
          { label: 'Avg Energy', value: livingCells > 0 ? (totalEnergy / livingCells).toFixed(2) : '0' }
        )
        break
        
      case 'info':
        const activeSignals = cellStates.filter(c => (c.outputSignal || 0) > 0.5).length
        metrics.push(
          { label: 'Active Signals', value: activeSignals },
          { label: 'Signal Coverage', value: `${((activeSignals / livingCells) * 100).toFixed(0)}%` }
        )
        break
    }
    
    return metrics
  }
  
  const parameters = renderParameters()
  const metrics = getLiveMetrics()
  
  return (
    <div className="preset-details-panel">
      <div className="details-header">
        <h3>
          <Info size={16} />
          Current Simulation
        </h3>
        <div className="preset-title">{preset.name}</div>
        <div className="preset-type">{preset.algorithm.toUpperCase()}</div>
      </div>
      
      <div className="details-section">
        <h4>Description</h4>
        <p className="description-text">{preset.description}</p>
        <p className="expected-behavior">
          <strong>Expected:</strong> {preset.expectedBehavior}
        </p>
      </div>
      
      <div className="details-section">
        <h4>Parameters</h4>
        <div className="parameter-list">
          {parameters.map((param, i) => (
            <div key={i} className="parameter-item">
              <span className="param-label">{param.label}:</span>
              <span className="param-value">{param.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="details-section">
        <h4>
          <Activity size={14} />
          Live Metrics
        </h4>
        <div className="metrics-list">
          {metrics.map((metric, i) => (
            <div key={i} className="metric-item">
              <span className="metric-label">{metric.label}:</span>
              <span className="metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="details-section">
        <div className="simulation-info">
          <div className="info-item">
            <span>Cube Size:</span>
            <span>{preset.cubeSize}×{preset.cubeSize}×{preset.cubeSize}</span>
          </div>
          <div className="info-item">
            <span>Best Speed:</span>
            <span className="speed-recommendation">{preset.bestSpeed}</span>
          </div>
        </div>
      </div>
    </div>
  )
}