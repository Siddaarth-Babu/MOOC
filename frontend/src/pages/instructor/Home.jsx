import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

// Instructor home: reads `user` from localStorage, redirects to login if missing,
// fetches teaching courses and earnings data from API.
const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [earnings, setEarnings] = useState({ total: 0, perCourse: {} })
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

    // Fetch teaching courses
    fetch(`/api/instructor/courses`, {
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
        setCourses(Array.isArray(data) ? data : data.courses || [])
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

    // Fetch earnings data
    fetch(`/api/instructor/earnings`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) return { total: 0, perCourse: {} }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setEarnings(data || { total: 0, perCourse: {} })
      })
      .catch(() => {
        // Silently fail on earnings fetch, use default
        if (mounted) setEarnings({ total: 0, perCourse: {} })
      })

    return () => {
      mounted = false
    }
  }, [user])

  // Calculate earnings per course from courses array if API doesn't provide earnings data
  const averageEarningsPerCourse = courses.length > 0 ? (earnings.total / courses.length).toFixed(2) : '0.00'

  return (
    <div className="instructor-home">
      <Navbar />
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
