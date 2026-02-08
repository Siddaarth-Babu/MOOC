import React from 'react'

const Header = () => (
  <header className="site-header">
    <div className="container header-inner">
      <a className="logo" href="/">MOOC</a>
      <nav className="nav">
        <a href="#features">Features</a>
        <a href="#roles">Roles</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="auth">
        <a className="btn btn-login" href="/login">Login</a>
        <a className="btn btn-signup" href="/signup">Sign Up</a>
      </div>
    </div>
  </header>
)

export default Header
