import React from 'react'

const features = [
  { icon: '📚', title: 'Diverse Courses', text: 'Access hundreds of courses across many disciplines.' },
  { icon: '🏫', title: 'Expert Instructors', text: 'Learn from industry professionals and educators.' },
  { icon: '📊', title: 'Progress Tracking', text: 'Monitor your learning journey with analytics.' },
  { icon: '🔒', title: 'Secure & Private', text: 'Your data is protected with industry best practices.' },
  { icon: '💻', title: 'Learn Anywhere', text: 'Access courses on any device at your own pace.' },
  { icon: '🎓', title: 'Certifications', text: 'Earn certificates to showcase your achievements.' },
]

const Features = () => (
  <section className="features" id="features">
    <div className="container">
      <h2 className="section-title">Why Choose MOOC?</h2>
      <div className="features-grid">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Features
