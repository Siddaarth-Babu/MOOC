import React, { useState, useMemo, useEffect } from 'react'
import CourseCard from '../../components/student/CourseCard'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'

const MyEnrollments = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // Enrolled courses will be fetched from the backend instead of using hardcoded data.
  // The original hardcoded example data has been commented out here for reference.
  /*
    const EXAMPLE = [ { id: 'CS301', name: 'Computer Networks', ... }, ... ]
  */
  const [enrolledCourses, setEnrolledCourses] = useState([])

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('access_token')
    if (!token) return

    fetch('http://127.0.0.1:8000/student/enrollments', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || 'Failed to fetch enrollments')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        // backend returns { student_name, my_list }
        const list = Array.isArray(data.my_list) ? data.my_list : []
        setEnrolledCourses(list)
      })
      .catch((err) => {
        console.error('Enrollments fetch error:', err)
      })

    return () => { mounted = false }
  }, [])

  // Search-only filter (case-insensitive) — simplified per request
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return enrolledCourses
    const q = searchQuery.toLowerCase()
    return enrolledCourses.filter((course_fetched) => {
      const name = String(course_fetched.course_name || course_fetched.name || course_fetched.title || '')
      const id = String(course_fetched.course_id || course_fetched.id || course_fetched.courseId || '')
      return name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
    })
  }, [enrolledCourses, searchQuery])

  return (
    <div className='my-enrollments-wrapper'>
      <Navbar />
      <div className="my-enrollments">
      
      <div className="enrollments-header">
        <h1 className="enrollments-title">My courses</h1>
        <p className="enrollments-subtitle">Course overview</p>
      </div>

      <div className="enrollments-container">
        {/* Search-only control */}
        <div className="enrollments-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div className="control-group search-group" style={{ width: 320 }}>
            <input
              type="text"
              className="control-search"
              placeholder="Search courses by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="enrollments-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course_fetched) => {
              // Build comprehensive courseDetails structure from backend data
              // NO HARDCODED SECTIONS - will be fetched from backend folders
              const courseDetails = {
                course: {
                  id: course_fetched.course_id,
                  name: course_fetched.course_name,
                  instructor: course_fetched.instructor_name || 'TBA',
                  duration: `${course_fetched.duration} weeks`,
                  skillLevel: course_fetched.skill_level,
                  fee: `$${course_fetched.course_fees}`,
                  description: course_fetched.course_description || 'No description available'
                },
                // Sections will be populated from backend folder structure
                // FolderSchema contains items (FolderItemSchema) with actual data
                sections: {
                  general: [],
                  materials: [],
                  assignments: [],
                  assessments: []
                },
                details: [
                  { label: 'Course ID', value: course_fetched.course_id },
                  { label: 'Instructor', value: course_fetched.instructor_name || 'TBA' },
                  { label: 'Duration', value: `${course_fetched.duration} weeks` },
                  { label: 'Skill Level', value: course_fetched.skill_level },
                  { label: 'Course Fee', value: `$${course_fetched.course_fees}` },
                  { label: 'Description', value: course_fetched.course_description || 'No description available', fullWidth: true }
                ],
                grades: {
                  items: [],
                  overall: null
                }
              }

              return (
                <CourseCard
                  key={course_fetched.course_id}
                  courseId={course_fetched.course_id}
                  name={course_fetched.course_name}
                  duration={`${course_fetched.duration} weeks`}
                  skillLevel={course_fetched.skill_level}
                  fee={`$${course_fetched.course_fees}`}
                  courseData={courseDetails}
                />
              )
            })
          ) : (
            <div className="no-courses-message">
              <p>No courses found. Try adjusting your filters or search.</p>
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyEnrollments