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
  const adminId = localStorage.getItem('admin_id')

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-inner">
        <div className="admin-nav-left">
          <Link to="/admin" className="admin-logo">MOOC Admin</Link>
          <Link to="/admin" className="admin-link">Home</Link>
          <Link to="/admin/manage-users" className="admin-link">Manage Users</Link>
          <Link to="/admin/manage-courses" className="admin-link">Manage Courses</Link>
          <Link to="/admin/manage-universities" className="admin-link">Manage Universities</Link>
        </div>

        <div className="admin-nav-right">
          <button className="admin-profile-btn" onClick={() => setOpen(!open)}>👤</button>
          {open && (
            <div className="admin-profile-dropdown">
              <div className="admin-profile-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Admin'}</div>
              <button className="admin-dropdown-item" onClick={() => { if (adminId) { setOpen(false); navigate(`/admin/profile/${adminId}`) } else { alert('Admin ID not found. Please login again.') } }}>Profile</button>
              <button className="admin-dropdown-item admin-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
