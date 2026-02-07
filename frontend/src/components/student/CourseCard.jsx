import React from 'react'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ courseId, name, duration, skillLevel, fee, courseData }) => {
  const navigate = useNavigate()

  const goToDetails = () => {
    if (!courseId) return
    navigate(`/student/enrollments/${encodeURIComponent(courseId)}`, {
      state: { courseData }
    })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goToDetails()
    }
  }

  return (
    <article
      className="course-card"
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={onKeyDown}
      aria-label={`Open details for ${name}`}
    >
      <div className="course-banner" aria-hidden="true"></div>
      <div className="course-info">
        <div className="course-text">
          <h3 className="course-title">{courseId} : {name}</h3>
          <ul className="course-meta">
            <li><span className="meta-label">DURATION</span><span className="meta-val">{duration}</span></li>
            <li><span className="meta-label">SKILL LEVEL</span><span className="meta-val">{skillLevel}</span></li>
            <li><span className="meta-label">COURSEFEE</span><span className="meta-val">{fee}</span></li>
          </ul>
        </div>
      </div>
    </article>
  )
}

CourseCard.defaultProps = {
  courseId: 'COURSE-000',
  name: 'Course Name',
  duration: 'N/A',
  skillLevel: 'Beginner',
  fee: 'Free',
  courseData: null
}

export default CourseCard
