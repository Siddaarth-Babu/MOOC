import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Homepage/Home.jsx'
import Login from './pages/Auth/Login.jsx'
import Signup from './pages/Auth/Signup.jsx'
import StudentHome from './pages/student/Home.jsx'
import InstructorDashboard from './pages/instructor/Dashboard.jsx'
import AdminDashboard from './pages/administrator/Dashboard.jsx'

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
      </Routes>
    </div>
  )
}

export default App
