import { useEffect, useState } from 'react'
import styles from './ClickDebugOverlay.module.css'

interface ClickEvent {
  id: number
  x: number
  y: number
  timestamp: number
  hit: boolean
}

export const ClickDebugOverlay: React.FC = () => {
  const [clicks, setClicks] = useState<ClickEvent[]>([])
  const [canvasInfo, setCanvasInfo] = useState<{ width: number; height: number } | null>(null)
  
  useEffect(() => {
    let clickId = 0
    
    const handleClick = (e: MouseEvent) => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newClick: ClickEvent = {
        id: clickId++,
        x,
        y,
        timestamp: Date.now(),
        hit: false // Will be updated if we detect a hit
      }
      
      setClicks(prev => [...prev.slice(-9), newClick])
      
      // Remove after 2 seconds
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== newClick.id))
      }, 2000)
    }
    
    // Update canvas info
    const updateCanvasInfo = () => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setCanvasInfo({ width: rect.width, height: rect.height })
      }
    }
    
    window.addEventListener('click', handleClick, true)
    window.addEventListener('resize', updateCanvasInfo)
    updateCanvasInfo()
    
    return () => {
      window.removeEventListener('click', handleClick, true)
      window.removeEventListener('resize', updateCanvasInfo)
    }
  }, [])
  
  return (
    <>
      {/* Click markers */}
      {clicks.map(click => (
        <div
          key={click.id}
          className={styles.clickMarker}
          style={{
            left: click.x + 'px',
            top: click.y + 'px',
            opacity: 1 - (Date.now() - click.timestamp) / 2000
          }}
        >
          <div className={styles.clickRing} />
          <div className={styles.clickDot} />
        </div>
      ))}
      
      {/* Canvas info */}
      <div className={styles.canvasInfo}>
        Canvas: {canvasInfo ? `${Math.round(canvasInfo.width)}×${Math.round(canvasInfo.height)}` : 'Not found'}
      </div>
    </>
  )
}