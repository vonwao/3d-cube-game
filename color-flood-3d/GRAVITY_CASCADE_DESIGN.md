# Gravity Cascade - Game Design Document

## Overview
**Gravity Cascade** is a 3D puzzle game where colored blocks fall towards a central gravity well. Players swap adjacent blocks to create matching groups of 3 or more, triggering explosive chain reactions and cascading physics.

## Core Concept
- **Theme**: Space-themed block matching with gravitational physics
- **Core Loop**: Swap → Match → Explode → Cascade → Score
- **Unique Selling Point**: 3D gravity mechanics where blocks fall towards the center from all directions

## Game Mechanics

### 1. Block Generation & Sparse Matrix
- **Initial State**: Single block at the center (gravity core)
- **Spawning Pattern**: 
  - New blocks spawn at outer edges (sparse distribution)
  - Spawn rate increases with score/level
  - Distribution: 80% edge, 15% mid-layer, 5% near-center
- **Maximum Capacity**: ~40-50% of total cube volume to maintain "sparse" feel

### 2. Gravity System
- **Center Gravity Well**: All blocks attracted to the center point
- **Fall Mechanics**:
  - Blocks fall when no solid block beneath them (relative to center)
  - Fall speed: 0.5 units/second (adjustable)
  - Smooth interpolation for visual appeal
- **Directional Gravity**: 
  - Each block knows its "down" direction (towards center)
  - 26 possible gravity vectors in 3D space

### 3. Interaction Mechanics
- **Primary Action**: Click to select, click neighbor to swap
- **Valid Swaps**: 
  - Only orthogonally adjacent blocks (6 directions)
  - Cannot swap with empty space
  - Cannot swap during fall animations
- **Visual Feedback**:
  - Selected block: White outline + gentle pulse
  - Valid swap targets: Highlighted when selected
  - Invalid targets: Red tint or shake animation

### 4. Matching Rules
- **Basic Match**: 3+ same-colored blocks in a line
- **Detection Patterns**:
  - Check all 3 axes from each block's perspective
  - Account for gravity direction (matches can be "vertical" relative to block)
- **Match Types**:
  - Line Match (3-5 blocks): Base points
  - Big Match (6+ blocks): Bonus multiplier
  - Cross Match (T or L shape): Special effects
  - Cube Match (2x2x2 same color): Mega bonus

### 5. Cascade Physics
- **Post-Match Behavior**:
  - Matched blocks explode (particle effects)
  - Remaining blocks fall towards center
  - New matches detected after movement settles
- **Chain Reactions**:
  - Cascading matches multiply score
  - Combo counter increases with each cascade
  - Visual/audio feedback intensifies with combo level

### 6. Scoring System
- **Base Points**:
  - 3-match: 100 points
  - 4-match: 200 points
  - 5-match: 400 points
  - 6+ match: 800 points
- **Multipliers**:
  - Cascade combo: x2, x3, x4, etc.
  - Speed bonus: Complete matches quickly
  - Efficiency bonus: Fewer moves to clear level
- **Special Bonuses**:
  - Cross match: +500
  - Cube match: +2000
  - Clear entire layer: +5000

## Visual Design

### 1. Aesthetic
- **Theme**: Cosmic/Space with neon accents
- **Core Visual**: Glowing gravity well at center
- **Blocks**: Semi-transparent with inner glow
- **Background**: Starfield with subtle nebula effects

### 2. Color Palette
```
- Red:     #FF006E (Neon Pink)
- Blue:    #3A86FF (Electric Blue)
- Green:   #8FE1A5 (Mint Green)
- Yellow:  #FFBE0B (Solar Yellow)
- Purple:  #C77DFF (Cosmic Purple)
- Orange:  #FB5607 (Nebula Orange)
```

### 3. Effects
- **Gravity Well**: Pulsing energy core with particle streams
- **Block Explosions**: Color-matched particle bursts
- **Cascade Trail**: Light trails following falling blocks
- **Combo Effects**: Screen shake, flash effects, energy waves

### 4. UI Elements
- **Score Display**: Top-left with combo multiplier
- **Level Progress**: Top-right progress bar
- **Move Counter**: Bottom-left (if using move limits)
- **Power-up Indicators**: Bottom-right

## Game Progression

### 1. Level Structure
- **Tutorial Levels (1-3)**: Learn swap, match, gravity
- **Easy Levels (4-10)**: 3-4 colors, sparse blocks
- **Medium Levels (11-20)**: 5 colors, moderate density
- **Hard Levels (21-30)**: 6 colors, higher density, obstacles
- **Endless Mode**: Continuous play with increasing difficulty

### 2. Difficulty Scaling
- **Block Spawn Rate**: Increases per level
- **Color Count**: 3 → 4 → 5 → 6 colors
- **Gravity Strength**: Can vary for special levels
- **Special Blocks**: Introduced in later levels

### 3. Objectives
- **Score Target**: Reach X points
- **Clear Blocks**: Remove all blocks of specific color
- **Cascade Challenge**: Create X-length cascade
- **Time Trial**: Score points within time limit
- **Survival**: Prevent blocks from filling cube

## Special Mechanics (Future Expansions)

### 1. Power-up Blocks
- **Bomb Block**: Explodes 3x3x3 area when matched
- **Rainbow Block**: Matches with any color
- **Gravity Reverser**: Temporarily reverses gravity direction
- **Time Slower**: Slows down fall speed
- **Color Changer**: Changes all blocks of one color

### 2. Obstacle Blocks
- **Stone Blocks**: Cannot be swapped, must be exploded
- **Ice Blocks**: Must be matched twice to break
- **Lock Blocks**: Unlock by matching adjacent blocks
- **Black Holes**: Absorb nearby blocks periodically

### 3. Environmental Effects
- **Gravity Storms**: Periodic gravity direction changes
- **Color Waves**: All blocks of one color glow and give bonus points
- **Zero Gravity**: Temporary floating (easier matching)
- **Hyper Gravity**: Faster falling (increased difficulty)

## Technical Implementation

### 1. Architecture
- **Game State**: Zustand store for block positions, colors, score
- **Physics Engine**: Custom gravity simulation
- **Animation System**: React Spring for smooth transitions
- **3D Rendering**: Three.js with instanced meshes

### 2. Performance Optimizations
- **Instanced Rendering**: Single draw call for all blocks
- **Spatial Indexing**: Efficient neighbor lookups
- **Animation Batching**: Group simultaneous animations
- **LOD System**: Reduce detail for distant blocks

### 3. Data Structures
```typescript
interface Block {
  id: string
  position: Vec3
  targetPosition: Vec3
  color: ColorIndex
  isFalling: boolean
  isLocked: boolean
}

interface GameState {
  blocks: Map<string, Block>
  score: number
  combo: number
  level: number
  selectedBlock: string | null
}
```

## Sound Design
- **Swap Sound**: Soft "whoosh"
- **Match Sound**: Crystalline chime (pitch based on match size)
- **Explosion**: Deep bass thump with sparkle
- **Cascade**: Rising pitch sequence
- **Gravity Pull**: Low frequency rumble
- **Combo**: Escalating excitement stingers

## Controls
- **Mouse**: Click to select, click to swap
- **Touch**: Tap to select, tap to swap
- **Keyboard**: 
  - Arrow keys: Navigate selection
  - Space: Confirm swap
  - R: Rotate camera
  - ESC: Pause menu

## MVP Features (Initial Release)
1. ✅ Basic swap mechanics
2. ✅ Match-3 detection
3. ✅ Gravity physics
4. ✅ Score system
5. ✅ 5 tutorial levels
6. ✅ 10 main levels
7. ✅ Basic visual effects
8. ✅ Sound effects

## Future Roadmap
- **Phase 1**: Power-up blocks, Endless mode
- **Phase 2**: Multiplayer versus mode
- **Phase 3**: Level editor and sharing
- **Phase 4**: Mobile app version