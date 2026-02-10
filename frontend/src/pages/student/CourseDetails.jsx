import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import CoursePage from '../../components/student/CoursePage'

const CourseDetails = () => {
  const { id: courseId } = useParams()
  const location = useLocation()
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get courseData from location state passed from CourseCard
  const initialCourseData = location.state?.courseData

  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!courseId) return
      
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/student/enrollments/${courseId}`)
        if (!response.ok) throw new Error('Failed to fetch course structure')
        const folders = await response.json()
        
        // Combine initial course data with folder structure
        setCourseData({
          course: initialCourseData?.course || { id: courseId, name: 'Loading...' },
          folders: folders,
          details: initialCourseData?.details || [],
          grades: initialCourseData?.grades || { items: [], overall: null }
        })
      } catch (err) {
        setError(err.message)
        // Fallback to location state if fetch fails
        if (initialCourseData) {
          setCourseData(initialCourseData)
        }
      } finally {
        setLoading(false)
      }
    }

    if (initialCourseData && !courseId) {
      setCourseData(initialCourseData)
      setLoading(false)
    } else {
      fetchCourseStructure()
    }
  }, [courseId, initialCourseData])

  if (loading) {
    return (
      <div className="course-details">
        <div className="course-header">
          <div className="course-header-content" style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 className="course-details-title">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="course-details">
        <div className="course-header">
          <div className="course-header-content" style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 className="course-details-title">Course not found</h1>
            <p className="course-meta-info">Please go back and select a course from your enrollments.</p>
          </div>
        </div>
      </div>
    )
  }

  return <CoursePage courseData={courseData} />
}

export default CourseDetails
