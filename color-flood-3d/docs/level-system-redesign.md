# Level System Redesign Plan

## Current Problems
1. Only 3x3x3 has curated levels; other sizes get random levels
2. No level persistence for larger cube sizes
3. Level progression breaks when changing cube size
4. UI shows "New Game" button but it's unclear what it does

## Terminology Decision
**Recommendation: Use "Puzzle" instead of "Level"**
- "Puzzle #1", "Puzzle #2" etc. feels more appropriate for this game type
- "New Puzzle" is clearer than "New Game" 
- "Puzzle Set" for collections

## Proposed Architecture

### 1. Universal Puzzle ID System
```
Format: {difficulty}-{number}-{size}
Examples:
- tutorial-01-3x3
- easy-03-4x4
- expert-05-6x6
```

### 2. Puzzle Generation Strategy

#### Option A: Scale Existing Puzzles (Recommended)
- Take the 10 hand-crafted 3x3x3 puzzles
- Create scaling algorithms to expand them to larger sizes
- Preserve the "spirit" of each puzzle while adapting to more cells
- Benefits: Consistent experience, proven difficulty curve

#### Option B: Size-Specific Puzzle Sets
- Generate 10 puzzles for each cube size
- Use deterministic seeds for reproducibility
- Store in separate files
- Benefits: Optimized for each size

#### Option C: Hybrid Approach
- Scale tutorials (1-2) and easy puzzles (3-4)
- Generate new puzzles for medium+ difficulties
- Benefits: Easier onboarding, unique challenges

### 3. UI/UX Improvements

#### Unified Control Panel Changes
```
Current:
[🎮 Game] → Opens level selector

Proposed:
[📦 3x3] [Puzzles ▼]
         ├─ Browse Puzzles
         ├─ Random Easy
         ├─ Random Medium
         ├─ Random Hard
         └─ Continue (#7)
```

#### Alternative Design:
```
┌─ Cube Size ─┐  ┌─ Puzzle ─────┐
│ 3×3 4×4     │  │ Tutorial #1  │
│ 5×5 6×6     │  │ [Change]     │
└─────────────┘  └──────────────┘
```

### 4. Implementation Phases

#### Phase 1: Puzzle Scaling System
1. Create `puzzleScaler.ts` with algorithms:
   - Nearest neighbor scaling
   - Pattern repetition
   - Gradient interpolation
2. Scale all 10 puzzles to 4x4, 5x5, 6x6
3. Adjust move counts using difficulty multipliers

#### Phase 2: Puzzle Management
1. Create `PuzzleManager` class
2. Store scaled puzzles in:
   - `puzzles/tutorials.ts`
   - `puzzles/easy.ts`
   - `puzzles/medium.ts`
   - etc.
3. Each file contains all sizes for that difficulty

#### Phase 3: UI Updates
1. Redesign control panel puzzle selection
2. Add current puzzle display
3. Show puzzle number and difficulty
4. Quick puzzle browser dropdown

#### Phase 4: Progress System
1. Track progress per cube size
2. Aggregate stats view
3. "Complete all sizes" achievements

### 5. Puzzle Scaling Algorithms

#### A. Simple Expansion (for tutorials)
```
3x3x3 layer:        4x4x4 layer:
[R][G][B]     →     [R][R][G][B]
[R][G][B]           [R][R][G][B]
[R][G][B]           [R][R][G][B]
                    [R][R][G][B]
```

#### B. Pattern Interpolation (for complex puzzles)
- Analyze color regions in original
- Expand regions proportionally
- Maintain relative complexity

#### C. Fractal Scaling (for organic puzzles)
- Treat each cell as a mini-cube
- Apply original pattern within each cell
- Smooth boundaries

### 6. Move Count Scaling

```typescript
const getMoveCount = (baseMoves: number, fromSize: number, toSize: number) => {
  const cellRatio = (toSize ** 3) / (fromSize ** 3);
  const complexityFactor = Math.log2(cellRatio) + 1;
  return Math.ceil(baseMoves * complexityFactor);
};
```

### 7. Benefits of This Approach

1. **Consistency**: Same puzzle across all sizes
2. **Progression**: Maintain difficulty curve
3. **Replayability**: Can master same puzzle at different scales
4. **Clarity**: Clear puzzle selection UI
5. **Achievement**: Complete puzzle at all sizes

### 8. Future Enhancements

1. **Puzzle Editor**: Create custom puzzles
2. **Daily Puzzle**: One puzzle per day at all sizes
3. **Puzzle Sharing**: Share codes for custom puzzles
4. **Speed Run Mode**: Track best times per puzzle
5. **Minimal Moves**: Show optimal solution count

## Next Steps

1. Implement puzzle scaler
2. Generate puzzle sets for all sizes
3. Update UI components
4. Migrate save data format
5. Add puzzle browser