import React from 'react'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ courseId, name, duration, skillLevel, fee, courseData }) => {
  const navigate = useNavigate()

  const goToDetails = () => {
    if (!courseId) return
    navigate(`/instructor/courses/${encodeURIComponent(courseId)}`, {
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
      className="instructor-course-card"
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={onKeyDown}
      aria-label={`Open details for ${name}`}
    >
      <div className="instructor-course-banner" aria-hidden="true"></div>
      <div className="instructor-course-info">
        <div className="instructor-course-text">
          <h3 className="instructor-course-title">{courseId} : {name}</h3>
          <ul className="instructor-course-meta">
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
