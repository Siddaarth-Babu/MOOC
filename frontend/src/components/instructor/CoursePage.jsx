import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const CoursePage = ({ courseData }) => {
  const navigate = useNavigate()

  // Course data
  const [course, setCourse] = useState(null)
  const [folders, setFolders] = useState([])
  const [activeTab, setActiveTab] = useState('content')
  const [studentsEnrolled, setStudentsEnrolled] = useState([])

  // Modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [folderTitle, setFolderTitle] = useState('')

  const [showCreateSubfolderModal, setShowCreateSubfolderModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [subfolderTitle, setSubfolderTitle] = useState('')

  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedSubfolderId, setSelectedSubfolderId] = useState(null)
  const [contentType, setContentType] = useState('video') // 'video', 'notes', 'book'
  const [contentData, setContentData] = useState({ title: '', url_link: '', author: '', publisher: '', edition: '', document_type: 'pdf' })

  // Student modal states
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentGrades, setStudentGrades] = useState({})

  useEffect(() => {
    if (courseData) {
      const id = courseData.course?.id || courseData.course?.course_id || courseData.course_id || courseData.id
      setCourse({ id, name: courseData.course?.name || courseData.course_name || courseData.name })
      setStudentsEnrolled(courseData.studentsEnrolled || courseData.students_enrolled || courseData.students || [])
      if (id) {
        fetchFolders(id)
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

  // CREATE FOLDER
  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!folderTitle.trim() || !course) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('No access token found')
      return
    }

    try {
      console.log(`Creating folder: ${folderTitle}`)
      const res = await fetch(`http://localhost:8000/courses/${course.id}/add_folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: folderTitle })
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to create folder: ${res.status} - ${errText}`)
        alert(`Failed to create folder: ${errText}`)
        return
      }

      const newFolder = await res.json()
      console.log('Folder created:', newFolder)
      alert('Folder created successfully!')
      setFolderTitle('')
      setShowCreateFolderModal(false)
      
      // Fetch fresh folders
      await fetchFolders(course.id)
    } catch (err) {
      console.error('Error creating folder:', err)
      alert('Error creating folder')
    }
  }

  // CREATE SUBFOLDER
  const handleCreateSubfolder = async (e) => {
    e.preventDefault()
    if (!subfolderTitle.trim() || !selectedFolderId || !course) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('No access token found')
      return
    }

    try {
      console.log(`Creating subfolder: ${subfolderTitle} under folder ${selectedFolderId}`)
      const res = await fetch(`http://localhost:8000/courses/${course.id}/${selectedFolderId}/add_sub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: subfolderTitle })
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to create subfolder: ${res.status} - ${errText}`)
        alert(`Failed to create subfolder: ${errText}`)
        return
      }

      const newSubfolder = await res.json()
      console.log('Subfolder created:', newSubfolder)
      alert('Subfolder created successfully!')
      setSubfolderTitle('')
      setShowCreateSubfolderModal(false)
      setSelectedFolderId(null)
      
      // Fetch fresh folders
      await fetchFolders(course.id)
    } catch (err) {
      console.error('Error creating subfolder:', err)
      alert('Error creating subfolder')
    }
  }

  // CREATE VIDEO/NOTES/BOOK
  const handleCreateContent = async (e) => {
    e.preventDefault()
    if (!contentData.title.trim() || !selectedSubfolderId || !course) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('No access token found')
      return
    }

    try {
      // Find folder and subfolder IDs
      let parentFolderId = null
      let subFolderId = null

      for (const folder of folders) {
        for (const subfolder of (folder.subfolders || [])) {
          if (subfolder.folder_id === selectedSubfolderId) {
            parentFolderId = folder.folder_id
            subFolderId = subfolder.folder_id
            break
          }
        }
      }

      if (!parentFolderId || !subFolderId) {
        alert('Error: Could not find folder path')
        return
      }

      let endpoint = null
      let payload = null

      if (contentType === 'video') {
        endpoint = `http://localhost:8000/courses/${course.id}/${parentFolderId}/${subFolderId}/add_video`
        payload = {
          title: contentData.title,
          url_link: contentData.url_link,
          duration: 0
        }
      } else if (contentType === 'notes') {
        endpoint = `http://localhost:8000/courses/${course.id}/${parentFolderId}/${subFolderId}/add_notes`
        payload = {
          title: contentData.title,
          url_link: contentData.url_link,
          document_type: contentData.document_type
        }
      } else if (contentType === 'book') {
        endpoint = `http://localhost:8000/courses/${course.id}/${parentFolderId}/${subFolderId}/add_book`
        payload = {
          title: contentData.title,
          author: contentData.author,
          publisher: contentData.publisher,
          edition: contentData.edition
        }
      }

      console.log(`Creating ${contentType}:`, payload)
      console.log('Endpoint:', endpoint)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to create ${contentType}: ${res.status} - ${errText}`)
        alert(`Failed to create ${contentType}: ${errText}`)
        return
      }

      const result = await res.json()
      console.log(`${contentType} created:`, result)
      alert(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully!`)
      
      // Reset modal
      setContentData({ title: '', url_link: '', author: '', publisher: '', edition: '', document_type: 'pdf' })
      setShowContentModal(false)
      setSelectedSubfolderId(null)
      
      // Fetch fresh folders
      await fetchFolders(course.id)
    } catch (err) {
      console.error(`Error creating ${contentType}:`, err)
      alert(`Error creating ${contentType}`)
    }
  }

  // Open subfolder and show content options
  const openSubfolderContent = (subfolderId) => {
    setSelectedSubfolderId(subfolderId)
    setShowContentModal(true)
  }

  if (!course) {
    return <div className="instructor-course-details"><p>Loading...</p></div>
  }

  return (
    <div className="instructor-course-page">
      <Navbar />
      <div className="instructor-course-details">
        {/* Course Header */}
        <div className="instructor-course-header">
          <div className="instructor-course-header-content">
            <h1 className="instructor-course-details-title">{course.name}</h1>
            <p className="instructor-course-meta-info">Course ID: {course.id}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="instructor-course-tabs-nav">
          <button
            className={`instructor-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`instructor-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students Enrolled
          </button>
        </div>

        {/* Tab Content */}
        <div className="instructor-course-tabs-content">
          {activeTab === 'content' && (
            <div className="tab-panel">
              {/* Create Folder Button */}
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  + Create Folder
                </button>
              </div>

              {/* Folders List */}
              <div style={{ marginTop: '2rem' }}>
                {folders.length === 0 ? (
                  <p style={{ color: '#999', fontSize: '1rem' }}>No folders yet. Create one to get started!</p>
                ) : (
                  folders.map((folder) => (
                    <div key={folder.folder_id} style={{ marginBottom: '2rem', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                      {/* Folder Header */}
                      <div style={{
                        padding: '1.5rem',
                        background: '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>📁 {folder.title}</h3>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                            {(folder.subfolders || []).length} subfolder(s)
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFolderId(folder.folder_id)
                            setShowCreateSubfolderModal(true)
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          + Add Subfolder
                        </button>
                      </div>

                      {/* Subfolders List */}
                      <div style={{ padding: '1rem' }}>
                        {(folder.subfolders || []).length === 0 ? (
                          <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>No subfolders yet</p>
                        ) : (
                          (folder.subfolders || []).map((subfolder) => (
                            <div
                              key={subfolder.folder_id}
                              onClick={() => openSubfolderContent(subfolder.folder_id)}
                              style={{
                                padding: '1rem',
                                marginBottom: '0.75rem',
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                              <div>
                                <h4 style={{ margin: '0 0 0.3rem 0', color: '#333' }}>📂 {subfolder.title}</h4>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                                  {(subfolder.items || []).length} item(s) • Click to manage content
                                </p>
                              </div>
                              <span style={{ color: '#3498db', fontSize: '1.2rem' }}>→</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="tab-panel">
              <div className="instructor-students-list">
                {studentsEnrolled.length === 0 ? (
                  <p style={{ color: '#999' }}>No students enrolled yet.</p>
                ) : (
                  studentsEnrolled.map((student) => (
                    <div
                      key={student.id || student.student_id}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
                          {student.name || student.fullName || student.email}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                          {student.email || student.email_id}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE FOLDER MODAL */}
      {showCreateFolderModal && (
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
        }} onClick={() => setShowCreateFolderModal(false)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Create New Folder</h2>
            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                  Folder Title
                </label>
                <input
                  type="text"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder="e.g., Week 1 - Introduction"
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
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
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
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBFOLDER MODAL */}
      {showCreateSubfolderModal && (
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
        }} onClick={() => setShowCreateSubfolderModal(false)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Create New Subfolder</h2>
            <form onSubmit={handleCreateSubfolder}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                  Subfolder Title
                </label>
                <input
                  type="text"
                  value={subfolderTitle}
                  onChange={(e) => setSubfolderTitle(e.target.value)}
                  placeholder="e.g., Lecture 1"
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
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateSubfolderModal(false)}
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
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Create Subfolder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTENT MANAGEMENT MODAL */}
      {showContentModal && (
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
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            margin: '2rem auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Add Content to Subfolder</h2>

            {/* Content Type Selector */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', color: '#333', fontWeight: 'bold' }}>
                Content Type
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setContentType('video')
                    setContentData({ title: '', url_link: '', author: '', publisher: '', edition: '', document_type: 'pdf' })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: contentType === 'video' ? '#27ae60' : '#eee',
                    color: contentType === 'video' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🎥 Video
                </button>
                <button
                  onClick={() => {
                    setContentType('notes')
                    setContentData({ title: '', url_link: '', author: '', publisher: '', edition: '', document_type: 'pdf' })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: contentType === 'notes' ? '#27ae60' : '#eee',
                    color: contentType === 'notes' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📄 Notes
                </button>
                <button
                  onClick={() => {
                    setContentType('book')
                    setContentData({ title: '', url_link: '', author: '', publisher: '', edition: '', document_type: 'pdf' })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: contentType === 'book' ? '#27ae60' : '#eee',
                    color: contentType === 'book' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📚 Book
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateContent}>
              {/* Title (for all types) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={contentData.title}
                  onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                  placeholder="Enter title"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Video: URL + Duration */}
              {contentType === 'video' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                    Video Link (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    value={contentData.url_link}
                    onChange={(e) => setContentData({ ...contentData, url_link: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              )}

              {/* Notes: URL + Document Type */}
              {contentType === 'notes' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                      Document Link (PDF, Google Drive, etc.)
                    </label>
                    <input
                      type="url"
                      value={contentData.url_link}
                      onChange={(e) => setContentData({ ...contentData, url_link: e.target.value })}
                      placeholder="https://example.com/document.pdf"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                      Document Type
                    </label>
                    <select
                      value={contentData.document_type}
                      onChange={(e) => setContentData({ ...contentData, document_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                      <option value="txt">Text</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {/* Book: Author, Publisher, Edition */}
              {contentType === 'book' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                      Author
                    </label>
                    <input
                      type="text"
                      value={contentData.author}
                      onChange={(e) => setContentData({ ...contentData, author: e.target.value })}
                      placeholder="Author name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={contentData.publisher}
                      onChange={(e) => setContentData({ ...contentData, publisher: e.target.value })}
                      placeholder="Publisher name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>
                      Edition
                    </label>
                    <input
                      type="text"
                      value={contentData.edition}
                      onChange={(e) => setContentData({ ...contentData, edition: e.target.value })}
                      placeholder="e.g., 3rd Edition"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowContentModal(false)}
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
                  Create {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
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
