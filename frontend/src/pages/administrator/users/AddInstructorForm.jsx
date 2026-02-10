import React, { useState } from 'react'

const BASE = 'http://127.0.0.1:8000'
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  const headers = { 'Accept': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const AddInstructorForm = ({ onCreated = () => {}, onCancel = () => {} }) => {
  const [form, setForm] = useState({
    name: '',
    email_id: '',
    password: '',
    department: '',
    dob: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email_id || !form.password || !form.dob) {
      setError('Please fill required fields: name, email, password, dob.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email_id: form.email_id,
        password: form.password,
        department: form.department,
        dob: form.dob // should be YYYY-MM-DD
      }
      const res = await fetch(`${BASE}/admin/instructor/new_instructor`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const txt = await res.text()
      if (!res.ok) {
        setError(txt || `Create failed (${res.status})`)
      } else {
        onCreated()
      }
    } catch (err) {
      console.error('create instructor', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-user-form" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Add Instructor</h3>
      {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
      <div className="add-user-grid">
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="form-input" />
        <input name="email_id" placeholder="Email" value={form.email_id} onChange={handleChange} className="form-input" />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} className="form-input" />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="form-input" />
        <input name="dob" placeholder="DOB (YYYY-MM-DD)" value={form.dob} onChange={handleChange} className="form-input" />
      </div>
      <div style={{ marginTop: 10 }}>
        <button className="auth-submit-btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Instructor'}</button>
        <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </form>
  )
}

export default AddInstructorForm
