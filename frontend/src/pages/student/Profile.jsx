import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'

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
  const [isEditing, setIsEditing] = useState(false)
  const [savedProfile, setSavedProfile] = useState(null)

 // inside component

useEffect(() => {
  let mounted = true

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
        headers: {
          'Accept': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // uncomment if required
        }
      })

      if (!mounted) return

      if (res.ok) {
        const json = await res.json()
        const s = json.student || json
        setEmail(s.email || '')
        setName(s.name || '')
        setAge(s.age ?? '')
        setCountry(s.country || '')
        setSkillLevel(s.skillLevel || '')
        setSpecialization(s.specialization || '')
        setContactNumber(s.contactNumber || '')

        // snapshot current saved profile for Cancel
        setSavedProfile({
          name: s.name || '',
          age: s.age ?? '',
          country: s.country || '',
          skillLevel: s.skillLevel || '',
          specialization: s.specialization || '',
          contactNumber: s.contactNumber || ''
        })

        if (json.enrollments) setEnrollments(json.enrollments)
      } else {
        // try to read error message for debugging
        const errBody = await res.text().catch(() => null)
        setError(`Failed to load profile (${res.status}): ${errBody || res.statusText}`)
        // fallback demo values (as before)
        const fallback = {
          name: 'Sravan Maddipatla',
          age: '22',
          country: 'India',
          skillLevel: 'Intermediate',
          specialization: 'Computer Networks',
          contactNumber: '+91-9876543210'
        }
        setEmail('tinku2543m@gmail.com')
        setName(fallback.name)
        setAge(fallback.age)
        setCountry(fallback.country)
        setSkillLevel(fallback.skillLevel)
        setSpecialization(fallback.specialization)
        setContactNumber(fallback.contactNumber)
        setSavedProfile(fallback)
      }
    } catch (err) {
      // network issue
      setError(`Network error: ${err.message}`)
      const fallback = {
        name: 'Sravan Maddipatla',
        age: '22',
        country: 'India',
        skillLevel: 'Intermediate',
        specialization: 'Computer Networks',
        contactNumber: '+91-9876543210'
      }
      setEmail('tinku2543m@gmail.com')
      setName(fallback.name)
      setAge(fallback.age)
      setCountry(fallback.country)
      setSkillLevel(fallback.skillLevel)
      setSpecialization(fallback.specialization)
      setContactNumber(fallback.contactNumber)
      setSavedProfile(fallback)
    } finally {
      if (mounted) setLoading(false)
    }
  }

  fetchProfile()
  return () => { mounted = false }
}, [studentId])


// Improved handleSave
const handleSave = async (e) => {
  e.preventDefault()
  setError(null)

  // client-side validation: make sure skillLevel is one of allowed values
  const allowedSkillLevels = ['Beginner','Intermediate','Advanced','beginner','intermediate','advanced']
  if (skillLevel && !allowedSkillLevels.includes(skillLevel)) {
    setError('Invalid skill level. Use Beginner / Intermediate / Advanced')
    return
  }

  try {
    // convert age to number if possible
    const ageVal = age === '' ? null : Number(age)
    const payload = {
      name,
      age: ageVal,
      country,
      skillLevel,
      specialization,
      contactNumber
    }

    // choose method PATCH vs PUT per your API design
    const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
      method: 'PUT', // or 'PATCH' if your server expects partial updates
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // add if needed
      },
      body: JSON.stringify(payload)
    })

    // read body (works for ok or not ok)
    const text = await res.text()
    let body = null
    try { body = JSON.parse(text) } catch (_) { body = text }

    if (!res.ok) {
      // prefer server-sent message if present
      const message = body?.message || body?.error || (typeof body === 'string' ? body : null) || `Server returned ${res.status}`
      throw new Error(message)
    }

    // success — server returned updated model
    const updated = body || payload
    const newSnapshot = {
      name: updated.name ?? name,
      age: updated.age ?? age,
      country: updated.country ?? country,
      skillLevel: updated.skillLevel ?? skillLevel,
      specialization: updated.specialization ?? specialization,
      contactNumber: updated.contactNumber ?? contactNumber
    }
    setSavedProfile(newSnapshot)
    setName(newSnapshot.name)
    setAge(newSnapshot.age)
    setCountry(newSnapshot.country)
    setSkillLevel(newSnapshot.skillLevel)
    setSpecialization(newSnapshot.specialization)
    setContactNumber(newSnapshot.contactNumber)
    setIsEditing(false)
    alert('Profile saved')
  } catch (err) {
    setError(err.message || 'Save failed')
  }
}

// Revert to last saved snapshot and leave edit mode
const handleCancel = () => {
  if (savedProfile) {
    setName(savedProfile.name ?? '')
    setAge(savedProfile.age ?? '')
    setCountry(savedProfile.country ?? '')
    setSkillLevel(savedProfile.skillLevel ?? '')
    setSpecialization(savedProfile.specialization ?? '')
    setContactNumber(savedProfile.contactNumber ?? '')
  }
  setError(null)
  setIsEditing(false)
}

  if (loading) return <div className="student-loading">Loading profile…</div>

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-header">
        <div className="profile-avatar">{(name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</div>
        <div>
          <h1 className="profile-name">{name}</h1>
          <div className="profile-specialization">{specialization}</div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-form">
          {!isEditing ? (
            <div className="profile-display">
              <div className="profile-display-row">
                <div>
                  <div className="profile-display-label">Name</div>
                  <div className="profile-display-value">{name}</div>
                </div>
                <div>
                  <div className="profile-display-label">Email (fixed)</div>
                  <div className="profile-display-value">{email}</div>
                </div>
              </div>

              <div className="profile-display-row">
                <div>
                  <div className="profile-display-label">Age</div>
                  <div className="profile-display-value">{age}</div>
                </div>
                <div>
                  <div className="profile-display-label">Country</div>
                  <div className="profile-display-value">{country}</div>
                </div>
              </div>

              <div className="profile-display-row">
                <div>
                  <div className="profile-display-label">Skill level</div>
                  <div className="profile-display-value">{skillLevel}</div>
                </div>
                <div>
                  <div className="profile-display-label">Specialization</div>
                  <div className="profile-display-value">{specialization}</div>
                </div>
              </div>

              <div style={{marginTop:8}}>
                <div className="profile-display-label">Contact number</div>
                <div className="profile-display-value">{contactNumber}</div>
              </div>

              <div className="profile-save-row">
                <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>Edit profile</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="profile-field-grid">
                <div className="profile-field">
                  <label className="profile-label">Name</label>
                  <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Email (fixed)</label>
                  <input className="profile-input readonly" value={email} readOnly />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Age</label>
                  <input className="profile-input" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Country</label>
                  <input className="profile-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>

                <div className="profile-field">
                <label className="profile-label">Skill level</label>
                <select
                    className="profile-input"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>


                <div className="profile-field">
                  <label className="profile-label">Specialization</label>
                  <input className="profile-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>

                <div className="profile-field full-width">
                  <label className="profile-label">Contact number</label>
                  <input className="profile-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
              </div>

              <div className="profile-save-row">
                <button type="submit" className="btn-save">Save profile</button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                {error && <div className="profile-error">{error}</div>}
              </div>
            </form>
          )}
        </div>

        <aside className="profile-sidebar">
          <h3>Course details</h3>
          <div>
            <strong>Course profiles</strong>
            <ul className="profile-course-list">
              {enrollments.length === 0 ? (
                <li className="muted">No courses yet (will be fetched from database)</li>
              ) : (
                enrollments.map((enr) => (
                  <li key={enr.courseId}>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/courses/${encodeURIComponent(enr.courseId)}`, { state: { courseData: enr.courseDetails } }) }} className="link-brand">{enr.courseName} ({enr.courseId})</a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  )
}

export default Profile
