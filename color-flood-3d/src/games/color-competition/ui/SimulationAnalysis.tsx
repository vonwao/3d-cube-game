import { useState } from 'react'
import { Play, Download, BarChart3 } from 'lucide-react'
import { BatchSimulator, type BatchResult, type BatchSimulationConfig } from '../analysis/batchSimulator'

export const SimulationAnalysis: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BatchResult | null>(null)
  const [progress, setProgress] = useState('')
  
  const [config, setConfig] = useState<BatchSimulationConfig>({
    cubeSize: 5,
    maxGenerations: 100,
    runsPerRuleset: 2,
    includeRandomStart: true,
    includePatternStart: true
  })
  
  const runSimulation = async () => {
    setIsRunning(true)
    setProgress('Starting simulation...')
    setResults(null)
    
    try {
      // Mock progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => prev.includes('...') ? prev + '.' : prev + ' ...')
      }, 1000)
      
      const result = await BatchSimulator.runBatchSimulation(config)
      
      clearInterval(progressInterval)
      setResults(result)
      setProgress('Simulation complete!')
    } catch (error) {
      console.error('Simulation failed:', error)
      setProgress('Simulation failed!')
    } finally {
      setIsRunning(false)
    }
  }
  
  const downloadResults = () => {
    if (!results) return
    
    const jsonData = BatchSimulator.exportResults(results)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `simulation-results-${results.timestamp.split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const getClassificationColor = (classification: string): string => {
    const colors: { [key: string]: string } = {
      'extinct': '#e74c3c',
      'stable': '#2ecc71',
      'oscillating': '#3498db',
      'chaotic': '#f39c12',
      'explosive': '#e67e22',
      'glider': '#9b59b6'
    }
    return colors[classification] || '#95a5a6'
  }
  
  return (
    <div className="simulation-analysis">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="analysis-toggle"
        title="Run batch simulation analysis"
      >
        <BarChart3 size={20} />
        Batch Analysis
      </button>
      
      {isOpen && (
        <div className="analysis-content">
          <div className="analysis-header">
            <h4>Ruleset Analysis</h4>
            <p>Automatically test multiple rulesets to find the most interesting patterns</p>
          </div>
          
          <div className="config-section">
            <h5>Simulation Config:</h5>
            
            <div className="config-grid">
              <div className="config-item">
                <label>Cube Size:</label>
                <select 
                  value={config.cubeSize} 
                  onChange={(e) => setConfig(prev => ({ ...prev, cubeSize: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={4}>4×4×4</option>
                  <option value={5}>5×5×5</option>
                  <option value={6}>6×6×6</option>
                </select>
              </div>
              
              <div className="config-item">
                <label>Max Generations:</label>
                <select 
                  value={config.maxGenerations}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxGenerations: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              
              <div className="config-item">
                <label>Runs per Ruleset:</label>
                <select 
                  value={config.runsPerRuleset}
                  onChange={(e) => setConfig(prev => ({ ...prev, runsPerRuleset: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
            </div>
            
            <div className="checkbox-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.includeRandomStart}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeRandomStart: e.target.checked }))}
                  disabled={isRunning}
                />
                Include Random Start Patterns
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.includePatternStart}
                  onChange={(e) => setConfig(prev => ({ ...prev, includePatternStart: e.target.checked }))}
                  disabled={isRunning}
                />
                Include Designed Start Patterns
              </label>
            </div>
          </div>
          
          <div className="simulation-controls">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="run-simulation-btn"
            >
              <Play size={16} />
              {isRunning ? 'Running...' : 'Start Analysis'}
            </button>
            
            {results && (
              <button
                onClick={downloadResults}
                className="download-btn"
              >
                <Download size={16} />
                Download Results
              </button>
            )}
          </div>
          
          {isRunning && (
            <div className="progress-section">
              <div className="progress-text">{progress}</div>
              <div className="progress-note">
                This may take several minutes depending on the configuration...
              </div>
            </div>
          )}
          
          {results && (
            <div className="results-section">
              <div className="results-summary">
                <h5>Analysis Results</h5>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Total Rulesets:</span>
                    <span className="stat-value">{results.summary.totalRulesets}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Runs:</span>
                    <span className="stat-value">{results.summary.totalRuns}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Avg Interest Score:</span>
                    <span className="stat-value">{results.summary.averageInterestScore.toFixed(1)}/100</span>
                  </div>
                </div>
              </div>
              
              <div className="best-ruleset">
                <h5>🏆 Best Ruleset</h5>
                <div className="best-ruleset-details">
                  <div className="ruleset-name">{results.summary.bestRuleset.ruleset.name}</div>
                  <div className="ruleset-score">Score: {results.summary.bestRuleset.metrics.interestScore}/100</div>
                  <div className="ruleset-summary">{results.summary.bestRuleset.summary}</div>
                </div>
              </div>
              
              <div className="classifications">
                <h5>Pattern Classifications</h5>
                <div className="classification-grid">
                  {Object.entries(results.summary.classifications).map(([type, count]) => (
                    <div key={type} className="classification-item">
                      <div 
                        className="classification-dot"
                        style={{ backgroundColor: getClassificationColor(type) }}
                      />
                      <span className="classification-name">{type}</span>
                      <span className="classification-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="top-rulesets">
                <h5>🔥 Top 10 Rulesets</h5>
                <div className="rulesets-list">
                  {results.summary.topRulesets.slice(0, 10).map((result, index) => (
                    <div key={index} className="ruleset-item">
                      <div className="ruleset-rank">#{index + 1}</div>
                      <div className="ruleset-info">
                        <div className="ruleset-name">{result.ruleset.name}</div>
                        <div className="ruleset-details">
                          <span className="score">Score: {result.metrics.interestScore}</span>
                          <span 
                            className="classification"
                            style={{ color: getClassificationColor(result.metrics.classification) }}
                          >
                            {result.metrics.classification}
                          </span>
                          <span className="generations">{result.metrics.totalGenerations} gen</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}