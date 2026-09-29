import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const location = useLocation()

  return (
    <div className="bottom-nav">
      <Link 
        to="/" 
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">家計簿</span>
      </Link>
      <Link 
        to="/simulator" 
        className={`nav-item ${location.pathname === '/simulator' ? 'active' : ''}`}
      >
        <span className="nav-icon">🧮</span>
        <span className="nav-label">シミュレーション</span>
      </Link>
    </div>
  )
}
