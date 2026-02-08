import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'
import Video from '../../components/student/Video'
import Notes from '../../components/student/Notes'
import PdfCard from '../../components/student/PdfCard'
import { dummyContentData } from '../../utils/dummyContentData'

const Content = () => {
  const navigate = useNavigate()
  const { section, itemId } = useParams()
  const [item, setItem] = useState(null)
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submissionLink, setSubmissionLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState(null)

  useEffect(() => {
    setLoading(true)
    // Simulate API fetch delay
    setTimeout(() => {
      const sectionData = dummyContentData[section] || []
      // Try to find by ID - handle both string and number IDs
      let foundItem = sectionData.find((i) => String(i.id) === String(itemId))
      
      if (foundItem) {
        setItem(foundItem)
        setContents(foundItem.contents || [])
      } else {
        setItem(null)
        setContents([])
      }
      setLoading(false)
    }, 300)
  }, [section, itemId])

  if (loading) {
    return (
      <div className="student-page">
        <Navbar />
        <div className="container" style={{ padding: '2rem 1rem' }}>
          <p>Loading content...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="student-page">
        <Navbar />
        <div className="container" style={{ padding: '2rem 1rem' }}>
          <p>Content not found.</p>
          <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
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

  const isGraded = ['assignments', 'assessments'].includes(section)
  // Check if any content has grading
  const hasGrading = contents.some((c) => c.grading)

  const handleOpenSubmit = () => {
    setShowSubmitModal(true)
  }

  const handleSubmit = async () => {
    if (!submissionLink.trim()) {
      alert('Please enter your submission link')
      return
    }
    setSubmitting(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const payload = {
        section,
        itemId,
        link: submissionLink.trim(),
        user: user?.email || user?.id || 'anonymous'
      }
      // POST to submissions endpoint (adjust endpoint as backend expects)
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to submit')
      const data = await res.json()
      setSubmissionStatus({ success: true, data })
      setShowSubmitModal(false)
      setSubmissionLink('')
      alert('Submission uploaded successfully')
    } catch (err) {
      console.error(err)
      setSubmissionStatus({ success: false, error: err.message })
      alert('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="student-page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="content-page-wrapper">
          <div className="content-header">
            <h1>{item.title}</h1>
            <span className="content-type-badge">{section}</span>
          </div>

          {/* Display all content items */}
          <div className="content-items-list">
            {contents.length === 0 ? (
              <div className="content-main">
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No content available for this item yet.</p>
              </div>
            ) : (
              contents.map((content) => (
                <div key={content.id} className="content-main">
                  {renderContent(content)}
                </div>
              ))
            )}
          </div>

          {isGraded && hasGrading && (
            <div className="submission-section">
              <h3>Submission</h3>
              <p className="submission-status">Status: <strong>{submissionStatus?.success ? 'Submitted' : 'Not Submitted'}</strong></p>
              <p className="submission-points">Points: <strong>{contents.find(c => c.grading)?.grading?.totalPoints || 0}</strong></p>
              <button className="btn btn-submit" onClick={handleOpenSubmit}>Submit Work</button>

              {showSubmitModal && (
                <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Submit Work</h3>
                    <p style={{ marginBottom: '0.5rem' }}>Enter a link to your submission (GitHub, Drive, direct file link, etc.)</p>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      className="form-input"
                    />
                    <div className="modal-actions">
                      <button className="auth-submit-btn" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                      <button className="btn" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Content
