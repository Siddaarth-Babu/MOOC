import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'

// Student home: reads `user` from localStorage, redirects to login if missing,
// fetches enrolled courses from API and displays them.
const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [studentId, setStudentId] = useState(null)
  const [courses, setCourses] = useState([])
  const [catalog, setCatalog] = useState([])
  const [enrollConfirm, setEnrollConfirm] = useState({ show: false, course: null })
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      // not logged in -> redirect to login
      navigate('/login')
      return
    }
    // Set a minimal user object for greeting; real data fetched below
    // TODO: Fetch user details from backend if needed for greeting
    setUser({ email: 'Student' })
  }, [navigate])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Fetch student home data from backend (run once on mount)
    const endpoint = 'http://127.0.0.1:8000/student'

    fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Failed to fetch courses')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        // Extract student info from backend response
        const studentName = data.student_name || 'Student'
        setUser(prev => ({ ...(prev || {}), firstName: studentName }))
        // my_list contains enrolled courses
        setCourses(Array.isArray(data.my_list) ? data.my_list : [])
        // catalog contains all available courses
        setCatalog(Array.isArray(data.catalog) ? data.catalog : [])
        // Set student_id for profile navigation
        if (data.student_id) {
          setStudentId(data.student_id)
        }
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError('Could not load courses. Try again later.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const renderCourses = () => {
    if (loading) return <div className="student-loading">Loading courses...</div>
    if (error) return <div className="student-error">{error}</div>
    if (!catalog.length && !courses.length) return <div className="student-empty">No courses available.</div>

    // Show full catalog grid. Highlight courses already enrolled (from `courses`).
    const enrolledIds = new Set((courses || []).map(x => String(x.course_id || x.id || x.courseId)))

    const openEnroll = (course) => setEnrollConfirm({ show: true, course })
    const closeEnroll = () => setEnrollConfirm({ show: false, course: null })

    const handleConfirmEnroll = async () => {
      if (!enrollConfirm.course) return
      setEnrolling(true)
      try {
        const token = localStorage.getItem('access_token')
        const courseId = enrollConfirm.course.course_id || enrollConfirm.course.id || enrollConfirm.course.courseId
        const res = await fetch(`http://127.0.0.1:8000/student/courses/${encodeURIComponent(courseId)}/enroll`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ courseId })
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Enroll failed')
        }
        // On success, add course to enrolled list
        setCourses((prev) => {
          if (prev.find(c => String(c.course_id || c.id || c.courseId) === String(courseId))) return prev
          return [...prev, enrollConfirm.course]
        })
        closeEnroll()
      } catch (err) {
        console.error('Enroll error:', err)
        alert('Enrollment failed: ' + (err.message || 'Unknown'))
      } finally {
        setEnrolling(false)
      }
    }

    return (
      <div>
        <div className="student-courses-grid">
          {(catalog.length ? catalog : courses).map((c) => {
            // Backend schema: Course -> course_id, course_name, duration, skill_level, course_fees
            const id = c.course_id || c.id || c.courseId
            const title = c.course_name || c.title || c.name
            const description = c.description || c.summary || c.overview || ''
            const duration = c.duration || c.course_duration || null
            const skill = c.skill_level || c.level || ''
            const fees = c.course_fees || c.fees || null
            const enrolled = enrolledIds.has(String(id))
            return (
              <article key={id} className={`student-course-item ${enrolled ? 'enrolled' : ''}`}>
                <div className="student-course-body">
                  <h3 className="student-course-title">{title}</h3>
                  {description ? <p className="student-course-description">{description.slice(0, 140) + (description.length > 140 ? '…' : '')}</p> : <p className="student-course-description muted">No description</p>}
                  <div className="student-course-meta">
                    {duration && <span className="meta-item">⏱ {duration} min</span>}
                    {skill && <span className="meta-item">• {skill}</span>}
                    {fees !== null && <span className="meta-item">• ${fees}</span>}
                  </div>
                </div>
                <div className="student-course-footer">
                  <Link to={`/student/courses/${id}`} className="student-course-link">View</Link>
                  {enrolled ? (
                    <span className="enrolled-badge">Enrolled</span>
                  ) : (
                    <button className="auth-submit-btn enroll-btn" onClick={() => openEnroll(c)}>Enroll</button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Confirm enroll modal */}
        {enrollConfirm.show && (
          <div className="modal-overlay" onClick={closeEnroll}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <h3>Confirm Enrollment</h3>
              <p>Enroll in <strong>{enrollConfirm.course.title || enrollConfirm.course.name}</strong>?</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn" onClick={closeEnroll} disabled={enrolling}>No</button>
                <button className="auth-submit-btn" onClick={handleConfirmEnroll} disabled={enrolling}>{enrolling ? 'Enrolling...' : 'Yes, Enroll'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="student-home">
      <Navbar studentId={studentId} />
      <div className="container student-home-container">
        <div className="student-welcome-section">
          <div>
            <h2 className="student-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : user?.name ? `, ${user.name}` : ''}</h2>
            <p className="student-welcome-subtitle">Here are your enrolled courses and progress.</p>
          </div>
        </div>

        <div className="student-stats-card">
          <div className="stats-icon">📚</div>
          <div className="stats-content">
            <p className="stats-label">Courses Enrolled</p>
            <p className="stats-value">{courses.length}</p>
          </div>
        </div>

        <section>
          <h3 className="section-title">Your Courses</h3>
          {renderCourses()}
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default Home
