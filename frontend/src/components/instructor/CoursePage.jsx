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

  const handleGradeChange = (itemId, field, value) => {
    setCourse((c) => {
      const next = { ...c }
      if (next.grades && next.grades.items) {
        next.grades = { ...next.grades, items: next.grades.items.map((it) => it.id === itemId ? { ...it, [field]: value } : it) }
      }
      return next
    })
  }

  // Add a new dynamic section (header) under content
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

  // Add a new grade item under grades
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

  const studentsEnrolled = course.studentsEnrolled || course.students || []

  const goToStudentProfile = (student) => {
    // navigate to student profile and pass student id in state
    navigate('/student/profile', { state: { studentId: student.id || student.studentId || student.email } })
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
          <button className={`instructor-tab-btn ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Grades</button>
          <button className={`instructor-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students Enrolled</button>
        </div>

        {/* Tab Content */}
        <div className="instructor-course-tabs-content">
          {activeTab === 'content' && (
            <div className="tab-panel">
              {/* General Section */}
              <div className="instructor-content-section">
                <button className="instructor-section-header" onClick={() => toggleSection('general')}>
                  <span className={`instructor-section-arrow ${expandedSections.general ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">General</span>
                  <button className="instructor-add-btn" onClick={(e) => { e.stopPropagation(); setExpandedSections(s => ({...s, general:true})); handleAddInputChange('general',''); }}>{'+'}</button>
                </button>
                {expandedSections.general && (
                  <div>
                    <div className="instructor-add-input">
                      <input value={addInputs.general} onChange={(e) => handleAddInputChange('general', e.target.value)} placeholder="Add general item" />
                      <button onClick={() => handleAddItem('general')}>Add</button>
                    </div>
                    <div className="section-content">
                      {course.sections?.general?.map((item) => (
                        <div key={item.id} className="instructor-item" onClick={() => navigate(`/instructor/content/general/${item.id}`)} style={{cursor: 'pointer'}}>
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
                <button className="instructor-section-header" onClick={() => toggleSection('materials')}>
                  <span className={`instructor-section-arrow ${expandedSections.materials ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Materials</span>
                  <button className="instructor-add-btn" onClick={(e) => { e.stopPropagation(); setExpandedSections(s => ({...s, materials:true})); }}>{'+'}</button>
                </button>
                {expandedSections.materials && (
                  <div>
                    <div className="instructor-add-input">
                      <input value={addInputs.materials} onChange={(e) => handleAddInputChange('materials', e.target.value)} placeholder="Add material" />
                      <button onClick={() => handleAddItem('materials')}>Add</button>
                    </div>
                    <div className="section-content">
                      {course.sections?.materials?.map((item) => (
                        <div key={item.id} className="instructor-item" onClick={() => navigate(`/instructor/content/materials/${item.id}`)} style={{cursor: 'pointer'}}>
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
                <button className="instructor-section-header" onClick={() => toggleSection('assignments')}>
                  <span className={`instructor-section-arrow ${expandedSections.assignments ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Assignments</span>
                  <button className="instructor-add-btn" onClick={(e) => { e.stopPropagation(); setExpandedSections(s => ({...s, assignments:true})); }}>{'+'}</button>
                </button>
                {expandedSections.assignments && (
                  <div>
                    <div className="instructor-add-input">
                      <input value={addInputs.assignments} onChange={(e) => handleAddInputChange('assignments', e.target.value)} placeholder="Add assignment" />
                      <button onClick={() => handleAddItem('assignments')}>Add</button>
                    </div>
                    <div className="section-content">
                      {course.sections?.assignments?.map((item) => (
                        <div key={item.id} className="instructor-item" onClick={() => navigate(`/instructor/content/assignments/${item.id}`)} style={{cursor: 'pointer'}}>
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
                <button className="instructor-section-header" onClick={() => toggleSection('assessments')}>
                  <span className={`instructor-section-arrow ${expandedSections.assessments ? 'open' : ''}`}>▼</span>
                  <span className="instructor-section-title">Assessments</span>
                  <button className="instructor-add-btn" onClick={(e) => { e.stopPropagation(); setExpandedSections(s => ({...s, assessments:true})); }}>{'+'}</button>
                </button>
                {expandedSections.assessments && (
                  <div>
                    <div className="instructor-add-input">
                      <input value={addInputs.assessments} onChange={(e) => handleAddInputChange('assessments', e.target.value)} placeholder="Add assessment" />
                      <button onClick={() => handleAddItem('assessments')}>Add</button>
                    </div>
                    <div className="section-content">
                      {course.sections?.assessments?.map((item) => (
                        <div key={item.id} className="instructor-item" onClick={() => navigate(`/instructor/content/assessments/${item.id}`)} style={{cursor: 'pointer'}}>
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
                  <button className="instructor-section-header" onClick={() => toggleSection(key)}>
                    <span className={`instructor-section-arrow ${expandedSections[key] ? 'open' : ''}`}>▼</span>
                    <span className="instructor-section-title">{(course.sectionTitles && course.sectionTitles[key]) || key}</span>
                    <button className="instructor-add-btn" onClick={(e) => { e.stopPropagation(); setExpandedSections(s => ({...s, [key]:true})); }}>{'+'}</button>
                  </button>
                  {expandedSections[key] && (
                    <div>
                      <div className="instructor-add-input">
                        <input value={addInputs[key] || ''} onChange={(e) => handleAddInputChange(key, e.target.value)} placeholder={`Add item to ${(course.sectionTitles && course.sectionTitles[key]) || key}`} />
                        <button onClick={() => handleAddItem(key)}>Add</button>
                      </div>
                      <div className="section-content">
                        {(course.sections[key] || []).map((item) => (
                          <div key={item.id} className="instructor-item" onClick={() => navigate(`/instructor/content/${key}/${item.id}`)} style={{cursor: 'pointer'}}>
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

          {activeTab === 'grades' && (
            <div className="tab-panel">
              <div className="grades-content">
                <table className="instructor-grades-table">
                  <thead>
                    <tr>
                      <th>Assignment/Assessment</th>
                      <th>Score</th>
                      <th>Max Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.grades?.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <input className="editable-grade" value={item.score ?? ''} onChange={(e) => handleGradeChange(item.id, 'score', e.target.value)} />
                        </td>
                        <td>{item.maxScore}</td>
                        <td>
                          <input className="editable-grade" value={item.status ?? ''} onChange={(e) => handleGradeChange(item.id, 'status', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="overall-grade">
                  <h3>Overall Grade</h3>
                  <p className="grade-value">{course.grades?.overall !== null ? `${course.grades.overall}%` : 'Not calculated yet'}</p>
                </div>
                <div style={{marginTop:12}}>
                  <button className="save-grade-btn" onClick={() => alert('Grades saved locally (example)')}>Save Grades</button>
                </div>
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
                      <div>{s.name || s.fullName || s.email}</div>
                      <div>
                        <button className="instructor-student-link" onClick={() => goToStudentProfile(s)}>View Profile</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating add control */}
      <div className="instructor-floating-add">
        <button className="instructor-floating-btn" onClick={() => setShowAddPanel((s) => !s)}>＋</button>
        {showAddPanel && (
          <div className="instructor-add-panel">
            <div className="panel-row">
              <label style={{display:'flex',alignItems:'center',gap:6}}>
                <input type="radio" name="addType" checked={addPanelType === 'section'} onChange={() => setAddPanelType('section')} /> Add Section
              </label>
              <label style={{display:'flex',alignItems:'center',gap:6}}>
                <input type="radio" name="addType" checked={addPanelType === 'grade'} onChange={() => setAddPanelType('grade')} /> Add Grade
              </label>
            </div>
            <input value={newAddName} onChange={(e) => setNewAddName(e.target.value)} placeholder={addPanelType === 'section' ? 'Section title (e.g., Extra Materials)' : 'Grade item name (e.g., Quiz 1)'} />
            <div className="panel-actions">
              <button onClick={() => {
                if (addPanelType === 'section') handleAddNewSection(newAddName)
                else handleAddNewGrade(newAddName)
                setNewAddName('')
                setShowAddPanel(false)
              }}>Add</button>
              <button onClick={() => setShowAddPanel(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default CoursePage
