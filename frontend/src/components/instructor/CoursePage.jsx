import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const CoursePage = ({ courseData }) => {
  const [activeTab, setActiveTab] = useState('content')
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    materials: false,
    assignments: false,
    assessments: false,
    students: false
  })

  const [course, setCourse] = useState(courseData)
  const [addInputs, setAddInputs] = useState({ general: '', materials: '', assignments: '', assessments: '' })
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addPanelType, setAddPanelType] = useState('section')
  const [newAddName, setNewAddName] = useState('')

  // Track which section's add input is visible (separate from floating add panel)
  const [activeAddSection, setActiveAddSection] = useState(null)

  // Confirmation dialog state for deletions
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, itemName: '', onConfirm: null })

  // Student enrollment modal state
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentCourseData, setStudentCourseData] = useState(null)
  const [studentGrades, setStudentGrades] = useState({})
  const [loadingStudentData, setLoadingStudentData] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    setCourse(courseData)
  }, [courseData])

  if (!course) {
    return <div className="instructor-course-details"><p>Loading...</p></div>
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleAddInputChange = (section, value) => {
    setAddInputs((s) => ({ ...s, [section]: value }))
  }

  const handleAddItem = (section) => {
    const val = (addInputs[section] || '').trim()
    if (!val) return
    setCourse((c) => {
      const next = { ...c }
      if (!next.sections) next.sections = {}
      if (!next.sections[section]) next.sections[section] = []
      next.sections[section] = [...next.sections[section], { id: Date.now(), title: val, icon: '📄' }]
      return next
    })
    setAddInputs((s) => ({ ...s, [section]: '' }))
    setExpandedSections((s) => ({ ...s, [section]: true }))
  }

  const handleAddNewSection = (title) => {
    const name = (title || '').trim()
    if (!name) return
    const keyBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const key = `${keyBase}_${Date.now()}`
    setCourse((c) => {
      const next = { ...c }
      if (!next.sections) next.sections = {}
      next.sections[key] = []
      next.sectionTitles = { ...(next.sectionTitles || {}), [key]: name }
      return next
    })
    setExpandedSections((s) => ({ ...s, [key]: true }))
  }

  const handleAddNewGrade = (name) => {
    const title = (name || '').trim()
    if (!title) return
    setCourse((c) => {
      const next = { ...c }
      if (!next.grades) next.grades = { items: [], overall: null }
      next.grades = { ...next.grades, items: [...(next.grades.items || []), { id: Date.now(), name: title, score: '', maxScore: 100, status: '' }] }
      return next
    })
  }

  // Delete item from section
  const handleDeleteItem = (section, itemId, itemName) => {
    setConfirmDelete({
      visible: true,
      itemName,
      onConfirm: () => {
        setCourse((c) => {
          const next = { ...c }
          if (next.sections && next.sections[section]) {
            next.sections[section] = next.sections[section].filter(item => item.id !== itemId)
          }
          return next
        })
        setConfirmDelete({ visible: false, itemName: '', onConfirm: null })
      }
    })
  }

  // Delete section header
  const handleDeleteSection = (section, sectionTitle) => {
    setConfirmDelete({
      visible: true,
      itemName: `section "${sectionTitle}"`,
      onConfirm: () => {
        setCourse((c) => {
          const next = { ...c }
          if (next.sections) {
            delete next.sections[section]
          }
          if (next.sectionTitles) {
            delete next.sectionTitles[section]
          }
          setExpandedSections(s => {
            const updated = { ...s }
            delete updated[section]
            return updated
          })
          return next
        })
        setConfirmDelete({ visible: false, itemName: '', onConfirm: null })
      }
    })
  }

  const studentsEnrolled = course.studentsEnrolled || course.students || []

  // Open student enrollment modal and fetch/use data
  const openStudentModal = async (student) => {
    setSelectedStudent(student)
    setLoadingStudentData(true)
    try {
      // First check if student has embedded courseGrades (from studentsEnrolled data)
      if (student.courseGrades && student.courseGrades.items) {
        // Use embedded student course data
        const data = {
          ...student,
          sections: course.sections,
          grades: student.courseGrades,
          course: course.course
        }
        setStudentCourseData(data)
        // Initialize grades from student data
        const gradesMap = {}
        student.courseGrades.items.forEach((item) => {
          gradesMap[item.id] = { score: item.score || '', status: item.status || '' }
        })
        setStudentGrades(gradesMap)
      } else {
        // Fall back to API fetch if no embedded data
        const res = await fetch(`/api/students/${encodeURIComponent(student.id || student.studentId)}/courses/${encodeURIComponent(course.course.id)}`)
        if (res.ok) {
          const data = await res.json()
          setStudentCourseData(data)
          // Initialize grades from fetched data
          if (data.grades && data.grades.items) {
            const gradesMap = {}
            data.grades.items.forEach((item) => {
              gradesMap[item.id] = { score: item.score || '', status: item.status || '' }
            })
            setStudentGrades(gradesMap)
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch student course data:', err)
    } finally {
      setLoadingStudentData(false)
    }
  }

  // Close student modal and reset
  const closeStudentModal = () => {
    setSelectedStudent(null)
    setStudentCourseData(null)
    setStudentGrades({})
  }

  // Save student grades
  const saveStudentGrades = async () => {
    if (!selectedStudent || !studentCourseData) return
    try {
      const payload = {
        grades: Object.entries(studentGrades).map(([itemId, data]) => ({
          itemId,
          score: data.score,
          status: data.status
        }))
      }
      const res = await fetch(`/api/students/${encodeURIComponent(selectedStudent.id || selectedStudent.studentId)}/courses/${encodeURIComponent(course.course.id)}/grades`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert('Grades saved successfully')
      }
    } catch (err) {
      console.error('Failed to save grades:', err)
      alert('Failed to save grades')
    }
  }

  const handleGradeChange = (itemId, field, value) => {
    setStudentGrades((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }))
  }

  return (
    <div className="instructor-course-page">
      <Navbar />
      <div className="instructor-course-details">
        {/* Course Header */}
        <div className="instructor-course-header">
          <div className="instructor-course-header-content">
            <h1 className="instructor-course-details-title">{course.course.name}</h1>
            <p className="instructor-course-meta-info">{course.course.id}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="instructor-course-tabs-nav">
          <button className={`instructor-tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
          <button className={`instructor-tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
          <button className={`instructor-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students Enrolled</button>
        </div>

        {/* Tab Content */}
        <div className="instructor-course-tabs-content">
          {activeTab === 'content' && (
            <div className="tab-panel">
              {/* General Section */}
              <div className="instructor-content-section">
                <button className="instructor-section-header" onClick={() => toggleSection('general')} style={{ position: 'relative' }}>
                  <span className={`instructor-section-arrow ${expandedSections.general ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">General</span>
                  <button className="instructor-add-section-btn" onClick={(e) => { e.stopPropagation(); setActiveAddSection(activeAddSection === 'general' ? null : 'general'); setExpandedSections(s => ({...s, general: true})); }} style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>+</button>
                  <button className="instructor-delete-section-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSection('general', 'General'); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>−</button>
                </button>
                {expandedSections.general && (
                  <div>
                    {activeAddSection === 'general' && (
                      <div className="instructor-add-input">
                        <input value={addInputs.general} onChange={(e) => handleAddInputChange('general', e.target.value)} placeholder="Add general item" />
                        <button onClick={() => handleAddItem('general')}>Add</button>
                      </div>
                    )}
                    <div className="section-content">
                      {course.sections?.general?.map((item) => (
                        <div key={item.id} className="instructor-item" style={{ position: 'relative', paddingLeft: '3.5rem', cursor: 'pointer' }} onClick={() => navigate(`/instructor/content/general/${item.id}`)}>
                          <button className="instructor-delete-item-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem('general', item.id, item.title); }} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>−</button>
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-title">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Materials Section */}
              <div className="instructor-content-section">
                <button className="instructor-section-header" onClick={() => toggleSection('materials')} style={{ position: 'relative' }}>
                  <span className={`instructor-section-arrow ${expandedSections.materials ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Materials</span>
                  <button className="instructor-add-section-btn" onClick={(e) => { e.stopPropagation(); setActiveAddSection(activeAddSection === 'materials' ? null : 'materials'); setExpandedSections(s => ({...s, materials: true})); }} style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>+</button>
                  <button className="instructor-delete-section-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSection('materials', 'Materials'); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>−</button>
                </button>
                {expandedSections.materials && (
                  <div>
                    {activeAddSection === 'materials' && (
                      <div className="instructor-add-input">
                        <input value={addInputs.materials} onChange={(e) => handleAddInputChange('materials', e.target.value)} placeholder="Add material" />
                        <button onClick={() => handleAddItem('materials')}>Add</button>
                      </div>
                    )}
                    <div className="section-content">
                      {course.sections?.materials?.map((item) => (
                        <div key={item.id} className="instructor-item" style={{ position: 'relative', paddingLeft: '3.5rem', cursor: 'pointer' }} onClick={() => navigate(`/instructor/content/materials/${item.id}`)}>
                          <button className="instructor-delete-item-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem('materials', item.id, item.title); }} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>−</button>
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-title">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignments Section */}
              <div className="instructor-content-section">
                <button className="instructor-section-header" onClick={() => toggleSection('assignments')} style={{ position: 'relative' }}>
                  <span className={`instructor-section-arrow ${expandedSections.assignments ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Assignments</span>
                  <button className="instructor-add-section-btn" onClick={(e) => { e.stopPropagation(); setActiveAddSection(activeAddSection === 'assignments' ? null : 'assignments'); setExpandedSections(s => ({...s, assignments: true})); }} style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>+</button>
                  <button className="instructor-delete-section-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSection('assignments', 'Assignments'); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>−</button>
                </button>
                {expandedSections.assignments && (
                  <div>
                    {activeAddSection === 'assignments' && (
                      <div className="instructor-add-input">
                        <input value={addInputs.assignments} onChange={(e) => handleAddInputChange('assignments', e.target.value)} placeholder="Add assignment" />
                        <button onClick={() => handleAddItem('assignments')}>Add</button>
                      </div>
                    )}
                    <div className="section-content">
                      {course.sections?.assignments?.map((item) => (
                        <div key={item.id} className="instructor-item" style={{ position: 'relative', paddingLeft: '3.5rem', cursor: 'pointer' }} onClick={() => navigate(`/instructor/content/assignments/${item.id}`)}>
                          <button className="instructor-delete-item-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem('assignments', item.id, item.title); }} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>−</button>
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-title">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assessments Section */}
              <div className="instructor-content-section">
                <button className="instructor-section-header" onClick={() => toggleSection('assessments')} style={{ position: 'relative' }}>
                  <span className={`instructor-section-arrow ${expandedSections.assessments ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Assessments</span>
                  <button className="instructor-add-section-btn" onClick={(e) => { e.stopPropagation(); setActiveAddSection(activeAddSection === 'assessments' ? null : 'assessments'); setExpandedSections(s => ({...s, assessments: true})); }} style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>+</button>
                  <button className="instructor-delete-section-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSection('assessments', 'Assessments'); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>−</button>
                </button>
                {expandedSections.assessments && (
                  <div>
                    {activeAddSection === 'assessments' && (
                      <div className="instructor-add-input">
                        <input value={addInputs.assessments} onChange={(e) => handleAddInputChange('assessments', e.target.value)} placeholder="Add assessment" />
                        <button onClick={() => handleAddItem('assessments')}>Add</button>
                      </div>
                    )}
                    <div className="section-content">
                      {course.sections?.assessments?.map((item) => (
                        <div key={item.id} className="instructor-item" style={{ position: 'relative', paddingLeft: '3.5rem', cursor: 'pointer' }} onClick={() => navigate(`/instructor/content/assessments/${item.id}`)}>
                          <button className="instructor-delete-item-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem('assessments', item.id, item.title); }} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>−</button>
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-title">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Render any custom dynamic sections */}
              {(course.sections ? Object.keys(course.sections) : []).filter(k => !['general','materials','assignments','assessments'].includes(k)).map((key) => (
                <div className="instructor-content-section" key={key}>
                  <button className="instructor-section-header" onClick={() => toggleSection(key)} style={{ position: 'relative' }}>
                    <span className={`instructor-section-arrow ${expandedSections[key] ? 'open' : ''}`}>▼</span>
                    <span className="instructor-section-title">{(course.sectionTitles && course.sectionTitles[key]) || key}</span>
                    <button className="instructor-add-section-btn" onClick={(e) => { e.stopPropagation(); setActiveAddSection(activeAddSection === key ? null : key); setExpandedSections(s => ({...s, [key]: true})); }} style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', background: '#27ae60', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>+</button>
                    <button className="instructor-delete-section-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSection(key, (course.sectionTitles && course.sectionTitles[key]) || key); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>−</button>
                  </button>
                  {expandedSections[key] && (
                    <div>
                      {activeAddSection === key && (
                        <div className="instructor-add-input">
                          <input value={addInputs[key] || ''} onChange={(e) => handleAddInputChange(key, e.target.value)} placeholder={`Add item to ${(course.sectionTitles && course.sectionTitles[key]) || key}`} />
                          <button onClick={() => handleAddItem(key)}>Add</button>
                        </div>
                      )}
                      <div className="section-content">
                        {(course.sections[key] || []).map((item) => (
                          <div key={item.id} className="instructor-item" style={{ position: 'relative', paddingLeft: '3.5rem', cursor: 'pointer' }} onClick={() => navigate(`/instructor/content/${key}/${item.id}`)}>
                            <button className="instructor-delete-item-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem(key, item.id, item.title); }} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>−</button>
                            <span className="item-icon">{item.icon}</span>
                            <span className="item-title">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-panel">
              <div className="details-content">
                {course.details && course.details.map((field, idx) => (
                  <div key={idx} className="detail-field" style={field.fullWidth ? { gridColumn: '1 / -1' } : {}}>
                    <label>{field.label}</label>
                    <p>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="tab-panel">
              <div className="instructor-students-list">
                {studentsEnrolled.length === 0 ? (
                  <div className="no-courses-message-instructor"><p>No students enrolled.</p></div>
                ) : (
                  studentsEnrolled.map((s) => (
                    <div key={s.id || s.studentId || s.email} className="instructor-student-item">
                      <div 
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => openStudentModal(s)}
                        className="instructor-student-name-link"
                      >
                        {s.name || s.fullName || s.email}
                      </div>
                      <div>
                        <button className="instructor-student-link" onClick={() => openStudentModal(s)}>View Grades</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Enrollment Modal Overlay */}
      {selectedStudent && (
        <div className="instructor-modal-overlay" onClick={closeStudentModal}>
          <div className="instructor-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="instructor-modal-header">
              <h2>{selectedStudent.name || selectedStudent.fullName || selectedStudent.email} - {course.course.name}</h2>
              <button className="instructor-modal-close" onClick={closeStudentModal}>✕</button>
            </div>
            
            <div className="instructor-modal-body">
              {loadingStudentData ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading student data...</div>
              ) : studentCourseData ? (
                <>
                  {/* Course Content Sections */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#ff8c42', marginBottom: '1rem' }}>Course Content</h3>
                    {studentCourseData.sections && Object.entries(studentCourseData.sections).map(([sectionKey, items]) => (
                      <div key={sectionKey} style={{ marginBottom: '1rem' }}>
                        <h4 style={{ textTransform: 'capitalize', color: '#222' }}>{sectionKey}</h4>
                        <div>
                          {items && items.map((item) => (
                            <div key={item.id} style={{ padding: '0.5rem 0', color: '#666' }}>
                              <span>{item.icon} {item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Editable Grades */}
                  <div>
                    <h3 style={{ color: '#ff8c42', marginBottom: '1rem' }}>Grades</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #fde7db' }}>
                          <th style={{ textAlign: 'left', padding: '0.75rem', color: '#374151' }}>Assignment/Assessment</th>
                          <th style={{ textAlign: 'left', padding: '0.75rem', color: '#374151' }}>Score</th>
                          <th style={{ textAlign: 'left', padding: '0.75rem', color: '#374151' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentCourseData.grades?.items?.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #fde7db' }}>
                            <td style={{ padding: '0.75rem', color: '#222' }}>{item.name}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <input
                                type="number"
                                value={studentGrades[item.id]?.score ?? ''}
                                onChange={(e) => handleGradeChange(item.id, 'score', e.target.value)}
                                style={{
                                  width: '80px',
                                  padding: '0.5rem',
                                  border: '1px solid #f1a66a',
                                  borderRadius: '4px'
                                }}
                                placeholder={item.score ?? '-'}
                              />
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <input
                                type="text"
                                value={studentGrades[item.id]?.status ?? ''}
                                onChange={(e) => handleGradeChange(item.id, 'status', e.target.value)}
                                style={{
                                  width: '120px',
                                  padding: '0.5rem',
                                  border: '1px solid #f1a66a',
                                  borderRadius: '4px'
                                }}
                                placeholder={item.status ?? '-'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={saveStudentGrades}
                        style={{
                          background: '#ff8c42',
                          color: 'white',
                          border: 'none',
                          padding: '0.7rem 1.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        Save Grades
                      </button>
                      <button
                        onClick={closeStudentModal}
                        style={{
                          background: '#fff',
                          border: '1px solid #f1a66a',
                          color: '#ff8c42',
                          padding: '0.7rem 1.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Could not load student data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation delete modal */}
      {confirmDelete.visible && (
        <div className="instructor-modal-overlay" onClick={() => setConfirmDelete({ visible: false, itemName: '', onConfirm: null })} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div className="instructor-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px', background: '#fff', borderRadius: 10, padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', color: '#222', marginBottom: '0.5rem' }}>Confirm deletion of <strong>{confirmDelete.itemName}</strong></p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete({ visible: false, itemName: '', onConfirm: null })} style={{ padding: '0.6rem 1.2rem', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>No</button>
              <button onClick={() => confirmDelete.onConfirm && confirmDelete.onConfirm()} style={{ padding: '0.6rem 1.2rem', background: '#ff4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating add control - only show in Content tab */}
      {activeTab === 'content' && (
        <div className="instructor-floating-add">
          <button className="instructor-floating-btn" onClick={() => setShowAddPanel((s) => !s)}>＋</button>
          {showAddPanel && (
            <div className="instructor-add-panel">
              <div className="panel-row" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#222' }}>Adding new Section</div>
              <input value={newAddName} onChange={(e) => setNewAddName(e.target.value)} placeholder={`Section title (e.g., Extra Materials)`} />
              <div className="panel-actions">
                <button onClick={() => {
                  handleAddNewSection(newAddName)
                  setNewAddName('')
                  setShowAddPanel(false)
                }}>Add</button>
                <button onClick={() => setShowAddPanel(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CoursePage

