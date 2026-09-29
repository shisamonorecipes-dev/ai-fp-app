import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import HouseholdPage from './features/household/HouseholdPage'
import CalculatorPage from './features/simulator/CalculatorPage'

function App() {
  return (
    <Router>
      <Header />
      <div className="main-content" style={{ paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<HouseholdPage />} />
          <Route path="/simulator" element={<CalculatorPage />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  )
}

export default App
