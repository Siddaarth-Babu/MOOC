import React from 'react'

const Notes = ({ title, content, grading }) => {
  return (
    <div className="content-notes-wrapper">
      {title && <h3 className="content-item-title">{title}</h3>}
      <div className="content-notes-body">
        {content && content.split('\n').map((line, idx) => (
          <p key={idx} className="note-line">{line || <br />}</p>
        ))}
      </div>
      {grading && (
        <div className="content-grading-section">
          <h4>Grading</h4>
          <p><strong>Total Points:</strong> {grading.totalPoints}</p>
          <p><strong>Rubric:</strong> {grading.rubric}</p>
        </div>
      )}
    </div>
  )
}

export default Notes
