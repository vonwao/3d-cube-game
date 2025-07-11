# InstancedMesh Click Detection Fix

## The Core Problem

InstancedMesh in Three.js requires special handling for raycasting because:
1. It's a single mesh with multiple instances
2. Each instance needs its own transform matrix
3. Raycasting must identify which specific instance was clicked

## Critical Code Changes Made

### 1. Switch from onClick to onPointerDown

```tsx
// ❌ OLD - Less reliable
<instancedMesh
  onClick={handleClick}
>

// ✅ NEW - More reliable
<instancedMesh
  onPointerDown={handlePointerDown}
>
```

### 2. Force Matrix Updates

```tsx
// In CubeMesh.tsx useEffect
useEffect(() => {
  if (!meshRef.current) return;
  
  for (let i = 0; i < totalCells; i++) {
    // Set position for each instance
    tempObject.position.set(x, y, z);
    tempObject.rotation.set(0, 0, 0);
    tempObject.scale.setScalar(isEmpty ? 0.001 : 1);
    tempObject.updateMatrix();
    
    meshRef.current.setMatrixAt(i, tempObject.matrix);
  }
  
  // ✅ CRITICAL: Force matrix updates for raycasting
  meshRef.current.instanceMatrix.needsUpdate = true;
  meshRef.current.updateMatrixWorld(true);
  meshRef.current.matrixWorldNeedsUpdate = true;
  meshRef.current.geometry.computeBoundingSphere();
}, [cells, colorArray, positions, totalCells]);
```

### 3. Set Proper Mesh Attributes

```tsx
<instancedMesh
  ref={meshRef}
  args={[undefined, undefined, totalCells]}
  onPointerDown={handlePointerDown}
  castShadow
  receiveShadow
  frustumCulled={false}        // ✅ Prevent culling issues
  matrixAutoUpdate={false}      // ✅ Manual matrix control
>
```

### 4. Fix Parent Transform Updates

```tsx
// In AnimatedGroup component
useFrame(() => {
  if (groupRef.current) {
    // ... rotation updates ...
    
    // ✅ Critical: Update matrix world when rotation changes
    groupRef.current.updateMatrixWorld(true);
  }
});
```

### 5. Fix CSS Pointer Events

```css
/* ❌ OLD - Too broad, intercepted clicks */
.uiOverlay > * {
  pointer-events: auto;
}

/* ✅ NEW - Specific targeting */
.uiOverlay button,
.uiOverlay input,
.uiOverlay select,
.uiOverlay .clickable {
  pointer-events: auto;
}

/* ✅ Ensure canvas is clickable */
.canvasContainer canvas {
  touch-action: none; /* Prevent default touch behaviors */
}
```

### 6. Consistent Position-to-Index Mapping

```tsx
// Must be EXACTLY the same in both CubeMesh and BlockRenderer
const posToIndex = (x: number, y: number, z: number): number => {
  const halfSize = Math.floor(cubeSize / 2);
  const nx = Math.round(x) + halfSize;
  const ny = Math.round(y) + halfSize;
  const nz = Math.round(z) + halfSize;
  
  if (nx < 0 || nx >= cubeSize || ny < 0 || ny >= cubeSize || nz < 0 || nz >= cubeSize) {
    return -1;
  }
  
  // This formula must match the inverse of indexToVec3
  return nx + ny * cubeSize + nz * cubeSize * cubeSize;
};
```

## Why The Test Page Works

The simple test page works because:
1. **Individual meshes** - Each cube is a separate mesh object
2. **No InstancedMesh** - No instance ID mapping needed
3. **Simple hierarchy** - No complex parent transforms
4. **Direct events** - Each mesh handles its own clicks
5. **Clean CSS** - No pointer-event conflicts

## The Complete Fix Recipe

To make InstancedMesh clicking work:

1. **Use onPointerDown** instead of onClick
2. **Set frustumCulled={false}** on the InstancedMesh
3. **Set matrixAutoUpdate={false}** for manual control
4. **Call updateMatrixWorld(true)** after matrix changes
5. **Update parent transforms** when they change
6. **Fix CSS pointer-events** to be specific
7. **Ensure consistent index mapping** between components
8. **Add stopPropagation()** to prevent bubbling
9. **Log everything** during debugging
10. **Test incrementally** with simple cases first

## Common Pitfalls to Avoid

1. ❌ Don't rely on automatic matrix updates for InstancedMesh
2. ❌ Don't use blanket `pointer-events: auto` on UI overlays
3. ❌ Don't forget to update parent transform matrices
4. ❌ Don't mix onClick and onPointerDown (pick one)
5. ❌ Don't assume instance IDs map correctly without verification

## Testing Strategy

1. Start with `/click-test` - verify basic Three.js clicks work
2. Test `/instanced-test` - verify InstancedMesh clicks work
3. Add logging at every level to trace where clicks fail
4. Use visual debugging (click indicators) to verify coordinates
5. Check browser DevTools for overlapping elements