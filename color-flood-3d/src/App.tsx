import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameHomePage } from './pages/GameHomePage'
import { SimulationAnalysisPage } from './pages/SimulationAnalysisPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameHomePage />} />
        <Route path="/analysis" element={<SimulationAnalysisPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App