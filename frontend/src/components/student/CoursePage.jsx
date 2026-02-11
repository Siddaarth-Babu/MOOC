import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const CoursePage = ({ courseData }) => {
  const navigate = useNavigate()
  const { id: courseId } = useParams()

  // Course data
  const [course, setCourse] = useState(null)
  const [folders, setFolders] = useState([])
  const [evaluation, setEvaluation] = useState(null)
  const [activeTab, setActiveTab] = useState('content')
  const [expandedFolders, setExpandedFolders] = useState({})
  const [expandedSubfolders, setExpandedSubfolders] = useState({})

  // Content view modal
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedSubfolderContent, setSelectedSubfolderContent] = useState(null)
  const [subfolderItems, setSubfolderItems] = useState([])

  // Assignment submission modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')

  useEffect(() => {
    if (courseData) {
      const id = courseData.course?.id || courseData.course?.course_id || courseData.course_id || courseData.id
      setCourse({ id, name: courseData.course?.name || courseData.course_name || courseData.name })
      if (id) {
        fetchFolders(id)
        fetchEvaluation(id)
      }
    }
  }, [courseData])

  // Fetch folders from backend
  const fetchFolders = async (cId) => {
    try {
      console.log('Fetching folders for course:', cId)
      const res = await fetch(`http://localhost:8000/courses/${cId}`)
      if (!res.ok) {
        console.error(`Failed to fetch folders: ${res.status}`)
        return
      }
      const data = await res.json()
      console.log('Folders fetched:', data)
      setFolders(data || [])
    } catch (err) {
      console.error('Error fetching folders:', err)
    }
  }

  // Fetch evaluation from backend
  const fetchEvaluation = async (cId) => {
    try {
      console.log('Fetching evaluation for course:', cId)
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.error('No access token found')
        return
      }

      const res = await fetch(`http://localhost:8000/student/courses/${cId}/evaluation`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        console.error(`Failed to fetch evaluation: ${res.status}`)
        return
      }

      const data = await res.json()
      console.log('Evaluation fetched:', data)
      setEvaluation(data)
    } catch (err) {
      console.error('Error fetching evaluation:', err)
    }
  }

  // Fetch subfolder contents (items)
  const fetchSubfolderContents = async (folderId, subfolderId) => {
    try {
      console.log(`Fetching contents for folder ${folderId}/${subfolderId}`)
      const res = await fetch(`http://localhost:8000/courses/${course.id}/${folderId}/${subfolderId}`)
      if (!res.ok) {
        console.error(`Failed to fetch subfolder contents: ${res.status}`)
        return
      }
      const data = await res.json()
      console.log('Subfolder contents:', data)
      return data
    } catch (err) {
      console.error('Error fetching subfolder contents:', err)
      return null
    }
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const toggleSubfolder = (subfolderId) => {
    setExpandedSubfolders((prev) => ({
      ...prev,
      [subfolderId]: !prev[subfolderId],
    }))
  }

  // Open subfolder and fetch its contents
  const openSubfolderContent = async (folderId, subfolderId, subfolderTitle) => {
    const contents = await fetchSubfolderContents(folderId, subfolderId)
    if (contents) {
      setSelectedSubfolderContent({ folderId, subfolderId, title: subfolderTitle, ...contents })
      setSubfolderItems(contents.items || [])
      setShowContentModal(true)
    }
  }

  // Get icon based on item type
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

  // Open content in new tab (fetch URL from backend and open)
  const openContentInNewTab = async (itemType, itemId) => {
    try {
      let endpoint = ''
      let urlField = ''

      if (itemType === 'video') {
        endpoint = `http://localhost:8000/content/video/${itemId}`
        urlField = 'url_link'
      } else if (itemType === 'notes') {
        endpoint = `http://localhost:8000/content/notes/${itemId}`
        urlField = 'url_link'
      } else if (itemType === 'textbook') {
        endpoint = `http://localhost:8000/content/book/${itemId}`
        // Textbooks don't have a URL, just display info
        console.log(`Fetching textbook from: ${endpoint}`)
        const res = await fetch(endpoint)
        console.log(`Textbook response status: ${res.status}`)
        if (!res.ok) {
          const errText = await res.text()
          console.error(`Failed to fetch textbook: ${errText}`)
          alert('Failed to fetch textbook')
          return
        }
        const book = await res.json()
        console.log('Textbook data:', book)
        alert(`📚 ${book.title}\n\nAuthor: ${book.author}\nPublisher: ${book.publisher}\nEdition: ${book.edition || 'N/A'}`)
        return
      } else {
        alert(`Unknown content type: ${itemType}`)
        return
      }

      // Fetch the content
      console.log(`Fetching ${itemType} from: ${endpoint}`)
      const res = await fetch(endpoint)
      console.log(`${itemType} response status: ${res.status}`)
      
      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to fetch ${itemType}: ${errText}`)
        alert(`Failed to fetch ${itemType}: ${res.status}`)
        return
      }

      const contentData = await res.json()
      console.log(`${itemType} data:`, contentData)
      const url = contentData[urlField]

      if (url) {
        // Open URL in new tab
        console.log(`Opening ${itemType} URL: ${url}`)
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        alert(`No ${urlField} found for this ${itemType}`)
      }
    } catch (err) {
      console.error(`Error opening ${itemType}:`, err)
      alert(`Error opening ${itemType}: ${err.message}`)
    }
  }

  // Get item details from the backend data
  const getItemDetails = async (item) => {
    // This would require backend endpoints to fetch individual items
    // For now, we'll display basic info
    return {
      title: `${item.item_type} #${item.item_id}`,
      type: item.item_type
    }
  }

  // Open assignment submission modal
  const openAssignmentSubmission = (assignment) => {
    setSelectedAssignment(assignment)
    setSubmissionUrl('')
    setShowSubmissionModal(true)
  }

  // Submit assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    if (!submissionUrl.trim() || !selectedAssignment || !course) {
      alert('Please enter a valid submission URL')
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('No access token found')
      return
    }

    try {
      console.log('Submitting assignment:', submissionUrl)
      const res = await fetch(
        `http://localhost:8000/student/courses/${course.id}/submit_asg`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            submission_url: submissionUrl,
            assignment_id: selectedAssignment.assignment_id
          })
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to submit assignment: ${res.status} - ${errText}`)
        alert(`Failed to submit assignment: ${errText}`)
        return
      }

      const result = await res.json()
      console.log('Assignment submitted:', result)
      alert('Assignment submitted successfully!')
      setSubmissionUrl('')
      setShowSubmissionModal(false)
      setSelectedAssignment(null)
    } catch (err) {
      console.error('Error submitting assignment:', err)
      alert('Error submitting assignment')
    }
  }

  if (!course) {
    return <div className="course-details"><p>Loading...</p></div>
  }

  return (
    <div className="course-page-wrapper">
      <Navbar />
      <div className="course-details">
        {/* Course Header */}
        <div className="course-header">
          <div className="course-header-content">
            <h1 className="course-details-title">{course.name}</h1>
            <p className="course-meta-info">Course ID: {course.id}</p>
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
              {folders.length === 0 ? (
                <p style={{ color: '#999', fontSize: '1rem' }}>No course content available yet</p>
              ) : (
                folders.map((folder) => (
                  <div key={folder.folder_id} style={{ marginBottom: '2rem', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Folder Header */}
                    <div
                      onClick={() => toggleFolder(folder.folder_id)}
                      style={{
                        padding: '1.5rem',
                        background: '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                          <span style={{ marginRight: '0.5rem' }}>
                            {expandedFolders[folder.folder_id] ? '▼' : '▶'}
                          </span>
                          📁 {folder.title}
                        </h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                          {(folder.subfolders || []).length} subfolder(s)
                        </p>
                      </div>
                    </div>

                    {/* Subfolders List */}
                    {expandedFolders[folder.folder_id] && (
                      <div style={{ padding: '1rem' }}>
                        {(folder.subfolders || []).length === 0 ? (
                          <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>No subfolders yet</p>
                        ) : (
                          (folder.subfolders || []).map((subfolder) => (
                            <div key={subfolder.folder_id} style={{ marginBottom: '1rem' }}>
                              {/* Subfolder Header */}
                              <div
                                onClick={() => toggleSubfolder(subfolder.folder_id)}
                                style={{
                                  padding: '1rem',
                                  background: '#f9f9f9',
                                  border: '1px solid #ddd',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                              >
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: '0 0 0.3rem 0', color: '#333' }}>
                                    <span style={{ marginRight: '0.5rem' }}>
                                      {expandedSubfolders[subfolder.folder_id] ? '▼' : '▶'}
                                    </span>
                                    📂 {subfolder.title}
                                  </h4>
                                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                                    {(subfolder.items || []).length} item(s)
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openSubfolderContent(folder.folder_id, subfolder.folder_id, subfolder.title)
                                  }}
                                  style={{
                                    marginLeft: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  View Content
                                </button>
                              </div>

                              {/* Subfolder Items Preview */}
                              {expandedSubfolders[subfolder.folder_id] && (subfolder.items || []).length > 0 && (
                                <div style={{ padding: '0.75rem 1rem', background: '#fafafa', borderTop: '1px solid #ddd' }}>
                                  {(subfolder.items || []).map((item) => (
                                    <div
                                      key={`item-${item.item_id}`}
                                      style={{
                                        padding: '0.5rem 0',
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <span style={{ marginRight: '0.5rem' }}>{getItemIcon(item.item_type)}</span>
                                      <span style={{ color: '#555', fontSize: '0.9rem' }}>
                                        {item.item_type} #{item.item_id}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-panel">
              <div className="details-content">
                {courseData && courseData.details && courseData.details.length > 0 ? (
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
                {evaluation ? (
                  <div className="overall-grade" style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px', maxWidth: '600px' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>📊 Course Evaluation</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#999', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Total Marks</p>
                        <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: '#333' }}>
                          {evaluation.marks}
                        </p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#999', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Grade</p>
                        <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: '#3498db' }}>
                          {evaluation.grade}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#999', fontSize: '1rem' }}>No evaluation data available yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT MODAL */}
      {showContentModal && selectedSubfolderContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }} onClick={() => setShowContentModal(false)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            margin: '2rem auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ marginTop: 0, color: '#333' }}>📂 {selectedSubfolderContent.title}</h2>
              <button
                onClick={() => setShowContentModal(false)}
                style={{
                  background: '#ccc',
                  border: 'none',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </button>
            </div>

            {subfolderItems.length === 0 ? (
              <p style={{ color: '#999', fontSize: '1rem', textAlign: 'center' }}>No content available in this subfolder</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {subfolderItems.map((item) => (
                  <div
                    key={`item-${item.item_id}`}
                    style={{
                      padding: '1rem',
                      background: '#f9f9f9',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{getItemIcon(item.item_type)}</span>
                      <div>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#333' }}>
                          {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)} #{item.item_id}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                          Type: {item.item_type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openContentInNewTab(item.item_type, item.item_id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASSIGNMENT SUBMISSION MODAL */}
      {showSubmissionModal && selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setShowSubmissionModal(false)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
              📝 Submit Assignment
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              <strong>Assignment:</strong> {selectedAssignment.title}
            </p>
            <form onSubmit={handleSubmitAssignment}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                  Submission URL
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://example.com/my-submission"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                  required
                />
                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                  Provide a link to your submission (GitHub, Google Drive, etc.)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ccc',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CoursePage
