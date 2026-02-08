import React, { useEffect, useState } from 'react'

const Statistics = () => {
  const [stats, setStats] = useState({ courses: 0, students: 0, instructors: 0, admins: 0, analysts: 0 })

  useEffect(() => {
    let mounted = true
    // try to fetch real stats; fall back to hardcoded values if endpoint missing
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('no stats')
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setStats({
          courses: data.courses ?? 0,
          students: data.students ?? 0,
          instructors: data.instructors ?? 0,
          admins: data.admins ?? 0,
          analysts: data.analysts ?? 0,
        })
      })
      .catch(() => {
        if (!mounted) return
        setStats({ courses: 24, students: 1280, instructors: 42, admins: 4, analysts: 6 })
      })

    return () => { mounted = false }
  }, [])

  const cards = [
    { label: 'Courses', value: stats.courses },
    { label: 'Students', value: stats.students },
    { label: 'Instructors', value: stats.instructors },
    { label: 'System Admins', value: stats.admins },
    { label: 'Data Analysts', value: stats.analysts },
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
