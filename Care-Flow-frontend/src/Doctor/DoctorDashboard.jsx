import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  // State Management
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activePage, setActivePage] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prescriptions, setPrescriptions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    bio: "",
    availableDays: [],
    availableTimeSlots: {
      start: "",
      end: "",
    },
  });

  const [referrals, setReferrals] = useState([]);
  const [fetchReferraldetails, setFetchReferraldetails] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [availableOperations, setAvailableOperations] = useState([]);
  const [showReferFromPrescriptionModal, setShowReferFromPrescriptionModal] = useState(false);
  const [selectedPrescriptionForRefer, setSelectedPrescriptionForRefer] = useState(null);

  const [referFromPrescriptionForm, setReferFromPrescriptionForm] = useState({
    hospitalId: "",
    operationId: "",
    careType: "OPD",
    urgency: "Medium",
    estimatedPrice: "",
    estimatedStayDays: "",
    medicalNotes: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("doctorToken");
  const doctorInfo = JSON.parse(localStorage.getItem("doctorinfo"));

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    nextVisitDate: "",
  });

  // Dark mode effect
  useEffect(() => {
    const savedTheme = localStorage.getItem("doctorTheme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("doctorTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const openCreateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    fetchHospitalInfo();
    fetchProfile();
    fetchAppointments();
    fetchPrescriptions();
    fetchReferrals();
    fetchHospitals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/refer/doctor", config);
      setReferrals(res.data);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/hospital/all");
      setHospitals(res.data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  // Modified to fetch operations by doctor's department
  const fetchOperationsByDoctorDepartment = async (hospitalId) => {
    try {
      if (!profile?.specialization) {
        setAvailableOperations([]);
        return;
      }

      const res = await axios.get(`https://careflow-lsf5.onrender.com/api/operation/by-hospital/${hospitalId}`);
      
      // Filter operations by doctor's specialization/department
      const filteredOps = res.data.filter(operation => {
        const opDepartment = operation.departmentId?.name?.toLowerCase() || '';
        const doctorSpec = profile.specialization.toLowerCase();
        return opDepartment.includes(doctorSpec) || doctorSpec.includes(opDepartment);
      });
      
      setAvailableOperations(filteredOps);
    } catch (error) {
      console.error("Error fetching operations:", error);
      setAvailableOperations([]);
    }
  };

  const handleOperationChangeForRefer = (operationId) => {
    const selectedOperation = availableOperations.find(op => op._id === operationId);
    setReferFromPrescriptionForm({
      ...referFromPrescriptionForm,
      operationId,
      estimatedPrice: selectedOperation ? selectedOperation.price : ""
    });
  };

  const openReferFromPrescriptionModal = (prescription) => {
    setSelectedPrescriptionForRefer(prescription);
    
    // Automatically set hospital ID from doctor's hospital
    if (hospitalInfo?.hospital?._id) {
      setReferFromPrescriptionForm({
        ...referFromPrescriptionForm,
        hospitalId: hospitalInfo.hospital._id
      });
      
      // Fetch operations for doctor's hospital and department
      fetchOperationsByDoctorDepartment(hospitalInfo.hospital._id);
    }
    
    setShowReferFromPrescriptionModal(true);
  };

  const handleCreateReferralFromPrescription = async (e) => {
    e.preventDefault();
    if (!selectedPrescriptionForRefer) return;

    setLoading(true);
    try {
      await axios.post(
        "https://careflow-lsf5.onrender.com/api/refer/create-from-prescription",
        {
          prescriptionId: selectedPrescriptionForRefer._id,
          ...referFromPrescriptionForm
        },
        config
      );
      alert("Referral created successfully!");
      setShowReferFromPrescriptionModal(false);
      resetReferFromPrescriptionForm();
      fetchReferrals();
    } catch (error) {
      console.error("Error creating referral:", error);
      alert(error.response?.data?.message || "Failed to create referral");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReferral = async (referralId) => {
    if (!window.confirm("Are you sure you want to cancel this referral?")) return;

    setLoading(true);
    try {
      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/refer/cancel/${referralId}`,
        {},
        config
      );
      alert("Referral cancelled successfully!");
      fetchReferrals();
    } catch (error) {
      console.error("Error cancelling referral:", error);
      alert(error.response?.data?.message || "Failed to cancel referral");
    } finally {
      setLoading(false);
    }
  };

  const resetReferFromPrescriptionForm = () => {
    setReferFromPrescriptionForm({
      hospitalId: "",
      operationId: "",
      careType: "OPD",
      urgency: "Medium",
      estimatedPrice: "",
      estimatedStayDays: "",
      medicalNotes: ""
    });
    setSelectedPrescriptionForRefer(null);
    setAvailableOperations([]);
  };

  // ==================== FETCH FUNCTIONS ====================
  const fetchHospitalInfo = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/doctor/hospital", config);
      setHospitalInfo(res.data);
    } catch (error) {
      console.error("Error fetching hospital info:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/doctor/getDoctor", config);
      setProfile(res.data);
      setProfileForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        specialization: res.data.specialization || "",
        qualification: res.data.qualification || "",
        experience: res.data.experience || "",
        consultationFee: res.data.consultationFee || "",
        bio: res.data.bio || "",
        availableDays: res.data.availableDays || [],
        availableTimeSlots: res.data.availableTimeSlots || { start: "", end: "" },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/appointment/doctor", config);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/prescription/doctor", config);
      setPrescriptions(res.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  // ==================== APPOINTMENT FUNCTIONS ====================
  const handleApproveAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/appointment/approve/${appointmentId}`,
        {},
        config
      );
      alert("Appointment approved successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert(error.response?.data?.message || "Failed to approve appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to reject this appointment?")) return;

    setLoading(true);
    try {
      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/appointment/reject/${appointmentId}`,
        {},
        config
      );
      alert("Appointment rejected successfully!");
      fetchAppointments();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert(error.response?.data?.message || "Failed to reject appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/appointment/complete/${appointmentId}`,
        {},
        config
      );
      alert("Appointment marked as completed!");
      fetchAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert(error.response?.data?.message || "Failed to complete appointment");
    } finally {
      setLoading(false);
    }
  };

  // ==================== PRESCRIPTION FUNCTIONS ====================
  const handleAddMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: "", dosage: "", frequency: "", duration: "" },
      ],
    }));
  };

  const handleRemoveMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => {
      const meds = [...prev.medicines];
      meds[index][field] = value;
      return { ...prev, medicines: meds };
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setLoading(true);
    try {
      await axios.post(
        "https://careflow-lsf5.onrender.com/api/prescription/create",
        {
          appointmentId: selectedAppointment._id,
          patientId: selectedAppointment.userId._id,
          patientName: selectedAppointment.userId.name,
          doctorId: selectedAppointment.doctorId._id,
          doctorName: selectedAppointment.doctorId.name,
          reason: formData.reason,
          medicines: formData.medicines.filter((m) => m.name),
          dateOfVisit: selectedAppointment.appointmentDate,
          nextVisitDate: formData.nextVisitDate || null,
        },
        config
      );
      alert("Prescription created successfully!");
      setShowModal(false);
      resetForm();
      fetchPrescriptions();
      fetchAppointments();
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert(error.response?.data?.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?"))
      return;

    setLoading(true);
    try {
      await axios.delete(
        "https://careflow-lsf5.onrender.com/api/prescription/delete",
        {
          ...config,
          data: { appointmentId },
        }
      );
      alert("Prescription deleted successfully!");
      fetchPrescriptions();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Failed to delete prescription");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reason: "",
      medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
      nextVisitDate: "",
    });
    setSelectedAppointment(null);
  };

  // ==================== PROFILE FUNCTIONS ====================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "https://careflow-lsf5.onrender.com/api/doctor/profile",
        profileForm,
        config
      );
      setProfile(res.data);
      localStorage.setItem("doctorinfo", JSON.stringify({ ...doctorInfo, doctor: res.data }));
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
        "https://careflow-lsf5.onrender.com/api/doctor/change-password",
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
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorinfo");
    navigate("/");
  };

  const handleDayToggle = (day) => {
    setProfileForm((prev) => {
      if (prev.availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: prev.availableDays.filter((d) => d !== day),
        };
      }
      return {
        ...prev,
        availableDays: [...prev.availableDays, day],
      };
    });
  };

  const handlefetchreferDeatails = async (referId) => {
    const res = await axios.get(`https://careflow-lsf5.onrender.com/api/refer/gethospital/${referId}`, config);
    setFetchReferraldetails(res.data);
  };

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = (status) => {
    const colors = {
      pending: darkMode 
        ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" 
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: darkMode 
        ? "bg-green-900/30 text-green-300 border-green-700" 
        : "bg-green-100 text-green-800 border-green-200",
      rejected: darkMode 
        ? "bg-red-900/30 text-red-300 border-red-700" 
        : "bg-red-100 text-red-800 border-red-200",
      completed: darkMode 
        ? "bg-blue-900/30 text-blue-300 border-blue-700" 
        : "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: darkMode 
        ? "bg-gray-700 text-gray-300 border-gray-600" 
        : "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status?.toLowerCase()] || colors.cancelled;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentFilter === "all") return true;
    return apt.status?.toLowerCase() === appointmentFilter;
  });

  const getAppointmentStats = () => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status?.toLowerCase() === "pending").length;
    const approved = appointments.filter((a) => a.status?.toLowerCase() === "approved").length;
    const completed = appointments.filter((a) => a.status?.toLowerCase() === "completed").length;
    return { total, pending, approved, completed };
  };

  const stats = getAppointmentStats();

  const getPatientName = (appointment) => {
    if (appointment.isSelf) {
      return appointment.userId?.name || appointment.patientName || "Patient";
    } else {
      return appointment.familyMemberName || "Family Member";
    }
  };

  const getPatientInitial = (appointment) => {
    const name = getPatientName(appointment);
    return name.charAt(0).toUpperCase();
  };

  // Theme-aware classes
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgSecondary = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  // ==================== RENDER PAGES ====================
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Experience</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                {profile?.experience || "0"} Years
              </p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Appointments</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>{stats.total}</p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Pending</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>{stats.pending}</p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-500'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Completed</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>{stats.completed}</p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-purple-700' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Information */}
      {hospitalInfo && (
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center`}>
            <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hospital Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Hospital Name</label>
              <p className={`${textPrimary} font-medium`}>{hospitalInfo.hospital.name}</p>
            </div>
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Email</label>
              <p className={`${textPrimary} font-medium`}>{hospitalInfo.hospital.email}</p>
            </div>
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Phone</label>
              <p className={`${textPrimary} font-medium`}>{hospitalInfo.hospital.phone}</p>
            </div>
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Website</label>
              <p className={`${textPrimary} font-medium`}>{hospitalInfo.hospital.website || "Not available"}</p>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Address</label>
              <p className={`${textPrimary} font-medium`}>{hospitalInfo.hospital.address}</p>
            </div>
            {hospitalInfo.hospital.departments && hospitalInfo.hospital.departments.length > 0 && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Departments</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hospitalInfo.hospital.departments.map((dept, index) => (
                    <span key={index} className={`${darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${textPrimary} flex items-center`}>
            <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Recent Appointments
          </h3>
          <button onClick={() => setActivePage("appointments")} className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'} font-medium text-sm`}>
            View All →
          </button>
        </div>

        {appointments.length === 0 ? (
          <p className={`${textSecondary} text-center py-8`}>No appointments yet</p>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment._id} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg ${hoverBg} transition-colors`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center font-bold`}>
                    {getPatientInitial(appointment)}
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{getPatientName(appointment)}</p>
                    <p className={`text-sm ${textSecondary}`}>{formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Profile Summary */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center`}>
          <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Full Name</label>
            <p className={`${textPrimary} font-medium`}>{profile?.name || "Not set"}</p>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Email</label>
            <p className={`${textPrimary} font-medium`}>{profile?.email || "Not set"}</p>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Phone</label>
            <p className={`${textPrimary} font-medium`}>{profile?.phone || "Not set"}</p>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Qualification</label>
            <p className={`${textPrimary} font-medium`}>{profile?.qualification || "Not set"}</p>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Consultation Fee</label>
            <p className={`${textPrimary} font-medium`}>₹{profile?.consultationFee || "0"}</p>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Available Days</label>
            <p className={`${textPrimary} font-medium`}>{profile?.availableDays?.length > 0 ? profile.availableDays.join(", ") : "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Appointments</h2>
            <p className={textSecondary}>Manage your patient appointments</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "completed", "rejected", "cancelled"].map((filter) => (
              <button
                key={filter}
                onClick={() => setAppointmentFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  appointmentFilter === filter
                    ? darkMode
                      ? "bg-green-700 text-white"
                      : "bg-green-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`${textSecondary} text-lg`}>No appointments found</p>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>
              {appointmentFilter !== "all" ? `No ${appointmentFilter} appointments` : "You don't have any appointments yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Patient</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Date & Time</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Reason</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className={`${hoverBg} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center font-bold`}>
                          {getPatientInitial(appointment)}
                        </div>
                        <div className="ml-4">
                          <p className={`font-semibold ${textPrimary}`}>{getPatientName(appointment)}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {appointment.isSelf ? (appointment.userId?.email || "No email") : `${appointment.familyMemberRelation} - Age ${appointment.familyMemberAge}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`${textPrimary} font-medium`}>{formatDate(appointment.appointmentDate)}</p>
                      <p className={`text-sm ${textSecondary}`}>{formatTime(appointment.appointmentTime)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`${textPrimary} max-w-xs truncate`}>{appointment.reason || "No reason provided"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {appointment.status?.toLowerCase() === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveAppointment(appointment._id)}
                              disabled={loading}
                              className={`px-3 py-1 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appointment._id)}
                              disabled={loading}
                              className={`px-3 py-1 ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status?.toLowerCase() === "approved" && (
                          <button
                            onClick={() => handleCompleteAppointment(appointment._id)}
                            disabled={loading}
                            className={`px-3 py-1 ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                          >
                            Mark Complete
                          </button>
                        )}
                        {["completed", "rejected", "cancelled"].includes(appointment.status?.toLowerCase()) && (
                          <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No actions available</span>
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
  const renderPrescription = () => {
    const prescriptionReadyAppointments = appointments.filter(
      apt => apt.status?.toLowerCase() === "approved" || apt.status?.toLowerCase() === "completed"
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Prescriptions</h2>
          <p className={textSecondary}>Create and manage patient prescriptions</p>
        </div>

        {/* Appointments Ready for Prescription */}
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center`}>
            <svg className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Prescription
          </h3>

          {prescriptionReadyAppointments.length === 0 ? (
            <p className={`${textSecondary} text-center py-4`}>No appointments available for prescription</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptionReadyAppointments.map((apt) => (
                <div key={apt._id} className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 ${darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center font-bold`}>
                      {getPatientInitial(apt)}
                    </div>
                    <div>
                      <p className={`font-semibold ${textPrimary}`}>{getPatientName(apt)}</p>
                      <p className={`text-sm ${textSecondary}`}>{formatDate(apt.appointmentDate)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCreateModal(apt)}
                    className={`w-full ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    Create Prescription
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions List */}
        <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
          <div className={`p-6 border-b ${borderColor}`}>
            <h3 className={`text-lg font-bold ${textPrimary}`}>Recent Prescriptions</h3>
          </div>

          {prescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className={textSecondary}>No prescriptions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Patient</th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Reason</th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Date of Visit</th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Next Visit</th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderColor}`}>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription._id} className={hoverBg}>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${textPrimary}`}>{prescription.patientName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`${textSecondary} max-w-xs truncate`}>{prescription.reason}</p>
                      </td>
                      <td className={`px-6 py-4 ${textSecondary}`}>{formatDate(prescription.dateOfVisit)}</td>
                      <td className={`px-6 py-4 ${textSecondary}`}>
                        {prescription.nextVisitDate ? formatDate(prescription.nextVisitDate) : "Not set"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewPrescription(prescription)}
                            className={`px-3 py-1 ${darkMode ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-900/60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-lg text-sm font-medium transition-colors`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription.appointmentId)}
                            disabled={loading}
                            className={`px-3 py-1 ${darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => openReferFromPrescriptionModal(prescription)}
                            className={`px-3 py-1 ${darkMode ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} rounded-lg text-sm font-medium transition-colors`}
                          >
                            Refer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Prescription Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${bgSecondary} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${textPrimary}`}>Create Prescription</h3>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className={`${textSecondary} hover:${textPrimary}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {selectedAppointment && (
                  <p className={`${textSecondary} mt-1`}>
                    Patient: <span className="font-medium">{getPatientName(selectedAppointment)}</span>
                  </p>
                )}
              </div>

              <form onSubmit={handleCreatePrescription} className="p-6 space-y-6">
                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Reason / Diagnosis *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                    rows="2"
                    required
                    placeholder="Enter diagnosis or reason for visit"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-semibold ${textSecondary}`}>Medicines</label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'} text-sm font-medium flex items-center gap-1`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.medicines.map((medicine, index) => (
                      <div key={index} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${textSecondary}`}>Medicine {index + 1}</span>
                          {formData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            placeholder="Medicine Name"
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            className={`px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'} text-sm`}
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g., 500mg)"
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                            className={`px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'} text-sm`}
                          />
                          <input
                            type="text"
                            placeholder="Frequency"
                            value={medicine.frequency}
                            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                            className={`px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'} text-sm`}
                          />
                          <input
                            type="text"
                            placeholder="Duration"
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            className={`px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'} text-sm`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Next Visit Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.nextVisitDate}
                    onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50`}
                  >
                    {loading ? "Creating..." : "Create Prescription"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-2 rounded-lg font-semibold transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Prescription Modal */}
        {viewPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${bgSecondary} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${textPrimary}`}>Prescription Details</h3>
                  <button onClick={() => setViewPrescription(null)} className={`${textSecondary} hover:${textPrimary}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary}`}>Patient Name</label>
                    <p className={textPrimary}>{viewPrescription.patientName}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary}`}>Doctor Name</label>
                    <p className={textPrimary}>{viewPrescription.doctorName}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary}`}>Date of Visit</label>
                    <p className={textPrimary}>{formatDate(viewPrescription.dateOfVisit)}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary}`}>Next Visit</label>
                    <p className={textPrimary}>{viewPrescription.nextVisitDate ? formatDate(viewPrescription.nextVisitDate) : "Not scheduled"}</p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Reason / Diagnosis</label>
                  <p className={`${textPrimary} ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-3 rounded-lg`}>{viewPrescription.reason}</p>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Medicines</label>
                  {viewPrescription.medicines?.length > 0 ? (
                    <div className="space-y-2">
                      {viewPrescription.medicines.map((med, index) => (
                        <div key={index} className={`${darkMode ? 'bg-green-900/40 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-3`}>
                          <p className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{med.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{med.dosage} • {med.frequency} • {med.duration}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={textSecondary}>No medicines prescribed</p>
                  )}
                </div>

                <button
                  onClick={() => setViewPrescription(null)}
                  className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-2 rounded-lg font-semibold transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReferrals = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Patient Referrals</h2>
        <p className={textSecondary}>Track referrals sent to other hospitals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Referrals</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>{referrals.length}</p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Pending</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>
                {referrals.filter(r => r.status === "pending").length}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-500'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Accepted</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                {referrals.filter(r => r.status === "accepted").length}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Completed</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>
                {referrals.filter(r => r.status === "completed").length}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-purple-700' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List - Continued in next part due to length */}
      {/* Referrals List */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>My Referrals</h3>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={textSecondary}>No referrals yet</p>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>Create referrals from prescriptions to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Patient</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Hospital</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Operation</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Care Type</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Urgency</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Price</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {referrals.map((referral) => (
                  <tr key={referral._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${textPrimary}`}>{referral.patientName}</p>
                      <p className={`text-sm ${textSecondary}`}>{referral.patientPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${textPrimary}`}>{referral.hospitalId?.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      {referral.operationId ? (
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{referral.operationId.operationName}</p>
                          <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>₹{referral.operationId.price}</p>
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No operation</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.careType === "ICU" ? (darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800") :
                        referral.careType === "Emergency" ? (darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-800") :
                        referral.careType === "Ward" || referral.careType === "General Ward" ? (darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800") :
                        (darkMode ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-800")
                      }`}>
                        {referral.careType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.urgency === "Critical" ? (darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800") :
                        referral.urgency === "High" ? (darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-800") :
                        referral.urgency === "Medium" ? (darkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800") :
                        (darkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800")
                      }`}>
                        {referral.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${textPrimary}`}>₹{referral.estimatedPrice}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {referral.status === "pending" ? (
                        <button
                          onClick={() => handleCancelReferral(referral._id)}
                          disabled={loading}
                          className={`px-3 py-1 ${darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                        >
                          Cancel
                        </button>
                      ) : referral.status === "accepted" && referral.appointmentDate ? (
                        <div>
                          <p className={`text-sm font-medium ${textPrimary}`}>Scheduled</p>
                          <p className={`text-xs ${textSecondary}`}>{formatDate(referral.appointmentDate)}</p>
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No actions</span>
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

  const renderProfile = () => {
    if (!profile) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-green-400' : 'border-green-600'}`}></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Profile Settings</h2>
          <p className={textSecondary}>Manage your professional information</p>
        </div>

        {/* Profile Information */}
        <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
          <div className={`${darkMode ? 'bg-gradient-to-r from-green-700 to-emerald-700' : 'bg-gradient-to-r from-green-600 to-emerald-600'} px-6 py-8`}>
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center ${darkMode ? 'text-green-400' : 'text-green-600'} text-3xl font-bold shadow-lg`}>
                {profile.name?.charAt(0) || "D"}
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                <p className={`${darkMode ? 'text-green-200' : 'text-green-100'}`}>{profile.specialization}</p>
                <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-200'} mt-1`}>
                  {profile.qualification} • {profile.experience} years exp
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Full Name</label>
                    <p className={`${textPrimary} font-medium`}>{profile.name || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Email</label>
                    <p className={`${textPrimary} font-medium`}>{profile.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Phone</label>
                    <p className={`${textPrimary} font-medium`}>{profile.phone || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Specialization</label>
                    <p className={`${textPrimary} font-medium`}>{profile.specialization || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Qualification</label>
                    <p className={`${textPrimary} font-medium`}>{profile.qualification || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Experience</label>
                    <p className={`${textPrimary} font-medium`}>{profile.experience || "0"} years</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Consultation Fee</label>
                    <p className={`${textPrimary} font-medium`}>₹{profile.consultationFee || "0"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>License Number</label>
                    <p className={`${textPrimary} font-medium`}>{profile.licenseNumber || "Not set"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Bio</label>
                    <p className={`${textPrimary} font-medium`}>{profile.bio || "Not set"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Available Days</label>
                    <p className={`${textPrimary} font-medium`}>
                      {profile.availableDays?.length > 0 ? profile.availableDays.join(", ") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-1`}>Available Time</label>
                    <p className={`${textPrimary} font-medium`}>
                      {profile.availableTimeSlots?.start && profile.availableTimeSlots?.end
                        ? `${profile.availableTimeSlots.start} - ${profile.availableTimeSlots.end}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className={`mt-4 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md`}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Specialization</label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Qualification</label>
                    <input
                      type="text"
                      value={profileForm.qualification}
                      onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Experience (years)</label>
                    <input
                      type="number"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Consultation Fee</label>
                    <input
                      type="number"
                      value={profileForm.consultationFee}
                      onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      min="0"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                      rows="3"
                      placeholder="Brief bio about yourself..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Available Days</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day) => (
                        <label
                          key={day}
                          className={`flex items-center gap-2 cursor-pointer p-3 border ${borderColor} rounded-lg ${hoverBg} transition-colors`}
                        >
                          <input
                            type="checkbox"
                            checked={profileForm.availableDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'} focus:ring-green-500`}
                          />
                          <span className="text-sm font-medium">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Start Time</label>
                    <input
                      type="time"
                      value={profileForm.availableTimeSlots.start}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          availableTimeSlots: {
                            ...profileForm.availableTimeSlots,
                            start: e.target.value,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>End Time</label>
                    <input
                      type="time"
                      value={profileForm.availableTimeSlots.end}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          availableTimeSlots: {
                            ...profileForm.availableTimeSlots,
                            end: e.target.value,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setProfileForm({
                        name: profile.name || "",
                        phone: profile.phone || "",
                        specialization: profile.specialization || "",
                        qualification: profile.qualification || "",
                        experience: profile.experience || "",
                        consultationFee: profile.consultationFee || "",
                        bio: profile.bio || "",
                        availableDays: profile.availableDays || [],
                        availableTimeSlots: profile.availableTimeSlots || { start: "", end: "" },
                      });
                    }}
                    className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${textPrimary} px-6 py-2 rounded-lg font-semibold transition-all duration-200`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                required
                minLength="6"
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500'}`}
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md`}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      badge: stats.pending > 0 ? stats.pending : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "prescription",
      label: "Prescription",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "referrals",
      label: "Referrals",
      badge: referrals.filter(r => r.status === "pending").length > 0 ? referrals.filter(r => r.status === "pending").length : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
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
      <aside className={`w-64 ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-green-600 to-emerald-700'} text-white flex flex-col shadow-2xl`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-green-500'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg flex items-center justify-center shadow-lg`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Doctor Panel</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-green-200'}`}>Medical Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                activePage === item.id
                  ? darkMode
                    ? "bg-gray-700 text-green-400 shadow-lg ring-2 ring-green-400/50"
                    : "bg-white text-green-600 shadow-lg"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700/50"
                  : "text-white hover:bg-green-500"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`${darkMode ? 'bg-red-600' : 'bg-red-500'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-green-500'}`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
            } transition-all duration-200 mb-2 shadow-md`}
          >
            {darkMode ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              darkMode ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-green-500 hover:bg-green-600'
            } transition-all duration-200 shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${bgSecondary} shadow-md border-b ${borderColor} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>
                Welcome back, Dr. {profile?.name || doctorInfo?.doctor?.name || "Doctor"}!
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`text-sm font-semibold ${textPrimary}`}>
                  Dr. {profile?.name || doctorInfo?.doctor?.name || "Doctor"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {profile?.specialization || "Medical Professional"}
                </p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? 'bg-gradient-to-br from-green-700 to-emerald-700' : 'bg-gradient-to-br from-green-500 to-emerald-600'} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {profile?.name?.charAt(0) || doctorInfo?.doctor?.name?.charAt(0) || "D"}
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${bgPrimary} p-6`}>
          {activePage === "overview" && renderOverview()}
          {activePage === "appointments" && renderAppointments()}
          {activePage === "profile" && renderProfile()}
          {activePage === "prescription" && renderPrescription()}
          {activePage === "referrals" && renderReferrals()}
        </main>
      </div>
      
      {/* Referral Modal */}
      {showReferFromPrescriptionModal && selectedPrescriptionForRefer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary}`}>Create Referral from Prescription</h3>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Referral will be created for your hospital: <span className="font-semibold">{hospitalInfo?.hospital?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReferFromPrescriptionModal(false);
                    resetReferFromPrescriptionForm();
                  }}
                  className={`${textSecondary} hover:${textPrimary}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateReferralFromPrescription} className="p-6 space-y-6">
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 space-y-2`}>
                <h4 className={`font-semibold ${textPrimary} mb-3`}>Prescription Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={textSecondary}>Patient:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{selectedPrescriptionForRefer.patientName}</span>
                  </div>
                  <div>
                    <span className={textSecondary}>Diagnosis:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{selectedPrescriptionForRefer.reason}</span>
                  </div>
                  <div>
                    <span className={textSecondary}>Date:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{formatDate(selectedPrescriptionForRefer.createdAt)}</span>
                  </div>
                  <div>
                    <span className={textSecondary}>Your Department:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{profile?.specialization}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                  Hospital
                </label>
                <div className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${textPrimary}`}>{hospitalInfo?.hospital?.name}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>{hospitalInfo?.hospital?.address}</p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                  Select Operation/Procedure
                </label>
                <select
                  value={referFromPrescriptionForm.operationId}
                  onChange={(e) => handleOperationChangeForRefer(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                  }`}
                >
                  <option value="">Select operation</option>
                  {availableOperations.length === 0 ? (
                    <option disabled>No operations available for your department</option>
                  ) : (
                    availableOperations.map((operation) => (
                      <option key={operation._id} value={operation._id}>
                        {operation.operationName} - ₹{operation.price}
                        {operation.departmentId?.name && ` (${operation.departmentId.name})`}
                      </option>
                    ))
                  )}
                </select>
                {availableOperations.length === 0 && (
                  <p className="text-xs text-yellow-500 mt-1">
                    No operations found for {profile?.specialization} department. You can still create a referral without selecting an operation.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Care Type *</label>
                  <select
                    value={referFromPrescriptionForm.careType}
                    onChange={(e) =>
                      setReferFromPrescriptionForm({ ...referFromPrescriptionForm, careType: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                    }`}
                    required
                  >
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Urgency *</label>
                  <select
                    value={referFromPrescriptionForm.urgency}
                    onChange={(e) =>
                      setReferFromPrescriptionForm({ ...referFromPrescriptionForm, urgency: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                    }`}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Estimated Price (₹) *</label>
                  <input
                    type="number"
                    value={referFromPrescriptionForm.estimatedPrice}
                    onChange={(e) =>
                      setReferFromPrescriptionForm({ ...referFromPrescriptionForm, estimatedPrice: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                    }`}
                    min="0"
                    required
                    placeholder="Enter estimated cost"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Estimated Stay (days)</label>
                  <input
                    type="number"
                    value={referFromPrescriptionForm.estimatedStayDays}
                    onChange={(e) =>
                      setReferFromPrescriptionForm({ ...referFromPrescriptionForm, estimatedStayDays: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                    }`}
                    min="0"
                    placeholder="Number of days"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Additional Medical Notes</label>
                <textarea
                  value={referFromPrescriptionForm.medicalNotes}
                  onChange={(e) =>
                    setReferFromPrescriptionForm({ ...referFromPrescriptionForm, medicalNotes: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'
                  }`}
                  rows="3"
                  placeholder="Add any additional information for the hospital..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 ${
                    darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                  } text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-lg`}
                >
                  {loading ? "Creating Referral..." : "Create Referral"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReferFromPrescriptionModal(false);
                    resetReferFromPrescriptionForm();
                  }}
                  className={`px-6 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } ${textPrimary} py-3 rounded-lg font-semibold transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;