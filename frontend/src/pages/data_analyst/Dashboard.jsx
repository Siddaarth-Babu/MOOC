import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/data_analyst/Navbar'
import Footer from '../../components/data_analyst/Footer'
import Statistics from '../../components/data_analyst/Statistics'

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
    setUser({ email: 'Analyst' })

    // Fetch data analyst stats from backend
    let mounted = true
    setLoading(true)
    setError('')

    // TODO: Uncomment below to fetch from real API
    // fetch('http://127.0.0.1:8000/admin', {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    // })
    //   .then(async (res) => {
    //     if (!res.ok) {
    //       const txt = await res.text()
    //       throw new Error(txt || 'Failed to fetch analytics data')
    //     }
    //     return res.json()
    //   })
    //   .then((data) => {
    //     if (!mounted) return
    //     setStats({
    //       courses: data.no_of_courses ?? 0,
    //       students: data.no_of_students ?? 0,
    //       instructors: data.no_of_instructors ?? 0,
    //       universities: data.no_of_universities ?? 0,
    //       courseRatings: (data.avg_course_rating ?? 4.5).toFixed(2),
    //       highestRatedCourse: data.highest_rated_course || 'Advanced React Development',
    //       highestRatedCourseId: data.highest_rated_course_id || 'CS-301',
    //       highestViewedCourse: data.course_most_registrations || 'Web Development 101',
    //       highestViewedCourseId: data.course_most_registrations_id || 'CS-101',
    //       topInstructorRating: data.top_instructor_rating || 'Dr. Sarah Johnson',
    //       topInstructorRatingId: data.top_instructor_rating_id || 'INST-005',
    //       topInstructorRegistrations: data.top_instructor_registrations || 'Prof. John Smith',
    //       topInstructorRegistrationsId: data.top_instructor_registrations_id || 'INST-001',
    //       topUniversity: data.university_most_courses || 'Stanford University',
    //       topUniversityId: data.university_most_courses_id || 'UNI-001'
    //     })
    //     setUser(prev => ({ ...prev, firstName: data.analyst_name || 'Data Analyst' }))
    //   })
    //   .catch((err) => {
    //     if (!mounted) return
    //     console.error(err)
    //     // fallback to sample data
    //     loadSampleData()
    //   })
    //   .finally(() => {
    //     if (mounted) setLoading(false)
    //   })

    // Sample data for demo
    const loadSampleData = () => {
      if (!mounted) return
      setStats({
        courses: 32,
        students: 2150,
        instructors: 48,
        universities: 12,
        courseRatings: '4.6',
        highestRatedCourse: 'Advanced React Development',
        highestRatedCourseId: 'CS-301',
        highestViewedCourse: 'Web Development 101',
        highestViewedCourseId: 'CS-101',
        topInstructorRating: 'Dr. Sarah Johnson',
        topInstructorRatingId: 'INST-005',
        topInstructorRegistrations: 'Prof. John Smith',
        topInstructorRegistrationsId: 'INST-001',
        topUniversity: 'Stanford University',
        topUniversityId: 'UNI-001'
      })
      setUser(prev => ({ ...prev, firstName: 'Data Analyst' }))
      setLoading(false)
    }

    // Load sample data immediately
    loadSampleData()

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
            courses={stats.courses}
            students={stats.students}
            instructors={stats.instructors}
            universities={stats.universities}
            courseRatings={stats.courseRatings}
            highestRatedCourse={stats.highestRatedCourse}
            highestRatedCourseId={stats.highestRatedCourseId}
            highestViewedCourse={stats.highestViewedCourse}
            highestViewedCourseId={stats.highestViewedCourseId}
            topInstructorRating={stats.topInstructorRating}
            topInstructorRatingId={stats.topInstructorRatingId}
            topInstructorRegistrations={stats.topInstructorRegistrations}
            topInstructorRegistrationsId={stats.topInstructorRegistrationsId}
            topUniversity={stats.topUniversity}
            topUniversityId={stats.topUniversityId}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AnalystDashboard
