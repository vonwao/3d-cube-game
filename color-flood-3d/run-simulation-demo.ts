// Quick demo script to test the simulation analysis system
// Run with: npx tsx run-simulation-demo.ts

import { BatchSimulator } from './src/games/color-competition/analysis/batchSimulator'

async function runDemo() {
  console.log('🚀 Running simulation analysis demo...\n')
  
  const config = {
    cubeSize: 4,          // Small for quick demo
    maxGenerations: 50,   // Short runs
    runsPerRuleset: 1,    // Single run per ruleset
    includeRandomStart: true,
    includePatternStart: false
  }
  
  const result = await BatchSimulator.runBatchSimulation(config)
  
  console.log('\n📊 SIMULATION RESULTS:')
  console.log('='.repeat(50))
  console.log(`Total rulesets tested: ${result.summary.totalRulesets}`)
  console.log(`Average interest score: ${result.summary.averageInterestScore.toFixed(1)}/100`)
  console.log(`Best ruleset: ${result.summary.bestRuleset.summary}`)
  
  console.log('\n🏆 TOP 5 RULESETS:')
  result.summary.topRulesets.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.ruleset.name} (Score: ${r.metrics.interestScore}) - ${r.metrics.classification}`)
  })
  
  console.log('\n📈 CLASSIFICATIONS:')
  Object.entries(result.summary.classifications).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })
  
  // Export detailed results
  const jsonData = BatchSimulator.exportResults(result)
  console.log('\n💾 Results exported to JSON (copy from console):')
  console.log(jsonData)
}

runDemo().catch(console.error)