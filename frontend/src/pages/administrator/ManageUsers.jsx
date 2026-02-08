import React, { useEffect, useState } from 'react'
import Navbar from '../../components/administrator/Navbar'
import Footer from '../../components/administrator/Footer'
import { useNavigate } from 'react-router-dom'

const sampleUsers = [
  { id: 'u1', firstName: 'Alice', lastName: 'Wong', email: 'alice@example.com', role: 'student' },
  { id: 'u2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'instructor' },
  { id: 'u3', firstName: 'Carol', lastName: 'Ng', email: 'carol@example.com', role: 'data_analyst' },
  { id: 'u4', firstName: 'Dave', lastName: 'Lee', email: 'dave@example.com', role: 'admin' },
]

const ManageUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'student', password: '', confirm: '' })

  useEffect(() => {
    // try fetch; fall back to sample data
    fetch('/api/admin/users', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || sampleUsers))
      .catch(() => setUsers(sampleUsers))
  }, [])

  const filtered = users.filter((u) => {
    const matchesQuery = `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    const matchesRole = roleFilter === 'all' ? true : (roleFilter === 'data_analyst' ? u.role === 'data_analyst' : u.role === roleFilter)
    return matchesQuery && matchesRole
  })

  const handleDelete = (id) => {
    if (!window.confirm('Remove user from the system?')) return
    // optimistic UI remove
    setUsers((prev) => prev.filter((u) => u.id !== id))
    fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
  }

  const handleRowClick = (id) => {
    navigate(`/admin/users/${id}`)
  }

  const handleAddToggle = () => setShowAdd((s) => !s)

  const handleNewChange = (e) => setNewUser({ ...newUser, [e.target.name]: e.target.value })

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      alert('Please fill required fields')
      return
    }
    // simple client-side id
    const created = { ...newUser, id: `u_${Date.now()}` }
    setUsers((prev) => [created, ...prev])
    setNewUser({ firstName: '', lastName: '', email: '', role: 'student', password: '', confirm: '' })
    setShowAdd(false)
    // send to backend
    fetch('/api/admin/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(created) }).catch(() => {})
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container">
        <div className="manage-header">
          <div>
            <h2>Manage Users</h2>
            <p className="muted">Search, filter and manage platform users.</p>
          </div>
          <div className="manage-header-actions">
            <button className="btn" onClick={handleAddToggle}>{showAdd ? 'Cancel' : 'Add new user'}</button>
          </div>
        </div>

        <div className="manage-controls">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="control-select">
            <option value="all">All</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
            <option value="data_analyst">Data Analysts</option>
          </select>
          <input placeholder="Search users by name or email" value={query} onChange={(e) => setQuery(e.target.value)} className="control-search" />
        </div>

        <div className="users-table-wrap">
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="users-row" onClick={() => handleRowClick(u.id)}>
                    <td>{u.firstName}</td>
                    <td>{u.lastName}</td>
                    <td>{u.email}</td>
                    <td className="role-cell">{u.role.replace('_', ' ')}</td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id) }} className="btn btn-danger">-</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleCreateUser} className="add-user-form">
            <div className="add-user-grid">
              <input name="firstName" placeholder="First Name" value={newUser.firstName} onChange={handleNewChange} className="form-input" />
              <input name="lastName" placeholder="Last Name" value={newUser.lastName} onChange={handleNewChange} className="form-input" />
              <input name="email" placeholder="Email" value={newUser.email} onChange={handleNewChange} className="form-input" />
              <select name="role" value={newUser.role} onChange={handleNewChange} className="form-select">
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="data_analyst">Data Analyst</option>
              </select>
              <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleNewChange} className="form-input" />
              <input name="confirm" type="password" placeholder="Confirm Password" value={newUser.confirm} onChange={handleNewChange} className="form-input" />
            </div>
            <div className="add-user-actions">
              <button className="auth-submit-btn" type="submit">Create User</button>
              <button type="button" className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default ManageUsers
