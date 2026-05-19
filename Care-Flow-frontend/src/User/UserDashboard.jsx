// UserDashboard_Part1.jsx - Imports, State Management, Helper Functions & Fetch Functions

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointment from "./BookAppointment";
// Add these imports
import RatingModal from '../components/reviews/RatingModal';
import StarRating from '../components/reviews/StarRating';
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
    const [prescriptions, setPrescriptions] = useState([]); 
  
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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false); // NEW: Prescription modal state
  const [selectedPrescription, setSelectedPrescription] = useState(null); // NEW: Selected prescription for modal

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
 const accentPrimary = darkMode
    ? "from-sky-600 to-blue-700"
    : "from-sky-400 to-blue-500";
  const accentSecondary = darkMode
    ? "from-emerald-600 to-teal-700"
    : "from-emerald-400 to-teal-500";

  // ==================== EFFECTS ====================
  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

   const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/prescription/patient-prescription", config);
      setPrescriptions(res.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };
  // Initial Data Fetch
  useEffect(() => {
    fetchHospitals();
    fetchProfile();
    fetchAppointments();
    fetchReferrals();
    fetchBills(); // NEW: Fetch bills separately
    fetchMyReviews();
    fetchPrescriptions()

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
    prescriptions: prescriptions || [], 
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
case 'viewPrescriptions': // NEW
        setActivePage('prescriptions');
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

// console.log(selectedPrescription)
  // ==================== RENDER HOSPITALS (ENHANCED) ====================
const renderHospitals = () => {
  return (
    <div className="space-y-10 px-6 py-10 max-w-[1600px] mx-auto">

      {/* ================= HERO SECTION - Premium Split Design ================= */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-700">
              Healthcare Network
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-neutral-900 dark:text-gray-500 leading-tight">
            Discover Premium
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Healthcare Facilities
            </span>
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-700 leading-relaxed">
            Access a comprehensive network of top-rated hospitals, specialized departments, 
            and expert medical professionals. Your health, our priority.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">Verified</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Certified Facilities</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">24/7</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Available Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visual Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              label: "Total Hospitals", 
              value: hospitals.length,
              icon: "🏥",
              color: "from-indigo-500 to-blue-600"
            },
            { 
              label: "Departments", 
              value: getUniqueDepartments().length,
              icon: "🏢",
              color: "from-cyan-500 to-teal-600"
            },
            { 
              label: "Available Now", 
              value: filteredHospitals.length,
              icon: "✅",
              color: "from-emerald-500 to-green-600"
            },
            { 
              label: "Success Rate", 
              value: "98%",
              icon: "⭐",
              color: "from-amber-500 to-orange-600"
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="
                relative p-6 rounded-2xl
                bg-gradient-to-br from-neutral-50 to-neutral-100
                dark:from-neutral-800 dark:to-neutral-900
                border border-neutral-200 dark:border-neutral-700
                shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)]
                dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]
                hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)]
                transition-all duration-300
                group cursor-pointer
              "
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ================= SEARCH & FILTER - Premium Design ================= */}
      <div className="
        relative p-8 rounded-3xl
        bg-gradient-to-br from-neutral-50 to-neutral-100
        dark:from-neutral-800 dark:to-neutral-900
        border border-neutral-200 dark:border-neutral-700
        shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
        dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
      ">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Find Your Hospital
          </h3>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-4">
          
          {/* Search Input - Neumorphic */}
          <div className="relative">
            <div className="
              flex items-center gap-4 p-4 rounded-2xl
              bg-gradient-to-br from-neutral-100 to-neutral-50
              dark:from-neutral-900 dark:to-neutral-800
              shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]
              border border-neutral-200/50 dark:border-neutral-700/50
            ">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by hospital name, location, or specialty..."
                className="
                  flex-1 bg-transparent outline-none
                  text-neutral-900 dark:text-white
                  placeholder:text-neutral-400
                  font-medium
                "
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="relative md:w-72">
            <div className="
              flex items-center justify-between gap-4 p-4 rounded-2xl
              bg-gradient-to-br from-neutral-100 to-neutral-50
              dark:from-neutral-900 dark:to-neutral-800
              shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]
              border border-neutral-200/50 dark:border-neutral-700/50
            ">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="
                  flex-1 bg-transparent outline-none appearance-none cursor-pointer
                  text-neutral-900 dark:text-gray-600 font-medium
                "
              >
                <option value="all">All Departments</option>
                {getUniqueDepartments().map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <svg className="w-5 h-5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>
      </div>


      {/* ================= HOSPITAL CARDS - Premium Neumorphic Design ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredHospitals.map((hospital, idx) => (
          <div
            key={hospital._id}
            className="
              group relative p-6 rounded-3xl
              bg-gradient-to-br from-neutral-50 to-neutral-100
              dark:from-neutral-800 dark:to-neutral-900
              border border-neutral-200 dark:border-neutral-700
              shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
              dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
              hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.8)]
              dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.03)]
              transition-all duration-500
              hover:-translate-y-2
              overflow-hidden
            "
            style={{ animationDelay: `${idx * 100}ms` }}
          >

            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

            {/* Hospital Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="
                w-14 h-14 rounded-2xl flex-shrink-0
                bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500
                shadow-[4px_4px_12px_rgba(99,102,241,0.4)]
                flex items-center justify-center
                group-hover:scale-110 group-hover:rotate-3
                transition-all duration-300
              ">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                  {hospital.name}
                </h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    (4.8)
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent mb-5" />

            {/* Address */}
            <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {hospital.address}
              </p>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 gap-2 mb-5">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {hospital.phone}
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {hospital.email}
                </span>
              </div>
            </div>

            {/* Departments */}
            {hospital.departments?.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                  Departments
                </div>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments.slice(0, 2).map((dept, i) => (
                    <span
                      key={i}
                      className="
                        px-3 py-1.5 text-xs font-semibold rounded-lg
                        bg-gradient-to-r from-indigo-100 to-purple-100
                        dark:from-indigo-900/30 dark:to-purple-900/30
                        text-indigo-700 dark:text-indigo-300
                        border border-indigo-200 dark:border-indigo-700/50
                        shadow-sm
                      "
                    >
                      {dept}
                    </span>
                  ))}
                  {hospital.departments.length > 2 && (
                    <span className="
                      px-3 py-1.5 text-xs font-semibold rounded-lg
                      bg-neutral-200 dark:bg-neutral-700
                      text-neutral-700 dark:text-neutral-300
                    ">
                      +{hospital.departments.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Button - Neumorphic */}
            <button
              onClick={() => fetchHospitalDoctors(hospital._id)}
              className="
                relative w-full py-4 rounded-2xl font-bold text-white
                bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600
                shadow-[4px_4px_12px_rgba(99,102,241,0.4),-4px_-4px_12px_rgba(167,139,250,0.3)]
                hover:shadow-[2px_2px_8px_rgba(99,102,241,0.5),-2px_-2px_8px_rgba(167,139,250,0.4)]
                active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]
                transition-all duration-300
                overflow-hidden group
              "
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                View Available Doctors
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              
              {/* Animated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

          </div>
        ))}
      </div>

      {/* No Results State */}
      {filteredHospitals.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            No Hospitals Found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

    </div>
  );
};
  // ==================== RENDER DOCTORS ====================
 const renderDoctors = () => (
  <div className="space-y-10 px-6 py-10 max-w-[1600px] mx-auto">

    {/* ================= HEADER SECTION - Premium Neumorphic ================= */}
    <div className="
      relative p-8 rounded-3xl
      bg-gradient-to-br from-neutral-50 to-neutral-100
      dark:from-neutral-800 dark:to-neutral-900
      border border-neutral-200 dark:border-neutral-700
      shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
      dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
    ">
      
      {/* Back Button */}
      <button
        onClick={() => {
          setActivePage("hospitals");
          setSelectedHospital(null);
          setHospitalDoctors([]);
          setSearchTerm("");
        }}
        className="
          mb-6 px-6 py-3 rounded-xl
          bg-gradient-to-br from-neutral-100 to-neutral-50
          dark:from-neutral-900 dark:to-neutral-800
          shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)]
          dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]
          hover:shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.8)]
          dark:hover:shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(255,255,255,0.03)]
          transition-all duration-300
          flex items-center gap-2
          font-semibold text-neutral-700 dark:text-neutral-300
          group
        "
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Hospitals
      </button>

      {/* Hospital Info */}
      <div className="flex items-center gap-5">
        <div className="
          w-16 h-16 rounded-2xl flex-shrink-0
          bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500
          shadow-[4px_4px_12px_rgba(99,102,241,0.4)]
          flex items-center justify-center
        ">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            {selectedHospital?.name}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Browse our medical professionals
          </p>
        </div>
      </div>
    </div>


    {/* ================= SEARCH SECTION - Neumorphic ================= */}
    <div className="
      relative p-6 rounded-3xl
      bg-gradient-to-br from-neutral-50 to-neutral-100
      dark:from-neutral-800 dark:to-neutral-900
      border border-neutral-200 dark:border-neutral-700
      shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
      dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
    ">
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Find a Doctor
        </h3>
      </div>

      <div className="
        flex items-center gap-4 p-4 rounded-2xl
        bg-gradient-to-br from-neutral-100 to-neutral-50
        dark:from-neutral-900 dark:to-neutral-800
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]
        dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]
        border border-neutral-200/50 dark:border-neutral-700/50
      ">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search doctors by name or specialization..."
          className="
            flex-1 bg-transparent outline-none
            text-neutral-900 dark:text-white
            placeholder:text-neutral-400
            font-medium
          "
        />
      </div>
    </div>


    {/* ================= DOCTORS GRID ================= */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      
      {/* Loading State */}
      {loading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-20">
          <div className="
            w-20 h-20 rounded-full
            border-4 border-neutral-200 dark:border-neutral-700
            border-t-indigo-600 dark:border-t-indigo-400
            animate-spin
            shadow-[4px_4px_12px_rgba(99,102,241,0.3)]
          " />
          <p className="mt-6 text-lg font-semibold text-neutral-600 dark:text-neutral-400">
            Loading doctors...
          </p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="
            w-32 h-32 mx-auto mb-6 rounded-full
            bg-gradient-to-br from-neutral-100 to-neutral-200
            dark:from-neutral-800 dark:to-neutral-900
            flex items-center justify-center
            shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)]
            dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]
          ">
            <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            No Doctors Found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        filteredDoctors.map((doctor, idx) => (
          <div
            key={doctor._id}
            className="
              group relative p-6 rounded-3xl
              bg-gradient-to-br from-neutral-50 to-neutral-100
              dark:from-neutral-800 dark:to-neutral-900
              border border-neutral-200 dark:border-neutral-700
              shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
              dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
              hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.8)]
              dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.03)]
              transition-all duration-500
              hover:-translate-y-2
              overflow-hidden
            "
            style={{ animationDelay: `${idx * 100}ms` }}
          >

            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

            {/* Doctor Header */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20">
              
              {/* Avatar */}
              <div className="
                w-16 h-16 rounded-2xl flex-shrink-0
                bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500
                shadow-[4px_4px_12px_rgba(6,182,212,0.4)]
                flex items-center justify-center
                text-white font-bold text-2xl
                group-hover:scale-110 group-hover:rotate-3
                transition-all duration-300
              ">
                {doctor.name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1">
                  Dr. {doctor.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
                    {doctor.specialization}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent mb-5" />

            {/* Doctor Details */}
            <div className="space-y-3 mb-5">
              
              {/* Qualification */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                    Qualification
                  </p>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {doctor.qualification}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{doctor.experience}</span> years experience
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {doctor.phone}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {doctor.email}
                </span>
              </div>
            </div>

            {/* Consultation Fee - Prominent */}
            <div className="
              p-4 rounded-2xl mb-5
              bg-gradient-to-r from-amber-50 to-orange-50
              dark:from-amber-900/20 dark:to-orange-900/20
              border border-amber-200 dark:border-amber-700/50
            ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Consultation Fee
                  </span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ₹{doctor.consultationFee}
                </span>
              </div>
            </div>

            {/* Departments */}
            {doctor.departments && doctor.departments.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                  Departments
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.departments.slice(0, 3).map((dept, i) => (
                    <span
                      key={i}
                      className="
                        px-3 py-1.5 text-xs font-semibold rounded-lg
                        bg-gradient-to-r from-indigo-100 to-purple-100
                        dark:from-indigo-900/30 dark:to-purple-900/30
                        text-indigo-700 dark:text-indigo-300
                        border border-indigo-200 dark:border-indigo-700/50
                        shadow-sm
                      "
                    >
                      {dept}
                    </span>
                  ))}
                  {doctor.departments.length > 3 && (
                    <span className="
                      px-3 py-1.5 text-xs font-semibold rounded-lg
                      bg-neutral-200 dark:bg-neutral-700
                      text-neutral-700 dark:text-neutral-300
                    ">
                      +{doctor.departments.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Available Days */}
            {doctor.availableDays && doctor.availableDays.length > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    Available Days
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {doctor.availableDays.join(", ")}
                </p>
              </div>
            )}

            {/* Book Appointment Button - Premium Neumorphic */}
            <button
              onClick={() => handleBookAppointment(doctor)}
              className="
                relative w-full py-4 rounded-2xl font-bold text-white
                bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600
                shadow-[4px_4px_12px_rgba(16,185,129,0.4),-4px_-4px_12px_rgba(20,184,166,0.3)]
                hover:shadow-[2px_2px_8px_rgba(16,185,129,0.5),-2px_-2px_8px_rgba(20,184,166,0.4)]
                active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]
                transition-all duration-300
                overflow-hidden group
              "
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              
              {/* Animated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

          </div>
        ))
      )}
    </div>

  </div>
);

  // ==================== RENDER APPOINTMENTS ====================
 const renderAppointments = () => (
  <div className="space-y-10 px-6 py-10 max-w-[1600px] mx-auto">

    {/* ================= HEADER SECTION - Premium Neumorphic ================= */}
    <div className="
      relative p-8 rounded-3xl
      bg-gradient-to-br from-neutral-50 to-neutral-100
      dark:from-neutral-800 dark:to-neutral-900
      border border-neutral-200 dark:border-neutral-700
      shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
      dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
    ">
      <div className="flex items-center gap-5">
        <div className="
          w-16 h-16 rounded-2xl flex-shrink-0
          bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500
          shadow-[4px_4px_12px_rgba(168,85,247,0.4)]
          flex items-center justify-center
        ">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            My Appointments
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View and manage your medical appointments
          </p>
        </div>
      </div>
    </div>


    {/* ================= APPOINTMENTS LIST ================= */}
    {appointments.length === 0 ? (
      

      <div className="
        relative p-20 rounded-3xl
        bg-gradient-to-br from-neutral-50 to-neutral-100
        dark:from-neutral-800 dark:to-neutral-900
        border border-neutral-200 dark:border-neutral-700
        shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
        dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
        text-center
      ">
        <div className="
          w-32 h-32 mx-auto mb-6 rounded-full
          bg-gradient-to-br from-neutral-100 to-neutral-200
          dark:from-neutral-800 dark:to-neutral-900
          flex items-center justify-center
          shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)]
          dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]
        ">
          <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          No Appointments Yet
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your upcoming appointments will appear here
        </p>
      </div>

    ) : (
      
      <div className="space-y-6">
        {appointments.map((appointment, idx) => (
          <div
            key={appointment._id}
            className="
              group relative rounded-3xl overflow-hidden
              bg-gradient-to-br from-neutral-50 to-neutral-100
              dark:from-neutral-800 dark:to-neutral-900
              border border-neutral-200 dark:border-neutral-700
              shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.7)]
              dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.02)]
              hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.8)]
              dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.03)]
              transition-all duration-500
            "
            style={{ animationDelay: `${idx * 100}ms` }}
          >

            {/* Status Bar */}
            <div className={`h-2 ${
              appointment.status === 'pending' ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500' :
              appointment.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500' :
              appointment.status === 'rejected' ? 'bg-gradient-to-r from-rose-400 via-red-400 to-rose-500' :
              appointment.status === 'completed' ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500' :
              'bg-gradient-to-r from-neutral-400 via-gray-400 to-neutral-500'
            }`} />

            <div className="p-8">
              <div className="flex flex-col xl:flex-row gap-8">

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                  
                  {/* Doctor Info Header */}
                  <div className="flex items-start gap-5">
                    
                    {/* Doctor Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="
                        w-20 h-20 rounded-2xl
                        bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500
                        shadow-[4px_4px_12px_rgba(6,182,212,0.4)]
                        flex items-center justify-center
                        border-2 border-white dark:border-neutral-700
                      ">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      {/* Online Status Badge */}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-3 border-white dark:border-neutral-800 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                        Dr. {appointment.doctorId?.name}
                      </h3>
                      <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                        {appointment.doctorId?.specialization}
                      </p>
                      
                      {/* Hospital */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {appointment.hospitalId?.name}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-3">
                        <StarRating 
                          rating={appointment.doctorId.ratings?.average || 0} 
                          size="sm" 
                          showValue={true}
                        />
                        {appointment.doctorId.ratings?.count > 0 && (
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            ({appointment.doctorId.ratings.count} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent" />

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Date & Time */}
                    <div className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-purple-50/50 to-pink-50/50
                      dark:from-purple-900/20 dark:to-pink-900/20
                      border border-purple-200/50 dark:border-purple-700/50
                    ">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                            Date & Time
                          </p>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {appointment.appointmentTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Patient */}
                    <div className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-emerald-50/50 to-green-50/50
                      dark:from-emerald-900/20 dark:to-green-900/20
                      border border-emerald-200/50 dark:border-emerald-700/50
                    ">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                            Patient
                          </p>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                            {appointment.isSelf ? appointment.patientName : appointment.familyMemberName}
                          </p>
                          {!appointment.isSelf && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              ({appointment.familyMemberRelation})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-blue-50/50 to-indigo-50/50
                      dark:from-blue-900/20 dark:to-indigo-900/20
                      border border-blue-200/50 dark:border-blue-700/50
                    ">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                            Reason
                          </p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="
                      p-4 rounded-2xl
                      bg-gradient-to-br from-amber-50/50 to-orange-50/50
                      dark:from-amber-900/20 dark:to-orange-900/20
                      border border-amber-200/50 dark:border-amber-700/50
                    ">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                            Consultation Fee
                          </p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            ₹{appointment.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Status & Actions Sidebar */}
                <div className="xl:w-64 flex flex-col gap-4">
                  
                  {/* Status Badge */}
                  <div className={`
                    p-6 rounded-2xl text-center
                    shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)]
                    dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]
                    border-2
                    ${
                      appointment.status === 'pending' 
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-300 dark:border-amber-200' 
                        : appointment.status === 'approved' 
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-300 dark:border-emerald-700' 
                        : appointment.status === 'rejected' 
                        ? 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950 dark:to-red-950 border-rose-300 dark:border-rose-700' 
                        : appointment.status === 'completed' 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-300 dark:border-blue-700' 
                        : 'bg-gradient-to-br from-neutral-50 to-gray-50 dark:from-neutral-800 dark:to-gray-900 border-neutral-300 dark:border-neutral-700'
                    }
                  `}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        appointment.status === 'pending' ? 'bg-amber-500' :
                        appointment.status === 'approved' ? 'bg-emerald-500' :
                        appointment.status === 'rejected' ? 'bg-rose-500' :
                        appointment.status === 'completed' ? 'bg-blue-500' :
                        'bg-neutral-500'
                      }`} />
                      <span className={`text-sm font-bold uppercase tracking-wider ${
                        appointment.status === 'pending' ? 'text-amber-700 dark:text-amber-300' :
                        appointment.status === 'approved' ? 'text-emerald-700 dark:text-emerald-300' :
                        appointment.status === 'rejected' ? 'text-rose-700 dark:text-rose-300' :
                        appointment.status === 'completed' ? 'text-blue-700 dark:text-blue-300' :
                        'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="
                        relative py-4 px-6 rounded-2xl font-bold text-white
                        bg-gradient-to-r from-rose-500 to-rose-400
                        shadow-[4px_4px_12px_rgba(225,29,72,0.4),-4px_-4px_12px_rgba(239,68,68,0.3)]
                        hover:shadow-[2px_2px_8px_rgba(225,29,72,0.5),-2px_-2px_8px_rgba(239,68,68,0.4)]
                        active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]
                        transition-all duration-300
                        overflow-hidden group
                      "
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  )}

                  {appointment.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedDoctorForRating(appointment.doctorId);
                        setSelectedAppointmentForRating(appointment);
                        setShowDoctorRatingModal(true);
                      }}
                      className="
                        relative py-4 px-6 rounded-2xl font-bold text-white
                        bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600
                        shadow-[4px_4px_12px_rgba(217,119,6,0.4),-4px_-4px_12px_rgba(234,88,12,0.3)]
                        hover:shadow-[2px_2px_8px_rgba(217,119,6,0.5),-2px_-2px_8px_rgba(234,88,12,0.4)]
                        active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]
                        transition-all duration-300
                        overflow-hidden group
                      "
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Rate Doctor
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  )}

                  {appointment.status === 'approved' && (
                    <div className="
                      p-6 rounded-2xl text-center
                      bg-gradient-to-br from-emerald-50 to-green-50
                      dark:from-emerald-900/30 dark:to-green-900/30
                      border-2 border-emerald-300 dark:border-emerald-700
                      shadow-[4px_4px_8px_rgba(16,185,129,0.2),-4px_-4px_8px_rgba(34,197,94,0.1)]
                    ">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                        Confirmed
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Rejection Reason */}
              {appointment.rejectionReason && (
                <div className="
                  mt-6 p-5 rounded-2xl
                  bg-gradient-to-br from-rose-50 to-red-50
                  dark:from-rose-950 dark:to-red-950
                  border-2 border-rose-300 dark:border-rose-700
                ">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-200 dark:bg-rose-800 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-rose-700 dark:text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide mb-2">
                        Rejection Reason
                      </p>
                      <p className="text-sm font-medium text-rose-600 dark:text-rose-400 leading-relaxed">
                        {appointment.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
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
      <div className={`${bgSecondary} rounded-2xl shadow-sm p-8 border ${borderColor}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className={`text-3xl font-bold ${textPrimary}`}>My Referrals</h2>
        </div>
        <p className={`${textSecondary} text-base ml-13`}>Track your hospital referrals and treatment progress</p>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Referrals */}
        <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-100 dark:border-blue-800 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Referrals</p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{referrals.length}</p>
        </div>

        {/* Pending */}
        <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-100 dark:border-amber-800 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Pending</p>
          <p className="text-4xl font-bold text-amber-700 dark:text-amber-300">
            {referrals.filter(r => r.status === "pending").length}
          </p>
        </div>

        {/* Accepted */}
        <div className="group relative bg-gradient-to-br from-emerald-50  to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Accepted</p>
          <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
            {referrals.filter(r => r.status === "accepted").length}
          </p>
        </div>

        {/* Completed */}
        <div className="group relative bg-gradient-to-br from-violet-50  to-fuchsia-50 dark:from-violet-950 dark:to-fuchsia-950 border-2 border-violet-100 dark:border-violet-800 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-1">Completed</p>
          <p className="text-4xl font-bold text-violet-700 dark:text-violet-300">
            {referrals.filter(r => r.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Referrals Table - Enhanced */}
      <div className={`${bgSecondary} rounded-2xl shadow-sm border ${borderColor} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>Referral History</h3>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`${textPrimary} text-xl font-semibold mb-2`}>No referrals yet</p>
            <p className={`${textSecondary} text-base`}>Your doctor will create referrals when needed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Operation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {referrals.map((referral) => (
                  <tr key={referral._id} className={`${hoverBg} transition-colors duration-150`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-semibold ${textPrimary} text-sm`}>{referral.hospitalId?.name || "N/A"}</p>
                          <p className={`text-xs ${textSecondary} flex items-center gap-1 mt-0.5`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {referral.hospitalId?.phone || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-semibold ${textPrimary} text-sm`}>Dr. {referral.assignedDoctorId?.name || "Not Assigned"}</p>
                          <p className={`text-xs ${textSecondary} mt-0.5`}>{referral.assignedDoctorId?.specialization || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {referral.operationId ? (
                        <div>
                          <p className={`font-semibold ${textPrimary} text-sm`}>{referral.operationId.operationName}</p>
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">₹{referral.operationId.price?.toLocaleString()}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm italic">No operation</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`${textSecondary} text-sm font-medium`}>
                          {formatDate(referral.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${getStatusColor(referral.status)} inline-flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowReferralDetailsModal(true);
                          }}
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        {referral.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedHospitalForRating(referral.hospitalId);
                              setSelectedReferralForRating(referral);
                              setShowHospitalRatingModal(true);
                            }}
                            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Rate
                          </button>
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
    </div>
  );
  // UserDashboard_Part3.jsx - Render Bills (with Payment Options) & Profile

  // ==================== RENDER BILLS (NEW - WITH PAYMENT OPTIONS) ====================
 const renderBills = () => (
    <div className="space-y-6">
      {/* Header - Enhanced */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-green-200 dark:border-green-800">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white">My Bills & Payments</h2>
              </div>
              <p className="text-green-50 text-lg ml-[72px]">Manage your medical bills and make payments</p>
            </div>
            <div className="hidden lg:block">
              <div className="w-36 h-36 bg-white bg-opacity-15 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white border-opacity-20 shadow-2xl">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Bills */}
        <div className="group relative bg-gradient-to-br from-blue-50  to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-100 dark:border-blue-800 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Bills</p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{bills.length}</p>
        </div>

        {/* Paid Bills */}
        <div className="group relative bg-gradient-to-br from-emerald-50  to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Paid Bills</p>
          <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
            {bills.filter(b => b.paymentStatus === "paid").length}
          </p>
        </div>

        {/* Pending Bills */}
        <div className="group relative bg-gradient-to-br from-rose-50  to-pink-50 dark:from-rose-950 dark:to-pink-950 border-2 border-rose-100 dark:border-rose-800 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Pending</p>
          <p className="text-4xl font-bold text-rose-700 dark:text-rose-300">
            {bills.filter(b => b.paymentStatus === "pending").length}
          </p>
        </div>

        {/* Partial Paid */}
        <div className="group relative bg-gradient-to-br from-amber-50  to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-100 dark:border-amber-800 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Partial Paid</p>
          <p className="text-4xl font-bold text-amber-700 dark:text-amber-300">
            {bills.filter(b => b.paymentStatus === "partial").length}
          </p>
        </div>
      </div>

      {/* Bills Table - Enhanced */}
      <div className={`${bgSecondary} rounded-2xl shadow-sm border ${borderColor} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>All Bills</h3>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`${textPrimary} text-xl font-semibold mb-2`}>No bills generated yet</p>
            <p className={`${textSecondary} text-base`}>Bills will appear here once hospital generates them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bill #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bills.map((bill) => (
                  <tr key={bill._id} className={`${hoverBg} transition-colors duration-150`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <p className={`font-mono text-sm font-bold ${textPrimary}`}>
                          {bill.billNumber || `#${bill._id?.substring(0, 8)}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-semibold ${textPrimary} text-sm`}>{bill.hospitalId?.name || "N/A"}</p>
                          <p className={`text-xs ${textSecondary} mt-0.5`}>{bill.patientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`${textSecondary} text-sm font-medium`}>
                          {formatDate(bill.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{(bill.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{(bill.amountPaid || 0).toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                          ₹{((bill.totalAmount || 0) - (bill.amountPaid || 0)).toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${getPaymentStatusColor(bill.paymentStatus)} inline-flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        {(bill.paymentStatus || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowBillDetailsModal(true);
                          }}
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>

                        {bill.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleOpenPayment(bill)}
                            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Pay Now
                          </button>
                        )}

                        {bill.paymentStatus === "paid" && (
                          <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700 rounded-xl flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">Paid</span>
                          </div>
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

      {/* Payment Modal - Enhanced */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${borderColor}`}>
            {/* Header - Enhanced */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),transparent_50%)]"></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Payment</h3>
                      <p className="text-cyan-100 text-sm mt-1">Bill #{selectedBill.billNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedBill(null);
                      setPaymentType('full');
                      setPaymentAmount(0);
                      setEmiOption(null);
                    }}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center text-white transition-all backdrop-blur-md"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Bill Summary - Enhanced */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className={`font-bold ${textPrimary}`}>Bill Summary</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className={`text-sm ${textSecondary} flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Hospital
                    </span>
                    <span className={`font-semibold ${textPrimary}`}>{selectedBill.hospitalId?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className={`text-sm ${textSecondary} flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Patient
                    </span>
                    <span className={`font-semibold ${textPrimary}`}>{selectedBill.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-300 dark:border-gray-600">
                    <span className={`text-sm ${textSecondary}`}>Total Amount</span>
                    <span className={`font-bold text-lg ${textPrimary}`}>₹{selectedBill.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className={`text-sm ${textSecondary}`}>Amount Paid</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">₹{selectedBill.amountPaid?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <span className={`font-bold ${textPrimary}`}>Amount Due</span>
                    <span className="font-bold text-2xl text-red-600 dark:text-red-400">₹{(selectedBill.totalAmount - selectedBill.amountPaid)?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection - Enhanced */}
              <div>
                <label className={`block text-sm font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Payment Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setPaymentType('full');
                      setPaymentAmount(selectedBill.totalAmount - selectedBill.amountPaid);
                      setEmiOption(null);
                    }}
                    className={`group p-6 rounded-2xl border-2 transition-all duration-300 ${
                      paymentType === 'full'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900 dark:to-blue-900 shadow-lg scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">💰</div>
                      <div className={`font-bold text-lg mb-2 ${paymentType === 'full' ? 'text-cyan-600 dark:text-cyan-400' : textPrimary}`}>Full Payment</div>
                      <div className={`text-sm ${textSecondary}`}>
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
                    className={`group p-6 rounded-2xl border-2 transition-all duration-300 ${
                      paymentType === 'partial'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900 dark:to-blue-900 shadow-lg scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <div className={`font-bold text-lg mb-2 ${paymentType === 'partial' ? 'text-cyan-600 dark:text-cyan-400' : textPrimary}`}>Partial (EMI)</div>
                      <div className={`text-sm ${textSecondary}`}>Pay in installments</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* EMI Options - Enhanced */}
              {paymentType === 'partial' && (
                <div className="animate-fadeIn">
                  <label className={`block text-sm font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    EMI Options
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setEmiOption(2);
                        setPaymentAmount((selectedBill.totalAmount - selectedBill.amountPaid) / 2);
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                        emiOption === 2
                          ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900 dark:to-blue-900 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold text-lg mb-1 ${emiOption === 2 ? 'text-cyan-600 dark:text-cyan-400' : textPrimary}`}>2 Installments</div>
                        <div className={`text-sm ${textSecondary}`}>
                          ₹{((selectedBill.totalAmount - selectedBill.amountPaid) / 2)?.toLocaleString()} each
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setEmiOption(3);
                        setPaymentAmount((selectedBill.totalAmount - selectedBill.amountPaid) / 3);
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                        emiOption === 3
                          ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900 dark:to-blue-900 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold text-lg mb-1 ${emiOption === 3 ? 'text-cyan-600 dark:text-cyan-400' : textPrimary}`}>3 Installments</div>
                        <div className={`text-sm ${textSecondary}`}>
                          ₹{((selectedBill.totalAmount - selectedBill.amountPaid) / 3)?.toLocaleString()} each
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Summary - Enhanced */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-cyan-700 dark:text-cyan-300">Payment Summary</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-cyan-700 dark:text-cyan-300">Current Payment</span>
                    <span className="font-bold text-2xl text-cyan-700 dark:text-cyan-300">₹{paymentAmount?.toLocaleString()}</span>
                  </div>
                  {paymentType === 'partial' && (
                    <div className="flex items-center justify-between py-2 border-t border-cyan-300 dark:border-cyan-700">
                      <span className="text-sm text-cyan-600 dark:text-cyan-400">Remaining After Payment</span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        ₹{((selectedBill.totalAmount - selectedBill.amountPaid) - paymentAmount)?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Button */}
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

              {/* Security Footer */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className={`text-sm font-semibold ${textPrimary}`}>Secured by Razorpay</p>
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Cards
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    UPI
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    NetBanking
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Wallets
                  </span>
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
const renderPrescriptions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-2xl shadow-xl p-8 border ${borderColor} bg-gradient-to-r ${accentPrimary}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Prescriptions
            </h2>
            <p className="text-white text-lg">View and download your medical prescriptions</p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-20 h-20 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sky-500 text-sm font-semibold">Total Prescriptions</p>
            <p className="text-3xl font-bold text-sky-500 mt-1">{prescriptions.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-cyan-500 text-sm font-semibold">Recent (Last 30 days)</p>
            <p className="text-3xl font-bold text-cyan-500 mt-1">
              {prescriptions.filter(p => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(p.createdAt) >= thirtyDaysAgo;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className={`${bgSecondary} rounded-xl shadow-md p-12 text-center border ${borderColor}`}>
          <svg className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={`${textPrimary} text-xl font-semibold mb-2`}>No prescriptions yet</p>
          <p className={`${textSecondary} text-sm`}>Your prescriptions will appear here after doctor consultations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className={`${bgSecondary} rounded-xl shadow-lg border ${borderColor} overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}>
              {/* Prescription Header */}
              <div className="bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-700 dark:to-blue-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Dr. {prescription.doctorId?.name}</h3>
                      <p className="text-sm text-sky-100">{prescription.doctorId?.specialization}</p>
                      <p className="text-xs text-sky-200 mt-1">{prescription.hospitalId?.name}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white bg-opacity-30 text-sky-500 text-xs font-semibold rounded-full backdrop-blur-sm">
                    {formatDate(prescription.createdAt)}
                  </span>
                </div>
              </div>

              {/* Prescription Details */}
              <div className="p-6 space-y-4">
                {/* Patient Info */}
                <div className={`p-4 ${bgTertiary} rounded-lg`}>
                  <p className={`text-xs font-semibold ${textSecondary} mb-1`}>Patient</p>
                  <p className={`font-bold ${textPrimary}`}>{prescription.patientId?.name}</p>
                </div>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div>
                    <p className={`text-sm font-semibold ${textSecondary} mb-2 flex items-center`}>
                      <svg className="w-4 h-4 mr-1 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Diagnosis
                    </p>
                    <p className={`${textPrimary} text-sm`}>{prescription.diagnosis}</p>
                  </div>
                )}

                {/* Medications Preview */}
                {prescription.medications && prescription.medications.length > 0 && (
                  <div>
                    <p className={`text-sm font-semibold ${textSecondary} mb-2 flex items-center`}>
                      <svg className="w-4 h-4 mr-1 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Medications ({prescription.medications.length})
                    </p>
                    <div className="space-y-2">
                      {prescription.medications.slice(0, 2).map((med, index) => (
                        <div key={index} className={`p-3 ${darkMode ? 'bg-slate-700' : 'bg-white'} rounded-lg border ${borderColor}`}>
                          <p className={`font-semibold ${textPrimary} text-sm`}>{med.name}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                        </div>
                      ))}
                      {prescription.medications.length > 2 && (
                        <p className={`text-xs ${textSecondary} text-center`}>
                          +{prescription.medications.length - 2} more medications
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {prescription.instructions && (
                  <div className={`p-3 border-l-4 border-amber-400 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'} rounded`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-1`}>Instructions</p>
                    <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>{prescription.instructions}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setShowPrescriptionModal(true);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center bg-emerald-100 dark:bg-emerald-100 text-emerald-900 dark:text-emerald-300 px-4 py-3 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Prescription Details Modal */}
      {showPrescriptionModal && selectedPrescription && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">📋 Prescription Details</h3>
                  <p className="text-sky-100 text-sm mt-1">Date: {formatDate(selectedPrescription.createdAt)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="text-white hover:text-slate-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Doctor & Hospital Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}>
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>👨‍⚕️ Doctor</p>
                  <p className={`font-bold ${textPrimary} text-lg`}>
                    Dr. {selectedPrescription.doctorId?.name || selectedPrescription.doctorName}
                  </p>
                  <p className={`text-sm ${textSecondary}`}>
                    {selectedPrescription.doctorId?.specialization || 'N/A'}
                  </p>
                </div>
                <div className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}>
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>🏥 Hospital</p>
                  <p className={`font-bold ${textPrimary} text-lg`}>
                    {selectedPrescription.doctorId?.hospitalId?.name || 'N/A'}
                  </p>
                  {selectedPrescription.doctorId?.hospitalId?.departments && (
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      {Array.isArray(selectedPrescription.doctorId.hospitalId.departments) 
                        ? selectedPrescription.doctorId.hospitalId.departments.slice(0, 2).join(', ')
                        : selectedPrescription.doctorId.hospitalId.departments}
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Info */}
              <div className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}>
                <p className={`text-xs font-semibold ${textSecondary} mb-2`}>👤 Patient</p>
                <p className={`font-bold ${textPrimary} text-lg`}>
                  {selectedPrescription.patientId?.name || selectedPrescription.patientName}
                </p>
              </div>

              {/* Visit Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPrescription.dateOfVisit && (
                  <div className={`p-4 ${darkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'} rounded-xl border-2 border-cyan-300 dark:border-cyan-700`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-cyan-300' : 'text-cyan-700'} mb-2 flex items-center`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date of Visit
                    </p>
                    <p className={`font-bold ${darkMode ? 'text-cyan-200' : 'text-cyan-900'}`}>
                      {formatDate(selectedPrescription.dateOfVisit)}
                    </p>
                  </div>
                )}
                {selectedPrescription.nextVisitDate && (
                  <div className={`p-4 ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} rounded-xl border-2 border-purple-300 dark:border-purple-700`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-2 flex items-center`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Next Visit
                    </p>
                    <p className={`font-bold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      {formatDate(selectedPrescription.nextVisitDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Reason for Visit */}
              {selectedPrescription.reason && (
                <div className={`p-4 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-xl border-2 border-blue-300 dark:border-blue-700`}>
                  <p className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-2 flex items-center`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Reason for Visit
                  </p>
                  <p className={`${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>{selectedPrescription.reason}</p>
                </div>
              )}

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div className={`p-4 ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'} rounded-xl border-2 border-indigo-300 dark:border-indigo-700`}>
                  <p className={`text-sm font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'} mb-2 flex items-center`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Diagnosis
                  </p>
                  <p className={`${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {/* ✅ MEDICINES - Support both 'medicines' and 'medications' fields */}
              {((selectedPrescription.medicines && selectedPrescription.medicines.length > 0) || 
                (selectedPrescription.medications && selectedPrescription.medications.length > 0)) && (
                <div>
                  <h4 className={`font-bold ${textPrimary} mb-4 text-lg flex items-center`}>
                    <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    💊 Prescribed Medicines (
                      {(selectedPrescription.medicines || selectedPrescription.medications).length}
                    )
                  </h4>
                  <div className="space-y-3">
                    {(selectedPrescription.medicines || selectedPrescription.medications).map((med, index) => (
                      <div key={med._id || index} className={`p-4 ${darkMode ? 'bg-slate-700' : 'bg-white'} rounded-xl border-2 ${borderColor} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className={`font-bold ${textPrimary} text-lg flex items-center`}>
                              <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {index + 1}
                              </span>
                              {med.name}
                            </p>
                            {med.type && (
                              <p className={`text-sm ${textSecondary} mt-1 ml-11`}>{med.type}</p>
                            )}
                          </div>
                          {med.duration && (
                            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {med.duration}
                            </span>
                          )}
                        </div>
                        
                        {/* Medicine Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {med.dosage && (
                            <div className={`p-3 ${bgTertiary} rounded-lg border ${borderColor}`}>
                              <p className={`text-xs ${textSecondary} mb-1 flex items-center`}>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                                </svg>
                                Dosage
                              </p>
                              <p className={`font-bold ${textPrimary} text-sm`}>{med.dosage}</p>
                            </div>
                          )}
                          {med.frequency && (
                            <div className={`p-3 ${bgTertiary} rounded-lg border ${borderColor}`}>
                              <p className={`text-xs ${textSecondary} mb-1 flex items-center`}>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Frequency
                              </p>
                              <p className={`font-bold ${textPrimary} text-sm`}>{med.frequency}</p>
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        {med.instructions && (
                          <div className={`mt-3 p-3 border-l-4 border-amber-500 ${darkMode ? 'bg-amber-900/10' : 'bg-amber-50'} rounded`}>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-1 flex items-center`}>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Instructions
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Instructions */}
              {selectedPrescription.instructions && (
                <div className={`p-4 border-l-4 border-amber-500 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'} rounded-xl`}>
                  <p className={`text-sm font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-2 flex items-center`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    General Instructions
                  </p>
                  <p className={`${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
      id: "prescriptions", // ✅ NEW MENU ITEM
      label: "Prescriptions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: prescriptions.length > 0 ? prescriptions.length : null,
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

 <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">

  {menuItems.map((item) => {
    const isActive = activePage === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActivePage(item.id)}
        className={`
          w-full flex items-center justify-between
          px-4 py-3 rounded-xl
          transition-all duration-300
          ${
            isActive
              ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#24243A]"
          }
        `}
      >

        <div className="flex items-center gap-3">

          <div className={`
            text-lg
            ${isActive ? "text-white" : "text-indigo-300 dark:text-cyan-100"}
          `}>
            {item.icon}
          </div>

          <span className="text-sm font-medium">
            {item.label}
          </span>
        </div>

        {item.badge && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-semibold
            ${isActive
              ? "bg-white/20 text-white"
              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100"}
          `}>
            {item.badge}
          </span>
        )}

      </button>
    );
  })}

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
          {activePage === "prescriptions" && renderPrescriptions()}
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