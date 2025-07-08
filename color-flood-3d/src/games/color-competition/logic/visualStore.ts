import { create } from 'zustand'

interface VisualSettings {
  cellOpacity: number // 0-1
  showEmptyCells: boolean
  emptyOpacity: number // 0-1
  enableDepthSort: boolean // Sort cells by distance for better transparency
}

interface VisualStore extends VisualSettings {
  setCellOpacity: (opacity: number) => void
  setShowEmptyCells: (show: boolean) => void
  setEmptyOpacity: (opacity: number) => void
  setEnableDepthSort: (enable: boolean) => void
  resetVisuals: () => void
}

const DEFAULT_VISUALS: VisualSettings = {
  cellOpacity: 1.0,
  showEmptyCells: true,
  emptyOpacity: 0.1,
  enableDepthSort: false,
}

export const useVisualStore = create<VisualStore>((set) => ({
  ...DEFAULT_VISUALS,
  
  setCellOpacity: (opacity) => set({ cellOpacity: opacity }),
  setShowEmptyCells: (show) => set({ showEmptyCells: show }),
  setEmptyOpacity: (opacity) => set({ emptyOpacity: opacity }),
  setEnableDepthSort: (enable) => set({ enableDepthSort: enable }),
  
  resetVisuals: () => set(DEFAULT_VISUALS),
}))

// Selectors
export const useCellOpacity = () => useVisualStore(state => state.cellOpacity)
export const useShowEmptyCells = () => useVisualStore(state => state.showEmptyCells)
export const useEmptyOpacity = () => useVisualStore(state => state.emptyOpacity)
export const useEnableDepthSort = () => useVisualStore(state => state.enableDepthSort)