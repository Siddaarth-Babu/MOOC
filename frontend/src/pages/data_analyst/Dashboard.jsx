import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/data_analyst/Navbar'
import Footer from '../../components/data_analyst/Footer'
import Statistics from '../../components/data_analyst/Statistics'

const API_BASE = 'http://127.0.0.1:8000'

const AnalystDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    // Fetch data analyst stats from backend
    let mounted = true
    setLoading(true)
    setError('')

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // Fetch analytics data from /analyst/home/
    fetch(`${API_BASE}/analyst/home/`, {
      method: 'GET',
      headers
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Failed to fetch analytics data')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        
        // Set user with actual analyst name from backend
        setUser({
          firstName: data.analyst?.name || 'Data Analyst',
          email: data.analyst?.email || ''
        })
        
        // Calculate derived stats from revenue data
        const totalRevenue = data.summary?.total_revenue || 0
        const totalEnrollments = data.summary?.total_enrollments || 0
        const revenueData = data.charts?.revenue_data || []
        const gradeData = data.charts?.grade_data || []
        const countryData = data.charts?.country_data || []
        
        // Calculate average revenue per course
        const avgRevenuePerCourse = revenueData.length > 0 
          ? (totalRevenue / revenueData.length).toFixed(2)
          : 0

        setStats({
          totalRevenue,
          totalEnrollments,
          avgRevenuePerCourse,
          revenueData,
          gradeData,
          countryData
        })
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError(err.message || 'Failed to fetch data')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="analyst-page">
      <Navbar />
      <div className="container admin-container">
        <section className="admin-welcome">
          <h1 className="admin-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          <p className="muted">Platform analytics and insights</p>
        </section>

        {loading && <p className="muted">Loading analytics…</p>}
        {error && <p style={{ color: '#b91c1c' }}>Error: {error}</p>}

        {stats && (
          <Statistics
            totalRevenue={stats.totalRevenue}
            totalEnrollments={stats.totalEnrollments}
            avgRevenuePerCourse={stats.avgRevenuePerCourse}
            revenueData={stats.revenueData}
            gradeData={stats.gradeData}
            countryData={stats.countryData}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AnalystDashboard