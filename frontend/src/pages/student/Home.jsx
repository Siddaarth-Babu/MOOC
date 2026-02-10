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
    if (!user) return
    let mounted = true
    setLoading(true)
    setError('')

    const token = localStorage.getItem('access_token')
    // Fetch student home data from backend
    const endpoint = 'http://127.0.0.1:8000/student/home'

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
        // Extract student name and courses from backend response
        const studentName = data.student_name || 'Student'
        setUser(prev => ({ ...prev, firstName: studentName }))
        // my_list contains enrolled courses
        setCourses(Array.isArray(data.my_list) ? data.my_list : [])
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
