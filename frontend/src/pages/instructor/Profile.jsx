import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

const Profile = () => {
  const { instructorId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [dob, setDob] = useState('')
  const [courses, setCourses] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [savedProfile, setSavedProfile] = useState(null)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('access_token')

    const headers = token ? { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } : {}

    async function load() {
      try {
        // Fetch instructor's courses from backend
        const res = await fetch('http://127.0.0.1:8000/instructor', { headers })
        if (res.ok) {
          const data = await res.json()
          // Extract course info if available - for now just set empty
          setCourses([])
        }
      } catch (err) {
        console.error('Failed to load instructor courses', err)
      }
    }

    if (token) load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true

    if (!instructorId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('Not authenticated')
        }
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
        
        const url = `http://127.0.0.1:8000/instructor/profile/${instructorId}`
        console.log('Fetching instructor profile from:', url)
        console.log('Using token:', token.substring(0, 20) + '...')
        
        // Fetch profile from backend using instructorId
        const res = await fetch(url, { headers })
        
        if (!mounted) return
        
        console.log('Response status:', res.status)
        const responseText = await res.text()
        console.log('Response body:', responseText)
        
        if (res.ok) {
          const data = JSON.parse(responseText)
          setEmail(data.email_id || '')
          setName(data.name || '')
          setDepartment(data.department || '')
          setDob(data.dob || '')
          
          setSavedProfile({
            name: data.name || '',
            department: data.department || '',
            dob: data.dob || ''
          })
        } else {
          throw new Error(`Server error (${res.status}): ${responseText}`)
        }
      } catch (err) {
        if (mounted) {
          console.error('Profile fetch error:', err)
          setError(`Error: ${err.message}`)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProfile()
    return () => { mounted = false }
  }, [instructorId])

  const initials = (() => {
    if (!name) return 'I'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  })()

  const handleCancel = () => {
    if (savedProfile) {
      setName(savedProfile.name || '')
      setDepartment(savedProfile.department || '')
      setDob(savedProfile.dob || '')
    }
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      department,
      dob
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      const res = await fetch(`http://127.0.0.1:8000/instructor/profile/${instructorId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      })

      const text = await res.text()
      let body = null
      try { body = JSON.parse(text) } catch (_) { body = text }

      if (!res.ok) {
        const message = body?.message || body?.error || (typeof body === 'string' ? body : null) || `Server returned ${res.status}`
        throw new Error(message)
      }

      // Update saved profile
      setSavedProfile({
        name: payload.name,
        department: payload.department,
        dob: payload.dob
      })
      setName(payload.name)
      setDepartment(payload.department)
      setDob(payload.dob)
      setIsEditing(false)
      alert('Profile saved')
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  if (!instructorId) return <div className="student-loading">Invalid instructor ID</div>
  if (loading) return <div className="student-loading">Loading profile…</div>
  if (error) return <div className="student-error">{error}</div>

  return (
    <>
      <Navbar instructorId={instructorId} />

      <div className="profile-page container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
          <h2 className="profile-name">{name || 'Instructor'}</h2>
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

            {!isEditing ? (
              <>
                <div className="profile-display-row">
                  <label className="profile-display-label">NAME</label>
                  <div className="profile-display-value">{name || '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">EMAIL</label>
                  <div className="profile-display-value">{email || '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DEPARTMENT</label>
                  <div className="profile-display-value">{department || '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DATE OF BIRTH</label>
                  <div className="profile-display-value">{dob || '—'}</div>
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
