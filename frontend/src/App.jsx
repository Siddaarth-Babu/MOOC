import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Homepage/Home.jsx'
import Login from './pages/Auth/Login.jsx'
import Signup from './pages/Auth/Signup.jsx'

import StudentHome from './pages/student/Home.jsx'
import InstructorDashboard from './pages/instructor/Home.jsx'
import AdminDashboard from './pages/administrator/Dashboard.jsx'

import CourseDetails from './pages/student/CourseDetails.jsx'
import CourseCard from './components/student/CourseCard.jsx'
import MyEnrollments from './pages/student/MyEnrollments.jsx'
import CoursePage from './components/student/CoursePage.jsx'
import Profile from './pages/student/Profile.jsx'

import CourseCard2 from './components/instructor/CourseCard.jsx'
import CourseDetails2 from './pages/instructor/CourseDetails.jsx'
import CoursePage2 from './components/instructor/CoursePage.jsx'
import MyTeaching from './pages/instructor/MyTeaching.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/student" element={<StudentHome />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/courses" element={<CourseCard />} />
        <Route path="/student/enrollments/:id" element={<CourseDetails />} />
        <Route path="/student/enrollments" element={<MyEnrollments />} />
        <Route path="/coursepage" element={<CoursePage />} />
        <Route path="/student/profile" element={<Profile />} />
        
        <Route path="/coursecard" element={<CourseCard2 />} />
        <Route path="/instructor/teaching/:id" element={<CourseDetails2 />} />
        <Route path="/coursepage" element={<CoursePage2 />} />
        <Route path="/instructor/teaching" element={<MyTeaching />} />
      </Routes>
    </div>
  )
}

export default App
