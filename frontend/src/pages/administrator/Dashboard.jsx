import React from 'react'
import Navbar from '../../components/administrator/Navbar'
import Footer from '../../components/administrator/Footer'
import QuickAccess from '../../components/administrator/QuickAccess'
import Statistics from '../../components/administrator/Statistics'
const AdminDashboard = () => {
  const user = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })()

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container">
        <section className="admin-welcome">
          <h1 className="admin-welcome-title">Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          <p className="muted">Overview of platform activity</p>
        </section>

        <Statistics />

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
