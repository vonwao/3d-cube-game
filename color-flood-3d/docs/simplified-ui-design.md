# Simplified UI Design

## Current Random Generation (Keep It!)
- Creates organic color clusters with smoothing
- 30% chance for cells to adopt neighbor colors
- Natural-looking puzzles that are fun to solve
- Different every time = infinite replayability

## Proposed UI Simplification

### Main Game View
```
┌─────────────────────────────────────┐
│                                     │
│         [3D Cube Here]              │
│                                     │
└─────────────────────────────────────┘

Bottom Bar:
[Undo] [Reset] Moves: 5/12 [☰]
                            └─ Hamburger Menu
```

### Hamburger Menu Contents
```
┌─ Settings ──────────────────┐
│ Cube Size                   │
│ [3×3] [4×4] [5×5] [6×6]     │
│                             │
│ ─────────────────────────── │
│                             │
│ □ Show Color Palette        │
│ □ Show Instructions         │
│ □ Animation Speed ▼         │
│                             │
│ ─────────────────────────── │
│                             │
│ Keyboard Shortcuts:         │
│ • 1-6: Select colors        │
│ • E: Explode view           │
│ • U: Undo                   │
│ • R: Reset                  │
│ • Arrow keys: Rotate        │
│                             │
│ ─────────────────────────── │
│                             │
│ Special Puzzles ▼           │
│ • The Onion (3×3×3)         │
│ • Rainbow Cube (4×4×4)      │
│ • The Gradient (5×5×5)      │
│                             │
│ [New Random Puzzle]         │
└─────────────────────────────┘
```

### Core Gameplay Focus
```
Essential Controls Only:
- Undo (for mistakes)
- Reset (start over)
- Move counter (know your progress)
- Menu (everything else)

The Explode button gets integrated into the 3D view:
- Small [⤴] icon in corner of canvas
- Or just rely on 'E' key
```

## Benefits of This Approach

1. **Clean Interface**: Only what you need while playing
2. **Direct Interaction**: Click the cubes, not a palette
3. **Random First**: Embrace the good random generation
4. **Special Puzzles**: A few curated ones for variety
5. **Mobile Friendly**: Everything fits on small screens

## Color Selection Without Palette

Since you prefer clicking cells directly:

1. **Smart Color Detection**: 
   - Click any visible cell to flood that color
   - No need for separate palette

2. **Visual Feedback**:
   - Hover = subtle glow
   - Click = ripple effect
   - Color spreads from click point

3. **For Keyboard Users**:
   - Keep 1-6 shortcuts
   - Show current color in move counter area
   - "Moves: 5/12 • Color: 🟦"

## Implementation Priority

1. **Remove color palette from main UI**
2. **Create hamburger menu**
3. **Make cells directly clickable for color selection**
4. **Move cube size selector to menu**
5. **Add a few special hand-crafted puzzles**
6. **Simplify bottom bar**