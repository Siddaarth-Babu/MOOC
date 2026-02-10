import React from 'react'
import { useNavigate } from 'react-router-dom'

const QuickAccess = () => {
  const navigate = useNavigate()
  return (
    <div className="admin-quick-access">
      <button className="qa-btn" onClick={() => navigate('/admin/manage-courses')}>Add / Manage Courses</button>
      <button className="qa-btn" onClick={() => navigate('/admin/manage-users')}>Add / Manage Users</button>
      
    </div>
  )
}

export default QuickAccess
