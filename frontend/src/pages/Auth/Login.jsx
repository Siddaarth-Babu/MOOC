import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // TODO: Connect to actual API endpoint
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) throw new Error('Login failed')
      const data = await response.json()
      const { access_token, role } = data
      // Store token and redirect
        // const fakeResponse = {
        //     role: 'student',
        //     user: {
        //         id: 1,
        //         name: 'Demo Student',
        //         email: email,
        //         firstName: 'Demo'
        //     }
        // }

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('role', role)

        if(role === 'student') {
            navigate('/student')
        } else if(role === 'instructor') {
            navigate('/instructor')
        } else if(role === 'admin') {
            navigate('/admin')
        } else if(role === 'analyst') {
            navigate('/analyst')
        }
        // const response = await fetch("http://127.0.0.1:8000/auth/login", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ email, password })
        // })

        // if (!response.ok) throw new Error("Invalid credentials")

        // const data = await response.json()
        // const { role, user } = data

        // // ROLE BASED NAVIGATION
        // if (role === "student") {
        //   navigate("/student", { state: { user } })
        // } else if (role === "instructor") {
        //   navigate("/instructor", { state: { user } })
        // } else if (role === "administrator") {
        //   navigate("/admin", { state: { user } })
        // }
      console.log('Login attempt:', { email, password })
      // Simulate success after 1s
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your MOOC account</p>
        </div>

        <div className="auth-card">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right' }}>
              <a href="/forgot-password" className="form-link"> 
                {/* {Implement forgot password mechanism later} */}
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <div className="form-divider-line"></div>
            <span className="form-divider-text">or</span>
            <div className="form-divider-line"></div>
          </div>

          {/* Social Login */}
          <div className="social-buttons">
            <button type="button" className="social-btn" aria-label="Sign in with Google">
              Google
            </button>
            <button type="button" className="social-btn" aria-label="Sign in with GitHub">
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Sign up here</Link>
          </p>
        </div>

        {/* Back Link */}
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Login

