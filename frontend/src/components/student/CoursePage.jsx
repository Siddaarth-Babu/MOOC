import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const CoursePage = ({ courseData }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('content')
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    materials: false,
    assignments: false,
    assessments: false,
  })

  if (!courseData) {
    return <div className="course-details"><p>Loading...</p></div>
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="course-page-wrapper">
      <Navbar />
      <div className="course-details">
        {/* Course Header */}
        <div className="course-header">
          {/* <div className="course-header-banner"></div> */}
          <div className="course-header-content">
            <h1 className="course-details-title">{courseData.course.name}</h1>
            <p className="course-meta-info">
              {courseData.course.id}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="course-tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            Grades
          </button>
        </div>

        {/* Tab Content */}
        <div className="course-tabs-content">
          {activeTab === 'content' && (
            <div className="tab-panel">
              {/* General Section */}
              <div className="content-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('general')}
                >
                  <span className={`section-arrow ${expandedSections.general ? 'open' : ''}`}>
                    ▼
                  </span>
                  <span className="section-title">General</span>
                </button>
                {expandedSections.general && (
                  <div className="section-content">
                    {courseData.sections.general && courseData.sections.general.map((item) => (
                      <div key={item.id} className="content-item" onClick={() => navigate(`/student/content/general/${item.id}`)} style={{cursor: 'pointer'}}>
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Materials Section */}
              <div className="content-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('materials')}
                >
                  <span className={`section-arrow ${expandedSections.materials ? 'open' : ''}`}>
                    ▼
                  </span>
                  <span className="section-title">Materials</span>
                </button>
                {expandedSections.materials && (
                  <div className="section-content">
                    {courseData.sections.materials && courseData.sections.materials.map((item) => (
                      <div key={item.id} className="content-item" onClick={() => navigate(`/student/content/materials/${item.id}`)} style={{cursor: 'pointer'}}>
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignments Section */}
              <div className="content-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('assignments')}
                >
                  <span className={`section-arrow ${expandedSections.assignments ? 'open' : ''}`}>
                    ▼
                  </span>
                  <span className="section-title">Assignments</span>
                </button>
                {expandedSections.assignments && (
                  <div className="section-content">
                    {courseData.sections.assignments && courseData.sections.assignments.map((item) => (
                      <div key={item.id} className="content-item" onClick={() => navigate(`/student/content/assignments/${item.id}`)} style={{cursor: 'pointer'}}>
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessments Section */}
              <div className="content-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('assessments')}
                >
                  <span className={`section-arrow ${expandedSections.assessments ? 'open' : ''}`}>
                    ▼
                  </span>
                  <span className="section-title">Assessments</span>
                </button>
                {expandedSections.assessments && (
                  <div className="section-content">
                    {courseData.sections.assessments && courseData.sections.assessments.map((item) => (
                      <div key={item.id} className="content-item" onClick={() => navigate(`/student/content/assessments/${item.id}`)} style={{cursor: 'pointer'}}>
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-panel">
              <div className="details-content">
                {courseData.details && courseData.details.map((field, idx) => (
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
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Assignment/Assessment</th>
                      <th>Score</th>
                      <th>Max Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseData.grades.items && courseData.grades.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.score !== null ? item.score : '-'}</td>
                        <td>{item.maxScore}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="overall-grade">
                  <h3>Overall Grade</h3>
                  <p className="grade-value">
                    {courseData.grades.overall !== null ? `${courseData.grades.overall}%` : 'Not calculated yet'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CoursePage
