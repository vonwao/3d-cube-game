import type { ColorIndex } from '../../color-flood/logic/types'
import type { Vec3 } from '../../../engine/types'
import { vec3ToIndex } from './automata'

export function createWelcomePattern(cubeSize: number): (ColorIndex | null)[] {
  const cells = new Array(cubeSize * cubeSize * cubeSize).fill(null)
  
  // Create a visually interesting pattern for the initial load
  // Mix of clusters and scattered cells to show the mechanics
  
  // Center cluster
  const center = Math.floor(cubeSize / 2)
  const clusterCells: Array<{ pos: Vec3; color: ColorIndex }> = []
  
  // Create a small cluster of each color
  const colors: ColorIndex[] = [0, 1, 2, 3, 4, 5]
  for (let i = 0; i < colors.length; i++) {
    const angle = (i / colors.length) * Math.PI * 2
    const radius = 1.5
    
    const x = center + Math.round(Math.cos(angle) * radius)
    const y = center + Math.round(Math.sin(angle) * radius)
    
    // Add cells at different z levels for 3D effect
    clusterCells.push({ pos: [x, y, center - 1] as Vec3, color: colors[i] })
    clusterCells.push({ pos: [x, y, center] as Vec3, color: colors[i] })
    clusterCells.push({ pos: [x, y, center + 1] as Vec3, color: colors[i] })
    
    // Add some neighboring cells
    if (x > 0) clusterCells.push({ pos: [x - 1, y, center] as Vec3, color: colors[i] })
    if (x < cubeSize - 1) clusterCells.push({ pos: [x + 1, y, center] as Vec3, color: colors[i] })
  }
  
  // Add scattered cells throughout the cube
  const scatteredCount = Math.floor(cubeSize * cubeSize * cubeSize * 0.1)
  const usedPositions = new Set<string>()
  
  // First add the clusters
  for (const { pos, color } of clusterCells) {
    if (pos[0] >= 0 && pos[0] < cubeSize &&
        pos[1] >= 0 && pos[1] < cubeSize &&
        pos[2] >= 0 && pos[2] < cubeSize) {
      const index = vec3ToIndex(pos, cubeSize)
      cells[index] = color
      usedPositions.add(`${pos[0]},${pos[1]},${pos[2]}`)
    }
  }
  
  // Then add random scattered cells
  for (let i = 0; i < scatteredCount; i++) {
    let attempts = 0
    while (attempts < 10) {
      const x = Math.floor(Math.random() * cubeSize)
      const y = Math.floor(Math.random() * cubeSize)
      const z = Math.floor(Math.random() * cubeSize)
      const key = `${x},${y},${z}`
      
      if (!usedPositions.has(key)) {
        const index = vec3ToIndex([x, y, z], cubeSize)
        cells[index] = Math.floor(Math.random() * 6) as ColorIndex
        usedPositions.add(key)
        break
      }
      attempts++
    }
  }
  
  return cells
}