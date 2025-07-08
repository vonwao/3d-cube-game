import { useState } from 'react'
import { ColorFloodGame } from './games/color-flood/ColorFloodGame'
import './games/color-flood/ColorFloodGame.css'
import { ColorCompetitionGame } from './games/color-competition/ColorCompetitionGame'
import { ColorCompetitionMinimal } from './games/color-competition/ColorCompetitionMinimal'

type GameType = 'color-flood' | 'color-competition'

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('color-competition')
  
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
      </div>
      
      {/* Game Component */}
      {currentGame === 'color-flood' ? <ColorFloodGame /> : <ColorCompetitionGame />}
      
      {/* Temporary: Show minimal test in corner */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '300px', 
        height: '300px',
        border: '2px solid red'
      }}>
        <ColorCompetitionMinimal />
      </div>
    </>
  )
}

export default App