import { useEffect, useState } from 'react'
import { 
  useCells, 
  useCubeSize, 
  useGeneration, 
  useIsRunning, 
  useSpeed,
  useConfig 
} from '../logic/simulationStore'

export const DebugPanel: React.FC = () => {
  const cells = useCells()
  const cubeSize = useCubeSize()
  const generation = useGeneration()
  const isRunning = useIsRunning()
  const speed = useSpeed()
  const config = useConfig()
  const [fps, setFps] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  
  // FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const updateFPS = () => {
      frameCount++
      const currentTime = performance.now()
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      requestAnimationFrame(updateFPS)
    }
    
    const rafId = requestAnimationFrame(updateFPS)
    return () => cancelAnimationFrame(rafId)
  }, [])
  
  // Error catching
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `${event.message} at ${event.filename}:${event.lineno}`])
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  // Count cells by color
  const colorCounts = cells.reduce((acc, cell) => {
    const key = cell === null ? 'empty' : `color${cell}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '12px',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #0f0',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f0' }}>🐛 Debug Panel</h3>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Performance:</strong>
        <div>FPS: {fps}</div>
        <div>Generation: {generation}</div>
        <div>Speed: {speed}ms</div>
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>State:</strong>
        <div>Running: {isRunning ? '✅ YES' : '❌ NO'}</div>
        <div>Cube Size: {cubeSize}³ ({cubeSize ** 3} cells)</div>
        <div>Total Cells: {cells.length}</div>
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Cell Distribution:</strong>
        {Object.entries(colorCounts).map(([key, count]) => (
          <div key={key}>{key}: {count} ({Math.round(count / cells.length * 100)}%)</div>
        ))}
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Rules:</strong>
        <div>Min to survive: {config.minNeighborsToSurvive}</div>
        <div>Min for birth: {config.minNeighborsToBirth}</div>
        <div>Competition: {config.competitionThreshold}</div>
      </div>
      
      {errors.length > 0 && (
        <div style={{ marginTop: '0.5rem', color: '#f00' }}>
          <strong>Errors:</strong>
          {errors.map((err, i) => (
            <div key={i} style={{ fontSize: '10px' }}>{err}</div>
          ))}
        </div>
      )}
    </div>
  )
}