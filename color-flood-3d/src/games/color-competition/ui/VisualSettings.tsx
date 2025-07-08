import { Eye } from 'lucide-react'
import { useState } from 'react'
import { useVisualStore, useCellOpacity, useShowEmptyCells, useEmptyOpacity } from '../logic/visualStore'

export const VisualSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const cellOpacity = useCellOpacity()
  const showEmptyCells = useShowEmptyCells()
  const emptyOpacity = useEmptyOpacity()
  const { setCellOpacity, setShowEmptyCells, setEmptyOpacity } = useVisualStore()
  
  return (
    <div className="visual-settings">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="visual-toggle"
      >
        <Eye size={20} />
        Visuals
      </button>
      
      {isOpen && (
        <div className="visual-content">
          <div className="visual-item">
            <label>
              Cell Opacity:
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={cellOpacity}
                onChange={(e) => setCellOpacity(parseFloat(e.target.value))}
              />
              <span>{Math.round(cellOpacity * 100)}%</span>
            </label>
          </div>
          
          <div className="visual-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showEmptyCells}
                onChange={(e) => setShowEmptyCells(e.target.checked)}
              />
              Show empty cells
            </label>
          </div>
          
          {showEmptyCells && (
            <div className="visual-item">
              <label>
                Empty Cell Opacity:
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={emptyOpacity}
                  onChange={(e) => setEmptyOpacity(parseFloat(e.target.value))}
                />
                <span>{Math.round(emptyOpacity * 100)}%</span>
              </label>
            </div>
          )}
          
          <div className="visual-presets">
            <p>Quick presets:</p>
            <button 
              className="preset-btn"
              onClick={() => {
                setCellOpacity(1)
                setShowEmptyCells(true)
                setEmptyOpacity(0.1)
              }}
            >
              Solid
            </button>
            <button 
              className="preset-btn"
              onClick={() => {
                setCellOpacity(0.7)
                setShowEmptyCells(true)
                setEmptyOpacity(0.05)
              }}
            >
              Semi-transparent
            </button>
            <button 
              className="preset-btn"
              onClick={() => {
                setCellOpacity(0.5)
                setShowEmptyCells(false)
              }}
            >
              X-Ray
            </button>
          </div>
          
          <div className="visual-info">
            <p>• Lower opacity to see inside the cube</p>
            <p>• Hide empty cells for clearer view</p>
            <p>• Try X-Ray mode for complex patterns</p>
          </div>
        </div>
      )}
    </div>
  )
}