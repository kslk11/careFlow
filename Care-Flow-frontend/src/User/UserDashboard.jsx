// UserDashboard_Part1.jsx - Imports, State Management, Helper Functions & Fetch Functions

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookAppointment from "./BookAppointment";
// Add these imports
import StarRating from '../components/reviews/StarRating';
import RatingModal from '../components/reviews/RatingModal';
import ReviewsList from '../components/reviews/ReviewsList';
import RatingDisplay from '../components/reviews/RatingDisplay';
// Add these new imports for chatbot
import ChatBot from '../components/chatbot/ChatBot';
import ChatBotButton from '../components/chatbot/ChatBotButton';
import RazorpayPayment from '../components/payment/RazorpayPayment';
// ==================== HELPER FUNCTIONS ====================
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  return timeString;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const UserDashboard = () => {
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  // Core States
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [bills, setBills] = useState([]); // NEW: Separate bills state
  const [activePage, setActivePage] = useState("hospitals");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myReviews, setMyReviews] = useState({ doctorReviews: [], hospitalReviews: [] });
  const [loadingReviews, setLoadingReviews] = useState(false);
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);
// Add these states in UserDashboard component
const [showDoctorRatingModal, setShowDoctorRatingModal] = useState(false);
const [showHospitalRatingModal, setShowHospitalRatingModal] = useState(false);
const [selectedDoctorForRating, setSelectedDoctorForRating] = useState(null);
const [selectedHospitalForRating, setSelectedHospitalForRating] = useState(null);
const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState(null);
const [selectedReferralForRating, setSelectedReferralForRating] = useState(null);
  // ==================== CHATBOT STATES ====================
const [isChatBotOpen, setIsChatBotOpen] = useState(false);
const [chatBotUnreadCount, setChatBotUnreadCount] = useState(0);
// Profile States

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Appointment States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Referral States
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showReferralDetailsModal, setShowReferralDetailsModal] = useState(false);

  // Bill & Payment States
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState("full"); // full, partial
  const [emiOption, setEmiOption] = useState(null); // 2 or 3
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Auth
  const token = localStorage.getItem("UserToken");
  const userInfo = JSON.parse(localStorage.getItem("Userinfo"));

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // ==================== DARK MODE SETUP ====================
  useEffect(() => {
    const savedTheme = localStorage.getItem("userTheme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("userTheme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Theme Classes
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgSecondary = darkMode ? "bg-gray-800" : "bg-white";
  const bgTertiary = darkMode ? "bg-gray-700" : "bg-gray-100";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // ==================== EFFECTS ====================
  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    fetchHospitals();
    fetchProfile();
    fetchAppointments();
    fetchReferrals();
    fetchBills(); // NEW: Fetch bills separately
    fetchMyReviews()
  }, []);

  // Prepare user data for chatbot
const getChatBotUserData = () => {
  return {
    name: profile?.name || 'there',
    appointments: appointments || [],
    bills: bills || [],
    hospitals: hospitals|| [],
    doctors: appointments?.doctorId ?? [],
    referrals: referrals || [],
    profile: profile || {}
  };
};
// console.log(bills)
// console.log(hospitals)
// console.log(referrals)
// Handle chatbot actions
const handleChatBotAction = (actionType, actionData) => {
  console.log('ChatBot Action:', actionType, actionData);

  switch (actionType) {
    case 'navigate':
      // Navigate to different pages
      setActivePage(actionData);
      setIsChatBotOpen(false);
      break;

    case 'cancelAppointment':
      // Cancel appointment
      if (actionData?._id) {
        handleCancelAppointment(actionData._id);
      }
      break;

    case 'bookAppointment':
      // Open booking modal
      setActivePage('hospitals');
      setIsChatBotOpen(false);
      break;

    case 'payBill':
      // Navigate to bills page
      setActivePage('bills');
      setIsChatBotOpen(false);
      break;

    case 'viewDoctor':
      // Navigate to hospitals/doctors
      setActivePage('hospitals');
      setIsChatBotOpen(false);
      break;

    case 'viewHospital':
      // Navigate to hospitals
      setActivePage('hospitals');
      setIsChatBotOpen(false);
      break;

    default:
      console.log('Unknown action:', actionType);
  }
};

// Toggle chatbot
const toggleChatBot = () => {
  setIsChatBotOpen(!isChatBotOpen);
  if (!isChatBotOpen) {
    setChatBotUnreadCount(0); // Clear unread count when opening
  }
};
  // ==================== FETCH FUNCTIONS ====================
  const fetchHospitals = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/hospital/approved");
      setHospitals(res.data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchHospitalDoctors = async (hospitalId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/hospital/getdoctorsparams/${hospitalId}`
      );
      setHospitalDoctors(res.data);
      setSelectedHospital(hospitals.find((h) => h._id === hospitalId));
      setActivePage("doctors");
    } catch (error) {
      console.error("Error fetching hospital doctors:", error);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };
const fetchMyReviews = async () => {
  setLoadingReviews(true);
  try {
    const response = await axios.get('http://localhost:8000/api/review/user/mine', config);
    setMyReviews(response.data.data || { doctorReviews: [], hospitalReviews: [] });
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    setMyReviews({ doctorReviews: [], hospitalReviews: [] });
  } finally {
    setLoadingReviews(false);
  }
};
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/user/getUser", config);
      setProfile(res.data);
      setProfileForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        dateOfBirth: res.data.dateOfBirth?.split("T")[0] || "",
        gender: res.data.gender || "",
        bloodGroup: res.data.bloodGroup || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/appointment/user", config);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/refer/user", config);
      setReferrals(res.data);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  // NEW: Fetch Bills Function
  const fetchBills = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/bill/user", config);
      console.log("hello")
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };
// console.log(bills)
  // ==================== PROFILE FUNCTIONS ====================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:8000/api/user/profile", profileForm, config);
      setProfile(res.data);
      localStorage.setItem("Userinfo", JSON.stringify({ ...userInfo, user: res.data }));
      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:8000/api/user/resetpassword",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        config
      );
      alert("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("UserToken");
    localStorage.removeItem("Userinfo");
    navigate("/");
  };

  // ==================== APPOINTMENT FUNCTIONS ====================
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    try {
      await axios.patch(
        `http://localhost:8000/api/appointment/cancel/${appointmentId}`,
        {},
        config
      );
      alert("Appointment cancelled successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // ==================== PAYMENT FUNCTIONS ====================
  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    const totalAmount = bill.totalAmount || 0;
    setPaymentAmount(totalAmount);
    setPaymentType("full");
    setEmiOption(null);
    setShowPaymentModal(true);
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    const totalAmount = selectedBill.totalAmount || 0;
    const amountPaid = selectedBill.amountPaid || 0;
    const remainingAmount = totalAmount - amountPaid;
    
    if (type === "full") {
      setPaymentAmount(remainingAmount);
      setEmiOption(null);
    } else {
      setEmiOption(2); // Default to 2 EMI
      setPaymentAmount(remainingAmount / 2);
    }
  };

  const handleEmiChange = (emi) => {
    setEmiOption(emi);
    const totalAmount = selectedBill.totalAmount || 0;
    const amountPaid = selectedBill.amountPaid || 0;
    const remainingAmount = totalAmount - amountPaid;
    setPaymentAmount(remainingAmount / emi);
  };

  const handleProcessPayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setProcessingPayment(true);
    try {
      const paymentData = {
        amount: paymentAmount,
        paymentMethod: paymentMethod,
        transactionId: `TXN${Date.now()}`,
        paymentType: paymentType,
        emiOption: paymentType === "partial" ? emiOption : null
      };

      await axios.post(
        `http://localhost:8000/api/bill/payment/${selectedBill._id}`,
        paymentData,
        config
      );

      alert(`Payment of ₹${paymentAmount.toLocaleString()} processed successfully!`);
      setShowPaymentModal(false);
      setShowBillDetailsModal(false);
      fetchBills(); // Refresh bills
      fetchReferrals(); // Refresh referrals
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  // ==================== FILTER FUNCTIONS ====================
  const getUniqueDepartments = () => {
    const departments = new Set();
    hospitals.forEach((hospital) => {
      hospital.departments?.forEach((dept) => departments.add(dept));
    });
    return Array.from(departments);
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" ||
      hospital.departments?.includes(filterDepartment);

    return matchesSearch && matchesDepartment;
  });

  const filteredDoctors = hospitalDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // UserDashboard_Part2.jsx - Render Hospitals, Doctors, Appointments & Referrals

  // ==================== RENDER HOSPITALS (ENHANCED) ====================
  const renderHospitals = () => (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className={`${bgSecondary} rounded-2xl shadow-xl p-8 border ${borderColor} bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Discover Healthcare Excellence
            </h2>
            <p className="text-cyan-100 text-lg">Find the perfect hospital for your healthcare needs</p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-20 h-20 text-cyan-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-cyan-900 text-sm font-semibold">Total Hospitals</p>
            <p className="text-3xl font-bold text-cyan-700 mt-1">{hospitals.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-cyan-900 text-sm font-semibold">Departments</p>
            <p className="text-3xl font-bold text-cyan-700 mt-1">{getUniqueDepartments().length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-cyan-900 text-sm font-semibold">Available Now</p>
            <p className="text-3xl font-bold text-cyan-700 mt-1">{filteredHospitals.length}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className={`${bgSecondary} rounded-xl shadow-lg p-6 border ${borderColor}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold ${textPrimary} mb-2 flex items-center`}>
              <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Hospitals
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, location, or specialty..."
                className={`w-full pl-12 pr-4 py-3 border-2 ${borderColor} rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} transition-all`}
              />
              <svg
                className="w-6 h-6 text-gray-400 absolute left-4 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold ${textPrimary} mb-2 flex items-center`}>
              <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={`w-full px-4 py-3 border-2 ${borderColor} rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="all">🏥 All Departments</option>
              {getUniqueDepartments().map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.length === 0 ? (
          <div className={`col-span-full ${bgSecondary} rounded-xl p-12 text-center border ${borderColor}`}>
            <svg
              className="w-20 h-20 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className={`${textPrimary} text-lg font-semibold`}>No hospitals found</p>
            <p className={textSecondary}>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => (
            <div
              key={hospital._id}
              className={`${bgSecondary} rounded-2xl shadow-lg border ${borderColor} overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Enhanced Hospital Header with Gradient */}
              <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{hospital.name}</h3>
                    <div className="flex items-center space-x-2">
            <StarRating 
              rating={hospital.ratings?.average || 0} 
              size="sm"
            />
            {hospital.ratings?.count > 0 && (
              <span className="text-xs text-white font-semibold">
                {hospital.ratings.average.toFixed(1)} ({hospital.ratings.count})
              </span>
            )}
          </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3 text-sm">
                  <svg className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={textSecondary}>{hospital.address}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className={textSecondary}>{hospital.phone}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className={textSecondary}>{hospital.email}</span>
                </div>

                {hospital.website && (
                  <div className="flex items-center space-x-3 text-sm">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline hover:text-cyan-700 font-medium">
                      Visit Website
                    </a>
                  </div>
                )}

                {hospital.departments && hospital.departments.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      SPECIALTIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.departments.slice(0, 4).map((dept, index) => (
                        <span key={index} className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 text-cyan-800 dark:text-cyan-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                          {dept}
                        </span>
                      ))}
                      {hospital.departments.length > 4 && (
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                          +{hospital.departments.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => fetchHospitalDoctors(hospital._id)}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Doctors</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ==================== RENDER DOCTORS ====================
  const renderDoctors = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <button
          onClick={() => {
            setActivePage("hospitals");
            setSelectedHospital(null);
            setHospitalDoctors([]);
            setSearchTerm("");
          }}
          className="mb-4 text-cyan-600 hover:text-cyan-800 font-semibold flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Hospitals
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{selectedHospital?.name}</h2>
            <p className={textSecondary}>Browse our medical professionals</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors by name or specialization..."
            className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className={`mt-4 ${textSecondary}`}>Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className={textSecondary}>No doctors found</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div key={doctor._id} className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden hover:shadow-xl transition-shadow duration-200`}>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900 dark:to-blue-900 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {doctor.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>Dr. {doctor.name}</h3>
                    <p className="text-sm text-cyan-600 font-semibold">{doctor.specialization}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className={`flex items-center space-x-2 text-sm ${textSecondary}`}>
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>{doctor.qualification}</span>
                </div>

                <div className={`flex items-center space-x-2 text-sm ${textSecondary}`}>
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{doctor.experience} years experience</span>
                </div>

                <div className={`flex items-center space-x-2 text-sm ${textSecondary}`}>
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{doctor.phone}</span>
                </div>

                <div className={`flex items-center space-x-2 text-sm ${textSecondary}`}>
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{doctor.email}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${textSecondary}`}>Consultation Fee:</span>
                    <span className="text-lg font-bold text-cyan-600">₹{doctor.consultationFee}</span>
                  </div>
                </div>

                {doctor.departments && doctor.departments.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Departments:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.departments.map((dept, index) => (
                        <span key={index} className="bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded text-xs font-medium">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.availableDays && doctor.availableDays.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Available:</p>
                    <p className={`text-sm ${textPrimary}`}>{doctor.availableDays.join(", ")}</p>
                  </div>
                )}

                <button
                  onClick={() => handleBookAppointment(doctor)}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ==================== RENDER APPOINTMENTS ====================
  const renderAppointments = () => (
    <div className="space-y-6">
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>My Appointments</h2>
        <p className={textSecondary}>View and manage your medical appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className={`${bgSecondary} rounded-xl shadow-md p-12 text-center`}>
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={`${textSecondary} text-lg`}>No appointments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment._id} className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${textPrimary}`}>Dr. {appointment.doctorId?.name}</h3>
                      <p className={`text-sm ${textSecondary}`}>{appointment.doctorId?.specialization}</p>
                      <p className={`text-sm ${textSecondary}`}>{appointment.hospitalId?.name}</p>
                      <div className="mt-2">
            <StarRating 
              rating={appointment.doctorId.ratings?.average || 0} 
              size="sm" 
              showValue={true}
            />
            {appointment.doctorId.ratings?.count > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({appointment.doctorId.ratings.count} reviews)
              </span>
            )}
          </div>

                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className={`text-sm ${textSecondary} font-semibold`}>Date & Time:</p>
                      <p className={textPrimary}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondary} font-semibold`}>Patient:</p>
                      <p className={textPrimary}>
                        {appointment.isSelf ? appointment.patientName : `${appointment.familyMemberName} (${appointment.familyMemberRelation})`}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondary} font-semibold`}>Reason:</p>
                      <p className={textPrimary}>{appointment.reason}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondary} font-semibold`}>Consultation Fee:</p>
                      <p className={textPrimary}>₹{appointment.consultationFee}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    appointment.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    appointment.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>

                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  {appointment.status === 'completed' && (
    <button
      onClick={() => {
        setSelectedDoctorForRating(appointment.doctorId);
        setSelectedAppointmentForRating(appointment);
        setShowDoctorRatingModal(true);
      }}
      className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Rate Doctor
    </button>
  )}
                </div>
              </div>

              {appointment.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200"><strong>Rejection Reason:</strong> {appointment.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== RENDER REFERRALS (CLEAN - NO PAYMENT) ====================
  const renderReferrals = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>My Referrals</h2>
        <p className={textSecondary}>Track your hospital referrals and treatment progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Referrals</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{referrals.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {referrals.filter(r => r.status === "pending").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Accepted</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {referrals.filter(r => r.status === "accepted").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {referrals.filter(r => r.status === "completed").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-bold ${textPrimary}`}>Referral History</h3>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={`${textSecondary} text-lg`}>No referrals yet</p>
            <p className={`${textSecondary} text-sm mt-1`}>Your doctor will create referrals when needed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Operation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {referrals.map((referral) => (
                  <tr key={referral._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{referral.hospitalId?.name || "N/A"}</p>
                        <p className={`text-xs ${textSecondary}`}>{referral.hospitalId?.phone || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${textPrimary}`}>Dr. {referral.assignedDoctorId?.name || "Not Assigned"}</p>
                        <p className={`text-xs ${textSecondary}`}>{referral.assignedDoctorId?.specialization || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {referral.operationId ? (
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{referral.operationId.operationName}</p>
                          <p className={`text-xs ${textSecondary}`}>₹{referral.operationId.price?.toLocaleString()}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No operation</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${textSecondary} text-sm`}>
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
                        {referral.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedReferral(referral);
                          setShowReferralDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        View Details
                      </button>
                      {referral.status === 'completed' && (
      <button
        onClick={() => {
          setSelectedHospitalForRating(referral.hospitalId);
          setSelectedReferralForRating(referral);
          setShowHospitalRatingModal(true);
        }}
        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Rate Hospital
      </button>
    )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  // UserDashboard_Part3.jsx - Render Bills (with Payment Options) & Profile

  // ==================== RENDER BILLS (NEW - WITH PAYMENT OPTIONS) ====================
  const renderBills = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor} bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Bills & Payments
            </h2>
            <p className="text-green-100 text-lg">Manage your medical bills and make payments</p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-20 h-20 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Bills</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{bills.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Paid Bills</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {bills.filter(b => b.paymentStatus === "paid").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {bills.filter(b => b.paymentStatus === "pending").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Partial Paid</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {bills.filter(b => b.paymentStatus === "partial").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-bold ${textPrimary}`}>All Bills</h3>
        </div>

        {bills.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={`${textSecondary} text-lg`}>No bills generated yet</p>
            <p className={`${textSecondary} text-sm mt-1`}>Bills will appear here once hospital generates them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Bill #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Due</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bills.map((bill) => (
                  <tr key={bill._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <p className={`font-mono text-sm font-semibold ${textPrimary}`}>
                        {bill.billNumber || `#${bill._id?.substring(0, 8)}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{bill.hospitalId?.name || "N/A"}</p>
                        <p className={`text-xs ${textSecondary}`}>{bill.patientName}</p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${textSecondary} text-sm`}>
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{(bill.totalAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ₹{(bill.amountPaid || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ₹{((bill.totalAmount || 0) - (bill.amountPaid || 0)).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(bill.paymentStatus)}`}>
                        {(bill.paymentStatus || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowBillDetailsModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          View Details
                        </button>

                        {bill.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleOpenPayment(bill)}
                            className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Pay Now
                          </button>
                        )}

                        {bill.paymentStatus === "paid" && (
                          <span className="px-3 py-1 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Paid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {/* Payment Modal */}
{showPaymentModal && selectedBill && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">💳 Payment</h3>
            <p className="text-cyan-100 text-sm mt-1">Bill #{selectedBill.billNumber}</p>
          </div>
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedBill(null);
              setPaymentType('full');
              setPaymentAmount(0);
              setEmiOption(null);
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Bill Summary */}
        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Hospital:</span>
            <span className={`font-semibold ${textPrimary}`}>{selectedBill.hospitalId?.name}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Patient:</span>
            <span className={`font-semibold ${textPrimary}`}>{selectedBill.patientName}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Total Amount:</span>
            <span className={`font-bold text-lg ${textPrimary}`}>₹{selectedBill.totalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Amount Paid:</span>
            <span className={`font-semibold text-green-600`}>₹{selectedBill.amountPaid?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
            <span className={`text-sm font-bold ${textSecondary}`}>Amount Due:</span>
            <span className={`font-bold text-xl text-red-600`}>₹{(selectedBill.totalAmount - selectedBill.amountPaid)?.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div>
          <label className={`block text-sm font-bold ${textPrimary} mb-3`}>Payment Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setPaymentType('full');
                setPaymentAmount(selectedBill.totalAmount - selectedBill.amountPaid);
                setEmiOption(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentType === 'full'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className={`font-semibold ${textPrimary}`}>Full Payment</div>
                <div className={`text-sm ${textSecondary} mt-1`}>
                  Pay ₹{(selectedBill.totalAmount - selectedBill.amountPaid)?.toLocaleString()}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPaymentType('partial');
                setEmiOption(2);
                setPaymentAmount((selectedBill.totalAmount - selectedBill.amountPaid) / 2);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentType === 'partial'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className={`font-semibold ${textPrimary}`}>Partial (EMI)</div>
                <div className={`text-sm ${textSecondary} mt-1`}>Pay in installments</div>
              </div>
            </button>
          </div>
        </div>

        {/* EMI Options (if partial payment) */}
        {paymentType === 'partial' && (
          <div>
            <label className={`block text-sm font-bold ${textPrimary} mb-3`}>EMI Options</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setEmiOption(2);
                  setPaymentAmount((selectedBill.totalAmount - selectedBill.amountPaid) / 2);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  emiOption === 2
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className={`font-semibold ${textPrimary}`}>2 Installments</div>
                  <div className={`text-sm ${textSecondary} mt-1`}>
                    ₹{((selectedBill.totalAmount - selectedBill.amountPaid) / 2)?.toLocaleString()} each
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setEmiOption(3);
                  setPaymentAmount((selectedBill.totalAmount - selectedBill.amountPaid) / 3);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  emiOption === 3
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className={`font-semibold ${textPrimary}`}>3 Installments</div>
                  <div className={`text-sm ${textSecondary} mt-1`}>
                    ₹{((selectedBill.totalAmount - selectedBill.amountPaid) / 3)?.toLocaleString()} each
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>Current Payment:</span>
            <span className={`font-bold text-lg text-cyan-600`}>₹{paymentAmount?.toLocaleString()}</span>
          </div>
          {paymentType === 'partial' && (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textSecondary}`}>Remaining After Payment:</span>
              <span className={`font-semibold ${textSecondary}`}>
                ₹{((selectedBill.totalAmount - selectedBill.amountPaid) - paymentAmount)?.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* ✅ RAZORPAY PAYMENT BUTTON - REPLACE OLD BUTTON */}
        <RazorpayPayment
          bill={selectedBill}
          amount={paymentAmount}
          paymentType={paymentType}
          emiOption={emiOption}
          onSuccess={(data) => {
            console.log('Payment successful:', data);
            setShowPaymentModal(false);
            setSelectedBill(null);
            setPaymentType('full');
            setPaymentAmount(0);
            setEmiOption(null);
            fetchBills();
          }}
          onFailure={(error) => {
            console.error('Payment failed:', error);
          }}
          buttonText={`Pay ₹${paymentAmount?.toLocaleString()}`}
          darkMode={darkMode}
        />

        {/* Secured by Razorpay */}
        <div className="text-center">
          <p className={`text-xs ${textSecondary}`}>
            🔒 Secured by Razorpay • All payment methods supported
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-gray-500">💳 Cards</span>
            <span className="text-xs text-gray-500">📱 UPI</span>
            <span className="text-xs text-gray-500">🏦 NetBanking</span>
            <span className="text-xs text-gray-500">💰 Wallets</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
// ==================== RENDER MY REVIEWS ====================
// ==================== RENDER MY REVIEWS ====================
const renderMyReviews = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor} bg-gradient-to-r from-purple-500 via-pink-500 to-red-500`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <svg className="w-10 h-10 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              My Reviews
            </h2>
            <p className="text-purple-100 text-lg">All the reviews you've submitted</p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-semibold">Doctor Reviews</p>
            <p className="text-3xl font-bold text-white mt-1">{myReviews.doctorReviews?.length || 0}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-semibold">Hospital Reviews</p>
            <p className="text-3xl font-bold text-white mt-1">{myReviews.hospitalReviews?.length || 0}</p>
          </div>
        </div>
      </div>

      {loadingReviews ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className={`mt-4 ${textSecondary}`}>Loading reviews...</p>
        </div>
      ) : (
        <>
          {/* Doctor Reviews */}
          {myReviews.doctorReviews && myReviews.doctorReviews.length > 0 && (
            <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900">
                <h3 className={`text-xl font-bold ${textPrimary} flex items-center`}>
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Doctor Reviews ({myReviews.doctorReviews.length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {myReviews.doctorReviews.map((review) => (
                  <div key={review._id} className={`p-5 border ${borderColor} rounded-xl hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.doctorId?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <h4 className={`font-bold ${textPrimary} text-lg`}>
                              Dr. {review.doctorId?.name || 'Unknown'}
                            </h4>
                            <p className={`text-sm ${textSecondary}`}>
                              {review.doctorId?.specialization} • {review.hospitalId?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating rating={review.rating} size="md" />
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.review && (
                      <div className={`mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg`}>
                        <p className={`${textSecondary} text-sm italic`}>"{review.review}"</p>
                      </div>
                    )}
                    {review.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 mt-2 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Reviews */}
          {myReviews.hospitalReviews && myReviews.hospitalReviews.length > 0 && (
            <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
                <h3 className={`text-xl font-bold ${textPrimary} flex items-center`}>
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Hospital Reviews ({myReviews.hospitalReviews.length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {myReviews.hospitalReviews.map((review) => (
                  <div key={review._id} className={`p-5 border ${borderColor} rounded-xl hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.hospitalId?.name?.charAt(0) || 'H'}
                          </div>
                          <div>
                            <h4 className={`font-bold ${textPrimary} text-lg`}>
                              {review.hospitalId?.name || 'Unknown'}
                            </h4>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating rating={review.rating} size="md" />
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Category Ratings */}
                    {review.categories && (
                      <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {review.categories.cleanliness > 0 && (
                          <div>
                            <p className={`text-xs ${textSecondary} mb-1`}>🧹 Cleanliness</p>
                            <StarRating rating={review.categories.cleanliness} size="sm" />
                          </div>
                        )}
                        {review.categories.staff > 0 && (
                          <div>
                            <p className={`text-xs ${textSecondary} mb-1`}>👥 Staff</p>
                            <StarRating rating={review.categories.staff} size="sm" />
                          </div>
                        )}
                        {review.categories.facilities > 0 && (
                          <div>
                            <p className={`text-xs ${textSecondary} mb-1`}>🏥 Facilities</p>
                            <StarRating rating={review.categories.facilities} size="sm" />
                          </div>
                        )}
                        {review.categories.waitTime > 0 && (
                          <div>
                            <p className={`text-xs ${textSecondary} mb-1`}>⏱️ Wait Time</p>
                            <StarRating rating={review.categories.waitTime} size="sm" />
                          </div>
                        )}
                      </div>
                    )}

                    {review.review && (
                      <div className={`mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg`}>
                        <p className={`${textSecondary} text-sm italic`}>"{review.review}"</p>
                      </div>
                    )}
                    {review.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 mt-2 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Reviews */}
          {(!myReviews.doctorReviews || myReviews.doctorReviews.length === 0) && 
           (!myReviews.hospitalReviews || myReviews.hospitalReviews.length === 0) && (
            <div className={`${bgSecondary} rounded-xl shadow-md p-12 text-center border ${borderColor}`}>
              <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className={`${textPrimary} text-xl font-semibold mb-2`}>No reviews yet</p>
              <p className={`${textSecondary} text-sm mb-6`}>
                Complete appointments to leave reviews for doctors and hospitals
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActivePage('appointments')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  View Appointments
                </button>
                <button
                  onClick={() => setActivePage('referrals')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  View Referrals
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
  // ==================== RENDER PROFILE (KEEPING EXISTING) ====================
  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`${bgSecondary} rounded-2xl shadow-xl p-8 border ${borderColor}`}>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {profile?.name?.charAt(0) || "P"}
          </div>
          <div className="flex-1">
            <h2 className={`text-3xl font-bold ${textPrimary} mb-2`}>{profile?.name || "Patient Name"}</h2>
            <p className={`${textSecondary} text-lg`}>{profile?.email}</p>
            <div className="flex items-center space-x-4 mt-3">
              <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                Active Patient
              </span>
              <span className={`${textSecondary} text-sm`}>Member since {new Date(profile?.createdAt).getFullYear() || "2024"}</span>
            </div>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center`}>
              <svg className="w-6 h-6 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Blood Group</label>
                    <select
                      value={profileForm.bloodGroup}
                      onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Address</label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      rows="3"
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm ${textSecondary} mb-1`}>Phone Number</p>
                  <p className={`font-semibold ${textPrimary}`}>{profile?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className={`text-sm ${textSecondary} mb-1`}>Date of Birth</p>
                  <p className={`font-semibold ${textPrimary}`}>{profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not set"}</p>
                </div>
                <div>
                  <p className={`text-sm ${textSecondary} mb-1`}>Gender</p>
                  <p className={`font-semibold ${textPrimary}`}>{profile?.gender || "Not set"}</p>
                </div>
                <div>
                  <p className={`text-sm ${textSecondary} mb-1`}>Blood Group</p>
                  <p className={`font-semibold ${textPrimary}`}>{profile?.bloodGroup || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className={`text-sm ${textSecondary} mb-1`}>Address</p>
                  <p className={`font-semibold ${textPrimary}`}>{profile?.address || "Not set"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center`}>
              <svg className="w-6 h-6 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Stats & Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${textPrimary}`}>Appointments</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{appointments.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${textPrimary}`}>Referrals</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{referrals.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${textPrimary}`}>Bills</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{bills.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActivePage("hospitals")}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-semibold">Find Hospital</span>
              </button>

              <button
                onClick={() => setActivePage("appointments")}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">My Appointments</span>
              </button>

              <button
                onClick={() => setActivePage("referrals")}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">View Referrals</span>
              </button>

              <button
                onClick={() => setActivePage("bills")}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">Pay Bills</span>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className={textSecondary}>Member Since</span>
                <span className={`font-semibold ${textPrimary}`}>{new Date(profile?.createdAt).toLocaleDateString() || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Status</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // UserDashboard_Part4.jsx - Main Render, Sidebar Menu & Export

  // ==================== MAIN RENDER ====================
  const menuItems = [
    {
      id: "hospitals",
      label: "Browse Hospitals",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: appointments.filter(a => a.status === 'pending').length > 0 ? appointments.filter(a => a.status === 'pending').length : null,
    },
    {
      id: "referrals",
      label: "My Referrals",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: referrals.filter(r => r.status === "accepted" || r.status === "completed").length > 0
        ? referrals.filter(r => r.status === "accepted" || r.status === "completed").length
        : null,
    },
    {
      id: "bills",
      label: "Bills & Payments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: bills.filter(b => b.paymentStatus === "pending" || b.paymentStatus === "partial").length > 0
        ? bills.filter(b => b.paymentStatus === "pending" || b.paymentStatus === "partial").length
        : null,
    },
    {
    id: "reviews",
    label: "My Reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
    {
      id: "profile",
      label: "My Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex h-screen ${bgPrimary}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-cyan-600 to-blue-700'} text-white flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-cyan-500 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Patient Portal</h2>
              <p className="text-xs text-cyan-200">Healthcare Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                activePage === item.id
                  ? "bg-white text-cyan-600 shadow-lg transform scale-105"
                  : "text-white hover:bg-cyan-500 dark:hover:bg-gray-700 hover:transform hover:scale-102"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-t border-cyan-500 dark:border-gray-700">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-cyan-500 dark:bg-gray-700 hover:bg-cyan-600 dark:hover:bg-gray-600 transition-all"
          >
            <span className="font-medium">Theme</span>
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <div className="p-4 border-t border-cyan-500 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`${bgSecondary} shadow-md border-b ${borderColor} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>
                Welcome, {profile?.name || userInfo?.user?.name || "Patient"}!
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} • {currentTime.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`text-sm font-semibold ${textPrimary}`}>
                  {profile?.name || userInfo?.user?.name || "Patient"}
                </p>
                <p className={`text-xs ${textSecondary}`}>{profile?.email || userInfo?.user?.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {profile?.name?.charAt(0) || userInfo?.user?.name?.charAt(0) || "P"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${bgPrimary} p-6`}>
          {activePage === "hospitals" && renderHospitals()}
          {activePage === "doctors" && renderDoctors()}
          {activePage === "appointments" && renderAppointments()}
          {activePage === "referrals" && renderReferrals()}
          {activePage === "bills" && renderBills()}
          {activePage === "reviews" && renderMyReviews()}
          {activePage === "profile" && renderProfile()}
        </main>
      </div>
{showDoctorRatingModal && selectedDoctorForRating && selectedAppointmentForRating && (
      <RatingModal
        isOpen={showDoctorRatingModal}
        onClose={() => {
          setShowDoctorRatingModal(false);
          setSelectedDoctorForRating(null);
          setSelectedAppointmentForRating(null);
        }}
        type="doctor"
        entity={selectedDoctorForRating}
        appointmentId={selectedAppointmentForRating._id}
        hospitalId={selectedAppointmentForRating.hospitalId?._id}
        onSuccess={(data) => {
          console.log('Review submitted:', data);
          fetchAppointments(); // Refresh appointments
          setShowDoctorRatingModal(false);
          setSelectedDoctorForRating(null);
          setSelectedAppointmentForRating(null);
        }}
      />
    )}

    {/* ✅ NEW: Hospital Rating Modal */}
    {showHospitalRatingModal && selectedHospitalForRating && selectedReferralForRating && (
      <RatingModal
        isOpen={showHospitalRatingModal}
        onClose={() => {
          setShowHospitalRatingModal(false);
          setSelectedHospitalForRating(null);
          setSelectedReferralForRating(null);
        }}
        type="hospital"
        entity={selectedHospitalForRating}
        referralId={selectedReferralForRating._id}
        onSuccess={(data) => {
          console.log('Review submitted:', data);
          fetchReferrals(); // Refresh referrals
          setShowHospitalRatingModal(false);
          setSelectedHospitalForRating(null);
          setSelectedReferralForRating(null);
        }}
      />
    )}
      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookAppointment
          doctorId={selectedDoctor._id}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            fetchAppointments();
          }}
        />
      )}

      {/* Referral Details Modal */}
      {showReferralDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Referral Details</h3>
                  <p className="text-purple-100 text-sm">Complete referral information</p>
                </div>
                <button
                  onClick={() => setShowReferralDetailsModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Hospital Info */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Hospital Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Hospital:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReferral.hospitalId?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReferral.hospitalId?.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Address:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{selectedReferral.hospitalId?.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              {selectedReferral.assignedDoctorId && (
                <div className="bg-green-50 dark:bg-green-900 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Assigned Doctor</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Doctor:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Dr. {selectedReferral.assignedDoctorId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReferral.assignedDoctorId.specialization}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Operation Info */}
              {selectedReferral.operationId && (
                <div className="bg-purple-50 dark:bg-purple-900 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Operation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Operation:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReferral.operationId.operationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Description:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{selectedReferral.operationId.description || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="font-semibold text-green-600">₹{selectedReferral.operationId.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Referral Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Status Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReferral.status)}`}>
                      {selectedReferral.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created Date:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(selectedReferral.createdAt)}</span>
                  </div>
                  {selectedReferral.urgency && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReferral.urgency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowReferralDetailsModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {showBillDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-cyan-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Bill Details</h3>
                  <p className="text-blue-100 text-sm">Bill #{selectedBill.billNumber}</p>
                </div>
                <button
                  onClick={() => setShowBillDetailsModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Header Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Hospital</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedBill.hospitalId?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Patient</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedBill.patientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Bill Date</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(selectedBill.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Payment Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBill.paymentStatus)}`}>
                      {(selectedBill.paymentStatus || 'pending').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill Items */}
              {selectedBill.items && selectedBill.items.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Bill Items</h4>
                  <div className="space-y-2">
                    {selectedBill.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className={`font-medium ${textPrimary}`}>{item.itemName}</p>
                          {item.description && (
                            <p className={`text-xs ${textSecondary}`}>{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${textPrimary}`}>₹{item.totalPrice?.toLocaleString()}</p>
                          <p className={`text-xs ${textSecondary}`}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bill Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className={`font-semibold ${textPrimary}`}>₹{(selectedBill.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {selectedBill.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                      <span className={`font-semibold ${textPrimary}`}>₹{(selectedBill.tax || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="font-semibold text-green-600">-₹{(selectedBill.discount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">₹{(selectedBill.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="font-semibold text-green-600">₹{(selectedBill.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Balance Due:</span>
                    <span className="text-xl font-bold text-red-600">₹{((selectedBill.totalAmount || 0) - (selectedBill.amountPaid || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBillDetailsModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
                {selectedBill.paymentStatus !== "paid" && (
                  <button
                    onClick={() => {
                      setShowBillDetailsModal(false);
                      handleOpenPayment(selectedBill);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
       {/* ==================== ✅ NEW: CHATBOT COMPONENTS ==================== */}
    
    {/* ChatBot Component */}
    <ChatBot
      isOpen={isChatBotOpen}
      onClose={() => setIsChatBotOpen(false)}
      userData={getChatBotUserData()}
      onAction={handleChatBotAction}
      darkMode={darkMode}
    />

    {/* ChatBot Floating Button */}
    <ChatBotButton
      onClick={toggleChatBot}
      isOpen={isChatBotOpen}
      darkMode={darkMode}
      unreadCount={chatBotUnreadCount}
    />
    </div>
  );
};

export default UserDashboard;