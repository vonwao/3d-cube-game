# Icon List for Color Flood 3D

## Current Icons Used

### Game Control Icons
1. **Undo** - Currently: ↩️ (emoji)
   - Location: MinimalControls.tsx:72
   - Purpose: Undo last move
   - Alternative needs: Curved arrow, back arrow, undo symbol

2. **Reset** - Currently: 🔄 (emoji)
   - Location: MinimalControls.tsx:80
   - Purpose: Reset level to beginning
   - Alternative needs: Refresh, circular arrows, reset symbol

3. **Explode/Expand** - Currently: ⤴️ (emoji)
   - Location: MinimalControls.tsx:89
   - Purpose: Toggle exploded view of cube
   - Alternative needs: Expand arrows, explosion, spread out symbol

### UI Toggle Icons
4. **Color Palette** - Currently: 🎨 (emoji)
   - Location: MinimalControls.tsx:117
   - Purpose: Toggle color palette visibility
   - Alternative needs: Palette, paint brush, color wheel

5. **Game Controller/D-pad** - Currently: 🎮 (emoji)
   - Location: MinimalControls.tsx:125
   - Purpose: Toggle D-pad controls visibility
   - Alternative needs: Game controller, D-pad, joystick

6. **New Game** - Currently: ⭐ (emoji)
   - Location: MinimalControls.tsx:134
   - Purpose: Open new game menu
   - Alternative needs: Star, plus, new document, sparkle

### Navigation Icons
7. **Menu/Hamburger** - Currently: ☰ (text character)
   - Location: MinimalControls.tsx:155
   - Purpose: Open main menu
   - Alternative needs: Three lines, hamburger menu, menu dots

8. **Close/Dismiss** - Currently: × (text character)
   - Location: Multiple locations (WinDialog, Instructions, etc.)
   - Purpose: Close dialogs and menus
   - Alternative needs: X mark, close button, cross

### D-pad Control Icons
9. **Arrow Up** - Currently: ↑ (text character)
   - Location: DpadControls.tsx
   - Purpose: Rotate cube up
   - Alternative needs: Chevron up, arrow up, caret up

10. **Arrow Down** - Currently: ↓ (text character)
    - Location: DpadControls.tsx
    - Purpose: Rotate cube down
    - Alternative needs: Chevron down, arrow down, caret down

11. **Arrow Left** - Currently: ← (text character)
    - Location: DpadControls.tsx
    - Purpose: Rotate cube left
    - Alternative needs: Chevron left, arrow left, caret left

12. **Arrow Right** - Currently: → (text character)
    - Location: DpadControls.tsx
    - Purpose: Rotate cube right
    - Alternative needs: Chevron right, arrow right, caret right

13. **Zoom In** - Currently: + (text character)
    - Location: DpadControls.tsx
    - Purpose: Zoom in camera
    - Alternative needs: Plus, magnifying glass plus, zoom in

14. **Zoom Out** - Currently: − (text character)
    - Location: DpadControls.tsx
    - Purpose: Zoom out camera
    - Alternative needs: Minus, magnifying glass minus, zoom out

## Icon Requirements

### Visual Consistency Needs
- Consistent stroke width
- Matching visual style (outlined vs filled)
- Appropriate sizing at different scales
- Good contrast on dark backgrounds
- Clear meaning at small sizes

### Technical Requirements
- Vector format (SVG preferred)
- React component compatibility
- Tree-shakeable (only import used icons)
- TypeScript support
- Accessible (proper ARIA labels)
- Lightweight bundle size

### Semantic Categories
1. **Actions**: Undo, Reset, New Game
2. **View Controls**: Explode, Zoom In/Out
3. **UI Toggles**: Color Palette, D-pad, Menu
4. **Navigation**: Arrows (Up, Down, Left, Right)
5. **Utility**: Close, Hamburger Menu

## Popular Icon Library Options to Research
- **Lucide React** - Clean, consistent, open source
- **Heroicons** - By Tailwind team, two styles (outline/solid)
- **Phosphor Icons** - 6 weights, very comprehensive
- **Tabler Icons** - 3000+ icons, consistent stroke
- **Feather Icons** - Minimal, clean design
- **React Icons** - Includes many icon sets in one
- **Radix Icons** - 15x15 grid, crisp at small sizes
- **IconPark** - Configurable themes and styles