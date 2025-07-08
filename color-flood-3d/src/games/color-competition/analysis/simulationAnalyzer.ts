import type { ColorIndex } from '../../color-flood/logic/types'
import type { Life3DConfig, CellState } from '../logic/types'
import { evolveLife3D } from '../logic/life3d'
import { evolveGeneration } from '../logic/automata'
import { createRandomPattern } from '../logic/automata'

// Metrics for evaluating simulation "interestingness"
export interface SimulationMetrics {
  // Basic metrics
  totalGenerations: number
  finalPopulation: number
  maxPopulation: number
  avgPopulation: number
  
  // Stability metrics
  stabilityGeneration: number    // When pattern becomes stable/dies
  oscillationPeriod: number      // Period of oscillation (0 if not oscillating)
  
  // Diversity metrics
  colorDiversity: number         // Number of different colors present
  spatialDistribution: number   // How spread out the pattern is
  
  // Change metrics
  avgChangePerGeneration: number // Average cells changed per generation
  totalChanges: number          // Total cell changes throughout simulation
  
  // Pattern complexity
  clusterCount: number          // Number of separate clusters
  edgePopulation: number        // Cells on cube edges
  centerPopulation: number      // Cells in cube center
  
  // Qualitative assessment
  interestScore: number         // Overall interest score (0-100)
  classification: SimulationClass
}

export type SimulationClass = 
  | 'extinct'        // Dies out quickly
  | 'stable'         // Reaches stable state
  | 'oscillating'    // Periodic behavior
  | 'chaotic'        // Complex ongoing evolution
  | 'explosive'      // Fills entire space
  | 'glider'         // Moving patterns

export interface RulesetTest {
  name: string
  config: Life3DConfig | any  // Can be Life3D or competition config
  algorithm: 'life3d' | 'competition'
  cubeSize: number
  maxGenerations: number
}

export interface SimulationResult {
  ruleset: RulesetTest
  metrics: SimulationMetrics
  generationData: GenerationSnapshot[]
  summary: string
}

export interface GenerationSnapshot {
  generation: number
  population: number
  changes: number
  colorCounts: { [color: number]: number }
  centerOfMass: [number, number, number]
}

export class SimulationAnalyzer {
  
  static analyzeRuleset(
    ruleset: RulesetTest,
    initialPattern?: (ColorIndex | null)[]
  ): SimulationResult {
    console.log(`🔬 Analyzing ruleset: ${ruleset.name}`)
    
    // Initialize
    const cubeSize = ruleset.cubeSize
    let cells = initialPattern || createRandomPattern(cubeSize, 0.15) // Sparse start
    let cellStates: CellState[] = cells.map(color => ({
      color,
      age: 0,
      energy: 100,
      isEdge: false
    }))
    
    const generationData: GenerationSnapshot[] = []
    let generation = 0
    let stabilityCounter = 0
    let previousCells = [...cells]
    
    // Track metrics
    let totalChanges = 0
    let maxPopulation = this.countPopulation(cells)
    let populationSum = maxPopulation
    
    // Simulation loop
    while (generation < ruleset.maxGenerations) {
      // Evolve one generation
      if (ruleset.algorithm === 'life3d') {
        const result = evolveLife3D(cells, cellStates, cubeSize, ruleset.config as Life3DConfig)
        cells = result.cells
        cellStates = result.cellStates
      } else {
        cells = evolveGeneration(cells, cubeSize, ruleset.config)
        cellStates = cellStates.map((state, i) => ({ ...state, color: cells[i] }))
      }
      
      generation++
      
      // Calculate changes
      const changes = this.countChanges(previousCells, cells)
      totalChanges += changes
      
      // Track population
      const population = this.countPopulation(cells)
      populationSum += population
      maxPopulation = Math.max(maxPopulation, population)
      
      // Record snapshot
      generationData.push({
        generation,
        population,
        changes,
        colorCounts: this.countColors(cells),
        centerOfMass: this.calculateCenterOfMass(cells, cubeSize)
      })
      
      // Check for stability
      if (changes === 0) {
        stabilityCounter++
        if (stabilityCounter >= 3) break // Stable for 3 generations
      } else {
        stabilityCounter = 0
      }
      
      // Check for extinction
      if (population === 0) break
      
      previousCells = [...cells]
    }
    
    // Calculate final metrics
    const metrics = this.calculateMetrics(generationData, cubeSize, totalChanges)
    
    const result: SimulationResult = {
      ruleset,
      metrics,
      generationData,
      summary: this.generateSummary(metrics, ruleset.name)
    }
    
    console.log(`✅ ${ruleset.name}: ${result.summary}`)
    return result
  }
  
  private static calculateMetrics(
    data: GenerationSnapshot[],
    cubeSize: number,
    totalChanges: number
  ): SimulationMetrics {
    if (data.length === 0) {
      return this.getDefaultMetrics()
    }
    
    const totalGenerations = data.length
    const finalSnapshot = data[data.length - 1]
    const maxPopulation = Math.max(...data.map(d => d.population))
    const avgPopulation = data.reduce((sum, d) => sum + d.population, 0) / totalGenerations
    
    // Stability analysis
    const stabilityGeneration = this.findStabilityGeneration(data)
    const oscillationPeriod = this.detectOscillation(data)
    
    // Diversity metrics
    const finalColors = Object.keys(finalSnapshot.colorCounts).length
    const spatialDistribution = this.calculateSpatialDistribution(data)
    
    // Pattern analysis
    const edgePopulation = this.estimateEdgePopulation(finalSnapshot)
    const centerPopulation = finalSnapshot.population - edgePopulation
    
    // Calculate interest score
    const interestScore = this.calculateInterestScore({
      totalGenerations,
      maxPopulation,
      avgPopulation,
      finalPopulation: finalSnapshot.population,
      oscillationPeriod,
      colorDiversity: finalColors,
      avgChangePerGeneration: totalChanges / totalGenerations,
      spatialDistribution
    })
    
    const classification = this.classifySimulation(data, cubeSize)
    
    return {
      totalGenerations,
      finalPopulation: finalSnapshot.population,
      maxPopulation,
      avgPopulation,
      stabilityGeneration,
      oscillationPeriod,
      colorDiversity: finalColors,
      spatialDistribution,
      avgChangePerGeneration: totalChanges / totalGenerations,
      totalChanges,
      clusterCount: 0, // TODO: Implement cluster detection
      edgePopulation,
      centerPopulation,
      interestScore,
      classification
    }
  }
  
  private static calculateInterestScore(params: {
    totalGenerations: number
    maxPopulation: number
    avgPopulation: number
    finalPopulation: number
    oscillationPeriod: number
    colorDiversity: number
    avgChangePerGeneration: number
    spatialDistribution: number
  }): number {
    let score = 0
    
    // Longevity (0-25 points)
    score += Math.min(params.totalGenerations / 4, 25)
    
    // Population dynamics (0-20 points)
    if (params.maxPopulation > 0 && params.finalPopulation > 0) {
      score += Math.min(params.avgPopulation / 10, 20)
    }
    
    // Activity level (0-20 points)
    score += Math.min(params.avgChangePerGeneration * 2, 20)
    
    // Complexity (0-15 points)
    score += Math.min(params.colorDiversity * 3, 15)
    
    // Pattern behavior (0-20 points)
    if (params.oscillationPeriod > 1) {
      score += 15 // Oscillating patterns are interesting
    } else if (params.finalPopulation > 0 && params.totalGenerations > 50) {
      score += 10 // Long-lived stable patterns
    }
    
    // Spatial distribution (0-10 points)
    score += Math.min(params.spatialDistribution * 10, 10)
    
    return Math.min(Math.round(score), 100)
  }
  
  private static classifySimulation(data: GenerationSnapshot[], cubeSize: number): SimulationClass {
    const final = data[data.length - 1]
    const totalCells = cubeSize ** 3
    
    if (final.population === 0) return 'extinct'
    if (final.population > totalCells * 0.8) return 'explosive'
    
    const oscillationPeriod = this.detectOscillation(data)
    if (oscillationPeriod > 1) return 'oscillating'
    
    // Check for recent changes
    const recentChanges = data.slice(-10).reduce((sum, d) => sum + d.changes, 0)
    if (recentChanges === 0) return 'stable'
    
    // Check for movement patterns (potential gliders)
    if (this.detectMovement(data)) return 'glider'
    
    return 'chaotic'
  }
  
  // Utility methods
  private static countPopulation(cells: (ColorIndex | null)[]): number {
    return cells.filter(cell => cell !== null).length
  }
  
  private static countChanges(prev: (ColorIndex | null)[], curr: (ColorIndex | null)[]): number {
    return prev.reduce((count: number, cell, i) => cell !== curr[i] ? count + 1 : count, 0)
  }
  
  private static countColors(cells: (ColorIndex | null)[]): { [color: number]: number } {
    const counts: { [color: number]: number } = {}
    cells.forEach(cell => {
      if (cell !== null) {
        counts[cell] = (counts[cell] || 0) + 1
      }
    })
    return counts
  }
  
  private static calculateCenterOfMass(cells: (ColorIndex | null)[], cubeSize: number): [number, number, number] {
    let totalX = 0, totalY = 0, totalZ = 0, count = 0
    
    cells.forEach((cell, i) => {
      if (cell !== null) {
        const x = i % cubeSize
        const y = Math.floor(i / cubeSize) % cubeSize
        const z = Math.floor(i / (cubeSize * cubeSize))
        totalX += x
        totalY += y
        totalZ += z
        count++
      }
    })
    
    return count > 0 ? [totalX/count, totalY/count, totalZ/count] : [0, 0, 0]
  }
  
  private static findStabilityGeneration(data: GenerationSnapshot[]): number {
    // Find when changes dropped to near zero consistently
    for (let i = data.length - 1; i >= 3; i--) {
      if (data.slice(i-3, i).every(d => d.changes === 0)) {
        return i - 3
      }
    }
    return data.length
  }
  
  private static detectOscillation(data: GenerationSnapshot[]): number {
    if (data.length < 10) return 0
    
    const recent = data.slice(-20).map(d => d.population)
    
    // Check for periods 2-10
    for (let period = 2; period <= 10; period++) {
      if (this.isOscillating(recent, period)) {
        return period
      }
    }
    return 0
  }
  
  private static isOscillating(values: number[], period: number): boolean {
    if (values.length < period * 3) return false
    
    for (let i = 0; i < period; i++) {
      const val = values[values.length - 1 - i]
      for (let j = 1; j < 3; j++) {
        if (values[values.length - 1 - i - j * period] !== val) {
          return false
        }
      }
    }
    return true
  }
  
  private static calculateSpatialDistribution(data: GenerationSnapshot[]): number {
    if (data.length === 0) return 0
    
    const final = data[data.length - 1]
    const centerOfMass = final.centerOfMass
    
    // Simple distribution metric - how far from origin
    const distance = Math.sqrt(
      Math.pow(centerOfMass[0], 2) +
      Math.pow(centerOfMass[1], 2) +
      Math.pow(centerOfMass[2], 2)
    )
    
    return Math.min(distance / 10, 1) // Normalize roughly
  }
  
  private static estimateEdgePopulation(snapshot: GenerationSnapshot): number {
    // Rough estimate - assume 1/3 of population is on edges for typical patterns
    return Math.round(snapshot.population * 0.3)
  }
  
  private static detectMovement(data: GenerationSnapshot[]): boolean {
    if (data.length < 10) return false
    
    // Check if center of mass is moving consistently
    const recent = data.slice(-10)
    let totalMovement = 0
    
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i-1].centerOfMass
      const curr = recent[i].centerOfMass
      const movement = Math.sqrt(
        Math.pow(curr[0] - prev[0], 2) +
        Math.pow(curr[1] - prev[1], 2) +
        Math.pow(curr[2] - prev[2], 2)
      )
      totalMovement += movement
    }
    
    return totalMovement > 2 // Threshold for "significant movement"
  }
  
  private static getDefaultMetrics(): SimulationMetrics {
    return {
      totalGenerations: 0,
      finalPopulation: 0,
      maxPopulation: 0,
      avgPopulation: 0,
      stabilityGeneration: 0,
      oscillationPeriod: 0,
      colorDiversity: 0,
      spatialDistribution: 0,
      avgChangePerGeneration: 0,
      totalChanges: 0,
      clusterCount: 0,
      edgePopulation: 0,
      centerPopulation: 0,
      interestScore: 0,
      classification: 'extinct'
    }
  }
  
  private static generateSummary(metrics: SimulationMetrics, name: string): string {
    const { classification, interestScore, totalGenerations, finalPopulation } = metrics
    
    return `${name}: ${classification} (score: ${interestScore}/100, ${totalGenerations} gen, final pop: ${finalPopulation})`
  }
}