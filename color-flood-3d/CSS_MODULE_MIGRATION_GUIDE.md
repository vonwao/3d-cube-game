# CSS Module Migration Guide

## Overview
This guide explains how to migrate from global CSS files with !important declarations to CSS Modules for better encapsulation and elimination of specificity conflicts.

## Why CSS Modules?

1. **Eliminates !important**: CSS Modules provide locally scoped styles that don't conflict with Three.js or other libraries
2. **Better maintainability**: Styles are encapsulated with their components
3. **Type safety**: With TypeScript, you can get type definitions for your CSS classes
4. **No global pollution**: Class names are automatically hashed to prevent conflicts

## Migration Steps

### 1. Update Imports

#### ColorFloodGame
**Old (in GameHomePage.tsx):**
```tsx
import '../games/color-flood/ColorFloodGame.css'
```

**New:**
```tsx
import styles from '../games/color-flood/ColorFloodGame.module.css'
```

#### ColorCompetitionGame
**Old (in ColorCompetitionGame.tsx):**
```tsx
import './ColorCompetitionGame.css'
```

**New:**
```tsx
import styles from './ColorCompetitionGame.module.css'
```

### 2. Update Class Names in Components

#### Example for ColorFloodGame.tsx:
```tsx
// Old
<div className="color-flood-game">
  <div className="game-container">
    <div className="game-scene">
      <canvas className="game-canvas" />
    </div>
  </div>
</div>

// New
<div className={styles.colorFloodGame}>
  <div className={styles.gameContainer}>
    <div className={styles.gameScene}>
      <canvas className={styles.gameCanvas} />
    </div>
  </div>
</div>
```

### 3. Critical Canvas Styles

The CSS modules handle Three.js canvas styling without !important by using:
- CSS Module's local scoping for higher specificity
- `:global()` selector for targeting nested canvas elements
- Proper cascade ordering

Example from ColorFloodGame.module.css:
```css
.gameCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: default;
}

/* Target canvas element inside container */
.gameScene :global(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}
```

### 4. Handling Dynamic Classes

For conditional classes:
```tsx
// Old
<div className={`star ${filled ? 'filled' : 'empty'}`}>

// New
<div className={`${styles.star} ${filled ? styles.starFilled : styles.starEmpty}`}>
```

For multiple classes:
```tsx
// Old
<div className="control-button active">

// New
<div className={`${styles.controlButton} ${styles.controlButtonActive}`}>
```

### 5. Key Changes in CSS Modules

1. **Removed all !important declarations** - CSS Modules' scoping provides sufficient specificity
2. **Camelized class names** - `color-flood-game` becomes `colorFloodGame`
3. **Maintained responsive utilities** - Using standard media queries
4. **Preserved accessibility features** - `prefers-reduced-motion` works as before

### 6. TypeScript Support

Add type definitions for better DX:
```tsx
// types/css-modules.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

### 7. Testing the Migration

1. Verify Three.js canvas renders properly without styling issues
2. Check that all interactive elements maintain their hover/active states
3. Test responsive behavior on different screen sizes
4. Ensure accessibility features like reduced motion still work

## Benefits Achieved

1. **No more !important**: All styles work through proper CSS specificity
2. **Better performance**: Smaller bundle sizes with tree-shaking
3. **Maintainability**: Styles are co-located with components
4. **No conflicts**: Three.js inline styles don't conflict with our styles
5. **Future-proof**: Easy to migrate to CSS-in-JS solutions if needed

## Next Steps

1. Update all component files to use the new CSS module imports
2. Replace all className strings with CSS module references
3. Test thoroughly, especially Three.js canvas rendering
4. Remove old .css files once migration is complete
5. Consider adding CSS Module type generation for better TypeScript support

## Notes

- The `:global()` selector is used sparingly, only for Three.js canvas elements
- All animation and transition durations are maintained for accessibility
- Design system variables from `design-system.css` are still available
- Module composition can be used for shared styles between components