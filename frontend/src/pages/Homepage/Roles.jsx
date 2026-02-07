import React from 'react'

const Roles = () => (
  <section className="roles" id="roles">
    <div className="container">
      <h2 className="section-title">Platform Roles</h2>
      <div className="roles-grid">
        <div className="role-card">
          <h3>👨‍🎓 Students</h3>
          <ul>
            <li>Enroll in courses</li>
            <li>Access learning materials</li>
            <li>Track progress</li>
            <li>Earn certificates</li>
          </ul>
        </div>
        <div className="role-card">
          <h3>👨‍🏫 Instructors</h3>
          <ul>
            <li>Create courses</li>
            <li>Manage content</li>
            <li>Grade assignments</li>
            <li>Communicate with students</li>
          </ul>
        </div>
        <div className="role-card">
          <h3>👨‍💼 Administrators</h3>
          <ul>
            <li>User management</li>
            <li>Course oversight</li>
            <li>System operations</li>
            <li>Quality assurance</li>
          </ul>
        </div>
        <div className="role-card">
          <h3>📈 Data Analysts</h3>
          <ul>
            <li>Learning analytics</li>
            <li>Usage statistics</li>
            <li>Performance metrics</li>
            <li>Report generation</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
)

export default Roles
