// UserDashboard_Enhanced.jsx - With Improved Colors & Prescriptions Section

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookAppointment from "./BookAppointment";
import StarRating from "../components/reviews/StarRating";
import RatingModal from "../components/reviews/RatingModal";
import ReviewsList from "../components/reviews/ReviewsList";
import RatingDisplay from "../components/reviews/RatingDisplay";
import ChatBot from "../components/chatbot/ChatBot";
import ChatBotButton from "../components/chatbot/ChatBotButton";
import RazorpayPayment from "../components/payment/RazorpayPayment";

// ==================== HELPER FUNCTIONS ====================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  return timeString;
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50";
    case "accepted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50";
    case "completed":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50";
    case "cancelled":
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-300 dark:border-slate-700/50";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-300 dark:border-slate-700/50";
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    case "partial":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "paid":
    case "completed":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300";
  }
};

const UserDashboard = () => {
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]); // NEW: Prescriptions state
  const [activePage, setActivePage] = useState("hospitals");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myReviews, setMyReviews] = useState({
    doctorReviews: [],
    hospitalReviews: [],
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showDoctorRatingModal, setShowDoctorRatingModal] = useState(false);
  const [showHospitalRatingModal, setShowHospitalRatingModal] = useState(false);
  const [selectedDoctorForRating, setSelectedDoctorForRating] = useState(null);
  const [selectedHospitalForRating, setSelectedHospitalForRating] =
    useState(null);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] =
    useState(null);
  const [selectedReferralForRating, setSelectedReferralForRating] =
    useState(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [chatBotUnreadCount, setChatBotUnreadCount] = useState(0);
  const [selectedPrescription, setSelectedPrescription] = useState(null); // NEW: Selected prescription for modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false); // NEW: Prescription modal state

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
  const [showReferralDetailsModal, setShowReferralDetailsModal] =
    useState(false);

  // Bill & Payment States
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState("full");
  const [emiOption, setEmiOption] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);

  const token = localStorage.getItem("UserToken");
  const userInfo = JSON.parse(localStorage.getItem("Userinfo"));

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // ==================== IMPROVED THEME COLORS ====================
  useEffect(() => {
    const savedTheme = localStorage.getItem("userTheme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("userTheme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ✅ IMPROVED THEME COLORS - Sky Blue for Light Mode
  const bgPrimary = darkMode
    ? "bg-slate-900"
    : "bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50";
  const bgSecondary = darkMode ? "bg-slate-800" : "bg-white";
  const bgTertiary = darkMode ? "bg-slate-700" : "bg-sky-50";
  const textPrimary = darkMode ? "text-slate-100" : "text-slate-800";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-600";
  const borderColor = darkMode ? "border-slate-700" : "border-sky-200";
  const hoverBg = darkMode ? "hover:bg-slate-700" : "hover:bg-sky-50";
  const accentPrimary = darkMode
    ? "from-sky-600 to-blue-700"
    : "from-sky-400 to-blue-500";
  const accentSecondary = darkMode
    ? "from-emerald-600 to-teal-700"
    : "from-emerald-400 to-teal-500";

  // ==================== EFFECTS ====================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchProfile();
    fetchAppointments();
    fetchReferrals();
    fetchBills();
    fetchMyReviews();
    fetchPrescriptions(); // NEW: Fetch prescriptions
  }, []);

  // ==================== FETCH FUNCTIONS ====================
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/hospital/approved",
      );
      setHospitals(res.data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchHospitalDoctors = async (hospitalId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/hospital/getdoctorsparams/${hospitalId}`,
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
      const response = await axios.get(
        "http://localhost:8000/api/review/user/mine",
        config,
      );
      setMyReviews(
        response.data.data || { doctorReviews: [], hospitalReviews: [] },
      );
    } catch (error) {
      console.error("Error fetching my reviews:", error);
      setMyReviews({ doctorReviews: [], hospitalReviews: [] });
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/user/getUser",
        config,
      );
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
      const res = await axios.get(
        "http://localhost:8000/api/appointment/user",
        config,
      );
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/refer/user",
        config,
      );
      setReferrals(res.data);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/bill/user",
        config,
      );
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  // ✅ NEW: Fetch Prescriptions Function
  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/prescription/patient-prescription",
        config,
      );
      setPrescriptions(res.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  // Chatbot functions
  const getChatBotUserData = () => {
    return {
      name: profile?.name || "there",
      appointments: appointments || [],
      bills: bills || [],
      hospitals: hospitals || [],
      doctors: appointments?.doctorId ?? [],
      referrals: referrals || [],
      prescriptions: prescriptions || [], // NEW: Add prescriptions
      profile: profile || {},
    };
  };

  const handleChatBotAction = (actionType, actionData) => {
    switch (actionType) {
      case "navigate":
        setActivePage(actionData);
        setIsChatBotOpen(false);
        break;
      case "cancelAppointment":
        if (actionData?._id) {
          handleCancelAppointment(actionData._id);
        }
        break;
      case "bookAppointment":
        setActivePage("hospitals");
        setIsChatBotOpen(false);
        break;
      case "payBill":
        setActivePage("bills");
        setIsChatBotOpen(false);
        break;
      case "viewPrescriptions": // NEW
        setActivePage("prescriptions");
        setIsChatBotOpen(false);
        break;
      default:
        console.log("Unknown action:", actionType);
    }
  };

  const toggleChatBot = () => {
    setIsChatBotOpen(!isChatBotOpen);
    if (!isChatBotOpen) {
      setChatBotUnreadCount(0);
    }
  };

  // Profile & Auth functions (keeping existing code)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:8000/api/user/profile",
        profileForm,
        config,
      );
      setProfile(res.data);
      localStorage.setItem(
        "Userinfo",
        JSON.stringify({ ...userInfo, user: res.data }),
      );
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
        config,
      );
      alert("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
        config,
      );
      alert("Appointment cancelled successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // Payment functions (keeping existing)
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
      setEmiOption(2);
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
        emiOption: paymentType === "partial" ? emiOption : null,
      };

      await axios.post(
        `http://localhost:8000/api/bill/payment/${selectedBill._id}`,
        paymentData,
        config,
      );

      alert(
        `Payment of ₹${paymentAmount.toLocaleString()} processed successfully!`,
      );
      setShowPaymentModal(false);
      setShowBillDetailsModal(false);
      fetchBills();
      fetchReferrals();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

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

  const filteredDoctors = hospitalDoctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ==================== ✅ NEW: RENDER PRESCRIPTIONS ====================
  const renderPrescriptions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`${bgSecondary} rounded-2xl shadow-xl p-8 border ${borderColor} bg-gradient-to-r ${accentPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <svg
                className="w-10 h-10 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              My Prescriptions
            </h2>
            <p className="text-sky-100 text-lg">
              View and download your medical prescriptions
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-semibold">
              Total Prescriptions
            </p>
            <p className="text-3xl font-bold text-white mt-1">
              {prescriptions.length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-semibold">
              Recent (Last 30 days)
            </p>
            <p className="text-3xl font-bold text-white mt-1">
              {
                prescriptions.filter((p) => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return new Date(p.createdAt) >= thirtyDaysAgo;
                }).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div
          className={`${bgSecondary} rounded-xl shadow-md p-12 text-center border ${borderColor}`}
        >
          <svg
            className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className={`${textPrimary} text-xl font-semibold mb-2`}>
            No prescriptions yet
          </p>
          <p className={`${textSecondary} text-sm`}>
            Your prescriptions will appear here after doctor consultations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className={`${bgSecondary} rounded-xl shadow-lg border ${borderColor} overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Prescription Header */}
              <div className="bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-700 dark:to-blue-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-sky-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Dr. {prescription.doctorId?.name}
                      </h3>
                      <p className="text-sm text-sky-100">
                        {prescription.doctorId?.specialization}
                      </p>
                      <p className="text-xs text-sky-200 mt-1">
                        {prescription.hospitalId?.name}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white bg-opacity-30 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    {formatDate(prescription.createdAt)}
                  </span>
                </div>
              </div>

              {/* Prescription Details */}
              <div className="p-6 space-y-4">
                {/* Patient Info */}
                <div className={`p-4 ${bgTertiary} rounded-lg`}>
                  <p className={`text-xs font-semibold ${textSecondary} mb-1`}>
                    Patient
                  </p>
                  <p className={`font-bold ${textPrimary}`}>
                    {prescription.patientId?.name}
                  </p>
                </div>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div>
                    <p
                      className={`text-sm font-semibold ${textSecondary} mb-2 flex items-center`}
                    >
                      <svg
                        className="w-4 h-4 mr-1 text-sky-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Diagnosis
                    </p>
                    <p className={`${textPrimary} text-sm`}>
                      {prescription.diagnosis}
                    </p>
                  </div>
                )}

                {/* Medications Preview */}
                {prescription.medications &&
                  prescription.medications.length > 0 && (
                    <div>
                      <p
                        className={`text-sm font-semibold ${textSecondary} mb-2 flex items-center`}
                      >
                        <svg
                          className="w-4 h-4 mr-1 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                        Medications ({prescription.medications.length})
                      </p>
                      <div className="space-y-2">
                        {prescription.medications
                          .slice(0, 2)
                          .map((med, index) => (
                            <div
                              key={index}
                              className={`p-3 ${darkMode ? "bg-slate-700" : "bg-white"} rounded-lg border ${borderColor}`}
                            >
                              <p
                                className={`font-semibold ${textPrimary} text-sm`}
                              >
                                {med.name}
                              </p>
                              <p className={`text-xs ${textSecondary}`}>
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                          ))}
                        {prescription.medications.length > 2 && (
                          <p className={`text-xs ${textSecondary} text-center`}>
                            +{prescription.medications.length - 2} more
                            medications
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Instructions */}
                {prescription.instructions && (
                  <div
                    className={`p-3 border-l-4 border-amber-400 ${darkMode ? "bg-amber-900/20" : "bg-amber-50"} rounded`}
                  >
                    <p
                      className={`text-xs font-semibold ${darkMode ? "text-amber-300" : "text-amber-700"} mb-1`}
                    >
                      Instructions
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-amber-200" : "text-amber-900"}`}
                    >
                      {prescription.instructions}
                    </p>
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
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
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
          <div
            className={`${bgSecondary} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    📋 Prescription Details
                  </h3>
                  <p className="text-sky-100 text-sm mt-1">
                    Date: {formatDate(selectedPrescription.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="text-white hover:text-slate-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Doctor & Hospital Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}
                >
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>
                    👨‍⚕️ Doctor
                  </p>
                  <p className={`font-bold ${textPrimary} text-lg`}>
                    Dr. {selectedPrescription.doctorId?.name}
                  </p>
                  <p className={`text-sm ${textSecondary}`}>
                    {selectedPrescription.doctorId?.specialization}
                  </p>
                </div>
                <div
                  className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}
                >
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>
                    🏥 Hospital
                  </p>
                  <p className={`font-bold ${textPrimary} text-lg`}>
                    {selectedPrescription.hospitalId?.name}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div
                className={`p-4 ${bgTertiary} rounded-xl border ${borderColor}`}
              >
                <p className={`text-xs font-semibold ${textSecondary} mb-2`}>
                  👤 Patient
                </p>
                <p className={`font-bold ${textPrimary} text-lg`}>
                  {selectedPrescription.patientId?.name}
                </p>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div
                  className={`p-4 ${darkMode ? "bg-blue-900/20" : "bg-blue-50"} rounded-xl border-2 border-blue-300 dark:border-blue-700`}
                >
                  <p
                    className={`text-sm font-bold ${darkMode ? "text-blue-300" : "text-blue-700"} mb-2 flex items-center`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Diagnosis
                  </p>
                  <p
                    className={`${darkMode ? "text-blue-200" : "text-blue-900"}`}
                  >
                    {selectedPrescription.diagnosis}
                  </p>
                </div>
              )}

              {/* Medications */}
              {selectedPrescription.medications &&
                selectedPrescription.medications.length > 0 && (
                  <div>
                    <h4
                      className={`font-bold ${textPrimary} mb-4 text-lg flex items-center`}
                    >
                      <svg
                        className="w-6 h-6 mr-2 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      Prescribed Medications
                    </h4>
                    <div className="space-y-3">
                      {selectedPrescription.medications.map((med, index) => (
                        <div
                          key={index}
                          className={`p-4 ${darkMode ? "bg-slate-700" : "bg-white"} rounded-xl border-2 ${borderColor} hover:shadow-md transition-shadow`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className={`font-bold ${textPrimary} text-lg`}>
                                {index + 1}. {med.name}
                              </p>
                              <p className={`text-sm ${textSecondary} mt-1`}>
                                {med.type || "Medication"}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                              {med.duration}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className={`p-2 ${bgTertiary} rounded-lg`}>
                              <p className={`text-xs ${textSecondary}`}>
                                Dosage
                              </p>
                              <p className={`font-semibold ${textPrimary}`}>
                                {med.dosage}
                              </p>
                            </div>
                            <div className={`p-2 ${bgTertiary} rounded-lg`}>
                              <p className={`text-xs ${textSecondary}`}>
                                Frequency
                              </p>
                              <p className={`font-semibold ${textPrimary}`}>
                                {med.frequency}
                              </p>
                            </div>
                          </div>
                          {med.instructions && (
                            <div
                              className={`mt-3 p-2 border-l-4 border-amber-400 ${darkMode ? "bg-amber-900/10" : "bg-amber-50"} rounded`}
                            >
                              <p
                                className={`text-xs ${darkMode ? "text-amber-300" : "text-amber-700"}`}
                              >
                                📝 {med.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* General Instructions */}
              {selectedPrescription.instructions && (
                <div
                  className={`p-4 border-l-4 border-amber-500 ${darkMode ? "bg-amber-900/20" : "bg-amber-50"} rounded-xl`}
                >
                  <p
                    className={`text-sm font-bold ${darkMode ? "text-amber-300" : "text-amber-700"} mb-2 flex items-center`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    General Instructions
                  </p>
                  <p
                    className={`${darkMode ? "text-amber-200" : "text-amber-900"}`}
                  >
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              {/* Follow-up */}
              {selectedPrescription.followUpDate && (
                <div
                  className={`p-4 ${darkMode ? "bg-purple-900/20" : "bg-purple-50"} rounded-xl border-2 border-purple-300 dark:border-purple-700`}
                >
                  <p
                    className={`text-sm font-bold ${darkMode ? "text-purple-300" : "text-purple-700"} mb-1 flex items-center`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Follow-up Required
                  </p>
                  <p
                    className={`${darkMode ? "text-purple-200" : "text-purple-900"} font-semibold`}
                  >
                    {formatDate(selectedPrescription.followUpDate)}
                  </p>
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
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

  // ==================== MAIN RENDER (UPDATED MENU) ====================
  const menuItems = [
    {
      id: "hospitals",
      label: "Browse Hospitals",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      badge:
        appointments.filter((a) => a.status === "pending").length > 0
          ? appointments.filter((a) => a.status === "pending").length
          : null,
    },
    {
      id: "prescriptions", // ✅ NEW MENU ITEM
      label: "Prescriptions",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      badge: prescriptions.length > 0 ? prescriptions.length : null,
    },
    {
      id: "referrals",
      label: "My Referrals",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      badge:
        referrals.filter(
          (r) => r.status === "accepted" || r.status === "completed",
        ).length > 0
          ? referrals.filter(
              (r) => r.status === "accepted" || r.status === "completed",
            ).length
          : null,
    },
    {
      id: "bills",
      label: "Bills & Payments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      badge:
        bills.filter(
          (b) => b.paymentStatus === "pending" || b.paymentStatus === "partial",
        ).length > 0
          ? bills.filter(
              (b) =>
                b.paymentStatus === "pending" || b.paymentStatus === "partial",
            ).length
          : null,
    },
    {
      id: "reviews",
      label: "My Reviews",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "My Profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex h-screen ${bgPrimary}`}>
      {/* ✅ Improved Sidebar with Sky Blue Theme */}
      <aside
        className={`w-64 ${darkMode ? "bg-gradient-to-b from-slate-800 to-slate-900" : "bg-gradient-to-b from-sky-500 to-blue-600"} text-white flex flex-col shadow-2xl`}
      >
        <div className="p-6 border-b border-sky-400 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Patient Portal</h2>
              <p className="text-xs text-sky-100">Healthcare Access</p>
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
                  ? "bg-white text-sky-600 shadow-lg transform scale-105"
                  : "text-white hover:bg-sky-400 dark:hover:bg-slate-700 hover:transform hover:scale-102"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-t border-sky-400 dark:border-slate-700">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-sky-400 dark:bg-slate-700 hover:bg-sky-500 dark:hover:bg-slate-600 transition-all"
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

        <div className="p-4 border-t border-sky-400 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ✅ Improved Topbar */}
        <header
          className={`${bgSecondary} shadow-md border-b ${borderColor} px-6 py-4`}
        >
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
                })}{" "}
                • {currentTime.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`text-sm font-semibold ${textPrimary}`}>
                  {profile?.name || userInfo?.user?.name || "Patient"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {profile?.email || userInfo?.user?.email}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {profile?.name?.charAt(0) ||
                  userInfo?.user?.name?.charAt(0) ||
                  "P"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto ${bgPrimary} p-6`}
        >
          {activePage === "prescriptions" && renderPrescriptions()}
          {/* Add other page renders here - keeping existing ones */}
        </main>
      </div>

      {/* Modals & Components */}
      <ChatBot
        isOpen={isChatBotOpen}
        onClose={() => setIsChatBotOpen(false)}
        userData={getChatBotUserData()}
        onAction={handleChatBotAction}
        darkMode={darkMode}
      />

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
