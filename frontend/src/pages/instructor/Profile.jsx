import React, { useEffect, useState } from 'react'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [department, setDepartment] = useState('')
  const [dob, setDob] = useState('')
  const [savedProfile, setSavedProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const raw = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    const parsed = raw ? JSON.parse(raw) : null
    const instructorId = parsed?.instructor_id

    // TODO: Uncomment below to fetch from backend using instructor ID
    // if (instructorId) {
    //   const headers = token ? { Authorization: `Bearer ${token}` } : {}
    //   fetch(`/instructor/${instructorId}`, { headers })
    //     .then(async (res) => {
    //       if (!res.ok) throw new Error('Failed to fetch instructor profile')
    //       return res.json()
    //     })
    //     .then((data) => {
    //       if (!mounted) return
    //       setUser(data)
    //     })
    //     .catch((err) => {
    //       if (!mounted) return
    //       console.error(err)
    //       // Fallback to localStorage
    //       if (mounted) setUser(parsed)
    //     })
    // } else {
    //   if (mounted) setUser(parsed)
    // }

    // Demo: Load from localStorage
    if (mounted) setUser(parsed)

    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    async function load() {
      setLoading(true)
      try {
        // Try instructor-specific courses endpoint
        const res = await fetch('/instructor/courses', { headers })
        if (res.ok) {
          const data = await res.json()
          // Accept either { courses: [...] } or array
          const list = Array.isArray(data) ? data : data.courses || data
          setCourses(list)
        } else {
          // fallback: if we have instructor id, try admin endpoint (may require different auth)
          if (parsed?.instructor_id) {
            const r2 = await fetch(`/admin/instructors/${parsed.instructor_id}`, { headers })
            if (r2.ok) {
              const d2 = await r2.json()
              const mapped = (d2.courses || []).map((c, idx) => {
                if (typeof c === 'string') return { id: idx, title: c, enrolled: 0 }
                return c
              })
              setCourses(mapped)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load instructor courses', err)
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // initialize editable fields from `user` when loaded
    if (user) {
      const initialName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || ''
      setName(initialName)
      setContact(user.contact || user.phone || '')
      setDepartment(user.department || user.dept || '')
      setDob(user.dob || user.dateOfBirth || '')
      setSavedProfile({ name: initialName, contact: user.contact || user.phone || '', department: user.department || user.dept || '', dob: user.dob || user.dateOfBirth || '' })
    }
  }, [user])

  const initials = (() => {
    if (!user) return 'I'
    if (user.firstName) return `${user.firstName[0] || ''}${user.lastName ? user.lastName[0] : ''}`
    if (user.name) return user.name.split(' ').map(n => n[0]).slice(0,2).join('')
    return (user.email || 'I')[0]
  })()

  const handleCancel = () => {
    if (savedProfile) {
      setName(savedProfile.name || '')
      setContact(savedProfile.contact || '')
      setDepartment(savedProfile.department || '')
      setDob(savedProfile.dob || '')
    }
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    // build payload — split name into first/last simple heuristic
    const [firstName, ...rest] = (name || '').trim().split(' ')
    const lastName = rest.length ? rest.join(' ') : ''

    const payload = {
      firstName: firstName || null,
      lastName: lastName || null,
      contact: contact || null,
      department: department || null,
      dob: dob || null
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const instructorId = user?.instructor_id

      // TODO: Uncomment below to send to backend
      // const res = await fetch(`/instructor/${instructorId}`, {
      //   method: 'PUT',
      //   headers,
      //   body: JSON.stringify(payload)
      // })
      //
      // if (!res.ok) {
      //   const text = await res.text().catch(() => '')
      //   throw new Error(text || `Server returned ${res.status}`)
      // }
      //
      // const updated = await res.json().catch(() => null)

      // Demo: Update localStorage only
      const newUser = { ...user }
      if (payload.firstName) newUser.firstName = payload.firstName
      if (payload.lastName) newUser.lastName = payload.lastName
      newUser.contact = payload.contact
      newUser.department = payload.department
      newUser.dob = payload.dob
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      setSavedProfile({ name, contact, department, dob })
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  return (
    <>
      <Navbar />

      <div className="profile-page container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'Instructor'}</h2>
            <div className="profile-specialization muted">Instructor profile</div>
          </div>
        </div>

        <div className="profile-grid">
          <aside className="profile-sidebar">
            <h4 className="admin-quick-title">Courses</h4>

            {loading ? (
              <p className="muted">Loading courses…</p>
            ) : courses && courses.length ? (
              <ul className="profile-course-list">
                {courses.map((c) => {
                  const title = c.course_name || c.title || c.course_title || c.courseName || c.name || c
                  const enrolled = c.enrolled || c.enrollment_count || c.student_count || c.enrolled_count || c.students || 0
                  const key = c.id || c.course_id || title
                  return (
                    <li key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong className="link-brand">{title}</strong>
                        {c.code && <div className="muted" style={{ fontSize: '0.9rem' }}>{c.code}</div>}
                      </span>
                      <span className="muted" style={{ marginLeft: 12 }}>{enrolled}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="muted">No courses found.</p>
            )}
          </aside>

          <section className="profile-display">
            <h4 className="admin-quick-title">Instructor Details</h4>

            <div className="profile-display-row">
              <label className="profile-display-label">INSTRUCTOR ID</label>
              <div className="profile-display-value">{user?.instructor_id ?? user?.id ?? '—'}</div>
            </div>

            {!isEditing ? (
              <>
                <div className="profile-display-row">
                  <label className="profile-display-label">NAME</label>
                  <div className="profile-display-value">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">EMAIL</label>
                  <div className="profile-display-value">{user?.email ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">CONTACT</label>
                  <div className="profile-display-value">{user?.contact ?? user?.phone ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DEPARTMENT</label>
                  <div className="profile-display-value">{user?.department ?? user?.dept ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DATE OF BIRTH</label>
                  <div className="profile-display-value">{user?.dob ?? user?.dateOfBirth ?? '—'}</div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <div className="profile-field-grid">
                  <div className="profile-field full-width">
                    <label className="profile-label">NAME</label>
                    <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="profile-field full-width">
                    <label className="profile-label">CONTACT</label>
                    <input className="profile-input" value={contact} onChange={(e) => setContact(e.target.value)} />
                  </div>

                  <div className="profile-field full-width">
                    <label className="profile-label">DEPARTMENT</label>
                    <input className="profile-input" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>

                  <div className="profile-field full-width">
                    <label className="profile-label">DATE OF BIRTH</label>
                    <input className="profile-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                </div>

                <div className="profile-save-row">
                  <button type="submit" className="btn-save">Save</button>
                  <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                  {error && <div className="profile-error">{error}</div>}
                </div>
              </form>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Profile
