import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { ColorFloodGame } from '../games/color-flood/ColorFloodGame'
import '../games/color-flood/ColorFloodGame.css'
import { ColorCompetitionGame } from '../games/color-competition/ColorCompetitionGame'
import { ColorCompetitionSimple } from '../games/color-competition/ColorCompetitionSimple'

type GameType = 'color-flood' | 'color-competition' | 'color-competition-simple'

export const GameHomePage: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('color-competition-simple')
  
  return (
    <>
      {/* Game Selector */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <button
          onClick={() => setCurrentGame('color-flood')}
          style={{
            padding: '0.5rem 1rem',
            background: currentGame === 'color-flood' ? '#3498db' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Color Flood
        </button>
        <button
          onClick={() => setCurrentGame('color-competition')}
          style={{
            padding: '0.5rem 1rem',
            background: currentGame === 'color-competition' ? '#3498db' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Color Competition
        </button>
        <button
          onClick={() => setCurrentGame('color-competition-simple')}
          style={{
            padding: '0.5rem 1rem',
            background: currentGame === 'color-competition-simple' ? '#2ecc71' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          CA Explorer (Simple)
        </button>
      </div>
      
      {/* Analysis Link */}
      <Link
        to="/analysis"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(52, 152, 219, 0.9)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
        }}
      >
        <BarChart3 size={16} />
        CA Analysis
      </Link>
      
      {/* Game Component */}
      {currentGame === 'color-flood' ? (
        <ColorFloodGame />
      ) : currentGame === 'color-competition' ? (
        <ColorCompetitionGame />
      ) : (
        <ColorCompetitionSimple />
      )}
    </>
  )
}