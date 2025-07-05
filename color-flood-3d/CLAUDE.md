# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (runs TypeScript check then Vite build)
- `pnpm lint` - Run ESLint on all files
- `pnpm test` - Run Jest tests once
- `pnpm test:watch` - Run Jest tests in watch mode
- `pnpm test:coverage` - Run Jest tests with coverage report
- `pnpm preview` - Preview production build locally

## Project Architecture

This is a 3D Color Flood puzzle game built with React, TypeScript, and Three.js. The game presents a 3x3x3 cube where players flood-fill colors to make the entire cube the same color.

### Key Technologies
- **React 19** with TypeScript for UI components
- **Three.js** with **@react-three/fiber** and **@react-three/drei** for 3D rendering
- **Zustand** for state management
- **Vite** for build tooling
- **Jest** with Testing Library for testing

### Core Architecture

**Engine Layer** (`src/engine/`):
- `CubeMesh.tsx` - Three.js instanced mesh renderer for the 3x3x3 cube using efficient instancing
- `useCubeControls.ts` - Custom hook for mouse/keyboard 3D rotation controls
- `types.ts` - Shared 3D coordinate types (Vec3)

**Game Logic** (`src/games/color-flood/logic/`):
- `simpleGameStore.ts` - Zustand store managing game state with individual selectors to prevent unnecessary re-renders
- `flood.ts` - Core flood fill algorithm, neighbor calculation, and win condition logic
- `types.ts` - Game-specific types including ColorIndex, CubeState, Level, and ColorPalette definitions

**UI Components** (`src/games/color-flood/ui/`):
- `ColorPalette.tsx` - Interactive color selection with keyboard shortcuts (1-6)
- `GameHUD.tsx` - Game stats display (moves, max moves)
- `Instructions.tsx` - Game instructions and controls

### Game State Management

The game uses Zustand with a carefully designed store structure:
- **Individual selectors** (e.g., `useCubeState`, `useCurrentLevel`) prevent unnecessary re-renders
- **Immutable updates** ensure proper React re-rendering
- **Undo/redo stack** maintains game history
- **Animation state** manages transition effects

### 3D Rendering Strategy

- **Instanced rendering** for efficient 3x3x3 cube display (27 instances)
- **Dual mesh system**: main cubes + highlight overlay for flood region visualization
- **Position-based indexing** converts 1D array indices to 3D coordinates
- **Interactive clicking** with Three.js raycasting for cell selection

### Testing Setup

- Jest configured with jsdom environment for React components
- Test files located in `__tests__/` directories or `.test.ts` suffix
- Coverage collection excludes build artifacts and type definitions
- Setup file at `src/setupTests.ts` configures Testing Library

### Development Patterns

- **Component composition** over inheritance
- **Custom hooks** for reusable logic (controls, game state)
- **Type safety** with strict TypeScript configuration
- **Functional programming** patterns in game logic
- **Immutable state updates** throughout the application

## Game Design Principles

### Core Design Philosophy

This Color Flood 3D game demonstrates several key game design principles that should be maintained and extended:

### 1. Transparency Through Configurability

**Principle**: Games should be understandable through experimentation and transparency of systems.

**Implementation**:
- **Level Selection**: Players should be able to choose starting conditions rather than being forced through linear progression
- **Settings Exposure**: Game mechanics (animation speed, rotation sensitivity, color palettes) should be adjustable
- **Visual Feedback**: All game state changes should be clearly communicated through UI and animations
- **Debug/Developer Tools**: Expose internal state for understanding and testing

**Current Gaps**:
- No level selection UI - players can't choose difficulty or starting conditions
- Animation system is hidden/hardcoded rather than configurable
- No way to experiment with different color palettes or cube sizes

### 2. Progressive Complexity with Clear Feedback

**Principle**: Games should teach through doing, with clear cause-and-effect relationships.

**Implementation**:
- **Tutorial Levels**: Start with simple 2-color, 2-move scenarios
- **Flood Region Visualization**: White wireframes clearly show the player's current territory
- **Move Counter**: Clear indication of progress and remaining moves
- **Star Rating System**: Performance feedback encourages optimization

**Current Gaps**:
- Instructions are text-heavy rather than interactive
- No visual preview of what will happen when selecting a color
- Animation timing is too fast to understand the flood-fill process

### 3. Intuitive 3D Interaction

**Principle**: 3D games should feel natural and provide clear spatial understanding.

**Implementation**:
- **Multiple Control Schemes**: Mouse drag, arrow keys, Q/E for rotation
- **Smooth Rotation**: Damped movement feels natural
- **Proper Camera Angle**: Isometric view shows cube structure clearly
- **Visual Hierarchy**: Current flood region is highlighted differently from rest of cube

**Current Gaps**:
- Keyboard event conflicts between color selection and cube rotation
- No face/cell highlighting on hover
- No visual indication of which cells are "reachable" in next move

### 4. Flood Fill Game Mechanics

**Specific to Color Flood games**:

**Core Loop**:
1. **Assess**: Player examines current flood region (white wireframes)
2. **Plan**: Consider which color will maximize expansion
3. **Execute**: Select color and watch region grow
4. **Repeat**: Continue until entire cube is one color

**Key Mechanics**:
- **Adjacency Rules**: Only orthogonally connected cells (not diagonal)
- **Flood Expansion**: New color must be different from current to trigger expansion
- **Strategic Depth**: Planning 2-3 moves ahead becomes crucial in harder levels
- **Constraint**: Limited moves force efficient solutions

**Design Insights**:
- Early levels (2-3 moves) teach the mechanic but feel too simple
- Medium levels (4-6 moves) provide good strategic depth
- Hard levels (8+ moves) require significant planning and spatial reasoning
- The 3x3x3 cube size is optimal for complexity without overwhelming players

### 5. State Management for Games

**Principle**: Game state should be predictable, undoable, and easily debuggable.

**Implementation**:
- **Immutable State**: All game state changes create new objects
- **Undo Stack**: Players can reverse moves to experiment
- **Atomic Operations**: Each move is a complete state transition
- **Separation of Concerns**: Game logic separate from UI rendering

**Technical Patterns**:
- Individual Zustand selectors prevent unnecessary re-renders
- Pure functions for game logic enable easy testing
- Animation state is separate from game state
- Level data is static and easily modified