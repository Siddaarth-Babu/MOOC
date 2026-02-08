const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// In-memory storage
const submissions = []
const students = [
  { id: 'student1', name: 'Student One', email: 'student1@example.com' }
]

// Create a submission
app.post('/api/submissions', (req, res) => {
  const { section, itemId, link, user } = req.body
  if (!section || !itemId || !link) {
    return res.status(400).json({ error: 'Missing required fields: section, itemId, link' })
  }
  const id = `sub_${Date.now()}`
  const submission = { id, section, itemId, link, user: user || 'anonymous', createdAt: new Date().toISOString() }
  submissions.push(submission)
  return res.json({ ok: true, submission })
})

// List submissions (filter by query params)
app.get('/api/submissions', (req, res) => {
  const { section, itemId, user } = req.query
  let results = submissions.slice().reverse()
  if (section) results = results.filter(s => s.section === section)
  if (itemId) results = results.filter(s => String(s.itemId) === String(itemId))
  if (user) results = results.filter(s => String(s.user) === String(user))
  return res.json({ ok: true, submissions: results })
})

// Get submissions for a single student
app.get('/api/submissions/student/:studentId', (req, res) => {
  const { studentId } = req.params
  const results = submissions.filter(s => String(s.user) === String(studentId))
  return res.json({ ok: true, submissions: results })
})

// Minimal student-course lookup used by instructor modal
app.get('/api/students/:studentId/courses/:courseId', (req, res) => {
  const { studentId, courseId } = req.params
  const student = students.find(s => s.id === studentId) || { id: studentId, name: `Student ${studentId}` }
  const studentCourseData = {
    id: student.id,
    name: student.name,
    course: { id: courseId, name: `Course ${courseId}` },
    sections: {},
    grades: { items: [] },
    submissions: submissions.filter(s => String(s.user) === String(studentId))
  }
  return res.json(studentCourseData)
})

app.get('/', (req, res) => res.send('MOOC Mock Server running'))

app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`))
