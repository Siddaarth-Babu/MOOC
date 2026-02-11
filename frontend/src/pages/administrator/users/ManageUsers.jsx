// src/pages/administrator/users/ManageUsers.jsx
import React, { useEffect, useState } from 'react'
import Navbar from '../../../components/administrator/Navbar'
import Footer from '../../../components/administrator/Footer'
import AddUserMenu from './AddUserMenu'
import AddStudentForm from './AddStudentForm'
import AddInstructorForm from './AddInstructorForm'
import AddAnalystForm from './AddAnalystForm'

const BASE = 'http://127.0.0.1:8000'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  const headers = { 'Accept': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/* Internal UsersTable */
const UsersTable = ({ users = [], onDelete = () => {}, loading = false }) => {
  return (
    <div className="users-table-wrap" style={{ marginTop: 12 }}>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="muted">Loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan="5" className="muted">No users found</td></tr>
            )}
            {!loading && users.map((u) => (
              <tr key={`${u.role}-${u.id || u.numericUserId || Math.random()}`} className="users-row">
                <td>{u.name}</td>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td className="role-cell">{(u.role || '').replace('_', ' ')}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(u)}
                      disabled={loading}
                      title="Delete user"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeAddRole, setActiveAddRole] = useState(null) // 'student' | 'instructor' | 'data_analyst'
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Single fetch to /admin/users
  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/admin/users`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      })
      if (!res.ok) {
        const txt = await res.text()
        setError(txt || `Failed to load users: ${res.status}`)
        setUsers([])
        setLoading(false)
        return
      }
      const json = await res.json()
      console.log('Debug: Backend response:', json)
      const arr = Array.isArray(json) ? json : (json.users ?? [])
      console.log('Debug: Users array:', arr)

      // Normalize each user: expose numericUserId + role-specific ids
      const normalized = arr.map(u => {
        console.log('Debug: Normalizing user:', u)
        const numericUserId = u.user_id ?? u.id ?? u.userId ?? null
        const studentId = u.student_id ?? u.studentId ?? (u.student ? (u.student.student_id ?? null) : null) ?? null
        const instructorId = u.instructor_id ?? u.instructorId ?? (u.instructor ? (u.instructor.instructor_id ?? null) : null) ?? null
        const analystId = u.analyst_id ?? u.analystId ?? u.data_analyst_id ?? (u.data_analyst ? (u.data_analyst.analyst_id ?? null) : null) ?? null

        let role = (u.role ?? u.user_role ?? '').toString()
        if (!role) {
          if (studentId) role = 'student'
          else if (instructorId) role = 'instructor'
          else if (analystId) role = 'data_analyst'
          else if (u.is_admin || u.admin_id) role = 'admin'
          else role = 'user'
        }

        const fullName = u.full_name ?? u.name ?? (() => {
          const f = u.first_name ?? ''
          const l = u.last_name ?? ''
          return `${f} ${l}`.trim()
        })()

        const email = u.email ?? u.email_id ?? u.email_address ?? ''

        // display id - prefer role-specific id if present
        const displayId = studentId ?? instructorId ?? analystId ?? numericUserId ?? ''

        const normalized_user = {
          id: String(displayId || ''),
          numericUserId: numericUserId ? Number(numericUserId) : null,
          studentId: studentId ? Number(studentId) : null,
          instructorId: instructorId ? Number(instructorId) : null,
          analystId: analystId ? Number(analystId) : null,
          name: fullName || '',
          email,
          role,
          raw: u
        }
        console.log('Debug: Normalized user:', normalized_user)
        return normalized_user
      })

      setUsers(normalized)
    } catch (err) {
      console.error('fetchUsers error', err)
      setError('Network error while loading users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Delete handler: attempts role-specific deletes ONLY (not unified delete)
  const handleDelete = async (userRow) => {
    console.log('Debug: User object being deleted:', userRow)
    console.log('Debug: Role:', userRow.role)
    console.log('Debug: Student ID:', userRow.studentId)
    console.log('Debug: Instructor ID:', userRow.instructorId)
    console.log('Debug: Analyst ID:', userRow.analystId)
    
    if (!window.confirm('Remove user from the system?')) return
    setError('')

    const headers = getAuthHeaders()
    const credentials = 'include'

    const parseMessage = async (res) => {
      try {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const j = await res.json()
          return j?.message ?? j?.detail ?? JSON.stringify(j)
        } else {
          return await res.text()
        }
      } catch (e) {
        return ''
      }
    }

    // Build ONLY role-specific endpoints (prioritize these over unified delete)
    const endpoints = []
    if (userRow.role === 'student' && userRow.studentId) {
      endpoints.push(`/admin/del_student/${userRow.studentId}`)
      endpoints.push(`/admin/student/${userRow.studentId}`)
    } else if (userRow.role === 'instructor' && userRow.instructorId) {
      endpoints.push(`/admin/del_instructor/${userRow.instructorId}`)
      endpoints.push(`/admin/instructor/${userRow.instructorId}`)
    } else if ((userRow.role === 'data_analyst' || userRow.role === 'analyst') && userRow.analystId) {
      endpoints.push(`/admin/del_data_analyst/${userRow.analystId}`)
      endpoints.push(`/admin/data_analyst/${userRow.analystId}`)
    }

    console.log('Debug: Endpoints to try:', endpoints)

    // Remove duplicates while preserving order
    const uniqueEndpoints = Array.from(new Set(endpoints))

    if (uniqueEndpoints.length === 0) {
      console.error('Debug: No endpoints found. User data:', userRow)
      alert('Unable to determine delete endpoint for this user. Make sure they have a valid role with matching ID.')
      return
    }

    let anySuccess = false
    const messages = []
    const failures = []

    // Try each endpoint sequentially
    for (const ep of uniqueEndpoints) {
      try {
        const res = await fetch(`${BASE}${ep}`, {
          method: 'DELETE',
          headers,
          credentials
        })
        const msg = await parseMessage(res)
        if (res.ok) {
          anySuccess = true
          messages.push({ endpoint: ep, msg: msg || `Deleted via ${ep}` })
          break // Stop after first success
        } else {
          failures.push({ endpoint: ep, status: res.status, msg })
          console.warn(`Delete endpoint ${ep} returned ${res.status}:`, msg)
        }
      } catch (e) {
        failures.push({ endpoint: ep, msg: e.message || String(e) })
        console.error(`Delete endpoint ${ep} failed:`, e)
      }
    }

    if (anySuccess) {
      // Remove from UI by matching whichever ids exist on the row
      setUsers(prev => prev.filter(u => {
        if (userRow.studentId && u.studentId) return u.studentId !== userRow.studentId
        if (userRow.instructorId && u.instructorId) return u.instructorId !== userRow.instructorId
        if (userRow.analystId && u.analystId) return u.analystId !== userRow.analystId
        if (userRow.numericUserId && u.numericUserId) return u.numericUserId !== userRow.numericUserId
        // fallback: compare displayed id + role
        return !(u.id === userRow.id && u.role === userRow.role)
      }))

      // Show success messages
      const successText = messages.map(m => m.msg).filter(Boolean).join(' — ')
      if (successText) alert(successText)
      else alert(`${userRow.name} has been removed from ${userRow.role} records and user system.`)
    } else {
      // No endpoint succeeded
      const failText = failures.map(f => `${f.endpoint} -> ${f.msg || f.status}`).join('\n')
      alert('Delete failed. Server responses:\n' + (failText || 'unknown error'))
      // Refetch to ensure UI consistency
      await fetchUsers()
    }
  }

  // top-level filters
  const filteredUsers = users.filter(u => {
    const q = query.trim().toLowerCase()
    if (q) {
      const present = `${u.name} ${u.email} ${u.id}`.toLowerCase()
      if (!present.includes(q)) return false
    }
    if (roleFilter !== 'all') return u.role === roleFilter
    return true
  })

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container">
        <div className="manage-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Manage Users</h2>
            <p className="muted">Search, filter and manage platform users.</p>
            {loading && <div className="muted">Loading users...</div>}
            {error && <div className="error" style={{ marginTop: 6 }}>{error}</div>}
          </div>
          <div className="manage-header-actions">
            <AddUserMenu onSelect={(role) => setActiveAddRole(role)} />
          </div>
        </div>

        <div className="manage-controls" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="control-select">
            <option value="all">All</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="analyst">Data Analysts</option>
            <option value="admin">Admins</option>
          </select>
          <input
            placeholder="Search users by name, email or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="control-search"
            style={{ marginLeft: 12 }}
          />
        </div>

        <UsersTable users={filteredUsers} onDelete={handleDelete} loading={loading} />

        {/* Role-specific add forms */}
        {activeAddRole === 'student' && (
          <AddStudentForm
            onCreated={() => { fetchUsers(); setActiveAddRole(null) }}
            onCancel={() => setActiveAddRole(null)}
          />
        )}
        {activeAddRole === 'instructor' && (
          <AddInstructorForm
            onCreated={() => { fetchUsers(); setActiveAddRole(null) }}
            onCancel={() => setActiveAddRole(null)}
          />
        )}
        {activeAddRole === 'data_analyst' && (
          <AddAnalystForm
            onCreated={() => { fetchUsers(); setActiveAddRole(null) }}
            onCancel={() => setActiveAddRole(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ManageUsers
