import React from 'react'
import { useParams, useLocation } from 'react-router-dom'
import CoursePage from '../../components/student/CoursePage'

const CourseDetails = () => {
  const { id: courseId } = useParams()
  const location = useLocation()

  // Get courseData from location state passed from CourseCard, or use courseId
  const courseData = location.state?.courseData

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
