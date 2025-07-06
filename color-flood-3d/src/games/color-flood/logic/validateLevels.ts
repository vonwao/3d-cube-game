import { SAMPLE_LEVELS } from '../levels/sampleLevels';
import { analyzeLevels, validateLevels } from './solver';

// Run validation on all sample levels
console.log('🔍 Analyzing all sample levels...\n');

const validation = validateLevels(SAMPLE_LEVELS);

if (validation.valid) {
  console.log('✅ All levels are valid and solvable!');
} else {
  console.log('❌ Found issues with levels:');
  validation.issues.forEach(issue => console.log(`  - ${issue}`));
}

console.log('\n📊 Detailed analysis:');
const solutions = analyzeLevels(SAMPLE_LEVELS);

console.log('\n📝 Summary table:');
console.log('Level ID'.padEnd(20) + 'Optimal'.padEnd(10) + 'Declared'.padEnd(10) + 'Status');
console.log('-'.repeat(50));

for (const level of SAMPLE_LEVELS) {
  const solution = solutions[level.id];
  const status = !solution.solvable ? 'UNSOLVABLE' : 
                 solution.optimalMoves > level.maxMoves ? 'TOO HARD' :
                 solution.optimalMoves === level.maxMoves ? 'PERFECT' :
                 'EASY';
  
  console.log(
    level.id.padEnd(20) + 
    (solution.solvable ? solution.optimalMoves.toString() : 'N/A').padEnd(10) + 
    level.maxMoves.toString().padEnd(10) + 
    status
  );
}