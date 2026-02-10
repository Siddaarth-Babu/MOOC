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
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [specialization, setSpecialization] = useState('')

  // Course list fetched from backend
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
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      // Fetch profile from backend
      const res = await fetch('http://127.0.0.1:8000/student/profile', { headers })
      
      if (!mounted) return
      
      if (res.ok) {
        const json = await res.json()
        const s = json
        setEmail(s.email_id || '')
        setName(s.name || '')
        setDob(s.dob || '')
        setCountry(s.country || '')
        setSkillLevel(s.skill_level || '')
        setSpecialization(s.specialization || '')
        
        setSavedProfile({
          name: s.name || '',
          dob: s.dob || '',
          country: s.country || '',
          skillLevel: s.skill_level || '',
          specialization: s.specialization || ''
        })
      } else {
        const errBody = await res.text().catch(() => null)
        throw new Error(`Failed to load profile (${res.status}): ${errBody || res.statusText}`)
      }

      // Fetch enrollments/courses
      const enrollRes = await fetch('http://127.0.0.1:8000/student/enrollments', { headers })
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json()
        if (enrollData.my_list) setEnrollments(enrollData.my_list)
      }
    } catch (err) {
      if (mounted) {
        setError(`Error: ${err.message}`)
      }
    } finally {
      if (mounted) setLoading(false)
    }
  }

  fetchProfile()
  return () => { mounted = false }
}, [])


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
    const payload = {
      name,
      dob,
      country,
      skill_level: skillLevel,
      specialization
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Not authenticated')
    }
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    const res = await fetch('http://127.0.0.1:8000/student/profile/update', {
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

    // Update saved profile with skill_level mapped back to skillLevel
    const newSnapshot = {
      name: payload.name,
      dob: payload.dob,
      country: payload.country,
      skillLevel: payload.skill_level,
      specialization: payload.specialization
    }
    setSavedProfile(newSnapshot)
    setName(newSnapshot.name)
    setDob(newSnapshot.dob)
    setCountry(newSnapshot.country)
    setSkillLevel(newSnapshot.skillLevel)
    setSpecialization(newSnapshot.specialization)
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
    setDob(savedProfile.dob ?? '')
    setCountry(savedProfile.country ?? '')
    setSkillLevel(savedProfile.skillLevel ?? '')
    setSpecialization(savedProfile.specialization ?? '')
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
                  <div className="profile-display-label">Date of Birth</div>
                  <div className="profile-display-value">{dob}</div>
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
                  <label className="profile-label">Date of Birth</label>
                  <input className="profile-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
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
          <h3>Enrolled Courses</h3>
          <div>
            <strong>Your Courses</strong>
            <ul className="profile-course-list">
              {enrollments.length === 0 ? (
                <li className="muted">No courses enrolled yet</li>
              ) : (
                enrollments.map((course) => {
                  const courseId = course.course_id || course.id
                  const courseName = course.course_name || course.name || course.title
                  return (
                    <li key={courseId}>
                      <a href={`/student/courses/${courseId}`} className="link-brand">{courseName} ({courseId})</a>
                    </li>
                  )
                })
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
