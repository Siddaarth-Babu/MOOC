import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setProfileOpen(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen)
  }

  const goToProfile = () => {
    setProfileOpen(false)
    navigate('/instructor/profile')
  }

  return (
    <nav className="instructor-navbar">
      <div className="instructor-nav-container">
        <Link to="/instructor" className="instructor-nav-logo">MOOC</Link>
        
        <div className="instructor-nav-links">
          <Link to="/instructor" className="instructor-nav-link">Home</Link>
          <Link to="/instructor/teaching" className="instructor-nav-link">Teaching</Link>
        </div>

        <div className="instructor-nav-profile">
          <button className="instructor-profile-btn" onClick={handleProfileClick}>
            👤
          </button>
          
          {profileOpen && (
            <div className="instructor-profile-dropdown">
              <div className="instructor-profile-header">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'}
              </div>
              <button className="instructor-dropdown-item" onClick={goToProfile}>
                My Profile
              </button>
              <button className="instructor-dropdown-item instructor-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
