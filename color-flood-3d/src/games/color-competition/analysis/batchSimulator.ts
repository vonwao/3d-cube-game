import type { Life3DConfig, SimulationConfig } from '../logic/types'
import { SimulationAnalyzer, type RulesetTest, type SimulationResult } from './simulationAnalyzer'
import { createRandomPattern } from '../logic/automata'
import { createLife3DSeedPattern } from '../logic/life3dPatterns'

export interface BatchSimulationConfig {
  cubeSize: number
  maxGenerations: number
  runsPerRuleset: number
  includeRandomStart: boolean
  includePatternStart: boolean
}

export interface BatchResult {
  config: BatchSimulationConfig
  results: SimulationResult[]
  summary: BatchSummary
  timestamp: string
}

export interface BatchSummary {
  totalRulesets: number
  totalRuns: number
  averageInterestScore: number
  bestRuleset: SimulationResult
  classifications: { [key: string]: number }
  topRulesets: SimulationResult[]
}

export class BatchSimulator {
  
  static async runBatchSimulation(config: BatchSimulationConfig): Promise<BatchResult> {
    console.log('🚀 Starting batch simulation...')
    console.log(`Config: ${config.cubeSize}³ cube, ${config.maxGenerations} max gen, ${config.runsPerRuleset} runs each`)
    
    const rulesets = this.generateRulesets(config.cubeSize, config.maxGenerations)
    const results: SimulationResult[] = []
    
    let completed = 0
    const total = rulesets.length * config.runsPerRuleset
    
    for (const ruleset of rulesets) {
      for (let run = 0; run < config.runsPerRuleset; run++) {
        // Generate different initial patterns
        let initialPattern = undefined
        if (config.includeRandomStart && run === 0) {
          initialPattern = createRandomPattern(config.cubeSize, 0.1)
        } else if (config.includePatternStart && run === 1) {
          initialPattern = createLife3DSeedPattern(config.cubeSize)
        }
        
        const result = SimulationAnalyzer.analyzeRuleset(ruleset, initialPattern)
        results.push(result)
        
        completed++
        if (completed % 10 === 0) {
          console.log(`Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`)
        }
      }
    }
    
    const summary = this.generateSummary(results)
    
    console.log('✅ Batch simulation complete!')
    console.log(`Best ruleset: ${summary.bestRuleset.summary}`)
    
    return {
      config,
      results,
      summary,
      timestamp: new Date().toISOString()
    }
  }
  
  private static generateRulesets(cubeSize: number, maxGenerations: number): RulesetTest[] {
    const rulesets: RulesetTest[] = []
    
    // === 3D LIFE RULESETS ===
    
    // Classic variations
    rulesets.push(...this.generateLife3DClassicVariations(cubeSize, maxGenerations))
    
    // Birth/survival combinations
    rulesets.push(...this.generateLife3DBirthSurvivalVariations(cubeSize, maxGenerations))
    
    // Edge bias variations
    rulesets.push(...this.generateLife3DEdgeBiasVariations(cubeSize, maxGenerations))
    
    // === COLOR COMPETITION RULESETS ===
    rulesets.push(...this.generateCompetitionVariations(cubeSize, maxGenerations))
    
    console.log(`Generated ${rulesets.length} rulesets to test`)
    return rulesets
  }
  
  private static generateLife3DClassicVariations(cubeSize: number, maxGenerations: number): RulesetTest[] {
    const variations: RulesetTest[] = []
    
    // Classic Game of Life variants
    const classicConfigs = [
      { birth: [5], survival: [5, 6, 7], name: 'Life5567' },
      { birth: [6], survival: [5, 6, 7], name: 'Life6567' },
      { birth: [4, 5], survival: [5, 6], name: 'Life45-56' },
      { birth: [5, 6], survival: [4, 5, 6], name: 'Life56-456' },
      { birth: [4], survival: [4, 5, 6, 7], name: 'Life4-4567' },
      { birth: [6, 7], survival: [5, 6], name: 'Life67-56' },
      { birth: [5], survival: [4, 5, 6], name: 'Life5-456' },
      { birth: [4, 5, 6], survival: [6, 7, 8], name: 'Life456-678' },
    ]
    
    for (const config of classicConfigs) {
      for (const useAgeColors of [true, false]) {
        for (const maxAge of [20, 50, 100]) {
          variations.push({
            name: `${config.name}_age${useAgeColors ? maxAge : 'off'}`,
            algorithm: 'life3d',
            cubeSize,
            maxGenerations,
            config: {
              birthNeighbors: config.birth,
              survivalNeighbors: config.survival,
              useAgeColors,
              maxAge,
              edgeBias: 1.0
            } as Life3DConfig
          })
        }
      }
    }
    
    return variations
  }
  
  private static generateLife3DBirthSurvivalVariations(cubeSize: number, maxGenerations: number): RulesetTest[] {
    const variations: RulesetTest[] = []
    
    // Systematic exploration of birth/survival combinations
    const birthOptions = [
      [3], [4], [5], [6], [7],
      [4, 5], [5, 6], [6, 7],
      [3, 4, 5], [5, 6, 7]
    ]
    
    const survivalOptions = [
      [4, 5], [5, 6], [6, 7], [7, 8],
      [4, 5, 6], [5, 6, 7], [6, 7, 8],
      [3, 4, 5, 6], [4, 5, 6, 7]
    ]
    
    let count = 0
    for (const birth of birthOptions) {
      for (const survival of survivalOptions) {
        if (count++ % 3 === 0) { // Sample every 3rd combination to keep manageable
          variations.push({
            name: `B${birth.join('')}S${survival.join('')}`,
            algorithm: 'life3d',
            cubeSize,
            maxGenerations,
            config: {
              birthNeighbors: birth,
              survivalNeighbors: survival,
              useAgeColors: true,
              maxAge: 50,
              edgeBias: 1.0
            } as Life3DConfig
          })
        }
      }
    }
    
    return variations
  }
  
  private static generateLife3DEdgeBiasVariations(cubeSize: number, maxGenerations: number): RulesetTest[] {
    const variations: RulesetTest[] = []
    
    // Test edge bias effects on interesting rulesets
    const baseConfigs = [
      { birth: [5], survival: [5, 6, 7], name: 'Classic' },
      { birth: [4, 5], survival: [5, 6], name: 'Growth' },
      { birth: [6], survival: [4, 5, 6, 7], name: 'Stable' }
    ]
    
    const edgeBiases = [0.5, 0.7, 0.9, 1.1, 1.3, 1.5]
    
    for (const base of baseConfigs) {
      for (const edgeBias of edgeBiases) {
        variations.push({
          name: `${base.name}_edge${edgeBias}`,
          algorithm: 'life3d',
          cubeSize,
          maxGenerations,
          config: {
            birthNeighbors: base.birth,
            survivalNeighbors: base.survival,
            useAgeColors: true,
            maxAge: 50,
            edgeBias
          } as Life3DConfig
        })
      }
    }
    
    return variations
  }
  
  private static generateCompetitionVariations(cubeSize: number, maxGenerations: number): RulesetTest[] {
    const variations: RulesetTest[] = []
    
    // Color competition parameter variations
    const survivalRange = [2, 3, 4, 5, 6]
    const birthRange = [3, 4, 5, 6, 7, 8]
    const competitionRange = [4, 6, 8, 10, 12]
    
    for (const survival of survivalRange) {
      for (const birth of birthRange) {
        for (const competition of competitionRange) {
          if (birth > survival) { // Birth should generally be higher than survival
            variations.push({
              name: `Comp_S${survival}B${birth}C${competition}`,
              algorithm: 'competition',
              cubeSize,
              maxGenerations,
              config: {
                minNeighborsToSurvive: survival,
                minNeighborsToBirth: birth,
                competitionThreshold: competition
              } as SimulationConfig
            })
          }
        }
      }
    }
    
    return variations
  }
  
  private static generateSummary(results: SimulationResult[]): BatchSummary {
    const totalRuns = results.length
    const totalRulesets = new Set(results.map(r => r.ruleset.name)).size
    
    // Calculate average interest score
    const averageInterestScore = results.reduce((sum, r) => sum + r.metrics.interestScore, 0) / totalRuns
    
    // Find best ruleset
    const bestRuleset = results.reduce((best, current) => 
      current.metrics.interestScore > best.metrics.interestScore ? current : best
    )
    
    // Count classifications
    const classifications: { [key: string]: number } = {}
    results.forEach(r => {
      const cls = r.metrics.classification
      classifications[cls] = (classifications[cls] || 0) + 1
    })
    
    // Get top 10 rulesets by interest score
    const topRulesets = results
      .sort((a, b) => b.metrics.interestScore - a.metrics.interestScore)
      .slice(0, 10)
    
    return {
      totalRulesets,
      totalRuns,
      averageInterestScore,
      bestRuleset,
      classifications,
      topRulesets
    }
  }
  
  // Export results to JSON for analysis
  static exportResults(batchResult: BatchResult): string {
    const exportData = {
      summary: batchResult.summary,
      timestamp: batchResult.timestamp,
      config: batchResult.config,
      topRulesets: batchResult.summary.topRulesets.map(r => ({
        name: r.ruleset.name,
        algorithm: r.ruleset.algorithm,
        config: r.ruleset.config,
        metrics: r.metrics,
        summary: r.summary
      })),
      classifications: batchResult.summary.classifications,
      detailedResults: batchResult.results.map(r => ({
        name: r.ruleset.name,
        interestScore: r.metrics.interestScore,
        classification: r.metrics.classification,
        totalGenerations: r.metrics.totalGenerations,
        finalPopulation: r.metrics.finalPopulation,
        oscillationPeriod: r.metrics.oscillationPeriod
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }
}