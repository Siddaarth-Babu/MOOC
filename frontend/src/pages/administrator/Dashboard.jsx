import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/administrator/Navbar'
import Footer from '../../components/administrator/Footer'
import QuickAccess from '../../components/administrator/QuickAccess'
import Statistics from '../../components/administrator/Statistics'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // TODO: Hardcoded user object - fetch from backend /admin endpoint
  // const hardcodedUser = {
  //   firstName: 'Admin',
  //   email: 'admin@example.com'
  // }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    setUser({ email: 'Admin' })

    /* START CHANGES
       Replaced the previous inline fetch logic with a single fetch here in Dashboard.jsx.
       We will fetch /admin once and pass the resulting data down to <Statistics adminData={adminData} />.
    */

    let mounted = true
    setLoading(true)
    setError('')

    const fetchAdmin = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/admin', {
          method: 'GET',
          credentials: 'include', // keep this if your backend uses cookies for auth
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Failed to fetch admin data')
        }
        const data = await res.json()
        if (!mounted) return
        setAdminData(data)
        setUser(prev => ({ ...prev, firstName: data.admin_name || 'Admin' }))
      } catch (err) {
        if (!mounted) return
        console.error('Admin dashboard fetch error:', err)
        setError('Could not load admin dashboard. Try again later.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    fetchAdmin()

    /* END CHANGES */

    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container">
        <section className="admin-welcome">
          <h1 className="admin-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          <p className="muted">Overview of platform activity</p>
        </section>

        {/* Pass fetched adminData down to Statistics */}
        <Statistics adminData={adminData} loading={loading} error={error} />

        <div className="admin-quick-wrap">
          <h3 className="admin-quick-title">Quick Access</h3>
          <QuickAccess />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminDashboard
