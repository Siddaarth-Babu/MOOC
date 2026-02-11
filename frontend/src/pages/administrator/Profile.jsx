import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/administrator/Navbar'
import Footer from '../../components/administrator/Footer'

const Profile = () => {
  const { adminId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [savedProfile, setSavedProfile] = useState(null)

  useEffect(() => {
    let mounted = true

    if (!adminId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('Not authenticated')
        }
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
        
        const url = `http://127.0.0.1:8000/admin/profile/${adminId}`
        console.log('Fetching admin profile from:', url)
        
        const res = await fetch(url, { headers })
        
        if (!mounted) return
        
        console.log('Response status:', res.status)
        const responseText = await res.text()
        console.log('Response body:', responseText)
        
        if (res.ok) {
          const data = JSON.parse(responseText)
          setEmail(data.email_id || '')
          setName(data.name || '')
          setDob(data.dob || '')
          
          setSavedProfile({
            name: data.name || '',
            dob: data.dob || ''
          })
        } else {
          throw new Error(`Server error (${res.status}): ${responseText}`)
        }
      } catch (err) {
        if (mounted) {
          console.error('Profile fetch error:', err)
          setError(`Error: ${err.message}`)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProfile()
    return () => { mounted = false }
  }, [adminId])

  const initials = (() => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  })()

  const handleCancel = () => {
    if (savedProfile) {
      setName(savedProfile.name || '')
      setDob(savedProfile.dob || '')
    }
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)

    const payload = {
      name,
      dob
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      const res = await fetch(`http://127.0.0.1:8000/admin/profile/${adminId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      })

      const text = await res.text()
      let body = null
      try { body = JSON.parse(text) } catch (_) { body = text }

      if (!res.ok) {
        const message = body?.message || body?.error || (typeof body === 'string' ? body : null) || `Server returned ${res.status}`
        throw new Error(message)
      }

      // Update saved profile
      setSavedProfile({
        name: payload.name,
        dob: payload.dob
      })
      setName(payload.name)
      setDob(payload.dob)
      setIsEditing(false)
      alert('Profile saved')
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  if (!adminId) return <div className="student-loading">Invalid admin ID</div>
  if (loading) return <div className="student-loading">Loading profile…</div>
  if (error) return <div className="student-error">{error}</div>

  return (
    <>
      <Navbar />

      <div className="profile-page container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{name || 'Administrator'}</h2>
            <div className="profile-specialization muted">Admin profile</div>
          </div>
        </div>

        <div className="profile-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="profile-display">
            <h4 className="admin-quick-title">Administrator Details</h4>

            <div className="profile-display-row">
              <label className="profile-display-label">ADMIN ID</label>
              <div className="profile-display-value">{adminId ?? '—'}</div>
            </div>

            {!isEditing ? (
              <>
                <div className="profile-display-row">
                  <label className="profile-display-label">NAME</label>
                  <div className="profile-display-value">{name ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">EMAIL</label>
                  <div className="profile-display-value">{email ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DATE OF BIRTH</label>
                  <div className="profile-display-value">{dob ?? '—'}</div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <div className="profile-field-grid">
                  <div className="profile-field full-width">
                    <label className="profile-label">NAME</label>
                    <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="profile-field full-width">
                    <label className="profile-label">DATE OF BIRTH</label>
                    <input className="profile-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                </div>

                <div className="profile-save-row">
                  <button type="submit" className="btn-save">Save</button>
                  <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                  {error && <div className="profile-error">{error}</div>}
                </div>
              </form>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Profile
