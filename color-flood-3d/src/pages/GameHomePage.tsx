import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { ColorFloodGame } from '../games/color-flood/ColorFloodGame'
import '../games/color-flood/ColorFloodGame.css'
import { ColorCompetitionGame } from '../games/color-competition/ColorCompetitionGame'
import { ColorCompetitionSimple } from '../games/color-competition/ColorCompetitionSimple'
import { GameMenu, type GameType } from '../components/GameMenu/GameMenu'

export const GameHomePage: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('color-competition-simple')
  
  return (
    <>
      {/* Game Selector Menu */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
      }}>
        <GameMenu currentGame={currentGame} onGameChange={setCurrentGame} />
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