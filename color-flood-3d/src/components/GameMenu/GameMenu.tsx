import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './GameMenu.module.css'

export type GameType = 'color-flood' | 'color-competition' | 'color-competition-simple' | 'gravity-cascade'

interface GameMenuItem {
  id: GameType
  label: string
  description?: string
}

interface GameMenuProps {
  currentGame: GameType
  onGameChange: (game: GameType) => void
}

const gameItems: GameMenuItem[] = [
  { id: 'color-flood', label: 'Color Flood', description: 'Flood the 3D cube with colors' },
  { id: 'color-competition', label: 'Color Competition', description: 'Compete with AI agents' },
  { id: 'color-competition-simple', label: 'CA Explorer (Simple)', description: 'Explore cellular automata' },
  { id: 'gravity-cascade', label: 'Gravity Cascade', description: 'Match blocks in a gravity well' },
]

export const GameMenu: React.FC<GameMenuProps> = ({ currentGame, onGameChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentGameItem = gameItems.find(item => item.id === currentGame)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleGameSelect = (gameId: GameType) => {
    onGameChange(gameId)
    setIsOpen(false)
  }

  return (
    <div className={styles.gameMenu} ref={menuRef}>
      <button
        className={styles.menuButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={styles.menuButtonLabel}>
          {currentGameItem?.label || 'Select Game'}
        </span>
        <ChevronDown 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
          size={20} 
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {gameItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.dropdownItem} ${item.id === currentGame ? styles.active : ''}`}
              onClick={() => handleGameSelect(item.id)}
            >
              <div className={styles.itemLabel}>{item.label}</div>
              {item.description && (
                <div className={styles.itemDescription}>{item.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}