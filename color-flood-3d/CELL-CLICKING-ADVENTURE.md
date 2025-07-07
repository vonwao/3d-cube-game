# The Cell Clicking Adventure: A Deep Dive into Three.js Event Handling

## Table of Contents
1. [The Problem](#the-problem)
2. [Understanding Three.js Event System](#understanding-threejs-event-system)
3. [Our Implementation Architecture](#our-implementation-architecture)
4. [The Journey: Issues and Solutions](#the-journey-issues-and-solutions)
5. [Key Learnings](#key-learnings)
6. [Final Implementation](#final-implementation)

## The Problem

In our 3D Color Flood game, players need to click on individual cells within a 3x3x3 (or larger) cube to select colors. However, we encountered several issues:

1. **Intermittent clicking** - Sometimes clicks worked, sometimes they didn't
2. **Hover state flickering** - Cell highlighting was unstable
3. **Rotation vs clicking conflicts** - Mouse drag controls interfered with cell selection
4. **Size change breaking clicks** - Changing cube size (3x3x3 to 4x4x4) broke clicking entirely

## Understanding Three.js Event System

### How Three.js Raycasting Works

Three.js doesn't have native DOM events on 3D objects. Instead, it uses **raycasting**:

```
Mouse Position → Ray from Camera → Intersection with 3D Objects → Event Dispatch
```

1. **Ray Creation**: A ray is cast from the camera through the mouse position
2. **Intersection Testing**: The ray checks which objects it intersects
3. **Event Mapping**: Intersections are mapped to pointer events (click, hover, etc.)

### React Three Fiber's Event System

React Three Fiber (R3F) wraps Three.js raycasting in a React-friendly API:

```jsx
<mesh
  onClick={(event) => console.log('clicked!')}
  onPointerEnter={(event) => console.log('hovered!')}
/>
```

Behind the scenes, R3F:
- Automatically creates a raycaster
- Updates it on every frame
- Maps intersections to React synthetic events
- Handles event propagation and bubbling

### Instanced Meshes: Special Considerations

Our game uses `instancedMesh` for performance (rendering 27-216 cubes efficiently):

```jsx
<instancedMesh args={[geometry, material, instanceCount]}>
```

With instanced meshes:
- All instances share the same geometry and material
- Each instance has its own transformation matrix
- Raycasting returns both the mesh AND the specific instance ID
- Events include `event.instanceId` to identify which cube was clicked

## Our Implementation Architecture

### Component Structure

```
ColorFloodGame
  └── Canvas (R3F)
      └── CubeScene
          └── AnimatedGroup (rotation wrapper)
              └── CubeMesh
                  ├── Main instancedMesh (clickable cells)
                  ├── Highlight instancedMesh (white wireframe overlay)
                  └── Hover instancedMesh (hover effects)
```

### Event Flow

1. **User clicks** → Browser pointer event
2. **Canvas captures event** → R3F raycaster activated
3. **Raycaster finds intersection** → Identifies mesh and instance
4. **CubeMesh.onClick handler** → Receives event with instanceId
5. **Game logic** → Apply color based on clicked cell

### Rotation Control System

We use a custom `useCubeControls` hook for cube rotation:
- Drag to rotate the cube
- Arrow keys for keyboard rotation
- Momentum physics for smooth feel

## The Journey: Issues and Solutions

### Issue 1: Rotation Controls Blocking Clicks

**Problem**: The rotation control's `pointerdown` handler was preventing clicks from reaching the 3D objects.

**Initial Implementation**:
```javascript
const handlePointerDown = (event) => {
  setIsDragging(true);
  gl.domElement.setPointerCapture(event.pointerId);
  event.preventDefault(); // This was blocking clicks!
};
```

**Solution**: Implement click vs drag detection:
```javascript
const handlePointerDown = (event) => {
  // Don't start dragging immediately
  lastPointer.current.set(event.clientX, event.clientY);
  startPointer.set(event.clientX, event.clientY);
  setPointerDown(true);
};

const handlePointerMove = (event) => {
  if (!pointerDown) return;
  
  const totalDelta = Math.abs(event.clientX - startPointer.x) + 
                     Math.abs(event.clientY - startPointer.y);
  
  // Only start dragging after 5px movement
  if (!isDragging && totalDelta > 5) {
    setIsDragging(true);
    gl.domElement.setPointerCapture(event.pointerId);
  }
};
```

### Issue 2: Overlapping Meshes Interfering

**Problem**: The highlight and hover meshes were blocking raycast hits to the main mesh.

**Solution**: Disable raycasting on overlay meshes:
```jsx
<instancedMesh
  ref={highlightMeshRef}
  raycast={() => null} // Disable raycasting
/>
```

### Issue 3: Bounding Sphere Not Updating

**Problem**: Three.js uses bounding spheres for efficient raycasting. When instance positions changed, the bounding sphere wasn't updated.

**Solution**: Force bounding sphere updates:
```javascript
useEffect(() => {
  // ... update instance matrices ...
  
  // Force update geometry bounds for proper raycasting
  meshRef.current.geometry.computeBoundingSphere();
  meshRef.current.geometry.computeBoundingBox();
  meshRef.current.updateMatrixWorld(true);
}, [cells, colorArray, positions, totalCells]);
```

### Issue 4: Size Changes Breaking Everything

**Problem**: When changing from 3x3x3 to 4x4x4, the instanced mesh wasn't properly recreated, causing raycasting to fail.

**Solution**: Use React keys to force recreation:
```jsx
<instancedMesh
  key={`main-mesh-${totalCells}`}  // Forces new instance
  ref={meshRef}
  args={[undefined, undefined, totalCells]}
/>
```

### Issue 5: Event Handler Memory Leaks

**Problem**: Event handlers were recreated on every render, causing:
- Memory leaks
- Lost event listeners
- Inconsistent behavior

**Solution**: Use `useCallback` with proper dependencies:
```javascript
const handlePointerMove = useCallback((event) => {
  // ... handle movement ...
}, [pointerDown, isDragging, rotationSpeed, gl.domElement]);

useEffect(() => {
  canvas.addEventListener('pointermove', handlePointerMove);
  return () => {
    canvas.removeEventListener('pointermove', handlePointerMove);
  };
}, [gl.domElement, handlePointerMove]);
```

## Key Learnings

### 1. Event Propagation in 3D

Unlike DOM events, Three.js events don't naturally bubble. R3F adds this behavior, but you must be careful about:
- Event capture order
- Pointer capture preventing propagation
- Overlapping geometry blocking rays

### 2. State Management Complexity

Managing both rotation state and click detection requires careful coordination:
- Separate "pointer down" from "dragging"
- Track movement threshold before starting drag
- Clean up states on blur/focus loss

### 3. Performance Considerations

Instanced meshes are powerful but require special handling:
- Bounding spheres must be manually updated
- Changing instance count requires full recreation
- Each instance needs proper matrix updates

### 4. React Three Fiber Gotchas

- `useFrame` runs 60 times per second - be careful with state updates
- Refs to Three.js objects may be null during initial renders
- Event handlers in `useEffect` need proper cleanup

## Final Implementation

The working solution combines:

1. **Smart Pointer Handling**
   - Differentiate clicks from drags using movement threshold
   - Only capture pointer after confirming drag intent
   - Reset states on window blur

2. **Proper Mesh Setup**
   - Disable raycasting on overlay meshes
   - Force bounding updates after changes
   - Use keys for proper recreation on size changes

3. **Robust Event Management**
   - `useCallback` for stable handler references
   - Proper dependency arrays
   - Cleanup on unmount

4. **Clear Separation of Concerns**
   - Rotation controls handle camera movement
   - CubeMesh handles cell interaction
   - Game logic processes color selection

The result is a smooth, reliable interaction system that properly balances 3D navigation with precise cell selection, even as the game dynamically changes cube sizes.

## Code Architecture Benefits

This implementation provides:
- **Predictable behavior** - Clicks always work when not dragging
- **Smooth rotation** - Drag controls feel natural
- **Scalability** - Works with any cube size (3x3x3 to 6x6x6)
- **Performance** - Instanced rendering handles hundreds of cubes
- **Maintainability** - Clear separation between systems

The journey taught us that 3D interaction in the browser requires careful coordination between multiple systems, but with the right architecture, we can create intuitive and reliable user experiences.