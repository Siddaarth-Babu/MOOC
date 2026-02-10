import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Homepage/Home.jsx'
import Login from './pages/Auth/Login.jsx'
import Signup from './pages/Auth/Signup.jsx'

import StudentHome from './pages/student/Home.jsx'
import StudentContent from './pages/student/Content.jsx'
import InstructorDashboard from './pages/instructor/Home.jsx'
import InstructorContent from './pages/instructor/Content.jsx'
import AdminDashboard from './pages/administrator/Dashboard.jsx'
import ManageUsers from './pages/administrator/ManageUsers.jsx'
import ManageCoursesAdmin from './pages/administrator/ManageCourses.jsx'
import ProfileAdmin from './pages/administrator/Profile.jsx'

import CourseDetails from './pages/student/CourseDetails.jsx'
import CourseCard from './components/student/CourseCard.jsx'
import MyEnrollments from './pages/student/MyEnrollments.jsx'
import CoursePage from './components/student/CoursePage.jsx'
import Profile from './pages/student/Profile.jsx'

import CourseCard2 from './components/instructor/CourseCard.jsx'
import CourseDetails2 from './pages/instructor/CourseDetails.jsx'
import CoursePage2 from './components/instructor/CoursePage.jsx'
import MyTeaching from './pages/instructor/MyTeaching.jsx'
import ProfileInstructor from './pages/instructor/Profile.jsx'


import Dashboard2 from './pages/data_analyst/Dashboard.jsx'
import ProfileAnalyst from './pages/data_analyst/Profile.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/student" element={<StudentHome />} />
        <Route path="/student/content/:section/:itemId" element={<StudentContent />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/content/:section/:itemId" element={<InstructorContent />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/manage-courses" element={<ManageCoursesAdmin />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />

        <Route path="/courses" element={<CourseCard />} />
        <Route path="/student/enrollments/:id" element={<CourseDetails />} />
        <Route path="/student/enrollments" element={<MyEnrollments />} />
        <Route path="/coursepage" element={<CoursePage />} />
        <Route path="/student/profile" element={<Profile />} />
        
        <Route path="/coursecard" element={<CourseCard2 />} />
        <Route path="/instructor/teaching/:id" element={<CourseDetails2 />} />
        <Route path="/coursepage" element={<CoursePage2 />} />
        <Route path="/instructor/teaching" element={<MyTeaching />} />
        <Route path="/instructor/profile" element={<ProfileInstructor />} />

        <Route path="/analyst" element={<Dashboard2 />} />
        <Route path="/analyst/profile" element={<ProfileAnalyst />} />
      </Routes>
    </div>
  )
}

export default App
