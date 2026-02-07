import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/*
 Profile page

 - Fetches student profile by `studentId` route param (email/core data comes from DB)
 - Displays: name, email (readonly), age, country, skillLevel, specialization, contactNumber
 - `enrollments` is left as an empty variable (fetched by DB in real app)
 - Minimal save handler that PUTs changes to `/api/students/:id`
 - Uses light-toned backgrounds inline for a clean look
*/

const Profile = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Profile fields
  const [email, setEmail] = useState('') // fetched and readonly
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [country, setCountry] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  // Course list left empty — backend should populate this
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`)
        if (!mounted) return

        if (res.ok) {
          const json = await res.json()
          // Map DB fields (ER diagram) to component state
          const s = json.student || json
          setEmail(s.email || '')
          setName(s.name || '')
          setAge(s.age ?? '')
          setCountry(s.country || '')
          setSkillLevel(s.skillLevel || '')
          setSpecialization(s.specialization || '')
          setContactNumber(s.contactNumber || '')

          // If backend returns enrollments, set them; otherwise keep empty array
          if (json.enrollments) setEnrollments(json.enrollments)
        } else {
          // fallback demo values when backend is unavailable
          setEmail('tinku2543m@gmail.com')
          setName('Sravan Maddipatla')
          setAge('22')
          setCountry('India')
          setSkillLevel('Intermediate')
          setSpecialization('Computer Networks')
          setContactNumber('+91-9876543210')
        }
      } catch (err) {
        // network issue — use light demo fallback
        setEmail('tinku2543m@gmail.com')
        setName('Sravan Maddipatla')
        setAge('22')
        setCountry('India')
        setSkillLevel('Intermediate')
        setSpecialization('Computer Networks')
        setContactNumber('+91-9876543210')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [studentId])

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        name,
        age,
        country,
        skillLevel,
        specialization,
        contactNumber
      }

      const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save')

      // optionally show feedback — here we navigate back to dashboard or refresh
      const updated = await res.json()
      // reflect server response if it returns updated record
      if (updated?.name) setName(updated.name)
      alert('Profile saved')
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading profile…</div>

  return (
    <div style={{ padding: 24, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
          {(name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{name}</h1>
          <div style={{ color: '#6b7280' }}>{specialization}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, marginTop: 20 }}>
        <form onSubmit={handleSave} style={{ background: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid #eef2f7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Email (fixed)</label>
              <input value={email} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #eef2f7', background: '#fbfdff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Age</label>
              <input value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Skill level</label>
              <input value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Specialization</label>
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Contact number</label>
              <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbe4ff' }} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" style={{ background: 'linear-gradient(135deg,var(--brand-1),var(--brand-2))', color: 'white', padding: '0.6rem 1rem', borderRadius: 8, border: 'none', fontWeight: 700 }}>Save profile</button>
            {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
          </div>
        </form>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid #eef2f7' }}>
          <h3 style={{ marginTop: 0 }}>Course details</h3>
          <div style={{ marginTop: 8 }}>
            <strong>Course profiles</strong>
            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
              {enrollments.length === 0 ? (
                <li style={{ color: '#6b7280' }}>No courses yet (will be fetched from database)</li>
              ) : (
                enrollments.map((enr) => (
                  <li key={enr.courseId} style={{ marginBottom: 8 }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/courses/${encodeURIComponent(enr.courseId)}`, { state: { courseData: enr.courseDetails } }) }} style={{ color: 'var(--brand-1)' }}>{enr.courseName} ({enr.courseId})</a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
