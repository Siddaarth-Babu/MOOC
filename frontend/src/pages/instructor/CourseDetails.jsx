import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import CoursePage from '../../components/instructor/CoursePage'

const CourseDetails = () => {
  const { id: courseId } = useParams()
  const location = useLocation()

  // get courseData from navigation state if provided
  const initialCourse = location.state?.courseData

  const [courseData, setCourseData] = useState(initialCourse || null)
  const [loading, setLoading] = useState(!initialCourse)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchCourse = async () => {
      if (initialCourse) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:8000/instructor/courses/${encodeURIComponent(courseId)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        if (!res.ok) throw new Error(`Failed to fetch course: ${res.status}`)
        const data = await res.json()
        
        // Get folders for this course
        const foldersRes = await fetch(`http://localhost:8000/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        
        if (foldersRes.ok) {
          const folders = await foldersRes.json()
          const courseDetails = {
            ...data.course_details,
            folders: folders,
            co_instructors: data.co_instructors || []
          }
          if (mounted) setCourseData(courseDetails)
        } else {
          if (mounted) setCourseData(data.course_details)
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCourse()
    return () => { mounted = false }
  }, [courseId, initialCourse])

  if (loading) return <div className="instructor-course-details"><p>Loading course…</p></div>
  if (error) return (
    <div className="course-details">
      <div className="course-header">
        <div className="course-header-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 className="course-details-title">Unable to load course</h1>
          <p className="course-meta-info">{error}</p>
        </div>
      </div>
    </div>
  )

  if (!courseData) {
    return (
      <div className="course-details">
        <div className="course-header">
          <div className="course-header-content" style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 className="course-details-title">Course not found</h1>
            <p className="course-meta-info">Please go back and select a course from your teaching list.</p>
          </div>
        </div>
      </div>
    )
  }

  return <CoursePage courseData={courseData} />
}

export default CourseDetails
