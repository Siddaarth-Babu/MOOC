import React, { useState, useMemo } from 'react'
import CourseCard from '../../components/instructor/CourseCard'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'

const MyTeaching = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // Complete example data for all courses - includes all data for CoursePage
  const [enrolledCourses] = useState([
    {
      id: 'CS301',
      name: 'Computer Networks',
      duration: '16 weeks',
      skillLevel: 'Intermediate',
      fee: '$500',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS301',
          name: 'Computer Networks',
          semester: 'Spring Semester (2025-26)',
          credits: 4,
          instructor: 'Dr. John Smith',
          duration: '16 weeks',
          skillLevel: 'Intermediate',
          fee: '$500',
          description: 'A comprehensive course on computer networks, covering OSI model, TCP/IP, routing, and network security.'
        },
        sections: {
          general: [{ id: 1, title: 'Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'Videos', icon: '🎥' },
            { id: 2, title: 'Notes', icon: '📝' },
            { id: 3, title: 'Textbooks', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'Assignment 1 -- Traffic Tracing', icon: '✏️' },
            { id: 2, title: 'Assignment 2 - UDP Sockets', icon: '✏️' },
            { id: 3, title: 'Assignment 3 - TCP Protocol', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: OSI Model', icon: '📊' },
            { id: 2, title: 'Quiz 2: TCP/IP', icon: '📊' },
            { id: 3, title: 'Final Exam', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS301' },
          { label: 'Instructor', value: 'Dr. John Smith' },
          { label: 'Duration', value: '16 weeks' },
          { label: 'Skill Level', value: 'Intermediate' },
          { label: 'Course Fee', value: '$500' },
          { label: 'Credits', value: '4' },
          { label: 'Description', value: 'A comprehensive course on computer networks, covering OSI model, TCP/IP, routing, and network security.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'Assignment 1 -- Traffic Tracing', score: 85, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Assignment 2 - UDP Sockets', score: null, maxScore: 100, status: 'Overdue' },
            { id: 3, name: 'Assignment 3 - TCP Protocol', score: null, maxScore: 100, status: 'Not Started' },
            { id: 4, name: 'Quiz 1: OSI Model', score: 92, maxScore: 100, status: 'Completed' },
            { id: 5, name: 'Quiz 2: TCP/IP', score: null, maxScore: 100, status: 'Pending' },
            { id: 6, name: 'Final Exam', score: null, maxScore: 200, status: 'Not Started' }
          ],
          overall: 88.5
        }
      }
    },
    {
      id: 'CS39002',
      name: 'Operating Systems Laboratory',
      duration: '14 weeks',
      skillLevel: 'Advanced',
      fee: '$600',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS39002',
          name: 'Operating Systems Laboratory',
          semester: 'Spring Semester (2025-26)',
          credits: 3,
          instructor: 'Dr. Sarah Johnson',
          duration: '14 weeks',
          skillLevel: 'Advanced',
          fee: '$600',
          description: 'Hands-on lab course covering OS concepts, process management, memory management, and file systems.'
        },
        sections: {
          general: [{ id: 1, title: 'Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'Videos', icon: '🎥' },
            { id: 2, title: 'Notes', icon: '📝' },
            { id: 3, title: 'Lab Manuals', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'Lab 1: Process Management', icon: '✏️' },
            { id: 2, title: 'Lab 2: Memory Management', icon: '✏️' },
            { id: 3, title: 'Lab 3: File Systems', icon: '✏️' },
            { id: 4, title: 'Lab 4: Synchronization', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: Process Concepts', icon: '📊' },
            { id: 2, title: 'Midterm Exam', icon: '📊' },
            { id: 3, title: 'Final Exam', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS39002' },
          { label: 'Instructor', value: 'Dr. Sarah Johnson' },
          { label: 'Duration', value: '14 weeks' },
          { label: 'Skill Level', value: 'Advanced' },
          { label: 'Course Fee', value: '$600' },
          { label: 'Credits', value: '3' },
          { label: 'Description', value: 'Hands-on lab course covering OS concepts, process management, memory management, and file systems.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'Lab 1: Process Management', score: 90, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Lab 2: Memory Management', score: 88, maxScore: 100, status: 'Submitted' },
            { id: 3, name: 'Lab 3: File Systems', score: null, maxScore: 100, status: 'In Progress' },
            { id: 4, name: 'Lab 4: Synchronization', score: null, maxScore: 100, status: 'Not Started' },
            { id: 5, name: 'Quiz 1: Process Concepts', score: 87, maxScore: 100, status: 'Completed' },
            { id: 6, name: 'Midterm Exam', score: null, maxScore: 150, status: 'Not Started' }
          ],
          overall: 88
        }
      }
    },
    {
      id: 'CS401',
      name: 'DBMS Theory and Lab',
      duration: '16 weeks',
      skillLevel: 'Intermediate',
      fee: '$550',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS401',
          name: 'DBMS Theory and Lab',
          semester: 'Spring Semester (2025-26)',
          credits: 4,
          instructor: 'Dr. Rajesh Kumar',
          duration: '16 weeks',
          skillLevel: 'Intermediate',
          fee: '$550',
          description: 'Database management systems course covering relational models, SQL, indexing, transactions, and normalization.'
        },
        sections: {
          general: [{ id: 1, title: 'Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'Videos', icon: '🎥' },
            { id: 2, title: 'SQL Notes', icon: '📝' },
            { id: 3, title: 'Database Textbooks', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'SQL Queries Assignment', icon: '✏️' },
            { id: 2, title: 'Database Design Project', icon: '✏️' },
            { id: 3, title: 'Normalization Exercise', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: Relational Model', icon: '📊' },
            { id: 2, title: 'Quiz 2: SQL', icon: '📊' },
            { id: 3, title: 'Final Exam', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS401' },
          { label: 'Instructor', value: 'Dr. Rajesh Kumar' },
          { label: 'Duration', value: '16 weeks' },
          { label: 'Skill Level', value: 'Intermediate' },
          { label: 'Course Fee', value: '$550' },
          { label: 'Credits', value: '4' },
          { label: 'Description', value: 'Database management systems course covering relational models, SQL, indexing, transactions, and normalization.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'SQL Queries Assignment', score: 92, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Database Design Project', score: null, maxScore: 150, status: 'In Progress' },
            { id: 3, name: 'Normalization Exercise', score: null, maxScore: 100, status: 'Not Started' },
            { id: 4, name: 'Quiz 1: Relational Model', score: 85, maxScore: 100, status: 'Completed' },
            { id: 5, name: 'Quiz 2: SQL', score: null, maxScore: 100, status: 'Pending' },
            { id: 6, name: 'Final Exam', score: null, maxScore: 200, status: 'Not Started' }
          ],
          overall: 85.67
        }
      }
    },
    {
      id: 'CS201',
      name: 'Machine Learning',
      duration: '12 weeks',
      skillLevel: 'Intermediate',
      fee: '$700',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS201',
          name: 'Machine Learning',
          semester: 'Spring Semester (2025-26)',
          credits: 3,
          instructor: 'Dr. Priya Patel',
          duration: '12 weeks',
          skillLevel: 'Intermediate',
          fee: '$700',
          description: 'Introduction to machine learning covering supervised learning, unsupervised learning, and neural networks.'
        },
        sections: {
          general: [{ id: 1, title: 'Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'Lecture Videos', icon: '🎥' },
            { id: 2, title: 'ML Notes', icon: '📝' },
            { id: 3, title: 'Research Papers', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'Supervised Learning Project', icon: '✏️' },
            { id: 2, title: 'Clustering Assignment', icon: '✏️' },
            { id: 3, title: 'Neural Network Implementation', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: Fundamentals', icon: '📊' },
            { id: 2, title: 'Midterm Exam', icon: '📊' },
            { id: 3, title: 'Final Project', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS201' },
          { label: 'Instructor', value: 'Dr. Priya Patel' },
          { label: 'Duration', value: '12 weeks' },
          { label: 'Skill Level', value: 'Intermediate' },
          { label: 'Course Fee', value: '$700' },
          { label: 'Credits', value: '3' },
          { label: 'Description', value: 'Introduction to machine learning covering supervised learning, unsupervised learning, and neural networks.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'Supervised Learning Project', score: 88, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Clustering Assignment', score: null, maxScore: 100, status: 'In Progress' },
            { id: 3, name: 'Neural Network Implementation', score: null, maxScore: 150, status: 'Not Started' },
            { id: 4, name: 'Quiz 1: Fundamentals', score: 90, maxScore: 100, status: 'Completed' },
            { id: 5, name: 'Midterm Exam', score: null, maxScore: 150, status: 'Pending' },
            { id: 6, name: 'Final Project', score: null, maxScore: 200, status: 'Not Started' }
          ],
          overall: 89
        }
      }
    },
    {
      id: 'CS302',
      name: 'Software Engineering Laboratory',
      duration: '14 weeks',
      skillLevel: 'Intermediate',
      fee: '$550',
      semester: 'Spring Semester (2024-25)',
      status: 'completed',
      courseDetails: {
        course: {
          id: 'CS302',
          name: 'Software Engineering Laboratory',
          semester: 'Spring Semester (2024-25)',
          credits: 3,
          instructor: 'Dr. Michael Brown',
          duration: '14 weeks',
          skillLevel: 'Intermediate',
          fee: '$550',
          description: 'Software engineering lab course covering SDLC, design patterns, version control, and testing methodologies.'
        },
        sections: {
          general: [{ id: 1, title: 'Course Summary', icon: '📢' }],
          materials: [
            { id: 1, title: 'Recorded Lectures', icon: '🎥' },
            { id: 2, title: 'Design Patterns', icon: '📝' },
            { id: 3, title: 'SE Textbooks', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'Design Pattern Study', icon: '✏️' },
            { id: 2, title: 'Software Project', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz', icon: '📊' },
            { id: 2, title: 'Final Exam', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS302' },
          { label: 'Instructor', value: 'Dr. Michael Brown' },
          { label: 'Duration', value: '14 weeks' },
          { label: 'Skill Level', value: 'Intermediate' },
          { label: 'Course Fee', value: '$550' },
          { label: 'Credits', value: '3' },
          { label: 'Description', value: 'Software engineering lab course covering SDLC, design patterns, version control, and testing methodologies.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'Design Pattern Study', score: 92, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Software Project', score: 95, maxScore: 150, status: 'Submitted' },
            { id: 3, name: 'Quiz', score: 88, maxScore: 100, status: 'Completed' },
            { id: 4, name: 'Final Exam', score: 90, maxScore: 200, status: 'Completed' }
          ],
          overall: 91
        }
      }
    },
    {
      id: 'CS501',
      name: 'Systems Programming Laboratory',
      duration: '12 weeks',
      skillLevel: 'Advanced',
      fee: '$650',
      semester: 'Spring Semester (2024-25)',
      status: 'completed',
      courseDetails: {
        course: {
          id: 'CS501',
          name: 'Systems Programming Laboratory',
          semester: 'Spring Semester (2024-25)',
          credits: 4,
          instructor: 'Dr. David Lee',
          duration: '12 weeks',
          skillLevel: 'Advanced',
          fee: '$650',
          description: 'Advanced systems programming covering low-level programming, system calls, concurrency, and performance optimization.'
        },
        sections: {
          general: [{ id: 1, title: 'Course Completion Info', icon: '📢' }],
          materials: [
            { id: 1, title: 'System Programming Videos', icon: '🎥' },
            { id: 2, title: 'C Programming Notes', icon: '📝' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1', icon: '📊' },
            { id: 2, title: 'Midterm', icon: '📊' },
            { id: 3, title: 'Final Exam', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS102' },
          { label: 'Instructor', value: 'Dr. Emily White' },
          { label: 'Duration', value: '16 weeks' },
          { label: 'Skill Level', value: 'Beginner' },
          { label: 'Course Fee', value: '$400' },
          { label: 'Credits', value: '4' },
          { label: 'Description', value: 'Fundamentals of data structures and algorithms covering arrays, lists, trees, sorting, and searching.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'Array Operations', score: 89, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'Tree Implementation', score: 87, maxScore: 100, status: 'Submitted' },
            { id: 3, name: 'Sorting Algorithms', score: 90, maxScore: 100, status: 'Submitted' },
            { id: 4, name: 'Quiz 1', score: 85, maxScore: 100, status: 'Completed' },
            { id: 5, name: 'Midterm', score: 88, maxScore: 150, status: 'Completed' },
            { id: 6, name: 'Final Exam', score: 91, maxScore: 200, status: 'Completed' }
          ],
          overall: 88.5
        }
      }
    },
    {
      id: 'CS202',
      name: 'Web Development Fundamentals',
      duration: '10 weeks',
      skillLevel: 'Beginner',
      fee: '$350',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS202',
          name: 'Web Development Fundamentals',
          semester: 'Spring Semester (2025-26)',
          credits: 3,
          instructor: 'Dr. Lisa Anderson',
          duration: '10 weeks',
          skillLevel: 'Beginner',
          fee: '$350',
          description: 'Introduction to web development covering HTML, CSS, JavaScript, and basic web frameworks.'
        },
        sections: {
          general: [{ id: 1, title: 'Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'Web Dev Videos', icon: '🎥' },
            { id: 2, title: 'HTML/CSS/JS Notes', icon: '📝' },
            { id: 3, title: 'Web Development Guides', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'HTML Structure Assignment', icon: '✏️' },
            { id: 2, title: 'CSS Styling Project', icon: '✏️' },
            { id: 3, title: 'JavaScript Interactivity', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: HTML/CSS', icon: '📊' },
            { id: 2, title: 'Quiz 2: JavaScript', icon: '📊' },
            { id: 3, title: 'Final Project', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS202' },
          { label: 'Instructor', value: 'Dr. Lisa Anderson' },
          { label: 'Duration', value: '10 weeks' },
          { label: 'Skill Level', value: 'Beginner' },
          { label: 'Course Fee', value: '$350' },
          { label: 'Credits', value: '3' },
          { label: 'Description', value: 'Introduction to web development covering HTML, CSS, JavaScript, and basic web frameworks.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 1, name: 'HTML Structure Assignment', score: 91, maxScore: 100, status: 'Submitted' },
            { id: 2, name: 'CSS Styling Project', score: 89, maxScore: 100, status: 'Submitted' },
            { id: 3, name: 'JavaScript Interactivity', score: null, maxScore: 100, status: 'In Progress' },
            { id: 4, name: 'Quiz 1: HTML/CSS', score: 88, maxScore: 100, status: 'Completed' },
            { id: 5, name: 'Quiz 2: JavaScript', score: null, maxScore: 100, status: 'Pending' },
            { id: 6, name: 'Final Project', score: null, maxScore: 150, status: 'Not Started' }
          ],
          overall: 89.33
        }
      }
    },
    {
      id: 'CS105',
      name: 'Distributed Hash Tables',
      duration: '14 weeks',
      skillLevel: 'Advanced',
      fee: '$650',
      semester: 'Spring Semester (2025-26)',
      status: 'active',
      courseDetails: {
        course: {
          id: 'CS105',
          name: 'Distributed Hash Tables',
          semester: 'Spring Semester (2025-26)',
          credits: 4,
          instructor: 'Dr. Vikram Singh',
          duration: '14 weeks',
          skillLevel: 'Advanced',
          fee: '$650',
          description: 'Advanced course on distributed hash tables, peer-to-peer networks, consistency models, and scalability patterns.'
        },
        sections: {
          general: [{ id: 1, title: 'Course Announcements', icon: '📢' }],
          materials: [
            { id: 1, title: 'DHT Architecture Videos', icon: '🎥' },
            { id: 2, title: 'Distributed Systems Notes', icon: '📝' },
            { id: 3, title: 'P2P Technology Papers', icon: '📚' }
          ],
          assignments: [
            { id: 1, title: 'DHT Implementation Project', icon: '✏️' },
            { id: 2, title: 'Consistency Protocol Design', icon: '✏️' },
            { id: 3, title: 'Performance Analysis Report', icon: '✏️' }
          ],
          assessments: [
            { id: 1, title: 'Quiz 1: P2P Concepts', icon: '📊' },
            { id: 2, title: 'Midterm Exam', icon: '📊' },
            { id: 3, title: 'Final Project Presentation', icon: '🎓' }
          ]
        },
        details: [
          { label: 'Course ID', value: 'CS105' },
          { label: 'Instructor', value: 'Dr. Vikram Singh' },
          { label: 'Duration', value: '14 weeks' },
          { label: 'Skill Level', value: 'Advanced' },
          { label: 'Course Fee', value: '$650' },
          { label: 'Credits', value: '4' },
          { label: 'Description', value: 'Advanced course on distributed hash tables, peer-to-peer networks, consistency models, and scalability patterns.', fullWidth: true }
        ],
        grades: {
          items: [
            { id: 101, name: 'DHT Implementation Project', score: 0, maxScore: 150, status: 'Not Graded' },
            { id: 102, name: 'Consistency Protocol Design', score: 0, maxScore: 100, status: 'Not Graded' },
            { id: 103, name: 'Performance Analysis Report', score: 0, maxScore: 100, status: 'Not Graded' },
            { id: 104, name: 'Quiz 1: P2P Concepts', score: 0, maxScore: 100, status: 'Not Graded' },
            { id: 105, name: 'Midterm Exam', score: 0, maxScore: 150, status: 'Not Graded' },
            { id: 106, name: 'Final Project Presentation', score: 0, maxScore: 200, status: 'Not Graded' }
          ],
          overall: 0
        }
      },
      studentsEnrolled: [
        {
          id: 'STU001',
          studentId: 'STU001',
          name: 'Aisha Patel',
          email: 'aisha.patel@university.edu',
          enrollmentDate: '2025-01-15',
          progress: 65,
          courseGrades: {
            items: [
              { id: 101, name: 'DHT Implementation Project', score: 135, maxScore: 150, status: 'Submitted' },
              { id: 102, name: 'Consistency Protocol Design', score: 92, maxScore: 100, status: 'Submitted' },
              { id: 103, name: 'Performance Analysis Report', score: 88, maxScore: 100, status: 'In Progress' },
              { id: 104, name: 'Quiz 1: P2P Concepts', score: 87, maxScore: 100, status: 'Completed' },
              { id: 105, name: 'Midterm Exam', score: 128, maxScore: 150, status: 'Completed' },
              { id: 106, name: 'Final Project Presentation', score: null, maxScore: 200, status: 'Not Started' }
            ],
            overall: 106.33
          }
        },
        {
          id: 'STU002',
          studentId: 'STU002',
          name: 'Marcus Chen',
          email: 'marcus.chen@university.edu',
          enrollmentDate: '2025-01-15',
          progress: 58,
          courseGrades: {
            items: [
              { id: 101, name: 'DHT Implementation Project', score: 142, maxScore: 150, status: 'Submitted' },
              { id: 102, name: 'Consistency Protocol Design', score: 95, maxScore: 100, status: 'Submitted' },
              { id: 103, name: 'Performance Analysis Report', score: null, maxScore: 100, status: 'Pending' },
              { id: 104, name: 'Quiz 1: P2P Concepts', score: 91, maxScore: 100, status: 'Completed' },
              { id: 105, name: 'Midterm Exam', score: 135, maxScore: 150, status: 'Completed' },
              { id: 106, name: 'Final Project Presentation', score: null, maxScore: 200, status: 'Not Started' }
            ],
            overall: 112.67
          }
        }
      ]
    }
  ])

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    let filtered = enrolledCourses

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((course) => course.status === filterStatus)
    }

    // Search by name or ID
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
    //  else if (sortBy === 'semester') {
    //   filtered.sort((a, b) => b.semester.localeCompare(a.semester))
    // }

    return filtered
  }, [enrolledCourses, filterStatus, searchQuery, sortBy])

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

          {/* <div className="instructor-control-group">
            <select
              className="instructor-control-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by course name</option>
              <option value="semester">Sort by semester</option>
            </select>
          </div> */}
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
                // pass full shaped courseData for CoursePage (include students)
                courseData={{
                  ...(course.courseDetails || {}),
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