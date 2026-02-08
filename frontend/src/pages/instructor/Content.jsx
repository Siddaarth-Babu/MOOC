import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/instructor/Navbar'
import Footer from '../../components/instructor/Footer'
import Video from '../../components/instructor/Video'
import Notes from '../../components/instructor/Notes'
import PdfCard from '../../components/instructor/PdfCard'
import { dummyContentData } from '../../utils/dummyContentData'

const Content = () => {
  const navigate = useNavigate()
  const { section, itemId } = useParams()
  const [item, setItem] = useState(null)
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState('')
  const [formData, setFormData] = useState({ link: '', title: '' })

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const sectionData = dummyContentData[section] || []
      let foundItem = sectionData.find((i) => String(i.id) === String(itemId))
      
      if (foundItem) {
        setItem(foundItem)
        setContents(foundItem.contents || [])
      } else {
        // Allow instructors to add content even if item doesn't exist yet
        setItem({ id: itemId, title: 'New Item', contents: [] })
        setContents([])
      }
      setLoading(false)
    }, 300)
  }, [section, itemId])

  const handleAddContent = (type) => {
    setAddType(type)
    setShowAddModal(true)
  }

  const handleSaveContent = () => {
    if (!formData.title || !formData.link) {
      alert('Please fill in both fields')
      return
    }

    const newContent = {
      id: `c${Date.now()}`,
      type: addType,
      title: formData.title
    }

    if (addType === 'video') {
      newContent.videoId = formData.link
    } else if (addType === 'notes') {
      newContent.content = formData.link
    } else if (addType === 'pdf') {
      newContent.pdfUrl = formData.link
    }

    // Add new content to the list instead of replacing
    const updatedContents = [...contents, newContent]
    setContents(updatedContents)
    
    // Update the item with new contents
    const updatedItem = { ...item, contents: updatedContents }
    setItem(updatedItem)

    setShowAddModal(false)
    setFormData({ link: '', title: '' })
    alert('Content added successfully!')
  }

  const handleRemoveContent = (contentId) => {
    const updatedContents = contents.filter((c) => c.id !== contentId)
    setContents(updatedContents)
    
    const updatedItem = { ...item, contents: updatedContents }
    setItem(updatedItem)
    alert('Content removed successfully!')
  }

  if (loading) {
    return (
      <div className="instructor-page">
        <Navbar />
        <div className="container" style={{ padding: '2rem 1rem' }}>
          <p>Loading content...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const renderContent = (content) => {
    switch (content.type) {
      case 'video':
        return <Video videoId={content.videoId} title={content.title} description={content.description} />
      case 'notes':
        return <Notes title={content.title} content={content.content} grading={content.grading} />
      case 'pdf':
        return <PdfCard title={content.title} pdfUrl={content.pdfUrl} description={content.description} />
      default:
        return <div>Unknown content type</div>
    }
  }

  return (
    <div className="instructor-page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="content-page-wrapper">
          <div className="content-header-instructor">
            <div style={{ flex: 1 }}>
              <h1>{item?.title}</h1>
              <span className="content-type-badge">{section}</span>
            </div>
            <div className="instructor-actions">
              <button className="action-btn" onClick={() => handleAddContent('video')}>+ Add Video</button>
              <button className="action-btn" onClick={() => handleAddContent('notes')}>+ Add Notes</button>
              <button className="action-btn" onClick={() => handleAddContent('pdf')}>+ Add PDF</button>
            </div>
          </div>

          {/* Show all added content items */}
          <div className="content-items-list">
            {contents.length === 0 ? (
              <div className="content-main">
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No content added yet. Click the buttons above to add content.</p>
              </div>
            ) : (
              contents.map((content) => (
                <div key={content.id} className="content-item-wrapper">
                  <div className="content-main">
                    {renderContent(content)}
                  </div>
                  <button 
                    className="btn-remove-content" 
                    onClick={() => handleRemoveContent(content.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add {addType?.toUpperCase()}</h3>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
              />
              <input
                type="text"
                placeholder={addType === 'video' ? 'YouTube Video ID' : addType === 'pdf' ? 'PDF URL' : 'Notes content'}
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="form-input"
              />
              <div className="modal-actions">
                <button className="auth-submit-btn" onClick={handleSaveContent}>Save</button>
                <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Content
