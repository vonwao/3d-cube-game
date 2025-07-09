# How to Find Algorithm Settings

## The settings are inside the Algorithm Selector!

### Step 1: Open Algorithm Selector
1. Look for the button labeled **"Algorithm: [Current Algorithm]"** with a lightning bolt icon
2. It's the FIRST control in the left panel
3. Click it to expand

### Step 2: Select an Algorithm
Once expanded, you'll see:
- Color Competition
- 3D Game of Life
- **Energy & Resources** ← Has settings!
- **Magnet Automata** ← Has settings!
- **Information Processing** ← Has settings!

### Step 3: Algorithm Settings Appear Below
After selecting an algorithm with settings, you'll see:

#### For Energy & Resources:
- **Presets buttons**: centralSource, cornerSources, fountain, scarcity
- **Energy Decay slider**: 1% to 10%
- **Birth Cost slider**: 10% to 50%
- **Diffusion Rate slider**: 10% to 50%
- **Competition Radius slider**: 0 to 3

#### For Magnet Automata:
- **Presets buttons**: uniformField, singleVortex, doubleVortex, turbulentFlow, magneticDomains
- **Alignment Strength slider**: 10% to 100%
- **Viscosity slider**: 0% to 100%
- **Turbulence slider**: 0% to 50%
- **Alignment Radius slider**: 1 to 3

#### For Information Processing:
- **Presets buttons**: emptyBoard, fastSignals, noisyCircuit, digitalLogic
- **Signal Decay slider**: 0% to 50%
- **Signal Threshold slider**: 10% to 90%
- **Propagation Delay slider**: 0 to 5
- **Gate Types grid**: Shows active gate types

## Visual Guide:

```
Left Panel Structure:
┌─────────────────────────────┐
│ ⚡ Algorithm: Energy        │ ← CLICK THIS FIRST!
└─────────────────────────────┘
         ↓ Expands to ↓
┌─────────────────────────────┐
│ ⚡ Algorithm: Energy        │
├─────────────────────────────┤
│ Select Algorithm:           │
│ [Color Competition]         │
│ [3D Game of Life]          │
│ [Energy & Resources] ←Click │
│ [Magnet Automata]          │
│ [Information Processing]    │
├─────────────────────────────┤
│ Energy System Settings:     │ ← THESE APPEAR!
│                            │
│ Presets:                   │
│ [fountain] [scarcity] ...  │
│                            │
│ Energy Decay: 3% ━━━━━━━━  │
│ Birth Cost: 30% ━━━━━━━━━  │
│ Diffusion Rate: 30% ━━━━━  │
│                            │
└─────────────────────────────┘
```

## Quick Access Instructions:

1. **To see Energy settings**: 
   - Click "Algorithm" button → Select "Energy & Resources"
   
2. **To see Magnet settings**: 
   - Click "Algorithm" button → Select "Magnet Automata"
   
3. **To see Info settings**: 
   - Click "Algorithm" button → Select "Information Processing"

## Why This Design?

The settings are context-sensitive - they only appear when you select an algorithm that uses them. This keeps the UI clean and shows only relevant controls.

## Pro Tips:

1. **Presets are your friend** - Click preset buttons for instant good settings
2. **Settings persist** - Your adjustments stay even when switching patterns
3. **Real-time updates** - Changes apply immediately while simulation runs
4. **Auto-switch** - Loading a Magnet/Info pattern auto-opens correct settings

## Can't see the Algorithm button?

- It should be the FIRST item in the left control panel
- Has a lightning bolt (⚡) icon
- Shows current algorithm name
- If missing, try refreshing the page