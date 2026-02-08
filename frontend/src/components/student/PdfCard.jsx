import React from 'react'

const PdfCard = ({ title, pdfUrl, description }) => {
  return (
    <div className="pdf-card-wrapper">
      <div className="pdf-card">
        <div className="pdf-icon">📄</div>
        <div className="pdf-info">
          <h4 className="pdf-title">{title}</h4>
          {description && <p className="pdf-desc">{description}</p>}
        </div>
      </div>
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-open-btn">
        Open PDF
      </a>
    </div>
  )
}

export default PdfCard
