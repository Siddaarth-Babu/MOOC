import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Homepage/Home.jsx'
import Login from './pages/Auth/Login.jsx'
import Signup from './pages/Auth/Signup.jsx'
import StudentHome from './pages/student/Home.jsx'
import InstructorDashboard from './pages/instructor/Dashboard.jsx'
import AdminDashboard from './pages/administrator/Dashboard.jsx'
import CourseDetails from './pages/student/CourseDetails.jsx'
import CourseCard from './components/student/CourseCard.jsx'
import MyEnrollments from './pages/student/MyEnrollments.jsx'
import CoursePage from './components/student/CoursePage.jsx'
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
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/enrollments" element={<MyEnrollments />} />
        <Route path="/coursepage" element={<CoursePage />} />
      </Routes>
    </div>
  )
}

export default App
