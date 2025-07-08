import { Grid3x3 } from 'lucide-react'
import { useSimulationStore, PATTERNS } from '../logic/simulationStore'

export const PatternSelector: React.FC = () => {
  const { loadPattern, cubeSize, setCubeSize } = useSimulationStore()
  
  const handlePatternSelect = (patternIndex: number) => {
    const pattern = PATTERNS[patternIndex]
    if (pattern.cubeSize !== cubeSize) {
      setCubeSize(pattern.cubeSize)
    }
    loadPattern(pattern)
    
    // Auto-start simulation when selecting a pattern
    // Small delay to let the pattern load first
    setTimeout(() => {
      if (!useSimulationStore.getState().isRunning) {
        useSimulationStore.getState().setRunning(true)
      }
    }, 100)
  }
  
  const cubeSizes = [3, 4, 5, 6, 7, 8, 9]
  
  return (
    <div className="pattern-selector">
      <h3>
        <Grid3x3 size={20} />
        Patterns & Size
      </h3>
      
      <div className="pattern-list">
        {PATTERNS.map((pattern, index) => (
          <button
            key={index}
            onClick={() => handlePatternSelect(index)}
            className="pattern-button"
            title={pattern.description}
          >
            {pattern.name}
          </button>
        ))}
      </div>
      
      <div className="size-selector">
        <label>Cube Size:</label>
        <div className="size-buttons">
          {cubeSizes.map(size => (
            <button
              key={size}
              onClick={() => setCubeSize(size)}
              className={`size-button ${cubeSize === size ? 'active' : ''}`}
            >
              {size}³
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}