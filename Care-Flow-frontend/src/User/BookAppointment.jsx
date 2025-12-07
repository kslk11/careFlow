import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookAppointment = ({ doctorId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    // For others
    familyMemberName: '',
    familyMemberAge: '',
    familyMemberGender: '',
    familyMemberRelation: '',
    familyMemberAddress: ''
  });

  const token = localStorage.getItem('UserToken');
  const userInfo = JSON.parse(localStorage.getItem('Userinfo'));

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
   if (doctorId) {
    fetchDoctorDetails();
    fetchUserDetails();
  }
  }, [doctorId]); 

  const fetchDoctorDetails = async () => {
    try {
      const res = await axios.get(`https://careflow-lsf5.onrender.com/api/doctor/getDoctor/${doctorId}`,config);
      setDoctor(res.data);
      console.log(res.data)
    } catch (error) {
        console.log("res.data")
      console.error('Error fetching doctor:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(
        `https://careflow-lsf5.onrender.com/api/user/getUser`, // ✅ Your endpoint is correct
        config
      );
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        isSelf
      };

      // Add family member details if not for self
      if (!isSelf) {
        appointmentData.familyMemberName = formData.familyMemberName;
        appointmentData.familyMemberAge = parseInt(formData.familyMemberAge);
        appointmentData.familyMemberGender = formData.familyMemberGender;
        appointmentData.familyMemberRelation = formData.familyMemberRelation;
        appointmentData.familyMemberAddress = formData.familyMemberAddress;
      }

      const res = await axios.post(
        'https://careflow-lsf5.onrender.com/api/appointment/create',
        appointmentData,
        config
      );

      alert('Appointment booked successfully! Waiting for doctor approval.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Doctor Info */}
        {doctor && (
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-cyan-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {doctor.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.name}</h3>
                <p className="text-cyan-600 font-semibold">{doctor.specialization}</p>
                <p className="text-sm text-gray-600">{doctor.qualification}</p>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  Consultation Fee: ₹{doctor.consultationFee}
                </p>  
                <p className="text-sm text-gray-600 mt-1">
  <span className="font-semibold">Available Days:</span> {doctor.availableDays?.join(", ")}
</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking For */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Booking Appointment For:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-cyan-50 transition-colors flex-1">
                <input
                  type="radio"
                  checked={isSelf}
                  onChange={() => setIsSelf(true)}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-gray-700">For Self</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-cyan-50 transition-colors flex-1">
                <input
                  type="radio"
                  checked={!isSelf}
                  onChange={() => setIsSelf(false)}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-gray-700">Others</span>
              </label>
            </div>
          </div>

          {/* Patient Details */}
          {isSelf ? (
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-gray-800 mb-3">Your Details:</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Name:</span> {user?.name}</p>
                <p><span className="font-semibold">Email:</span> {user?.email}</p>
                <p><span className="font-semibold">Phone:</span> {user?.phone}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Family Member Details:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="familyMemberName"
                    value={formData.familyMemberName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={!isSelf}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="familyMemberAge"
                    value={formData.familyMemberAge}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={!isSelf}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="familyMemberGender"
                    value={formData.familyMemberGender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={!isSelf}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relation *
                  </label>
                  <input
                    type="text"
                    name="familyMemberRelation"
                    value={formData.familyMemberRelation}
                    onChange={handleChange}
                    placeholder="e.g., Father, Mother, Son"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={!isSelf}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="familyMemberAddress"
                    value={formData.familyMemberAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={!isSelf}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Appointment Details:</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Time *
                </label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your symptoms or reason for consultation..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;