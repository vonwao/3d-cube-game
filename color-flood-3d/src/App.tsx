/**
 * Main App Component
 * 
 * Root component that handles routing and global app layout.
 * Now uses CSS Modules for styling and shared components.
 * 
 * @potential-issue: BrowserRouter may need basename for subdirectory deployments
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameHomePage } from './pages/GameHomePage'
import { SimulationAnalysisPage } from './pages/SimulationAnalysisPage'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameHomePage />} />
          <Route path="/analysis" element={<SimulationAnalysisPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App