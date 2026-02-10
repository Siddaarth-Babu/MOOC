import React, { useEffect, useState } from 'react'

const ManageCourses = () => {
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [courseName, setCourseName] = useState('')
  const [duration, setDuration] = useState('')
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [fees, setFees] = useState('')
  const [programName, setProgramName] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [instructorEmails, setInstructorEmails] = useState('')

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('access_token')
    if (!token) return

    const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }

    const load = async () => {
      setLoading(true)
      try {
        const r = await fetch('http://127.0.0.1:8000/admin/courses', { headers })
        const data = await r.json()
        if (!mounted) return
        setCourses(data.catalog || [])

        const ri = await fetch('http://127.0.0.1:8000/admin/instructors', { headers })
        const idi = await ri.json()
        setInstructors(idi.instructors || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load courses')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    const token = localStorage.getItem('access_token')
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }

    const payload = {
      course_name: courseName,
      duration: Number(duration || 0),
      skill_level: skillLevel,
      course_fees: Number(fees || 0),
      program_name: programName,
      institute_name: instituteName,
      instructor_emails: instructorEmails.split(',').map(s => s.trim()).filter(Boolean)
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/admin/course/new_course', {
        method: 'POST', headers, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      const body = await res.json()
      alert('Course created (id: ' + (body.course_id || 'unknown') + ')')
      // refresh list
      window.location.reload()
    } catch (err) {
      console.error(err)
      setError('Create failed: ' + (err.message || err))
    }
  }

  const handleDelete = async (courseId) => {
    if (!confirm('Delete course and all its content?')) return
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/course/${courseId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      alert('Deleted')
      setCourses(prev => prev.filter(c => (c.course_id || c.courseId || c.id) !== courseId))
    } catch (err) {
      console.error(err)
      setError('Delete failed')
    }
  }

  const handleAssign = async (courseId, email) => {
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/course/${courseId}/assign_instructor/${encodeURIComponent(email)}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      alert('Assigned')
    } catch (err) {
      console.error(err)
      setError('Assign failed')
    }
  }

  return (
    <div className="admin-manage-courses container">
      <h2>Manage Courses</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <form className="admin-form" onSubmit={handleCreate}>
        <h3>Create Course</h3>
        <div className="form-row-2">
          <input className="form-input" placeholder="Course name" value={courseName} onChange={e => setCourseName(e.target.value)} required />
          <input className="form-input" placeholder="Duration (mins)" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="form-row-2">
          <input className="form-input" placeholder="Skill level" value={skillLevel} onChange={e => setSkillLevel(e.target.value)} />
          <input className="form-input" placeholder="Course fees" value={fees} onChange={e => setFees(e.target.value)} />
        </div>
        <div className="form-row-2">
          <input className="form-input" placeholder="Program name" value={programName} onChange={e => setProgramName(e.target.value)} />
          <input className="form-input" placeholder="Institute name" value={instituteName} onChange={e => setInstituteName(e.target.value)} />
        </div>
        <div>
          <input className="form-input" placeholder="Instructor emails (comma separated)" value={instructorEmails} onChange={e => setInstructorEmails(e.target.value)} />
        </div>
        <div style={{marginTop:8}}>
          <button className="auth-submit-btn" type="submit">Create Course</button>
        </div>
      </form>

      <section style={{marginTop:20}}>
        <h3>Existing courses</h3>
        {loading ? <p className="muted">Loading…</p> : (
          <ul className="admin-course-list">
            {courses.map(c => {
              const id = c.course_id || c.id || c.courseId
              return (
                <li key={id} className="admin-course-item">
                  <div>
                    <strong>{c.course_name || c.title || c.name}</strong>
                    <div className="muted">ID: {id}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <select onChange={(e) => handleAssign(id, e.target.value)} defaultValue="">
                      <option value="">Assign instructor</option>
                      {instructors.map(ins => <option key={ins.instructor_id} value={ins.email_id}>{ins.name} ({ins.email_id})</option>)}
                    </select>
                    <button className="btn" onClick={() => handleDelete(id)}>Delete</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ManageCourses
