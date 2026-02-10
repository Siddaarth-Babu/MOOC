import React from 'react'

const AddUserMenu = ({ onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button className="btn" onClick={() => onSelect('student')}>Add Student</button>
      <button className="btn" onClick={() => onSelect('instructor')}>Add Instructor</button>
      <button className="btn" onClick={() => onSelect('data_analyst')}>Add Data Analyst</button>
    </div>
  )
}

export default AddUserMenu
