import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const API_BASE = 'http://127.0.0.1:8000'

const CourseControlPage = () => {
  const params = useParams()
  const location = useLocation()
  const courseId = params.courseId || location?.state?.courseId
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [busyKey, setBusyKey] = useState(null)

  useEffect(() => {
    if (!courseId) {
      setError('Missing course id')
      setLoading(false)
      return
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch(`${API_BASE}/admin/course/${courseId}/control`, { headers: authHeaders })
        if (!r.ok) throw new Error(await r.text())
        const body = await r.json()
        setData(body)
      } catch (e) {
        console.error(e)
        setError('Failed to load course control data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  const deassignInstructor = async (instructorId) => {
    setBusyKey(`inst-${instructorId}`)
    setError(null)
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    }
    try {
      const r = await fetch(`${API_BASE}/admin/course/${courseId}/instructor/${instructorId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!r.ok) throw new Error(await r.text())
      setData(prev => ({ ...prev, instructors: prev.instructors.filter(i => i.id !== instructorId) }))
    } catch (e) {
      console.error(e)
      setError('Failed to deassign instructor')
    } finally {
      setBusyKey(null)
    }
  }

  const deregStudent = async (studentId) => {
    const key = `stu-${studentId}`
    setBusyKey(key)
    setError(null)
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    }
    try {
      const r = await fetch(`${API_BASE}/admin/course/${courseId}/student/${studentId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!r.ok) throw new Error(await r.text())
      setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== studentId) }))
    } catch (e) {
      console.error(e)
      setError('Failed to deregister student')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="course-control-page">
      <Navbar />
      <main className="admin-content container">
        {loading ? (
          <div className="cc-loading">Loading…</div>
        ) : error ? (
          <div className="cc-error">{error}</div>
        ) : !data ? (
          <div className="cc-empty">No data available</div>
        ) : (
          <>
            <div className="cc-header">
              <div className="cc-title">
                <h1 className="course-title">{data.course_name}</h1>
                <div className="course-meta">ID: <span className="meta-id">{data.course_id}</span></div>
              </div>
              <div className="cc-actions">
                <button className="btn btn-back" onClick={() => navigate(-1)}>Back</button>
              </div>
            </div>

            <section className="cc-section instructors-section">
              <h2 className="section-heading">Assigned instructors</h2>
              <div className="list-wrap">
                {Array.isArray(data.instructors) && data.instructors.length > 0 ? (
                  <ul className="instructors-list">
                    {data.instructors.map(i => (
                      <li key={i.id} className="person-card instructor-card">
                        <div className="person-main">
                          <div className="person-name">{i.name || '—'}</div>
                          <div className="person-sub">ID: <span className="person-id">{i.id}</span> — {i.email}</div>
                        </div>
                        <div className="person-ops">
                          <button
                            className="btn btn-deassign"
                            onClick={() => deassignInstructor(i.id)}
                            disabled={busyKey === `inst-${i.id}`}
                          >
                            {busyKey === `inst-${i.id}` ? 'Working…' : 'DEASSIGN'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="muted">No assigned instructors</div>
                )}
              </div>
            </section>

            <section className="cc-section students-section">
              <h2 className="section-heading">Registered students</h2>
              <div className="list-wrap">
                {Array.isArray(data.students) && data.students.length > 0 ? (
                  <ul className="students-list">
                    {data.students.map(s => (
                      <li key={s.id} className="person-card student-card">
                        <div className="person-main">
                          <div className="person-name">{s.name || '—'}</div>
                          <div className="person-sub">ID: <span className="person-id">{s.id}</span> — {s.email}</div>
                        </div>
                        <div className="person-ops">
                          <button
                            className="btn btn-dereg"
                            onClick={() => deregStudent(s.id)}
                            disabled={busyKey === `stu-${s.id}`}
                          >
                            {busyKey === `stu-${s.id}` ? 'Working…' : 'DEREG'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="muted">No registered students</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default CourseControlPage
