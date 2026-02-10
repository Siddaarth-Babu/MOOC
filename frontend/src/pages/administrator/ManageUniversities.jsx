import React, { useEffect, useState } from 'react'

const ManageUniversities = () => {
  const [universities, setUniversities] = useState([])
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem('access_token')
    if (!token) return
    const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://127.0.0.1:8000/admin/universities', { headers })
        const data = await res.json()
        if (!mounted) return
        setUniversities(data.universities || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load universities')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    const token = localStorage.getItem('access_token')
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    try {
      const res = await fetch('http://127.0.0.1:8000/admin/university/new_university', {
        method: 'POST', headers, body: JSON.stringify({ name, city, country })
      })
      if (!res.ok) throw new Error(await res.text())
      alert('University created')
      window.location.reload()
    } catch (err) {
      console.error(err)
      setError('Create failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete university and associated courses?')) return
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/universities/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      alert('Deleted')
      setUniversities(prev => prev.filter(u => u.institute_id !== id))
    } catch (err) {
      console.error(err)
      setError('Delete failed')
    }
  }

  return (
    <div className="admin-manage-universities container">
      <h2>Manage Universities</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <form className="admin-form" onSubmit={handleCreate}>
        <div className="form-row-2">
          <input className="form-input" placeholder="University name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="form-input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div style={{marginTop:8}}>
          <input className="form-input" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
        </div>
        <div style={{marginTop:8}}>
          <button className="auth-submit-btn" type="submit">Add University</button>
        </div>
      </form>

      <section style={{marginTop:20}}>
        <h3>Existing Universities</h3>
        {loading ? <p className="muted">Loading…</p> : (
          <ul className="admin-univ-list">
            {universities.map(u => (
              <li key={u.institute_id} className="admin-univ-item">
                <div>
                  <strong>{u.name}</strong>
                  <div className="muted">{u.city}, {u.country}</div>
                </div>
                <div>
                  <button className="btn" onClick={() => handleDelete(u.institute_id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ManageUniversities
