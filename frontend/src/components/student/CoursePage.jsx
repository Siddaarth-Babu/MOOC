import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const CoursePage = ({ courseData }) => {
  const navigate = useNavigate()
  const { id: courseId } = useParams()
  const [activeTab, setActiveTab] = useState('content')
  const [expandedFolders, setExpandedFolders] = useState({})

  if (!courseData) {
    return <div className="course-details"><p>Loading...</p></div>
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  // Helper function to get icon based on item type
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

  // Recursive component to render nested folders
  const FolderTree = ({ folders = [], courseId }) => {
    return (
      <>
        {folders.map((folder) => (
          <div key={folder.folder_id} className="content-section">
            <button
              className="section-header"
              onClick={() => toggleFolder(folder.folder_id)}
            >
              <span className={`section-arrow ${expandedFolders[folder.folder_id] ? 'open' : ''}`}>
                ▼
              </span>
              <span className="section-title">{folder.title}</span>
            </button>

            {expandedFolders[folder.folder_id] && (
              <div className="section-content">
                {/* Render folder items (videos, notes, etc.) */}
                {folder.items && folder.items.length > 0 && (
                  <>
                    {folder.items.map((item) => (
                      <div
                        key={`item-${item.item_id}`}
                        className="content-item"
                        style={{ cursor: 'default' }}
                      >
                        <span className="item-icon">{getItemIcon(item.item_type)}</span>
                        <span className="item-title">{item.item_type} #{item.item_id}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Render subfolders recursively */}
                {folder.subfolders && folder.subfolders.length > 0 && (
                  <div className="subfolder-group">
                    <FolderTree folders={folder.subfolders} courseId={courseId} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  // Render sections (General, Materials, Assignments, Assessments)
  const SectionView = ({ sections = {} }) => {
    const sectionOrder = ['general', 'materials', 'assignments', 'assessments']
    
    return (
      <>
        {sectionOrder.map((sectionKey) => {
          const sectionItems = sections[sectionKey] || []
          const sectionTitle = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
          
          return (
            <div key={sectionKey} className="content-section">
              <button
                className="section-header"
                onClick={() => toggleFolder(sectionKey)}
              >
                <span className={`section-arrow ${expandedFolders[sectionKey] ? 'open' : ''}`}>
                  ▼
                </span>
                <span className="section-title">{sectionTitle}</span>
              </button>

              {expandedFolders[sectionKey] && (
                <div className="section-content">
                  {sectionItems.length > 0 ? (
                    sectionItems.map((item) => (
                      <div
                        key={item.id}
                        className="content-item"
                        style={{ cursor: 'default' }}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.5rem', color: '#999', fontSize: '0.9rem' }}>
                      No items in {sectionTitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="course-page-wrapper">
      <Navbar />
      <div className="course-details">
        {/* Course Header */}
        <div className="course-header">
          <div className="course-header-content">
            <h1 className="course-details-title">{courseData.course.name}</h1>
            <p className="course-meta-info">Course ID: {courseData.course.id}</p>
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
              {courseData.sections && Object.keys(courseData.sections).length > 0 ? (
                <SectionView sections={courseData.sections} />
              ) : courseData.folders && courseData.folders.length > 0 ? (
                <FolderTree folders={courseData.folders} courseId={courseId} />
              ) : (
                <div className="empty-state">
                  <p>No course content available yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-panel">
              <div className="details-content">
                {courseData.details && courseData.details.length > 0 ? (
                  courseData.details.map((field, idx) => (
                    <div
                      key={idx}
                      className="detail-field"
                      style={field.fullWidth ? { gridColumn: '1 / -1' } : {}}
                    >
                      <label>{field.label}</label>
                      <p>{field.value}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No course details available</p>
                  </div>
                )}
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
                    {courseData.grades.items && courseData.grades.items.length > 0 ? (
                      courseData.grades.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.score !== null ? item.score : '-'}</td>
                          <td>{item.maxScore}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>
                          No grades available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="overall-grade">
                  <h3>Overall Grade</h3>
                  <p className="grade-value">
                    {courseData.grades.overall !== null
                      ? `${courseData.grades.overall}%`
                      : 'Not calculated yet'}
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
