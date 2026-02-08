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
    navigate('/student/profile')
  }

  return (
    <nav className="student-navbar">
      <div className="student-nav-container">
        <Link to="/student" className="student-nav-logo">MOOC</Link>
        
        <div className="student-nav-links">
          <Link to="/student" className="student-nav-link">Home</Link>
          <Link to="/student/enrollments" className="student-nav-link">My Courses</Link>
        </div>

        <div className="student-nav-profile">
          <button className="student-profile-btn" onClick={handleProfileClick}>
            👤
          </button>
          
          {profileOpen && (
            <div className="student-profile-dropdown">
              <div className="student-profile-header">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'}
              </div>
              <button className="student-dropdown-item" onClick={goToProfile}>
                My Profile
              </button>
              <button className="student-dropdown-item student-logout-btn" onClick={handleLogout}>
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
