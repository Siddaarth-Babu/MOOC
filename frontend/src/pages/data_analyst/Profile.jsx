import React, { useEffect, useState } from 'react'
import Navbar from '../../components/data_analyst/Navbar'
import Footer from '../../components/data_analyst/Footer'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [dob, setDob] = useState('')
  const [savedProfile, setSavedProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    // TODO: Uncomment below to fetch from backend using analyst ID
    // const token = localStorage.getItem('token')
    // const headers = token ? { Authorization: `Bearer ${token}` } : {}
    // let analystId = localStorage.getItem('analyst_id')
    // if (!analystId) {
    //   // Try to get from user object in localStorage
    //   const raw = localStorage.getItem('user')
    //   const parsed = raw ? JSON.parse(raw) : null
    //   analystId = parsed?.analyst_id
    // }
    // if (analystId) {
    //   fetch(`/analyst/${analystId}`, { headers })
    //     .then(async (res) => {
    //       if (!res.ok) throw new Error('Failed to fetch analyst profile')
    //       return res.json()
    //     })
    //     .then((data) => {
    //       if (!mounted) return
    //       setUser(data)
    //       setLoading(false)
    //     })
    //     .catch((err) => {
    //       if (!mounted) return
    //       console.error(err)
    //       // Fallback to localStorage
    //       const raw = localStorage.getItem('user')
    //       const parsed = raw ? JSON.parse(raw) : null
    //       setUser(parsed)
    //       setLoading(false)
    //     })
    // } else {
    //   // No analyst ID found, fallback to localStorage
    //   const raw = localStorage.getItem('user')
    //   const parsed = raw ? JSON.parse(raw) : null
    //   setUser(parsed)
    //   setLoading(false)
    // }

    // Demo: Load from localStorage
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    if (mounted) {
      setUser(parsed)
      setLoading(false)
    }

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // initialize editable fields from `user` when loaded
    if (user) {
      const initialName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || ''
      setName(initialName)
      setContact(user.contact || user.phone || '')
      setDob(user.dob || user.dateOfBirth || '')
      setSavedProfile({ name: initialName, contact: user.contact || user.phone || '', dob: user.dob || user.dateOfBirth || '' })
    }
  }, [user])

  const initials = (() => {
    if (!user) return 'D'
    if (user.firstName) return `${user.firstName[0] || ''}${user.lastName ? user.lastName[0] : ''}`
    if (user.name) return user.name.split(' ').map(n => n[0]).slice(0,2).join('')
    return (user.email || 'D')[0]
  })()

  const handleCancel = () => {
    if (savedProfile) {
      setName(savedProfile.name || '')
      setContact(savedProfile.contact || '')
      setDob(savedProfile.dob || '')
    }
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    const [firstName, ...rest] = (name || '').trim().split(' ')
    const lastName = rest.length ? rest.join(' ') : ''

    const payload = {
      firstName: firstName || null,
      lastName: lastName || null,
      contact: contact || null,
      dob: dob || null
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const analystId = user?.analyst_id

      // TODO: Uncomment below to send to backend using analyst ID
      // const res = await fetch(`/analyst/${analystId}`, {
      //   method: 'PUT',
      //   headers,
      //   body: JSON.stringify(payload)
      // })
      //
      // if (!res.ok) {
      //   const text = await res.text().catch(() => '')
      //   throw new Error(text || `Server returned ${res.status}`)
      // }
      //
      // const updated = await res.json().catch(() => null)

      // Demo: Update localStorage only
      const newUser = { ...user }
      if (payload.firstName) newUser.firstName = payload.firstName
      if (payload.lastName) newUser.lastName = payload.lastName
      newUser.contact = payload.contact
      newUser.dob = payload.dob
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      setSavedProfile({ name, contact, dob })
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  return (
    <>
      <Navbar />

      <div className="profile-page container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'Data Analyst'}</h2>
            <div className="profile-specialization muted">Data Analyst profile</div>
          </div>
        </div>

        <div className="profile-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="profile-display">
            <h4 className="admin-quick-title">Analyst Details</h4>

            <div className="profile-display-row">
              <label className="profile-display-label">ANALYST ID</label>
              <div className="profile-display-value">{user?.analyst_id ?? user?.id ?? '—'}</div>
            </div>

            {!isEditing ? (
              <>
                <div className="profile-display-row">
                  <label className="profile-display-label">NAME</label>
                  <div className="profile-display-value">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">EMAIL</label>
                  <div className="profile-display-value">{user?.email ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">CONTACT</label>
                  <div className="profile-display-value">{user?.contact ?? user?.phone ?? '—'}</div>
                </div>

                <div className="profile-display-row">
                  <label className="profile-display-label">DATE OF BIRTH</label>
                  <div className="profile-display-value">{user?.dob ?? user?.dateOfBirth ?? '—'}</div>
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
                    <label className="profile-label">CONTACT</label>
                    <input className="profile-input" value={contact} onChange={(e) => setContact(e.target.value)} />
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
