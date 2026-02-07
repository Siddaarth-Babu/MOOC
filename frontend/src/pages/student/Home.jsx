import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'

// Student home: reads `user` from localStorage, redirects to login if missing,
// fetches enrolled courses from API and displays them.
const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      // not logged in -> redirect to login
      navigate('/login')
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setUser(parsed)
    } catch (err) {
      console.warn('Invalid user in localStorage', err)
      localStorage.removeItem('user')
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (!user) return
    let mounted = true
    setLoading(true)
    setError('')

    // Placeholder API path; replace with your backend endpoint.
    const endpoint = `/api/student/courses`

    fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
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
        // Expecting an array of courses; if API shape differs, adapt this
        setCourses(Array.isArray(data) ? data : data.courses || [])
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
  }, [user])

  const renderCourses = () => {
    if (loading) return <div className="student-loading">Loading courses...</div>
    if (error) return <div className="student-error">{error}</div>
    if (!courses.length) return <div className="student-empty">You are not enrolled in any courses yet.</div>

    return (
      <div className="student-courses-grid">
        {courses.map((c) => (
          <article key={c.id || c.courseId} className="student-course-item">
            <h3 className="student-course-title">{c.title || c.name}</h3>
            <p className="student-course-description">{c.description ? c.description.slice(0, 120) + (c.description.length > 120 ? '…' : '') : 'No description'}</p>
            <div className="student-course-footer">
              <Link to={`/student/courses/${c.id || c.courseId}`} className="student-course-link">View</Link>
              <span className="student-course-progress">{c.progress ? `${c.progress}%` : ''}</span>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="student-home">
      <Navbar />
      <div className="container student-home-container">
        <div className="student-welcome-section">
          <div>
            <h2 className="student-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : user?.name ? `, ${user.name}` : ''}</h2>
            <p className="student-welcome-subtitle">Here are your enrolled courses and progress.</p>
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
