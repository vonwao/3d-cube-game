# Effects Verification Checklist

## Quick Start Guide

1. **Open the app** at http://localhost:5174/
2. **Scroll down** in the pattern list to find the new patterns
3. **Look for patterns starting with**:
   - "Magnet" (3 patterns)
   - "Info" (4 patterns)

---

## Energy System Verification

### ✓ Check: Energy Fountain
1. Select "Algorithm: Energy & Resources"
2. Click "fountain" preset
3. Load any pattern with cells
4. **You should see**:
   - [ ] Cells getting brighter near bottom center
   - [ ] Cells dimming and disappearing at edges
   - [ ] New cells appearing near bright areas
   - [ ] Check Debug Panel: "Total Energy" should fluctuate

### ✓ Check: Resource Competition
1. Use "cornerSources" preset
2. **You should see**:
   - [ ] Two bright corners
   - [ ] Energy flowing diagonally
   - [ ] Competition zone in middle
   - [ ] Debug Panel: "Starving Cells" count changes

---

## Magnet Automata Verification

### ✓ Check: Magnet Vortex
1. Load "Magnet Vortex" pattern
2. **Immediate signs it's working**:
   - [ ] Algorithm switches to "Magnet Automata"
   - [ ] Simulation auto-starts
   - [ ] Debug Panel shows "Flow Activity"
   
3. **Within 10-20 generations**:
   - [ ] Colors should start changing
   - [ ] Cylindrical pattern maintains shape
   - [ ] Smooth color gradients form
   - [ ] Debug Panel: "Avg Alignment" increases

4. **If static**, try:
   - Increase "Alignment Strength" to 60%
   - Add "Turbulence" to 10%
   - Check simulation is playing

### ✓ Check: Magnet Helix
1. Load "Magnet Helix" pattern
2. **You should see**:
   - [ ] Two colored spirals (red/blue)
   - [ ] Colors blending at boundaries
   - [ ] Spiral structure flowing
   - [ ] Debug Panel: Flow Activity "Medium" or "High"

### ✓ Check: Flow Field
1. Load "Flow Field" pattern
2. **You should see**:
   - [ ] Multiple color sources
   - [ ] Constant color changes
   - [ ] Turbulent mixing
   - [ ] No static end state

---

## Information Processing Verification

### ✓ Check: Info Oscillator
1. Load "Info Oscillator" pattern
2. **You should see**:
   - [ ] Ring of cells around center
   - [ ] Bright signals moving
   - [ ] Debug Panel: "Active Signals" > 0
   - [ ] Signal pulse indicator blinking

3. **Signal behavior**:
   - [ ] Signal travels around ring
   - [ ] Center cell inverts signal
   - [ ] Regular oscillation pattern

### ✓ Check: Signal Line
1. Load "Signal Line" pattern
2. **You should see**:
   - [ ] Bright source on left
   - [ ] Signal moving right
   - [ ] Signal branching up/down
   - [ ] Gradual dimming at edges

### ✓ Check: Logic Gates
1. Load "Logic Gates" pattern
2. **You should see**:
   - [ ] Two source signals
   - [ ] Different gate outputs
   - [ ] Debug Panel: "Gate Count" > 0

### ✓ Check: 3D Circuit
1. Load "3D Circuit" pattern
2. **You should see**:
   - [ ] Complex 3D network
   - [ ] Multiple signal paths
   - [ ] Continuous activity
   - [ ] Debug Panel: High "Total Signal"

---

## Debug Panel Indicators

### Energy System
- **Total Energy**: Should fluctuate, not monotonically decrease
- **Avg Energy/Cell**: Should stabilize around 0.3-0.7
- **Starving Cells**: Should be < 50% of living cells
- **Energy Bar**: Visual representation of energy distribution

### Magnet Automata
- **Flow Activity**: Should show "Medium" or "High"
- **Avg Alignment**: Should increase over time (0 → 0.5+)
- **Spin Variance**: Should decrease as alignment improves
- **Active Cells**: Should remain stable

### Information Processing
- **Active Signals**: Should be > 0 for working circuits
- **Signal Pulse**: Should show "ACTIVE" and pulse
- **Gate Count**: Number of different gate types
- **Signal Coverage**: Percentage of cells with signal

---

## Common Issues & Solutions

### "Everything looks static"
1. **Check simulation is running** (Play button green)
2. **Wait 20-30 generations** - some effects need time
3. **Check Debug Panel** - metrics should be changing
4. **Try different speed** - Fast or Ultra for Magnet

### "Pattern died out"
1. **For Energy**: Decrease decay rate, increase injection
2. **For Info**: Use "digitalLogic" preset (no decay)
3. **For Magnet**: This shouldn't happen - check algorithm

### "Can't see the effects described"
1. **Rotate the cube** - some effects visible from certain angles
2. **Check you loaded the right pattern** - name should match
3. **Check algorithm switched** - shown in top left
4. **Watch Debug Panel** - provides quantitative feedback

### "Debug Panel shows all zeros"
1. **Ensure pattern has cells** - not empty cube
2. **Check correct algorithm** is selected
3. **Wait a few generations** for metrics to calculate

---

## Success Indicators

You'll know the systems are working when:

### Energy System ✓
- Cells continuously birth and die
- Energy flows from sources
- System reaches dynamic equilibrium
- Never completely dies or fills

### Magnet Automata ✓
- Continuous color changes
- Smooth flowing patterns
- No static end state
- Vortices and flows visible

### Information Processing ✓
- Signals visibly propagating
- Gates producing expected outputs
- Oscillators maintaining rhythm
- Debug panel shows activity

---

## Next Steps

Once verified working:
1. Try adjusting parameters while running
2. Mix patterns - load one, change algorithm
3. Create your own patterns
4. Experiment with different presets
5. Use the comprehensive PATTERN_EFFECTS_GUIDE.md for deeper exploration