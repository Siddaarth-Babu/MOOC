import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const user = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })()
  const analystId = localStorage.getItem('analyst_id')

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="analyst-navbar">
      <div className="analyst-nav-inner">
        <div className="analyst-nav-left">
          <Link to="/analyst" className="analyst-logo">MOOC Analytics</Link>
          <Link to="/analyst" className="analyst-link">Home</Link>
        </div>

        <div className="analyst-nav-right">
          <button className="analyst-profile-btn" onClick={() => setOpen(!open)}>👤</button>
          {open && (
            <div className="analyst-profile-dropdown">
              <div className="analyst-profile-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Analyst'}</div>
              <button className="analyst-dropdown-item" onClick={() => { if (analystId) { setOpen(false); navigate(`/analyst/profile/${analystId}`) } else { alert('Analyst ID not found. Please login again.') } }}>Profile</button>
              <button className="analyst-dropdown-item analyst-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
