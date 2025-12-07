import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MainHome = () => {
  const navigate = useNavigate()
  const handleDashboardAdmin=()=>{
    navigate('/admin')
  }
  const handleDashboardoctor=()=>{
    navigate('/docdash')
  }
  const handleDashboardhospital=()=>{
    navigate('/DashboardHos')
  }
  const handleDashboarduser=()=>{
    navigate('/userDash')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      
      {/* Navigation Bar */}
     

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Complete Hospital Management
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline hospital operations, manage staff, track patients, and deliver better healthcare with our comprehensive management system.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          
          {/* Admin Card */}
          <div onClick={handleDashboardAdmin} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Admin Portal</h3>
            <p className="text-gray-600 mb-6">
              Manage system settings, approve hospitals, and oversee all operations
            </p>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Department Management
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Hospital Approvals
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                System Analytics
              </span>
            </div>
          </div>

          {/* Doctor Card */}
          <div onClick={handleDashboardoctor} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Doctor Portal</h3>
            <p className="text-gray-600 mb-6">
              Manage patients, appointments, and prescriptions efficiently
            </p>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Patient Records
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Appointments
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Prescriptions
              </span>
            </div>
          </div>

          {/* Hospital Card */}
          <div onClick={handleDashboardhospital} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-orange-500">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hospital Portal</h3>
            <p className="text-gray-600 mb-6">
              Manage staff, beds, wards, and hospital operations
            </p>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Staff Management
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Bed Allocation
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Ward Management
              </span>
            </div>
          </div>

          {/* User Card */}
          <div onClick={handleDashboarduser} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-cyan-500">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Portal</h3>
            <p className="text-gray-600 mb-6">
              Book appointments, view reports, and find doctors easily
            </p>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                Find Doctors
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                Book Appointments
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                View Reports
              </span>
            </div>
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-3xl shadow-2xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">2000+</div>
              <div className="text-gray-600">Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of healthcare professionals using our platform
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/SignupOptions" 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Create Account
            </Link>
            <Link 
              to="/LoginOptions" 
              className="px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transform hover:-translate-y-1 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediCare HMS</h3>
              <p className="text-gray-400">Complete hospital management solution</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/SignupOptions" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/LoginOptions" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/admin/login" className="hover:text-white">Admin</Link></li>
                <li><Link to="/doctor/login" className="hover:text-white">Doctor</Link></li>
                <li><Link to="/hospital/login" className="hover:text-white">Hospital</Link></li>
                <li><Link to="/user/login" className="hover:text-white">Patient</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">Email: info@medicare.com</p>
              <p className="text-gray-400">Phone: +1 234 567 8900</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare HMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MainHome;