import React, { useEffect, useState } from 'react'
import Navbar from '../../components/administrator/Navbar'
import Footer from '../../components/administrator/Footer'
import { useNavigate } from 'react-router-dom'

/* START CHANGES
   Commented out the original sampleUsers array (we will fetch real users from backend)
*/
// const sampleUsers = [
//   { id: 'u1', firstName: 'Alice', lastName: 'Wong', email: 'alice@example.com', role: 'student' },
//   { id: 'u2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'instructor' },
//   { id: 'u3', firstName: 'Carol', lastName: 'Ng', email: 'carol@example.com', role: 'data_analyst' },
//   { id: 'u4', firstName: 'Dave', lastName: 'Lee', email: 'dave@example.com', role: 'admin' },
// ]
/* END CHANGES */

const ManageUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddMenu, setShowAddMenu] = useState(false) // now a menu for choose role
  const [activeAddRole, setActiveAddRole] = useState(null) // 'student' | 'instructor' | 'data_analyst'
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    password: '',
    confirm: '',
    // role-specific optional fields:
    department: '',
    dob: ''
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    /* START CHANGES
       Fetch real users from backend endpoints: instructors, students, data_analysts
    */
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    const headers = { 'Accept': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    let mounted = true
    setLoading(true)
    setFetchError(null)

    const fetchAllUsers = async () => {
      try {
        const base = 'http://127.0.0.1:8000'
        const [insR, stuR, daR] = await Promise.allSettled([
          fetch(`${base}/admin/instructors`, { headers, credentials: 'include' }),
          fetch(`${base}/admin/students`, { headers, credentials: 'include' }),
          fetch(`${base}/admin/data_analysts`, { headers, credentials: 'include' }),
        ])

        const combined = []

        const mapInstructor = (i) => ({
          id: i.instructor_id ?? i.id ?? i.instructorId ?? i.user_id ?? i.user?.id,
          firstName: i.first_name ?? i.firstName ?? i.name?.split?.(' ')?.[0] ?? '',
          lastName: i.last_name ?? i.lastName ?? (i.name?.split?.(' ')?.[1]) ?? '',
          email: i.email ?? i.email_id ?? i.user?.email ?? '',
          role: 'instructor',
          raw: i
        })
        const mapStudent = (s) => ({
          id: s.student_id ?? s.id ?? s.studentId ?? s.user_id ?? s.user?.id,
          firstName: s.first_name ?? s.firstName ?? s.name?.split?.(' ')?.[0] ?? '',
          lastName: s.last_name ?? s.lastName ?? (s.name?.split?.(' ')?.[1]) ?? '',
          email: s.email ?? s.email_id ?? s.user?.email ?? '',
          role: 'student',
          raw: s
        })
        const mapAnalyst = (a) => ({
          id: a.analyst_id ?? a.id ?? a.analystId ?? a.user_id ?? a.user?.id,
          firstName: a.first_name ?? a.firstName ?? a.name?.split?.(' ')?.[0] ?? '',
          lastName: a.last_name ?? a.lastName ?? (a.name?.split?.(' ')?.[1]) ?? '',
          email: a.email ?? a.email_id ?? a.user?.email ?? '',
          role: 'data_analyst',
          raw: a
        })

        if (insR.status === 'fulfilled') {
          if (insR.value.ok) {
            const json = await insR.value.json()
            const arr = Array.isArray(json) ? json : (json.instructors ?? [])
            combined.push(...arr.map(mapInstructor))
          } else {
            console.warn('/admin/instructors error', insR.value.status)
          }
        } else {
          console.warn('fetch instructors failed', insR.reason)
        }

        if (stuR.status === 'fulfilled') {
          if (stuR.value.ok) {
            const json = await stuR.value.json()
            const arr = Array.isArray(json) ? json : (json.students ?? [])
            combined.push(...arr.map(mapStudent))
          } else {
            console.warn('/admin/students error', stuR.value.status)
          }
        } else {
          console.warn('fetch students failed', stuR.reason)
        }

        if (daR.status === 'fulfilled') {
          if (daR.value.ok) {
            const json = await daR.value.json()
            const arr = Array.isArray(json) ? json : (json.data_analysts ?? [])
            combined.push(...arr.map(mapAnalyst))
          } else {
            console.warn('/admin/data_analysts error', daR.value.status)
          }
        } else {
          console.warn('fetch data analysts failed', daR.reason)
        }

        if (!mounted) return

        // dedupe & filter invalid
        const deduped = []
        const seen = new Set()
        for (const u of combined) {
          if (!u.id) continue
          if (seen.has(String(u.id))) continue
          seen.add(String(u.id))
          deduped.push(u)
        }

        if (deduped.length === 0) {
          setFetchError('No users returned. Verify backend endpoints and token.')
        }
        setUsers(deduped)
      } catch (err) {
        console.error('error fetching users', err)
        if (!mounted) return
        setFetchError('Failed to load users. Check backend and auth.')
        setUsers([])
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    fetchAllUsers()
    return () => { mounted = false }
    /* END CHANGES */
  }, [])

  const filtered = users.filter((u) => {
    const matchesQuery = `${(u.firstName || '')} ${(u.lastName || '')}`.toLowerCase().includes(query.toLowerCase()) || (u.email || '').toLowerCase().includes(query.toLowerCase())
    const matchesRole = roleFilter === 'all' ? true : (roleFilter === 'data_analyst' ? u.role === 'data_analyst' : u.role === roleFilter)
    return matchesQuery && matchesRole
  })

  const handleDelete = async (id, role) => {
    if (!window.confirm('Remove user from the system?')) return

    // Save removed item so we can restore on failure
    const removed = users.find(u => String(u.id) === String(id))
    // optimistic UI remove
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)))

    /* START CHANGES
       Use role-specific backend remove endpoints (these are POST endpoints in your backend snippets).
       - POST /admin/student/{student_id}
       - POST /admin/instructor/{instructor_id}
       - POST /admin/data_analyst/{analyst_id}
       Note: Using POST here because your provided handlers use @app.post for removals.
    */
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token')
      const headers = { 'Accept': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const base = 'http://127.0.0.1:8000'
      let endpoint = null

      if (role === 'instructor') endpoint = `${base}/admin/instructor/${id}`
      else if (role === 'student') endpoint = `${base}/admin/student/${id}`
      else if (role === 'data_analyst') endpoint = `${base}/admin/data_analyst/${id}`
      else endpoint = `${base}/admin/users/${id}` // fallback — implement server-side if you want unified delete

      const res = await fetch(endpoint, { method: 'POST', headers, credentials: 'include' })
      if (!res.ok) {
        // restore optimistic removal
        setUsers(prev => [removed, ...prev])
        if (res.status === 401) {
          alert('Unauthorized. Ensure your token is valid and has admin privileges.')
        } else if (res.status === 404) {
          alert('Item not found on server. It may already be deleted.')
        } else {
          const txt = await res.text()
          alert('Failed to delete: ' + (txt || res.statusText))
        }
      } else {
        // success - optionally show message or re-fetch users
      }
    } catch (err) {
      console.warn('delete request failed', err)
      // restore
      setUsers(prev => [removed, ...prev])
      alert('Delete failed (network). Check backend is running and reachable.')
    }
    /* END CHANGES */
  }

  const handleRowClick = (id, role) => {
    // navigate to detail page - include role so detail page can call the correct endpoint
    navigate(`/admin/users/${id}?role=${role}`)
  }

  const handleAddToggle = () => {
    // Toggle the Add menu
    setShowAddMenu(s => !s)
    // Reset active form when closing
    if (showAddMenu) {
      setActiveAddRole(null)
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        password: '',
        confirm: '',
        department: '',
        dob: ''
      })
    }
  }

  const openAddFor = (role) => {
    setShowAddMenu(false)
    setActiveAddRole(role)
    setNewUser(prev => ({ ...prev, role }))
  }

  const handleNewChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value })
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      alert('Please fill required fields (first name, email, password)')
      return
    }

    // optimistic UI
    const created = {
      id: `u_${Date.now()}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: activeAddRole || newUser.role,
      raw: null
    }
    setUsers(prev => [created, ...prev])

    // Clear form and close
    setActiveAddRole(null)
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      password: '',
      confirm: '',
      department: '',
      dob: ''
    })

    /* START CHANGES
       Role-specific POST to backend create endpoints you provided:
         /admin/instructor/new_instructor
         /admin/student/new_student
         /admin/data_analyst/new_data_analyst

       We include both first_name/last_name and a combined name field and also include
       department/dob when provided to reduce validation errors.
    */
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token')
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const base = 'http://127.0.0.1:8000'
      let endpoint = null
      const role = created.role

      const bodyCommon = {
        first_name: created.firstName,
        last_name: created.lastName,
        name: `${created.firstName} ${created.lastName}`.trim(),
        email_id: created.email,
        password: newUser.password // note: we already cleared newUser above, but password was read before state cleared; to be safe we kept local access in closure
      }

      // Add optional fields
      if (newUser.department) bodyCommon.department = newUser.department
      if (newUser.dob) bodyCommon.dob = newUser.dob

      if (role === 'instructor') {
        endpoint = `${base}/admin/instructor/new_instructor`
      } else if (role === 'student') {
        endpoint = `${base}/admin/student/new_student`
      } else if (role === 'data_analyst') {
        endpoint = `${base}/admin/data_analyst/new_data_analyst`
      } else {
        endpoint = `${base}/admin/users` // fallback if you implement it
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(bodyCommon)
      })

      if (!res.ok) {
        // put helpful messages based on status
        const text = await res.text().catch(() => '')
        if (res.status === 400) {
          alert(`Failed to create user: ${text || 'validation error (check required fields).'}`)
        } else if (res.status === 401) {
          alert('Unauthorized. Ensure you are logged in as an admin.')
        } else if (res.status === 404) {
          alert('Create endpoint not found on server. Implement it or change endpoint path.')
        } else {
          alert('Failed to create user: ' + (text || res.statusText))
        }
        // revert optimistic add
        setUsers(prev => prev.filter(u => u.id !== created.id))
      } else {
        // success - replace optimistic entry with normalized server response
        const serverUser = await res.json().catch(() => null)
        if (serverUser) {
          const normalized = {
            id: serverUser.instructor_id ?? serverUser.student_id ?? serverUser.analyst_id ?? serverUser.id ?? serverUser.user_id ?? created.id,
            firstName: serverUser.first_name ?? serverUser.firstName ?? created.firstName,
            lastName: serverUser.last_name ?? serverUser.lastName ?? created.lastName,
            email: serverUser.email ?? serverUser.email_id ?? created.email,
            role,
            raw: serverUser
          }
          setUsers(prev => [normalized, ...prev.filter(u => u.id !== created.id)])
        } else {
          // no JSON body returned — just leave optimistic entry as-is
        }
      }
    } catch (err) {
      console.warn('create request failed', err)
      alert('Create failed (network). Ensure backend is reachable and token is valid.')
      // revert optimistic add
      setUsers(prev => prev.filter(u => u.id !== created.id))
    }
    /* END CHANGES */
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container">
        <div className="manage-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Manage Users</h2>
            <p className="muted">Search, filter and manage platform users.</p>
            {loading && <div className="muted">Loading users...</div>}
            {fetchError && <div className="error">{fetchError}</div>}
          </div>
          <div className="manage-header-actions">
            {/* Add menu button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="btn" onClick={handleAddToggle}>{showAddMenu ? 'Close' : 'Add new user'}</button>
              {showAddMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 8,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                  padding: 8,
                  zIndex: 40,
                  minWidth: 180
                }}>
                  <button className="btn" style={{ display: 'block', width: '100%', marginBottom: 6 }} onClick={() => openAddFor('student')}>Add Student</button>
                  <button className="btn" style={{ display: 'block', width: '100%', marginBottom: 6 }} onClick={() => openAddFor('instructor')}>Add Instructor</button>
                  <button className="btn" style={{ display: 'block', width: '100%' }} onClick={() => openAddFor('data_analyst')}>Add Data Analyst</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="manage-controls" style={{ marginTop: 12 }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="control-select">
            <option value="all">All</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
            <option value="data_analyst">Data Analysts</option>
          </select>
          <input placeholder="Search users by name or email" value={query} onChange={(e) => setQuery(e.target.value)} className="control-search" style={{ marginLeft: 12 }} />
        </div>

        <div className="users-table-wrap" style={{ marginTop: 12 }}>
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
                  <tr key={u.id} className="users-row" onClick={() => handleRowClick(u.id, u.role)}>
                    <td>{u.firstName}</td>
                    <td>{u.lastName}</td>
                    <td>{u.email}</td>
                    <td className="role-cell">{(u.role || '').replace('_', ' ')}</td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id, u.role) }} className="btn btn-danger">-</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && <tr><td colSpan="5" className="muted">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role-specific add form */}
        {activeAddRole && (
          <form onSubmit={handleCreateUser} className="add-user-form" style={{ marginTop: 18, border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
            <h3 style={{ marginTop: 0 }}>Add {activeAddRole === 'student' ? 'Student' : activeAddRole === 'instructor' ? 'Instructor' : 'Data Analyst'}</h3>
            <div className="add-user-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input name="firstName" placeholder="First Name" value={newUser.firstName} onChange={handleNewChange} className="form-input" />
              <input name="lastName" placeholder="Last Name" value={newUser.lastName} onChange={handleNewChange} className="form-input" />
              <input name="email" placeholder="Email" value={newUser.email} onChange={handleNewChange} className="form-input" />
              <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleNewChange} className="form-input" />
              {/* role-specific optional fields */}
              {activeAddRole === 'instructor' && (
                <>
                  <input name="department" placeholder="Department (optional)" value={newUser.department} onChange={handleNewChange} className="form-input" />
                  <input name="dob" placeholder="DOB (YYYY-MM-DD) (optional)" value={newUser.dob} onChange={handleNewChange} className="form-input" />
                </>
              )}
              {activeAddRole === 'student' && (
                <>
                  <input name="dob" placeholder="DOB (YYYY-MM-DD) (optional)" value={newUser.dob} onChange={handleNewChange} className="form-input" />
                  <input name="department" placeholder="Department (optional)" value={newUser.department} onChange={handleNewChange} className="form-input" />
                </>
              )}
              {activeAddRole === 'data_analyst' && (
                <>
                  <input name="department" placeholder="Department (optional)" value={newUser.department} onChange={handleNewChange} className="form-input" />
                  <input name="dob" placeholder="DOB (YYYY-MM-DD) (optional)" value={newUser.dob} onChange={handleNewChange} className="form-input" />
                </>
              )}
            </div>
            <div className="add-user-actions" style={{ marginTop: 12 }}>
              <button className="auth-submit-btn" type="submit">Create {activeAddRole === 'student' ? 'Student' : activeAddRole === 'instructor' ? 'Instructor' : 'Analyst'}</button>
              <button type="button" className="btn" onClick={() => { setActiveAddRole(null); setNewUser({ firstName: '', lastName: '', email: '', role: 'student', password: '', confirm: '', department: '', dob: '' }) }}>Cancel</button>
            </div>
          </form>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default ManageUsers
