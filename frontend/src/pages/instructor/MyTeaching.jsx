import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseCard from '../../components/instructor/CourseCard'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

const getItemIcon = (itemType) => {
  switch (itemType) {
    case 'video':
      return '🎥'
    case 'notes':
      return '📄'
    case 'assignment':
      return '📝'
    case 'textbook':
      return '📚'
    default:
      return '📌'
  }
}

const MyTeaching = () => {
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // All hooks must be called in the same order on every render
  // Fetch instructor's courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          console.warn('No access token found - user may not be logged in')
          setError('Not authenticated. Please log in first.')
          setEnrolledCourses([])
          setLoading(false)
          return
        }

        const response = await fetch('http://localhost:8000/instructor/courses', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `Failed to fetch courses: ${response.status}`)
        }

        const data = await response.json()
        
        // Transform backend data to frontend format
        const transformedCourses = data.map(course => {
          const sections = { general: [], materials: [], assignments: [], assessments: [] }
          
          // Determine section type based on folder title (case-insensitive)
          const getSectionType = (folderTitle) => {
            const title = (folderTitle || '').toLowerCase()
            if (title.includes('general')) return 'general'
            if (title.includes('material')) return 'materials'
            if (title.includes('assignment')) return 'assignments'
            if (title.includes('assessment')) return 'assessments'
            return 'materials' // default to materials
          }
          
          // Transform folders into sections
          if (course.folders && Array.isArray(course.folders)) {
            course.folders.forEach(folder => {
              const sectionType = getSectionType(folder.title)
              
              if (folder.items && Array.isArray(folder.items)) {
                folder.items.forEach(item => {
                  const displayItem = {
                    id: item.item_id,
                    title: `${item.item_type} #${item.item_id}`,
                    icon: getItemIcon(item.item_type),
                    item_type: item.item_type,
                    video_id: item.video_id,
                    notes_id: item.notes_id,
                    assignment_id: item.assignment_id
                  }
                  
                  sections[sectionType].push(displayItem)
                })
              }
            })
          }

          return {
            id: course.course_id,
            name: course.course_name,
            duration: course.duration || '8 weeks',
            skillLevel: course.skill_level || 'Intermediate',
            fee: course.course_fees || 0,
            status: 'active',
            studentsEnrolled: course.students_enrolled ? course.students_enrolled.map(s => ({
              id: s.id,
              name: s.first_name + ' ' + s.last_name,
              email: s.email
            })) : [],
            courseDetails: {
              sections: sections,
              grades: {
                items: []
              },
              details: []
            }
          }
        })

        setEnrolledCourses(transformedCourses)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError(err.message || 'An error occurred while loading courses')
        setLoading(false)
        // Fallback to empty array
        setEnrolledCourses([])
      }
    }

    fetchCourses()
  }, [])

  // Fallback to empty array if no courses fetched
  const coursesData = enrolledCourses || []

  // Filter and search logic - MUST be called before conditional returns (hooks rule)
  const filteredCourses = useMemo(() => {
    let filtered = coursesData

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((course) => course.status === filterStatus)
    }

    // Search by name or ID
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [coursesData, filterStatus, searchQuery, sortBy])

  // Conditional rendering AFTER all hooks are called
  if (loading) {
    return (
      <div className='instructor-teaching'>
        <Navbar />
        <div className="instructor-teaching-header">
          <h1 className="instructor-teaching-title">My courses</h1>
          <p className="instructor-teaching-subtitle">Course overview</p>
        </div>
        <div className="instructor-teaching-container">
          <div className="no-courses-message-instructor">
            <p>Loading your courses...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    const isAuthError = error.includes('Not authenticated') || error.includes('Unauthorized')
    
    return (
      <div className='instructor-teaching'>
        <Navbar />
        <div className="instructor-teaching-header">
          <h1 className="instructor-teaching-title">My courses</h1>
          <p className="instructor-teaching-subtitle">Course overview</p>
        </div>
        <div className="instructor-teaching-container">
          <div className="no-courses-message-instructor" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <p style={{ color: '#721c24', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>{error}</p>
            {isAuthError && (
              <button 
                onClick={() => navigate('/login')} 
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#721c24',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className='instructor-teaching'>
      <Navbar />
      <div className="instructor-teaching-header">
        <h1 className="instructor-teaching-title">My courses</h1>
        <p className="instructor-teaching-subtitle">Course overview</p>
      </div>

      <div className="instructor-teaching-container">
        {/* Filters and Controls */}
        <div className="instructor-controls">
          <div className="instructor-control-group">
            <select
              className="instructor-control-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="instructor-control-group instructor-search-group">
            <input
              type="text"
              className="instructor-control-search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="instructor-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                courseId={course.id}
                name={course.name}
                duration={course.duration}
                skillLevel={course.skillLevel}
                fee={course.fee}
                // pass full shaped courseData for CoursePage (include students and course metadata)
                courseData={{
                  course: {
                    id: course.id,
                    name: course.name
                  },
                  ...course.courseDetails,
                  studentsEnrolled: (course.studentsEnrolled || []).map(s => ({ ...s, courseGrades: (course.courseDetails && course.courseDetails.grades) || { items: [] } }))
                }}
              />
            ))
          ) : (
            <div className="no-courses-message-instructor">
              <p>No courses found. Try adjusting your filters or search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyTeaching
