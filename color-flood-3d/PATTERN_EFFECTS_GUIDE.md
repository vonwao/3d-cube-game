# Complete Pattern Effects Guide

## Table of Contents
1. [Energy System Patterns](#energy-system-patterns)
2. [Magnet Automata Patterns](#magnet-automata-patterns)
3. [Information Processing Patterns](#information-processing-patterns)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Parameter Reference](#parameter-reference)

---

## Energy System Patterns

### Pattern: "Fountain" (Energy System)
**What You Should See:**
- Energy injected at the bottom center continuously
- Energy flows upward and spreads outward like a fountain
- Cells die (turn black) when energy depletes
- New cells birth near high-energy areas

**Setup:**
1. Select "Algorithm: Energy & Resources"
2. Load "fountain" preset or set:
   - Energy Decay: 3%
   - Birth Cost: 30%
   - Diffusion Rate: 30%
3. Look for: Pulsing growth from bottom center

**Visual Indicators:**
- Brighter cells = more energy
- Dark/dim cells = low energy
- Empty cells = dead from starvation

### Pattern: "Central Source" (Energy System)
**What You Should See:**
- Energy radiates from cube center
- Creates expanding sphere of life
- Outer edges constantly dying and rebirthing

**Setup:**
1. Use "centralSource" preset
2. Watch for: Breathing/pulsing effect from center

### Pattern: "Corner Sources" (Energy System)
**What You Should See:**
- Two opposite corners inject energy
- Creates diagonal energy gradient
- Competition zone in the middle

**Setup:**
1. Use "cornerSources" preset
2. Look for: Two expanding regions meeting in middle

---

## Magnet Automata Patterns

### Pattern: "Magnet Vortex"
**What You Should See:**
- Cylindrical pattern around vertical axis
- Colors should start swirling/rotating
- Pattern maintains vortex shape while flowing
- Colors blend at boundaries creating gradients

**Setup:**
1. Load "Magnet Vortex" pattern
2. Algorithm auto-switches to "Magnet Automata"
3. Preset "singleVortex" auto-applies
4. **Critical**: Pattern should auto-start

**Visual Indicators:**
- Colors represent spin direction (0-5 maps to 360° rotation)
- Smooth color transitions = aligned spins
- Movement direction follows color gradient

**If Not Working:**
- Ensure simulation is running (play button)
- Try "turbulentFlow" preset for more motion
- Increase Alignment Strength to 60%
- Decrease Viscosity to 5%

### Pattern: "Magnet Helix"
**What You Should See:**
- Two colored helixes (red and blue) spiraling
- Helixes should merge and influence each other
- Colors blend where helixes meet
- Flowing motion along spiral paths

**Setup:**
1. Load "Magnet Helix" pattern
2. Best viewed rotating cube slowly
3. Parameters:
   - Alignment Strength: 40%
   - Viscosity: 10%
   - Turbulence: 2%

**Expected Timeline:**
- Generation 0-10: Initial helix structure visible
- Generation 10-30: Spins start aligning
- Generation 30+: Flowing motion established

### Pattern: "Flow Field"
**What You Should See:**
- Four colored corners creating flow sources
- Colors mix and create complex patterns
- Turbulent mixing in center
- Constant motion and change

**Setup:**
1. Load "Flow Field" pattern
2. "turbulentFlow" preset auto-applies
3. Should see immediate mixing and motion

---

## Information Processing Patterns

### Pattern: "Info Oscillator"
**What You Should See:**
- Ring of cells with NOT gate in center
- Signal travels around ring
- Each pass through NOT gate inverts signal
- Creates blinking/oscillating pattern

**Setup:**
1. Load "Info Oscillator" pattern
2. "fastSignals" preset auto-applies
3. Watch center of cube at default rotation

**Visual Indicators:**
- Bright cells = signal present (1)
- Dim cells = no signal (0)
- Color indicates gate type

**Expected Behavior:**
- Signal circulates clockwise/counterclockwise
- Period: ~8-10 generations per cycle
- Center cell (NOT gate) flashes opposite to ring

### Pattern: "Signal Line"
**What You Should See:**
- Horizontal line with signal source at one end
- Signal propagates along line like dominoes
- Branches show signal splitting
- Gradual signal decay (dimming)

**Setup:**
1. Load "Signal Line" pattern
2. Parameters for best effect:
   - Signal Decay: 5%
   - Signal Threshold: 30%
   - Propagation Delay: 0

**Timeline:**
- Generation 0-5: Signal travels along main line
- Generation 5-10: Signal reaches branches
- Generation 10+: Decay visible at far ends

### Pattern: "Logic Gates"
**What You Should See:**
- Two source signals at bottom
- AND gate and OR gate in middle layer
- Different outputs based on logic:
  - AND: Output only when both inputs present
  - OR: Output when either input present

**Setup:**
1. Load "Logic Gates" pattern
2. Best with "digitalLogic" preset (no decay)
3. Rotate to see layer structure

### Pattern: "3D Circuit"
**What You Should See:**
- Grid of interconnected logic gates
- Multiple signal sources at corners
- Complex signal patterns flowing through network
- Different gate types creating varied outputs

**Setup:**
1. Load "3D Circuit" pattern
2. "digitalLogic" preset for clear signals
3. Slow speed recommended to track signals

---

## Troubleshooting Guide

### "I only see static colors"
**Solutions:**
1. Check simulation is running (Play button green)
2. Wait 10-20 generations for effects to develop
3. For Magnet: Increase Alignment Strength
4. For Info: Check Signal Decay isn't too high

### "Patterns die out quickly"
**For Energy System:**
- Decrease Energy Decay Rate
- Increase Injection Rate
- Add more injection points

**For Information Processing:**
- Decrease Signal Decay to 0-5%
- Lower Signal Threshold
- Use "digitalLogic" preset

### "Can't see the flow in Magnet patterns"
**Solutions:**
1. Increase simulation speed to "Fast"
2. Decrease Viscosity to 0-10%
3. Add Turbulence (5-15%)
4. Ensure pattern has enough active cells

### "Signals aren't propagating"
**Solutions:**
1. Check Signal Threshold (lower to 20-30%)
2. Ensure Signal Decay < 20%
3. Verify source cells are generating (bright)
4. Check Propagation Delay = 0 or 1

---

## Parameter Reference

### Energy System Parameters
| Parameter | Range | Effect | Best For Effects |
|-----------|-------|--------|------------------|
| Energy Decay | 1-10% | How fast cells lose energy | 2-3% for sustained life |
| Birth Cost | 10-50% | Energy needed to create cell | 20-30% balanced growth |
| Diffusion Rate | 10-50% | Energy spread speed | 20-30% for gradients |
| Competition Radius | 0-3 | How far cells compete | 1-2 for local competition |

### Magnet Automata Parameters
| Parameter | Range | Effect | Best For Effects |
|-----------|-------|--------|------------------|
| Alignment Strength | 10-100% | Spin alignment speed | 30-50% for smooth flow |
| Viscosity | 0-100% | Resistance to change | 5-20% for fluid motion |
| Turbulence | 0-50% | Random perturbations | 5-15% for organic flow |
| Alignment Radius | 1-3 | Influence distance | 1 for local, 2-3 for smooth |

### Information Processing Parameters
| Parameter | Range | Effect | Best For Effects |
|-----------|-------|--------|------------------|
| Signal Decay | 0-50% | Signal loss per step | 0-10% for long range |
| Signal Threshold | 10-90% | Activation level | 30-50% for clear gates |
| Propagation Delay | 0-5 | Delay between hops | 0-1 for fast circuits |

---

## Quick Effect Verification

### Energy System Working:
- [ ] Cells change brightness over time
- [ ] Empty spaces fill near bright cells
- [ ] Dark cells disappear
- [ ] Energy flows from sources

### Magnet Automata Working:
- [ ] Colors change continuously
- [ ] Smooth color gradients form
- [ ] Patterns flow/rotate
- [ ] No static end state

### Information Processing Working:
- [ ] Bright signals visible
- [ ] Signals move between cells
- [ ] Gates produce different outputs
- [ ] Oscillators blink regularly

---

## Advanced Tips

1. **Best Viewing Angles:**
   - Energy: Top-down for fountains
   - Magnet: 45° angle for vortices
   - Info: Side view for circuits

2. **Speed Settings:**
   - Energy: Normal (500ms)
   - Magnet: Fast (200ms)
   - Info: Slow (1000ms) for debugging

3. **Cube Sizes:**
   - Small (4-5): Good for understanding
   - Medium (6-7): Best for most effects
   - Large (8+): Complex patterns

4. **Pattern Combinations:**
   Try loading one pattern, letting it run, then switching algorithms to see how the same structure behaves differently!