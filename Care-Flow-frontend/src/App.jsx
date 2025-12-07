import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import MainHome from './MainHome'
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import Registerhospital from './Hospital/Registerhospital'
import HospitalLogin from './Hospital/HospitalLogin'
import DashboardHospital from './Hospital/DashboardHospital'
import DoctorLogin from './Doctor/DoctorLogin'
import DoctorDashboard from './Doctor/DoctorDashboard'
import UserRegister from './User/UserRegister'
import UserLogin from './User/UserLogin'
import UserDashboard from './User/UserDashboard'
import CombineLogin from './CombineLogin'
import SignupOptions from './SignupOptions'
import BookAppointment from './User/BookAppointment'
import PrescriptionManager from './Doctor/Prescriptionmanager'
import ProtectedRoute from "./ProtectedRoute"

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          
          {/* Public */}
          <Route path="/" element={<MainHome />} />
          <Route path="/LoginOptions" element={<CombineLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hospitallogin" element={<HospitalLogin />} />
          <Route path="/doclogin" element={<DoctorLogin />} />
          <Route path="/userLogin" element={<UserLogin />} />
          <Route path="/SignupOptions" element={<SignupOptions />} />
          <Route path="/hospitaladd" element={<Registerhospital />} />
          <Route path='/userResister' element={<UserRegister />} />

          {/* Admin Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Hospital Protected */}
          <Route
            path="/DashboardHos"
            element={
              <ProtectedRoute role="Hospital">
                <DashboardHospital />
              </ProtectedRoute>
            }
          />

          {/* Doctor Protected */}
          <Route
            path="/docdash"
            element={
              <ProtectedRoute role="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Protected */}
          <Route
            path="/userDash"
            element={
              // <ProtectedRoute role="Patient">
                <UserDashboard />
              // </ProtectedRoute>
            }
          />

          {/* User must be logged in to book appointment */}
          <Route
            path="/Appointment"
            element={
              <ProtectedRoute role="Patient">
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          {/* Doctor protected page */}
          <Route
            path="/prescription"
            element={
              <ProtectedRoute role="Doctor">
                <PrescriptionManager />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
