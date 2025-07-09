import { Grid3x3, Zap, Cpu, Heart, Sparkles } from 'lucide-react'
import { UNIFIED_PRESETS, type UnifiedPreset } from '../logic/allPresets'
import { useSimulationStore } from '../logic/simulationStore'

const CATEGORY_ICONS = {
  energy: Zap,
  magnetic: Sparkles,
  digital: Cpu,
  life: Heart,
  classic: Grid3x3
}

const CATEGORY_COLORS = {
  energy: '#f39c12',
  magnetic: '#3498db',
  digital: '#2ecc71',
  life: '#e74c3c',
  classic: '#9b59b6'
}

interface Props {
  selectedPresetId: string | null
  onSelectPreset: (preset: UnifiedPreset) => void
}

export const SimplePresetSelector: React.FC<Props> = ({ selectedPresetId, onSelectPreset }) => {
  const setRunning = useSimulationStore(state => state.setRunning)
  
  const handlePresetClick = (preset: UnifiedPreset) => {
    onSelectPreset(preset)
    // Auto-start simulation when selecting preset
    setTimeout(() => setRunning(true), 100)
  }
  
  return (
    <div className="simple-preset-selector">
      <h3>
        <Grid3x3 size={16} />
        Preset Simulations
      </h3>
      
      <div className="preset-list">
        {UNIFIED_PRESETS.map(preset => {
          const Icon = CATEGORY_ICONS[preset.category]
          const isSelected = preset.id === selectedPresetId
          
          return (
            <button
              key={preset.id}
              className={`preset-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handlePresetClick(preset)}
              style={{
                borderColor: isSelected ? CATEGORY_COLORS[preset.category] : undefined
              }}
            >
              <div className="preset-header">
                <Icon size={14} style={{ color: CATEGORY_COLORS[preset.category] }} />
                <span className="preset-name">{preset.name}</span>
              </div>
              <div className="preset-description">
                {preset.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}