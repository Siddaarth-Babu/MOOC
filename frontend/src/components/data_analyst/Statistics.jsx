import React, { useState } from 'react'

const Statistics = ({
  // Primary stats
  courses = 0,
  students = 0,
  instructors = 0,
  universities = 0,
  // Rating
  courseRatings = 0,
  // Course with highest rating
  highestRatedCourse = 'N/A',
  highestRatedCourseId = 0,
  // Course with highest registrations
  highestViewedCourse = 'N/A',
  highestViewedCourseId = 0,
  // Top instructors
  topInstructorRating = 'N/A',
  topInstructorRatingId = 0,
  topInstructorRegistrations = 'N/A',
  topInstructorRegistrationsId = 0,
  // Top university
  topUniversity = 'N/A',
  topUniversityId = 0,
  // Detail data fetchers (optional, for loading details)
  onCompany = null
}) => {
  const [activeModal, setActiveModal] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const handleCardClick = (cardType, id) => {
    setActiveModal(cardType)
    setModalLoading(true)
    
    // Simulate fetching detail data; replace with real API calls later
    setTimeout(() => {
      switch(cardType) {
        case 'highest-rated-course':
          setModalData({
            courseId: 'CS-301',
            courseName: 'Advanced React Development',
            instructor: 'Dr. Sarah Johnson',
            university: 'Stanford University',
            studentsRegistered: 342,
            rating: 4.8,
            description: 'Master advanced React patterns and best practices'
          })
          break
        case 'highest-views-course':
          setModalData({
            courseId: 'CS-101',
            courseName: 'Web Development 101',
            instructor: 'Prof. John Smith',
            university: 'MIT',
            studentsRegistered: 567,
            rating: 4.5,
            description: 'Complete guide to web development fundamentals'
          })
          break
        case 'top-instructor-rating':
          setModalData({
            instructorId: 'INST-005',
            instructorName: 'Dr. Sarah Johnson',
            courses: [
              { courseId: 'CS-301', courseName: 'Advanced React', students: 342, rating: 4.8 },
              { courseId: 'CS-302', courseName: 'Node.js Mastery', students: 289, rating: 4.7 },
              { courseId: 'CS-303', courseName: 'JavaScript Advanced', students: 215, rating: 4.6 }
            ]
          })
          break
        case 'top-instructor-registrations':
          setModalData({
            instructorId: 'INST-001',
            instructorName: 'Prof. John Smith',
            courses: [
              { courseId: 'CS-101', courseName: 'Web Development 101', students: 567, rating: 4.5 },
              { courseId: 'CS-102', courseName: 'HTML & CSS Basics', students: 498, rating: 4.3 },
              { courseId: 'CS-103', courseName: 'JavaScript Fundamentals', students: 456, rating: 4.4 }
            ]
          })
          break
        case 'top-university':
          setModalData({
            universityId: 'UNI-001',
            universityName: 'Stanford University',
            totalCourses: 18,
            courses: [
              { courseId: 'CS-301', courseName: 'Advanced React Development', students: 342, rating: 4.8 },
              { courseId: 'CS-305', courseName: 'Machine Learning Basics', students: 298, rating: 4.7 },
              { courseId: 'CS-310', courseName: 'Cloud Computing', students: 276, rating: 4.6 },
              { courseId: 'CS-315', courseName: 'Data Science 101', students: 245, rating: 4.5 }
            ]
          })
          break
        default:
          setModalData(null)
      }
      setModalLoading(false)
    }, 300)
  }

  const closeModal = () => {
    setActiveModal(null)
    setModalData(null)
  }

  return (
    <>
      {/* Primary Stats Row */}
      <div className="analyst-primary-row">
        <div className="analyst-primary-card">
          <div className="analyst-primary-value">{courses}</div>
          <div className="analyst-primary-label">Courses</div>
        </div>
        <div className="analyst-primary-card">
          <div className="analyst-primary-value">{students}</div>
          <div className="analyst-primary-label">Students</div>
        </div>
        <div className="analyst-primary-card">
          <div className="analyst-primary-value">{instructors}</div>
          <div className="analyst-primary-label">Instructors</div>
        </div>
        <div className="analyst-primary-card">
          <div className="analyst-primary-value">{universities}</div>
          <div className="analyst-primary-label">Universities</div>
        </div>
      </div>

      {/* Average Rating */}
      <div className="analyst-rating-card">
        <div className="analyst-rating-value">⭐ {courseRatings}</div>
        <div className="analyst-primary-label">Average Course Rating</div>
      </div>

      {/* Highest Rated Course */}
      <div 
        className="analyst-clickable-card" 
        onClick={() => handleCardClick('highest-rated-course', highestRatedCourseId)}
      >
        <div className="analyst-card-title">Highest Rated Course</div>
        <div className="analyst-card-value">{highestRatedCourse}</div>
        <div className="analyst-card-meta">ID: {highestRatedCourseId} • Click for details</div>
      </div>

      {/* Highest Views Course */}
      <div 
        className="analyst-clickable-card"
        onClick={() => handleCardClick('highest-views-course', highestViewedCourseId)}
      >
        <div className="analyst-card-title">Highest Registrations</div>
        <div className="analyst-card-value">{highestViewedCourse}</div>
        <div className="analyst-card-meta">ID: {highestViewedCourseId} • Click for details</div>
      </div>

      {/* Top Instructor by Rating */}
      <div 
        className="analyst-clickable-card"
        onClick={() => handleCardClick('top-instructor-rating', topInstructorRatingId)}
      >
        <div className="analyst-card-title">Top Instructor (by Rating)</div>
        <div className="analyst-card-value">{topInstructorRating}</div>
        <div className="analyst-card-meta">ID: {topInstructorRatingId} • Click for courses</div>
      </div>

      {/* Top Instructor by Registrations */}
      <div 
        className="analyst-clickable-card"
        onClick={() => handleCardClick('top-instructor-registrations', topInstructorRegistrationsId)}
      >
        <div className="analyst-card-title">Top Instructor (by Registrations)</div>
        <div className="analyst-card-value">{topInstructorRegistrations}</div>
        <div className="analyst-card-meta">ID: {topInstructorRegistrationsId} • Click for courses</div>
      </div>

      {/* Top University */}
      <div 
        className="analyst-clickable-card"
        onClick={() => handleCardClick('top-university', topUniversityId)}
      >
        <div className="analyst-card-title">Top University (by Courses)</div>
        <div className="analyst-card-value">{topUniversity}</div>
        <div className="analyst-card-meta">ID: {topUniversityId} • Click for courses</div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="analyst-modal-overlay" onClick={closeModal}>
          <div className="analyst-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="analyst-modal-header">
              <h2 className="analyst-modal-title">
                {activeModal === 'highest-rated-course' && 'Course Details'}
                {activeModal === 'highest-views-course' && 'Course Details'}
                {activeModal === 'top-instructor-rating' && 'Instructor Details'}
                {activeModal === 'top-instructor-registrations' && 'Instructor Details'}
                {activeModal === 'top-university' && 'University Details'}
              </h2>
              <button className="analyst-modal-close" onClick={closeModal}>✕</button>
            </div>

            {modalLoading ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading details…</p>
            ) : modalData ? (
              <>
                {/* Course Details */}
                {(activeModal === 'highest-rated-course' || activeModal === 'highest-views-course') && (
                  <div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Course ID</span>
                      <span className="analyst-detail-value">{modalData.courseId}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Course Name</span>
                      <span className="analyst-detail-value">{modalData.courseName}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Instructor</span>
                      <span className="analyst-detail-value">{modalData.instructor}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">University</span>
                      <span className="analyst-detail-value">{modalData.university}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Students Registered</span>
                      <span className="analyst-detail-value">{modalData.studentsRegistered}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Rating</span>
                      <span className="analyst-detail-value">⭐ {modalData.rating}</span>
                    </div>
                  </div>
                )}

                {/* Instructor Details */}
                {(activeModal === 'top-instructor-rating' || activeModal === 'top-instructor-registrations') && (
                  <div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Instructor ID</span>
                      <span className="analyst-detail-value">{modalData.instructorId}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Instructor Name</span>
                      <span className="analyst-detail-value">{modalData.instructorName}</span>
                    </div>
                    <div className="analyst-detail-section">
                      <div className="analyst-detail-section-title">Courses Teaching</div>
                      {modalData.courses.map((course, idx) => (
                        <div key={idx} className="analyst-course-item">
                          <div className="analyst-course-item-name">{course.courseName}</div>
                          <div className="analyst-course-item-meta">ID: {course.courseId}</div>
                          <div className="analyst-course-item-meta">Students: {course.students} • Rating: ⭐ {course.rating}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* University Details */}
                {activeModal === 'top-university' && (
                  <div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">University ID</span>
                      <span className="analyst-detail-value">{modalData.universityId}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">University Name</span>
                      <span className="analyst-detail-value">{modalData.universityName}</span>
                    </div>
                    <div className="analyst-detail-row">
                      <span className="analyst-detail-label">Total Courses</span>
                      <span className="analyst-detail-value">{modalData.totalCourses}</span>
                    </div>
                    <div className="analyst-detail-section">
                      <div className="analyst-detail-section-title">Courses Offered</div>
                      {modalData.courses.map((course, idx) => (
                        <div key={idx} className="analyst-course-item">
                          <div className="analyst-course-item-name">{course.courseName}</div>
                          <div className="analyst-course-item-meta">ID: {course.courseId}</div>
                          <div className="analyst-course-item-meta">Students: {course.students} • Rating: ⭐ {course.rating}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#e53e3e' }}>Error loading details</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Statistics
