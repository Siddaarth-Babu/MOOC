import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // TODO: Connect to actual API endpoint
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ email, password, rememberMe })
      // })
      // if (!response.ok) throw new Error('Login failed')
      // const data = await response.json()
      // Store token and redirect
      console.log('Login attempt:', { email, password, rememberMe })
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

            {/* Remember & Forgot */}
            <div className="form-checkbox-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="/forgot-password" className="form-link">
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

