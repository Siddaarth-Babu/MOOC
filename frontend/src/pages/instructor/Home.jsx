import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

// Instructor home: reads `user` from localStorage, redirects to login if missing,
// fetches teaching courses and earnings data from API.
const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [instructorId, setInstructorId] = useState(null)
  const [courses, setCourses] = useState([])
  const [earnings, setEarnings] = useState({ total: 0, perCourse: {} })
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
    setUser({ email: 'Instructor' })
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

    // Fetch instructor home data from backend (run once on mount)
    const endpoint = 'http://127.0.0.1:8000/instructor'

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
          throw new Error(txt || 'Failed to fetch teaching data')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        // Extract instructor data from backend response
        setUser(prev => ({ ...(prev || {}), firstName: data.instructor_name || 'Instructor' }))
        // Set instructor_id for profile navigation
        if (data.instructor_id) {
          setInstructorId(data.instructor_id)
        }
        // Set earnings data
        setEarnings({
          total: data.total_earnings || 0,
          perCourse: data.per_course_breakdown || {}
        })
        // Set courses count
        setCourses(new Array(data.total_courses || 0))
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError('Could not load teaching data. Try again later.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Calculate earnings per course from courses array if API doesn't provide earnings data
  const averageEarningsPerCourse = courses.length > 0 ? (earnings.total / courses.length).toFixed(2) : '0.00'

  return (
    <div className="instructor-home">
      <Navbar instructorId={instructorId} />
      <div className="container instructor-home-container">
        <div className="instructor-welcome-section">
          <div>
            <h2 className="instructor-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : user?.name ? `, ${user.name}` : ''}</h2>
            <p className="instructor-welcome-subtitle">Manage your courses and track your earnings.</p>
          </div>
        </div>

        {error && <div className="instructor-error">{error}</div>}

        <div className="instructor-stats-row">
          <div className="instructor-stats-card">
            <div className="stats-icon">📚</div>
            <div className="stats-content">
              <p className="stats-label">Courses Teaching</p>
              <p className="stats-value">{loading ? '...' : courses.length}</p>
            </div>
          </div>

          <div className="instructor-earnings-card">
            <div className="earnings-header">
              <h3 className="earnings-title">Earnings</h3>
              <div className="earnings-icon">💰</div>
            </div>
            <div className="earnings-data">
              <div className="earnings-item">
                <p className="earnings-label">Gross Earnings</p>
                <p className="earnings-amount">${loading ? '...' : earnings.total.toFixed(2)}</p>
              </div>
              <div className="earnings-divider"></div>
              <div className="earnings-item">
                <p className="earnings-label">Per Course</p>
                <p className="earnings-amount">${loading ? '...' : averageEarningsPerCourse}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
