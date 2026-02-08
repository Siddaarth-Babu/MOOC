import React from 'react'

const Footer = () => {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-inner">
        <p>© {new Date().getFullYear()} MOOC Platform — Built for learning and growth.</p>
      </div>
    </footer>
  )
}

export default Footer
