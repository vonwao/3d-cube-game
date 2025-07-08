import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Download, BarChart3, Zap, TrendingUp, Activity, Clock, Target } from 'lucide-react'
import { BatchSimulator, type BatchResult, type BatchSimulationConfig } from '../games/color-competition/analysis/batchSimulator'
import './SimulationAnalysisPage.css'

export const SimulationAnalysisPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BatchResult | null>(null)
  const [progress, setProgress] = useState('')
  const [selectedResult, setSelectedResult] = useState<BatchResult['summary']['topRulesets'][0] | null>(null)
  
  const [config, setConfig] = useState<BatchSimulationConfig>({
    cubeSize: 5,
    maxGenerations: 100,
    runsPerRuleset: 2,
    includeRandomStart: true,
    includePatternStart: true
  })
  
  // Load saved results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('simulation-results')
    if (saved) {
      try {
        setResults(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to load saved results:', e)
      }
    }
  }, [])
  
  const runSimulation = async () => {
    setIsRunning(true)
    setProgress('Initializing simulation...')
    setResults(null)
    
    try {
      // Mock progress updates
      const progressMessages = [
        'Generating rulesets...',
        'Testing Life 3D variants...',
        'Analyzing edge bias effects...',
        'Testing color competition rules...',
        'Evaluating pattern complexity...',
        'Calculating interest scores...',
        'Finalizing results...'
      ]
      
      let messageIndex = 0
      const progressInterval = setInterval(() => {
        if (messageIndex < progressMessages.length) {
          setProgress(progressMessages[messageIndex])
          messageIndex++
        }
      }, 3000)
      
      const result = await BatchSimulator.runBatchSimulation(config)
      
      clearInterval(progressInterval)
      setResults(result)
      setProgress('Simulation complete!')
      
      // Save results to localStorage
      localStorage.setItem('simulation-results', JSON.stringify(result))
      
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
  
  const getClassificationDescription = (classification: string): string => {
    const descriptions: { [key: string]: string } = {
      'extinct': 'Pattern dies out completely',
      'stable': 'Reaches unchanging state',
      'oscillating': 'Repeating periodic behavior',
      'chaotic': 'Complex ongoing evolution',
      'explosive': 'Fills entire space rapidly',
      'glider': 'Moving patterns or structures'
    }
    return descriptions[classification] || 'Unknown behavior'
  }
  
  return (
    <div className="simulation-analysis-page">
      <header className="page-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          Back to Game
        </Link>
        <div className="header-content">
          <h1>
            <BarChart3 size={32} />
            Cellular Automata Analysis Lab
          </h1>
          <p>Discover the most interesting 3D patterns through automated simulation analysis</p>
        </div>
      </header>
      
      <div className="page-content">
        <div className="simulation-setup">
          <div className="setup-card">
            <h2>
              <Target size={24} />
              Simulation Configuration
            </h2>
            
            <div className="config-grid">
              <div className="config-item">
                <label>
                  <span className="label-text">Cube Size</span>
                  <span className="label-description">Larger cubes allow more complex patterns</span>
                </label>
                <select 
                  value={config.cubeSize} 
                  onChange={(e) => setConfig(prev => ({ ...prev, cubeSize: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={4}>4×4×4 (Fast)</option>
                  <option value={5}>5×5×5 (Balanced)</option>
                  <option value={6}>6×6×6 (Complex)</option>
                  <option value={7}>7×7×7 (Detailed)</option>
                </select>
              </div>
              
              <div className="config-item">
                <label>
                  <span className="label-text">Max Generations</span>
                  <span className="label-description">How long to run each simulation</span>
                </label>
                <select 
                  value={config.maxGenerations}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxGenerations: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={50}>50 (Quick)</option>
                  <option value={100}>100 (Standard)</option>
                  <option value={200}>200 (Thorough)</option>
                  <option value={500}>500 (Comprehensive)</option>
                </select>
              </div>
              
              <div className="config-item">
                <label>
                  <span className="label-text">Runs per Ruleset</span>
                  <span className="label-description">Statistical reliability</span>
                </label>
                <select 
                  value={config.runsPerRuleset}
                  onChange={(e) => setConfig(prev => ({ ...prev, runsPerRuleset: parseInt(e.target.value) }))}
                  disabled={isRunning}
                >
                  <option value={1}>1 (Fast)</option>
                  <option value={2}>2 (Balanced)</option>
                  <option value={3}>3 (Reliable)</option>
                  <option value={5}>5 (Statistical)</option>
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
                <span>Test with Random Starting Patterns</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.includePatternStart}
                  onChange={(e) => setConfig(prev => ({ ...prev, includePatternStart: e.target.checked }))}
                  disabled={isRunning}
                />
                <span>Test with Designed Starting Patterns</span>
              </label>
            </div>
            
            <div className="simulation-actions">
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="run-button primary"
              >
                <Play size={20} />
                {isRunning ? 'Running Analysis...' : 'Start Analysis'}
              </button>
              
              {results && (
                <button
                  onClick={downloadResults}
                  className="download-button secondary"
                >
                  <Download size={20} />
                  Export Data
                </button>
              )}
            </div>
          </div>
          
          {isRunning && (
            <div className="progress-card">
              <div className="progress-content">
                <Activity className="progress-icon" size={24} />
                <div className="progress-text">
                  <h3>Analyzing Patterns...</h3>
                  <p>{progress}</p>
                </div>
              </div>
              <div className="progress-note">
                This analysis tests hundreds of different cellular automata rules to find the most interesting patterns. 
                Depending on your configuration, this may take several minutes.
              </div>
            </div>
          )}
        </div>
        
        {results && (
          <div className="results-section">
            <div className="results-overview">
              <h2>
                <TrendingUp size={24} />
                Analysis Results
              </h2>
              
              <div className="overview-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Target size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{results.summary.totalRulesets}</div>
                    <div className="stat-label">Rulesets Tested</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{results.summary.totalRuns}</div>
                    <div className="stat-label">Total Simulations</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Zap size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{results.summary.averageInterestScore.toFixed(1)}/100</div>
                    <div className="stat-label">Avg Interest Score</div>
                  </div>
                </div>
                
                <div className="stat-card highlight">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{results.summary.bestRuleset.metrics.interestScore}/100</div>
                    <div className="stat-label">Best Score</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="results-details">
              <div className="best-ruleset-card">
                <h3>🏆 Best Performing Ruleset</h3>
                <div className="best-ruleset-content">
                  <div className="ruleset-header">
                    <h4>{results.summary.bestRuleset.ruleset.name}</h4>
                    <div className="ruleset-score">
                      Score: {results.summary.bestRuleset.metrics.interestScore}/100
                    </div>
                  </div>
                  <div className="ruleset-details">
                    <div className="detail-item">
                      <span>Classification:</span>
                      <span 
                        className="classification-badge"
                        style={{ backgroundColor: getClassificationColor(results.summary.bestRuleset.metrics.classification) }}
                      >
                        {results.summary.bestRuleset.metrics.classification}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Generations:</span>
                      <span>{results.summary.bestRuleset.metrics.totalGenerations}</span>
                    </div>
                    <div className="detail-item">
                      <span>Final Population:</span>
                      <span>{results.summary.bestRuleset.metrics.finalPopulation}</span>
                    </div>
                    {results.summary.bestRuleset.metrics.oscillationPeriod > 0 && (
                      <div className="detail-item">
                        <span>Oscillation Period:</span>
                        <span>{results.summary.bestRuleset.metrics.oscillationPeriod}</span>
                      </div>
                    )}
                  </div>
                  <p className="ruleset-description">
                    {getClassificationDescription(results.summary.bestRuleset.metrics.classification)}
                  </p>
                </div>
              </div>
              
              <div className="classifications-card">
                <h3>📊 Pattern Classifications</h3>
                <div className="classifications-grid">
                  {Object.entries(results.summary.classifications).map(([type, count]) => (
                    <div key={type} className="classification-item">
                      <div 
                        className="classification-dot"
                        style={{ backgroundColor: getClassificationColor(type) }}
                      />
                      <div className="classification-info">
                        <span className="classification-name">{type}</span>
                        <span className="classification-count">{count}</span>
                      </div>
                      <div className="classification-description">
                        {getClassificationDescription(type)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="top-rulesets-card">
                <h3>🚀 Top Performing Rulesets</h3>
                <div className="rulesets-table">
                  <div className="table-header">
                    <span>Rank</span>
                    <span>Ruleset</span>
                    <span>Score</span>
                    <span>Type</span>
                    <span>Generations</span>
                    <span>Population</span>
                  </div>
                  {results.summary.topRulesets.slice(0, 15).map((result, index) => (
                    <div 
                      key={index} 
                      className={`table-row ${selectedResult === result ? 'selected' : ''}`}
                      onClick={() => setSelectedResult(selectedResult === result ? null : result)}
                    >
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{result.ruleset.name}</span>
                      <span className="score">{result.metrics.interestScore}</span>
                      <span 
                        className="classification"
                        style={{ color: getClassificationColor(result.metrics.classification) }}
                      >
                        {result.metrics.classification}
                      </span>
                      <span className="generations">{result.metrics.totalGenerations}</span>
                      <span className="population">{result.metrics.finalPopulation}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedResult && (
                <div className="selected-result-card">
                  <h3>📋 Detailed Analysis: {selectedResult.ruleset.name}</h3>
                  <div className="detailed-metrics">
                    <div className="metrics-grid">
                      <div className="metric-item">
                        <span className="metric-label">Interest Score</span>
                        <span className="metric-value">{selectedResult.metrics.interestScore}/100</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Total Generations</span>
                        <span className="metric-value">{selectedResult.metrics.totalGenerations}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Max Population</span>
                        <span className="metric-value">{selectedResult.metrics.maxPopulation}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Avg Population</span>
                        <span className="metric-value">{selectedResult.metrics.avgPopulation.toFixed(1)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Color Diversity</span>
                        <span className="metric-value">{selectedResult.metrics.colorDiversity}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Avg Changes/Gen</span>
                        <span className="metric-value">{selectedResult.metrics.avgChangePerGeneration.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="config-display">
                      <h4>Rule Configuration:</h4>
                      <pre>{JSON.stringify(selectedResult.ruleset.config, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}