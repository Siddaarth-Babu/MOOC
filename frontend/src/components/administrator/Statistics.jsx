import React, { useEffect, useState } from 'react'

const Statistics = ({ adminData = null, loading = false, error = '' }) => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    instructors: 0,
    admins: 0,
    analysts: 0,
    universities: 0
  })

  /* START CHANGES
     Commented out the original fetch that ran inside Statistics.jsx (we fetch once in Dashboard now).
     Instead, update local stats when adminData prop changes.
  */

  // --- Original code commented out ---
  /*
  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('token')
    const headers = { 'Accept': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    fetch('http://127.0.0.1:8000/admin', { method: 'GET', headers })
      .then((res) => {
        if (!res.ok) throw new Error('failed to fetch admin stats')
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setStats({
          courses: data.no_of_courses ?? 0,
          students: data.no_of_students ?? 0,
          instructors: data.no_of_instructors ?? 0,
          admins: data.no_of_admins ?? 0,
          analysts: data.no_of_dataanalysts ?? 0,
          universities: data.no_of_universities ?? 0
        })
      })
      .catch((err) => {
        console.error('Could not load admin stats:', err)
        if (!mounted) return
        setStats({ courses: 0, students: 0, instructors: 0, admins: 0, analysts: 0, universities: 0 })
      })

    return () => { mounted = false }
  }, [])
  */
  // --- End original code ---

  // New effect: populate stats from adminData prop (single source of truth)
  useEffect(() => {
    if (!adminData) {
      // No adminData yet: keep defaults (or you could show loading)
      setStats({
        courses: 0,
        students: 0,
        instructors: 0,
        admins: 0,
        analysts: 0,
        universities: 0
      })
      return
    }

    setStats({
      courses: adminData.no_of_courses ?? 0,
      students: adminData.no_of_students ?? 0,
      instructors: adminData.no_of_instructors ?? 0,
      admins: adminData.no_of_admins ?? 0,
      analysts: adminData.no_of_dataanalysts ?? 0,
      universities: adminData.no_of_universities ?? 0
    })
  }, [adminData])

  /* END CHANGES */

  const cards = [
    { label: 'Courses', value: stats.courses },
    { label: 'Students', value: stats.students },
    { label: 'Instructors', value: stats.instructors },
    { label: 'System Admins', value: stats.admins },
    { label: 'Data Analysts', value: stats.analysts },
    { label: 'Universities', value: stats.universities }
  ]

  return (
    <div className="admin-stats-grid">
      {cards.map((c) => (
        <div key={c.label} className="admin-stat-card">
          <div className="admin-stat-value">{c.value}</div>
          <div className="admin-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  )
}

export default Statistics
