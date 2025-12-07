import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Hospital Management System</h1>

      {/* Admin Section */}
      <section className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Admin</h2>
        <p>Pre-seeded admin can login to manage the system.</p>
        <ul className="list-disc ml-6">
          <li>Manage Departments</li>
          <li>Approve/Reject Hospitals</li>
          <li>View Users and Doctors</li>
        </ul>
        <Link to="  login" className="text-blue-500 mt-2 inline-block">
          Admin Login
        </Link>
      </section>

      {/* Hospital Section */}
      <section className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Hospital</h2>
        <p>Hospitals can register and manage doctors after admin approval.</p>
        <ul className="list-disc ml-6">
          <li>Register Hospital</li>
          <li>Update Profile</li>
          <li>Manage Doctors</li>
        </ul>
        <div className="mt-2">
          <Link to="/hospitaladd" className="text-blue-500 mr-4">Register</Link>
          <Link to="/hospitallogin" className="text-blue-500">Login</Link>
        </div>
      </section>

      {/* Doctor Section */}
      <section className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Doctor</h2>
        <p>Doctors can login to see appointments and manage their profile.</p>
        <ul className="list-disc ml-6">
          <li>Register / Assigned to Hospital</li>
          <li>View Appointments</li>
          <li>Update Profile</li>
        </ul>
        <Link to="/docLogin" className="text-blue-500 mt-2 inline-block">
          Doctor Login
        </Link>
      </section>

      {/* User Section */}
      <section className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">User / Patient</h2>
        <p>Users can register, login, and book appointments.</p>
        <ul className="list-disc ml-6">
          <li>Register / Login</li>
          <li>Browse Hospitals and Doctors</li>
          <li>Book Appointments</li>
          <li>View Appointment History</li>
        </ul>
        <div className="mt-2">
          <Link to="/userResister" className="text-blue-500 mr-4">Register</Link>
          <Link to="/userLogin" className="text-blue-500">Login</Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
