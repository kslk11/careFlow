import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const HospitalDashboard = () => {
    const navigate = useNavigate();

    // State Management
    const [doctors, setDoctors] = useState([]);
    const [profile, setProfile] = useState(null);
    const [activePage, setActivePage] = useState("doctors");
    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [availableDepartments, setAvailableDepartments] = useState([]);

    // Add to state management section (after existing states)
    const [operations, setOperations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showOperationModal, setShowOperationModal] = useState(false);
    const [editingOperation, setEditingOperation] = useState(null);
    const [operationForm, setOperationForm] = useState({
        departmentId: "",
        operationName: "",
        description: "",
        price: "",
        duration: ""
    });
    const [referrals, setReferrals] = useState([]);
const [filteredReferrals, setFilteredReferrals] = useState([]);
const [referralStatusFilter, setReferralStatusFilter] = useState("all");
const [showAcceptReferralModal, setShowAcceptReferralModal] = useState(false);
const [selectedReferralForAccept, setSelectedReferralForAccept] = useState(null);
const [showViewReferralModal, setShowViewReferralModal] = useState(false);
const [viewReferral, setViewReferral] = useState(null);

//bads 
const [beds, setBeds] = useState([]);
const [showBedModal, setShowBedModal] = useState(false);
const [editingBed, setEditingBed] = useState(null);
const [bedTypeFilter, setBedTypeFilter] = useState("all");
const [filteredBeds, setFilteredBeds] = useState([]);

const [bedForm, setBedForm] = useState({
  departmentId: "",
  bedType: "Normal",
  roomNumber: "",
  bedNumber: "",
  floor: "",
  pricePerDay: "",
  amenities: [],
  description: ""
});

const [newAmenity, setNewAmenity] = useState("");

// ==================== ADD TO useEffect ====================
// Update your existing useEffect to include fetchBeds:

useEffect(() => {
  fetchDoctors();
  fetchDepartments();
  fetchOperations();
  fetchReferrals();
  fetchBeds(); // ADD THIS
}, []);

// Add another useEffect for filtering beds
useEffect(() => {
  if (bedTypeFilter === "all") {
    setFilteredBeds(beds);
  } else {
    setFilteredBeds(beds.filter(b => b.bedType === bedTypeFilter));
  }
}, [beds, bedTypeFilter]);

// ==================== ADD FETCH FUNCTIONS ====================

const fetchBeds = async () => {
  try {
    const res = await axios.get("https://careflow-lsf5.onrender.com/api/bed/hospital", config);
    setBeds(res.data);
  } catch (error) {
    console.error("Error fetching beds:", error);
  }
};

// ==================== ADD HANDLER FUNCTIONS ====================

const handleCreateBed = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await axios.post(
      "https://careflow-lsf5.onrender.com/api/bed/create",
      bedForm,
      config
    );
    alert("Bed created successfully!");
    setShowBedModal(false);
    resetBedForm();
    fetchBeds();
  } catch (error) {
    console.error("Error creating bed:", error);
    alert(error.response?.data?.message || "Failed to create bed");
  } finally {
    setLoading(false);
  }
};

const handleEditBed = (bed) => {
  setEditingBed(bed);
  setBedForm({
    departmentId: bed.departmentId?._id || "",
    bedType: bed.bedType,
    roomNumber: bed.roomNumber,
    bedNumber: bed.bedNumber,
    floor: bed.floor || "",
    pricePerDay: bed.pricePerDay,
    amenities: bed.amenities || [],
    description: bed.description || ""
  });
  setShowBedModal(true);
};

const handleUpdateBed = async (e) => {
  e.preventDefault();
  if (!editingBed) return;

  setLoading(true);
  try {
    await axios.put(
      `https://careflow-lsf5.onrender.com/api/bed/update/${editingBed._id}`,
      bedForm,
      config
    );
    alert("Bed updated successfully!");
    setShowBedModal(false);
    resetBedForm();
    fetchBeds();
  } catch (error) {
    console.error("Error updating bed:", error);
    alert(error.response?.data?.message || "Failed to update bed");
  } finally {
    setLoading(false);
  }
};

const handleDeleteBed = async (bedId) => {
  if (!window.confirm("Are you sure you want to delete this bed?")) return;

  setLoading(true);
  try {
    await axios.delete(`https://careflow-lsf5.onrender.com/api/bed/${bedId}`, config);
    alert("Bed deleted successfully!");
    fetchBeds();
  } catch (error) {
    console.error("Error deleting bed:", error);
    alert(error.response?.data?.message || "Failed to delete bed");
  } finally {
    setLoading(false);
  }
};

const handleReleaseBed = async (bedId) => {
  if (!window.confirm("Release this bed and mark it as available?")) return;

  setLoading(true);
  try {
    await axios.patch(
      `https://careflow-lsf5.onrender.com/api/bed/release/${bedId}`,
      {},
      config
    );
    alert("Bed released successfully!");
    fetchBeds();
  } catch (error) {
    console.error("Error releasing bed:", error);
    alert(error.response?.data?.message || "Failed to release bed");
  } finally {
    setLoading(false);
  }
};

const handleAddAmenity = () => {
  if (newAmenity.trim() === "") return;
  
  setBedForm({
    ...bedForm,
    amenities: [...bedForm.amenities, newAmenity.trim()]
  });
  setNewAmenity("");
};

const handleRemoveAmenity = (index) => {
  setBedForm({
    ...bedForm,
    amenities: bedForm.amenities.filter((_, i) => i !== index)
  });
};

const resetBedForm = () => {
  setBedForm({
    departmentId: "",
    bedType: "Normal",
    roomNumber: "",
    bedNumber: "",
    floor: "",
    pricePerDay: "",
    amenities: [],
    description: ""
  });
  setEditingBed(null);
  setNewAmenity("");
};
const [acceptReferralForm, setAcceptReferralForm] = useState({
  appointmentDate: "",
  appointmentTime: "",
  assignedDoctorId: "",
  hospitalResponse: "",
  assignedBedId: "" 

});
const [availableBedsForReferral, setAvailableBedsForReferral] = useState([]);
    // Add to useEffect (add these fetch calls)
useEffect(() => {
  fetchOperations(); // Add this
  fetchDepartments(); // Add this
    fetchReferrals(); // ADD THIS

}, []);
useEffect(() => {
  if (referralStatusFilter === "all") {
    setFilteredReferrals(referrals);
  } else {
    setFilteredReferrals(referrals.filter(r => r.status === referralStatusFilter));
  }
}, [referrals, referralStatusFilter]);

// ==================== ADD FETCH FUNCTIONS ====================

const fetchReferrals = async () => {
  try {
    const res = await axios.get("https://careflow-lsf5.onrender.com/api/refer/hospital", config);
    setReferrals(res.data);
  } catch (error) {
    console.error("Error fetching referrals:", error);
  }
};

// ==================== ADD HANDLER FUNCTIONS ====================

const openAcceptReferralModal = (referral) => {
  setSelectedReferralForAccept(referral);
  setShowAcceptReferralModal(true);
    fetchAvailableBedsForCareType(referral.careType);

};
const fetchAvailableBedsForCareType = async (careType) => {
  try {
    // Map care type to bed type
    let bedType = '';
    if (careType === 'ICU') {
      bedType = 'ICU';
    } else if (careType === 'Ward' || careType === 'General Ward') {
      bedType = 'General Ward';
    }
    
    const res = await axios.get(
      `https://careflow-lsf5.onrender.com/api/bed/hospital?isAvailable=true&status=Available${bedType ? `&bedType=${bedType}` : ''}`,
      config
    );
    setAvailableBedsForReferral(res.data);
  } catch (error) {
    console.error("Error fetching available beds:", error);
    setAvailableBedsForReferral([]);
  }
};
const handleAcceptReferral = async (e) => {
  e.preventDefault();
  if (!selectedReferralForAccept) return;

  setLoading(true);
  try {
    await axios.patch(
      `https://careflow-lsf5.onrender.com/api/refer/accept/${selectedReferralForAccept._id}`,
      acceptReferralForm,
      config
    );
    alert("Referral accepted successfully!");
    setShowAcceptReferralModal(false);
    resetAcceptReferralForm();
    fetchReferrals();
  } catch (error) {
    console.error("Error accepting referral:", error);
    alert(error.response?.data?.message || "Failed to accept referral");
  } finally {
    setLoading(false);
  }
};

const handleRejectReferral = async (referralId) => {
  const rejectionReason = prompt("Please enter rejection reason:");
  if (!rejectionReason || rejectionReason.trim() === "") {
    alert("Rejection reason is required");
    return;
  }

  setLoading(true);
  try {
    await axios.patch(
      `https://careflow-lsf5.onrender.com/api/refer/reject/${referralId}`,
      { rejectionReason },
      config
    );
    alert("Referral rejected");
    fetchReferrals();
  } catch (error) {
    console.error("Error rejecting referral:", error);
    alert(error.response?.data?.message || "Failed to reject referral");
  } finally {
    setLoading(false);
  }
};

const handleCompleteReferral = async (referralId) => {
  if (!window.confirm("Mark this referral as completed?")) return;

  setLoading(true);
  try {
    await axios.patch(
      `https://careflow-lsf5.onrender.com/api/refer/complete/${referralId}`,
      {},
      config
    );
    alert("Referral marked as completed!");
    fetchReferrals();
  } catch (error) {
    console.error("Error completing referral:", error);
    alert(error.response?.data?.message || "Failed to complete referral");
  } finally {
    setLoading(false);
  }
};

const resetAcceptReferralForm = () => {
  setAcceptReferralForm({
    appointmentDate: "",
    appointmentTime: "",
    assignedDoctorId: "",
    hospitalResponse: "",
    assignedBedId: "" // ADD THIS

  });
  setSelectedReferralForAccept(null);
    setAvailableBedsForReferral([]); // ADD THIS

};
// Add these fetch functions
const fetchOperations = async () => {
  try {
    const res = await axios.get("https://careflow-lsf5.onrender.com/api/operation/hospital", config);
    setOperations(res.data);
  } catch (error) {
    console.error("Error fetching operations:", error);
  }
};


// Add operation handler functions
const handleCreateOperation = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await axios.post(
      "https://careflow-lsf5.onrender.com/api/operation/create",
      operationForm,
      config
    );
    alert("Operation created successfully!");
    setShowOperationModal(false);
    resetOperationForm();
    fetchOperations();
  } catch (error) {
    console.error("Error creating operation:", error);
    alert(error.response?.data?.message || "Failed to create operation");
  } finally {
    setLoading(false);
  }
};

const handleEditOperation = (operation) => {
  setEditingOperation(operation);
  setOperationForm({
    departmentId: operation.departmentId._id,
    operationName: operation.operationName,
    description: operation.description || "",
    price: operation.price,
    duration: operation.duration || ""
  });
  setShowOperationModal(true);
};

const handleUpdateOperation = async (e) => {
  e.preventDefault();
  if (!editingOperation) return;

  setLoading(true);
  try {
    await axios.put(
      `https://careflow-lsf5.onrender.com/api/operation/update/${editingOperation._id}`,
      operationForm,
      config
    );
    alert("Operation updated successfully!");
    setShowOperationModal(false);
    resetOperationForm();
    fetchOperations();
  } catch (error) {
    console.error("Error updating operation:", error);
    alert(error.response?.data?.message || "Failed to update operation");
  } finally {
    setLoading(false);
  }
};

const handleDeleteOperation = async (operationId) => {
  if (!window.confirm("Are you sure you want to delete this operation?")) return;

  setLoading(true);
  try {
    await axios.delete(
      `https://careflow-lsf5.onrender.com/api/operation/${operationId}`,
      config
    );
    alert("Operation deleted successfully!");
    fetchOperations();
  } catch (error) {
    console.error("Error deleting operation:", error);
    alert(error.response?.data?.message || "Failed to delete operation");
  } finally {
    setLoading(false);
  }
};

const resetOperationForm = () => {
  setOperationForm({
    departmentId: "",
    operationName: "",
    description: "",
    price: "",
    duration: ""
  });
  setEditingOperation(null);
};
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const [newDoctor, setNewDoctor] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        licenseNumber: "",
        departments: [],
        bio: "",
        availableDays: [],
        availableTimeSlots: {
            start: "",
            end: "",
        },
    });

    const [profileForm, setProfileForm] = useState({
        name: "",
        phone: "",
        address: "",
        website: "",
        departments: [],
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const token = localStorage.getItem("hospitalToken");
    const hospitalInfo = JSON.parse(localStorage.getItem("hospitalinfo"));

    const config = {
        headers: { Authorization: `Bearer ${token}` },
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
        fetchDoctors();
        fetchProfile();
        fetchDepartments();
    }, []);

    // ==================== FETCH DEPARTMENTS ====================
    const fetchDepartments = async () => {
        try {
            const res = await axios.get("https://careflow-lsf5.onrender.com/api/department/get");
            setAvailableDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    // ==================== DOCTOR FUNCTIONS ====================
    const fetchDoctors = async () => {
        try {
            const res = await axios.get("https://careflow-lsf5.onrender.com/api/hospital/getdocs", config);
            setDoctors(res.data);
        } catch (err) {
            console.log("Error fetching doctors:", err);
        }
    };

    const handleChange = (e) => {
        setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
    };

    const handleDepartmentSelect = (deptName) => {
        setNewDoctor((prev) => {
            if (prev.departments.includes(deptName)) {
                return {
                    ...prev,
                    departments: prev.departments.filter((d) => d !== deptName),
                };
            }
            return {
                ...prev,
                departments: [...prev.departments, deptName],
            };
        });
    };

    const handleDayToggle = (day) => {
        setNewDoctor((prev) => {
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

    const selectAllDepartments = () => {
        setNewDoctor({
            ...newDoctor,
            departments: availableDepartments.map(dept => dept.name)
        });
    };

    const deselectAllDepartments = () => {
        setNewDoctor({ ...newDoctor, departments: [] });
    };
    const handleAddDoctor = async (e) => {
        e.preventDefault();

        if (!hospitalInfo.userId) {
            alert("Hospital info not found.");
            return;
        }

        if (newDoctor.departments.length === 0) {
            alert("Please select at least one department.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                "https://careflow-lsf5.onrender.com/api/doctor/register",
                { ...newDoctor, hospitalId: hospitalInfo.userId },
                config
            );

            alert("Doctor added successfully");
            setNewDoctor({
                name: "",
                email: "",
                password: "",
                phone: "",
                specialization: "",
                qualification: "",
                experience: "",
                consultationFee: "",
                licenseNumber: "",
                departments: [],
                bio: "",
                availableDays: [],
                availableTimeSlots: {
                    start: "",
                    end: "",
                },
            });
            setShowAddDoctorForm(false);
            fetchDoctors();
        } catch (err) {
            alert(err.response?.data?.message || "Error adding doctor");
        } finally {
            setLoading(false);
        }
    };

    // ==================== PROFILE FUNCTIONS ====================
    const fetchProfile = async () => {
        try {
            const res = await axios.get("https://careflow-lsf5.onrender.com/api/hospital/getProfile", config);
            setProfile(res.data);
            setProfileForm({
                name: res.data.name || "",
                phone: res.data.phone || "",
                address: res.data.address || "",
                website: res.data.website || "",
                departments: res.data.departments || [],
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put(
                "https://careflow-lsf5.onrender.com/api/hospital/profile",
                profileForm,
                config
            );
            setProfile(res.data);
            localStorage.setItem("hospitalinfo", JSON.stringify({ ...hospitalInfo, hospital: res.data }));
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
                "https://careflow-lsf5.onrender.com/api/hospital/resetpassword",
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
        localStorage.removeItem("hospitalToken");
        localStorage.removeItem("hospitalinfo");
        navigate("/");
    };

    const handleProfileDepartmentSelect = (deptName) => {
        setProfileForm((prev) => {
            if (prev.departments.includes(deptName)) {
                return {
                    ...prev,
                    departments: prev.departments.filter((d) => d !== deptName),
                };
            }
            return {
                ...prev,
                departments: [...prev.departments, deptName],
            };
        });
    };

    // ==================== RENDER PAGES ====================
    const renderDoctors = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Management</h2>
                        <p className="text-gray-600">Manage doctors in your hospital</p>
                    </div>
                    <button
                        onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        <span>{showAddDoctorForm ? "Cancel" : "Add Doctor"}</span>
                    </button>
                </div>
            </div>

            {/* Add Doctor Form */}
            {showAddDoctorForm && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Doctor</h3>

                    <form onSubmit={handleAddDoctor} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Doctor Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newDoctor.name}
                                    onChange={handleChange}
                                    placeholder="Dr. John Doe"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newDoctor.email}
                                    onChange={handleChange}
                                    placeholder="doctor@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newDoctor.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                    minLength="6"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newDoctor.phone}
                                    onChange={handleChange}
                                    placeholder="1234567890"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={newDoctor.specialization}
                                    onChange={handleChange}
                                    placeholder="Cardiologist"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Qualification
                                </label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={newDoctor.qualification}
                                    onChange={handleChange}
                                    placeholder="MBBS, MD"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Experience (years)
                                </label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={newDoctor.experience}
                                    onChange={handleChange}
                                    placeholder="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Consultation Fee
                                </label>
                                <input
                                    type="number"
                                    name="consultationFee"
                                    value={newDoctor.consultationFee}
                                    onChange={handleChange}
                                    placeholder="500"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={newDoctor.licenseNumber}
                                    onChange={handleChange}
                                    placeholder="MED123456"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            {/* Bio Field */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bio (Optional)
                                </label>
                                <textarea
                                    name="bio"
                                    value={newDoctor.bio}
                                    onChange={handleChange}
                                    placeholder="Brief bio about the doctor..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Available Days */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Available Days (Optional)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {daysOfWeek.map((day) => (
                                    <label
                                        key={day}
                                        className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={newDoctor.availableDays.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium">{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Start Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={newDoctor.availableTimeSlots.start}
                                    onChange={(e) =>
                                        setNewDoctor({
                                            ...newDoctor,
                                            availableTimeSlots: {
                                                ...newDoctor.availableTimeSlots,
                                                start: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    End Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={newDoctor.availableTimeSlots.end}
                                    onChange={(e) =>
                                        setNewDoctor({
                                            ...newDoctor,
                                            availableTimeSlots: {
                                                ...newDoctor.availableTimeSlots,
                                                end: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Departments Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Select Departments (at least one required)
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllDepartments}
                                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deselectAllDepartments}
                                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {availableDepartments.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableDepartments.map((dept) => (
                                        <label
                                            key={dept._id}
                                            className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-orange-50 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={newDoctor.departments.includes(dept.name)}
                                                onChange={() => handleDepartmentSelect(dept.name)}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium">{dept.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-red-500 text-sm">
                                    No departments available. Please contact admin.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding Doctor..." : "Add Doctor"}
                        </button>
                    </form>
                </div>
            )}

            {/* Doctors List */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">All Doctors ({doctors.length})</h3>

                {doctors.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                        <p className="text-gray-500">No doctors added yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doc) => (
                            <div
                                key={doc._id}
                                className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-start space-x-4 mb-4">
                                    <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        {doc.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-1">{doc.name}</h4>
                                        <p className="text-sm text-orange-600 font-semibold">
                                            {doc.specialization}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-semibold">Email:</span> {doc.email}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Phone:</span> {doc.phone}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Qualification:</span> {doc.qualification}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Experience:</span> {doc.experience} years
                                    </p>
                                    <p>
                                        <span className="font-semibold">Fee:</span> ₹{doc.consultationFee}
                                    </p>
                                    <p>
                                        <span className="font-semibold">License:</span> {doc.licenseNumber}
                                    </p>
                                    {doc.departments && doc.departments.length > 0 && (
                                        <p>
                                            <span className="font-semibold">Departments:</span>{" "}
                                            {doc.departments.join(", ")}
                                        </p>
                                    )}
                                    {doc.availableDays && doc.availableDays.length > 0 && (
                                        <p>
                                            <span className="font-semibold">Available:</span>{" "}
                                            {doc.availableDays.join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Add this render function in HospitalDashboard.jsx
const renderOperations = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Operations Management</h2>
          <p className="text-gray-600">Manage surgical operations and procedures</p>
        </div>
        <button
          onClick={() => setShowOperationModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Operation
        </button>
      </div>
    </div>

    {/* Stats Card */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Total Operations</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{operations.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Departments Covered</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {new Set(operations.map(op => op.departmentId._id)).size}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Avg. Price</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ₹{operations.length > 0 ? Math.round(operations.reduce((acc, op) => acc + op.price, 0) / operations.length) : 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Operations List */}
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">All Operations</h3>
      </div>

      {operations.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">No operations added yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Operation" to create your first operation</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Operation Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {operations.map((operation) => (
                <tr key={operation._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{operation.operationName}</p>
                      {operation.description && (
                        <p className="text-sm text-gray-500 mt-1">{operation.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {operation.departmentId?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800">{operation.duration || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-green-600">₹{operation.price.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditOperation(operation)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOperation(operation._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Delete
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

    {/* Add/Edit Operation Modal */}
    {showOperationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingOperation ? "Edit Operation" : "Add New Operation"}
              </h3>
              <button
                onClick={() => {
                  setShowOperationModal(false);
                  resetOperationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form
            onSubmit={editingOperation ? handleUpdateOperation : handleCreateOperation}
            className="p-6 space-y-4"
          >
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={operationForm.departmentId}
                onChange={(e) =>
                  setOperationForm({ ...operationForm, departmentId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Department</option>
                {availableDepartments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Operation Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Operation Name *
              </label>
              <input
                type="text"
                value={operationForm.operationName}
                onChange={(e) =>
                  setOperationForm({ ...operationForm, operationName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Heart Bypass Surgery"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={operationForm.description}
                onChange={(e) =>
                  setOperationForm({ ...operationForm, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Brief description of the operation..."
              />
            </div>

            {/* Duration and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={operationForm.duration}
                  onChange={(e) =>
                    setOperationForm({ ...operationForm, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 2-3 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={operationForm.price}
                  onChange={(e) =>
                    setOperationForm({ ...operationForm, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter price"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading
                  ? editingOperation
                    ? "Updating..."
                    : "Creating..."
                  : editingOperation
                  ? "Update Operation"
                  : "Create Operation"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOperationModal(false);
                  resetOperationForm();
                }}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition-colors"
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
    const renderProfile = () => {
        if (!profile) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h2>
                    <p className="text-gray-600">Manage your hospital information</p>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-600 text-3xl font-bold">
                                {profile.name?.charAt(0) || "H"}
                            </div>
                            <div className="text-white">
                                <h3 className="text-2xl font-bold">{profile.name}</h3>
                                <p className="text-orange-100">{profile.email}</p>
                                <p className="text-sm text-orange-200 mt-1">
                                    Status: {profile.status || "Pending"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {!editMode ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Hospital Name
                                        </label>
                                        <p className="text-gray-800 font-medium">{profile.name || "Not set"}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Email
                                        </label>
                                        <p className="text-gray-800 font-medium">{profile.email || "Not set"}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Phone
                                        </label>
                                        <p className="text-gray-800 font-medium">{profile.phone || "Not set"}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Website
                                        </label>
                                        <p className="text-gray-800 font-medium">{profile.website || "Not set"}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Address
                                        </label>
                                        <p className="text-gray-800 font-medium">{profile.address || "Not set"}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Departments
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {profile.departments?.join(", ") || "Not set"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hospital Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, name: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, phone: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.address}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, address: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.website}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, website: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Department Selection */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Select Departments
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {availableDepartments.map((dept) => (
                                                <label
                                                    key={dept._id}
                                                    className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-orange-50 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={profileForm.departments.includes(dept.name)}
                                                        onChange={() => handleProfileDepartmentSelect(dept.name)}
                                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                    />
                                                    <span className="text-sm font-medium">{dept.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
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
                                                address: profile.address || "",
                                                website: profile.website || "",
                                                departments: profile.departments || [],
                                            });
                                        }}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                                minLength="6"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                                minLength="6"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>
            </div>
        );
    };


// Add this new render function (place it after renderReferrals and before renderProfile)

const renderBeds = () => {
  // Calculate stats
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.isAvailable).length;
  const occupiedBeds = beds.filter(b => b.status === "Occupied").length;
  const maintenanceBeds = beds.filter(b => b.status === "Under Maintenance").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bed Management</h2>
            <p className="text-gray-600">Manage hospital beds and room assignments</p>
          </div>
          <button
            onClick={() => setShowBedModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bed
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Beds</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalBeds}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{availableBeds}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{occupiedBeds}</p>
            </div>
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{maintenanceBeds}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setBedTypeFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              bedTypeFilter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({beds.length})
          </button>
          {["Normal", "AC", "Luxury", "ICU", "General Ward"].map((type) => (
            <button
              key={type}
              onClick={() => setBedTypeFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                bedTypeFilter === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type} ({beds.filter(b => b.bedType === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Beds Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">
            {bedTypeFilter === "all" ? "All Beds" : `${bedTypeFilter} Beds`}
          </h3>
        </div>

        {filteredBeds.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="text-gray-500">No beds added yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Bed" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room/Bed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price/Day</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBeds.map((bed) => (
                  <tr key={bed._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">Room {bed.roomNumber}</p>
                        <p className="text-sm text-gray-500">Bed {bed.bedNumber}</p>
                        {bed.floor && (
                          <p className="text-xs text-gray-400">Floor {bed.floor}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bed.bedType === "ICU" ? "bg-red-100 text-red-800" :
                        bed.bedType === "Luxury" ? "bg-purple-100 text-purple-800" :
                        bed.bedType === "AC" ? "bg-blue-100 text-blue-800" :
                        bed.bedType === "General Ward" ? "bg-cyan-100 text-cyan-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {bed.bedType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bed.departmentId ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                          {bed.departmentId.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">₹{bed.pricePerDay.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        bed.status === "Available" ? "bg-green-100 text-green-800 border-green-200" :
                        bed.status === "Occupied" ? "bg-red-100 text-red-800 border-red-200" :
                        bed.status === "Under Maintenance" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        "bg-blue-100 text-blue-800 border-blue-200"
                      }`}>
                        {bed.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bed.currentPatient ? (
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{bed.currentPatient.patientName}</p>
                          <p className="text-xs text-gray-500">
                            Admitted: {formatDate(bed.currentPatient.admissionDate)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {bed.status === "Occupied" ? (
                          <button
                            onClick={() => handleReleaseBed(bed._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            Release
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditBed(bed)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBed(bed._id)}
                              disabled={loading}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
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

      {/* Add/Edit Bed Modal */}
      {showBedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingBed ? "Edit Bed" : "Add New Bed"}
                </h3>
                <button
                  onClick={() => {
                    setShowBedModal(false);
                    resetBedForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={editingBed ? handleUpdateBed : handleCreateBed} className="p-6 space-y-6">
              {/* Bed Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bed Type *
                </label>
                <select
                  value={bedForm.bedType}
                  onChange={(e) => setBedForm({ ...bedForm, bedType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="AC">AC</option>
                  <option value="Luxury">Luxury</option>
                  <option value="ICU">ICU</option>
                  <option value="General Ward">General Ward</option>
                </select>
              </div>

              {/* Room Number and Bed Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={bedForm.roomNumber}
                    onChange={(e) => setBedForm({ ...bedForm, roomNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="e.g., 101, A-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bed Number *
                  </label>
                  <input
                    type="text"
                    value={bedForm.bedNumber}
                    onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="e.g., 1, A, B1"
                  />
                </div>
              </div>

              {/* Floor and Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Floor (Optional)
                  </label>
                  <input
                    type="text"
                    value={bedForm.floor}
                    onChange={(e) => setBedForm({ ...bedForm, floor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 1st, Ground, 2nd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <select
                    value={bedForm.departmentId}
                    onChange={(e) => setBedForm({ ...bedForm, departmentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">General</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Per Day */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Per Day (₹) *
                </label>
                <input
                  type="number"
                  value={bedForm.pricePerDay}
                  onChange={(e) => setBedForm({ ...bedForm, pricePerDay: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  required
                  placeholder="Enter price per day"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., TV, WiFi, Private Bathroom"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {bedForm.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bedForm.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bedForm.description}
                  onChange={(e) => setBedForm({ ...bedForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Additional details about the bed..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (editingBed ? "Updating..." : "Creating...") : (editingBed ? "Update Bed" : "Create Bed")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBedModal(false);
                    resetBedForm();
                  }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
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


    // Add this new render function (place it after renderOperations and before renderProfile)

const renderReferrals = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Referrals</h2>
          <p className="text-gray-600">Manage incoming referrals from doctors</p>
        </div>
        
        {/* Status Filter */}
        <div>
          <select
            value={referralStatusFilter}
            onChange={(e) => setReferralStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Referrals</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Total</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{referrals.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
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

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
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

      <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {referrals.filter(r => r.status === "rejected").length}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
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
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          {referralStatusFilter === "all" ? "All Referrals" : `${referralStatusFilter.charAt(0).toUpperCase() + referralStatusFilter.slice(1)} Referrals`}
        </h3>
      </div>

      {filteredReferrals.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No referrals found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Referring Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Operation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Care Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Urgency</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{referral.patientName}</p>
                      <p className="text-sm text-gray-500">{referral.patientPhone}</p>
                      {referral.patientEmail && (
                        <p className="text-xs text-gray-400">{referral.patientEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{referral.referringDoctorId?.name || "N/A"}</p>
                      <p className="text-sm text-gray-500">{referral.referringDoctorId?.specialization || ""}</p>
                      {referral.referringDoctorId?.hospitalId?.name && (
                        <p className="text-xs text-gray-400">{referral.referringDoctorId.hospitalId.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {referral.operationId ? (
                      <div>
                        <p className="font-medium text-gray-800">{referral.operationId.operationName}</p>
                        <p className="text-sm text-green-600 font-semibold">₹{referral.operationId.price.toLocaleString()}</p>
                        {referral.operationId.departmentId?.name && (
                          <p className="text-xs text-gray-500">{referral.operationId.departmentId.name}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No operation</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      referral.careType === "ICU" ? "bg-red-100 text-red-800" :
                      referral.careType === "Emergency" ? "bg-orange-100 text-orange-800" :
                      referral.careType === "Ward" || referral.careType === "General Ward" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {referral.careType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      referral.urgency === "Critical" ? "bg-red-100 text-red-800" :
                      referral.urgency === "High" ? "bg-orange-100 text-orange-800" :
                      referral.urgency === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {referral.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">₹{referral.estimatedPrice.toLocaleString()}</p>
                    {referral.estimatedStayDays > 0 && (
                      <p className="text-xs text-gray-500">{referral.estimatedStayDays} days</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      referral.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      referral.status === "accepted" ? "bg-green-100 text-green-800 border-green-200" :
                      referral.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                      referral.status === "completed" ? "bg-blue-100 text-blue-800 border-blue-200" :
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* View Button - Always visible */}
                      {/* <button
                        onClick={() => {
                          setViewReferral(referral);
                          setShowViewReferralModal(true);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        View
                      </button> */}
                      
                      {/* Action Buttons based on status */}
                      {referral.status === "pending" && (
                        <>
                          <button
                            onClick={() => openAcceptReferralModal(referral)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectReferral(referral._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {referral.status === "accepted" && (
                        <button
                          onClick={() => handleCompleteReferral(referral._id)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Complete
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

    {/* Accept Referral Modal */}
    {showAcceptReferralModal && selectedReferralForAccept && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Accept Referral</h3>
              <button
                onClick={() => {
                  setShowAcceptReferralModal(false);
                  resetAcceptReferralForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleAcceptReferral} className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedReferralForAccept.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{selectedReferralForAccept.patientPhone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Care Type:</span>
                  <span className="ml-2 font-medium">{selectedReferralForAccept.careType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Urgency:</span>
                  <span className="ml-2 font-medium">{selectedReferralForAccept.urgency}</span>
                </div>
              </div>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                value={acceptReferralForm.appointmentDate}
                onChange={(e) => setAcceptReferralForm({ ...acceptReferralForm, appointmentDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Time *
              </label>
              <input
                type="time"
                value={acceptReferralForm.appointmentTime}
                onChange={(e) => setAcceptReferralForm({ ...acceptReferralForm, appointmentTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Assign Doctor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign Doctor (Optional)
              </label>
              <select
                value={acceptReferralForm.assignedDoctorId}
                onChange={(e) => setAcceptReferralForm({ ...acceptReferralForm, assignedDoctorId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
{/* Assign Bed - ADD THIS SECTION */}
{selectedReferralForAccept && 
 (selectedReferralForAccept.careType === 'ICU' || 
  selectedReferralForAccept.careType === 'Ward' || 
  selectedReferralForAccept.careType === 'General Ward') && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Assign Bed {selectedReferralForAccept.careType === 'ICU' ? '(Required for ICU)' : '(Optional)'}
    </label>
    <select
      value={acceptReferralForm.assignedBedId}
      onChange={(e) => setAcceptReferralForm({ ...acceptReferralForm, assignedBedId: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      required={selectedReferralForAccept.careType === 'ICU'}
    >
      <option value="">Select a bed</option>
      {availableBedsForReferral.map((bed) => (
        <option key={bed._id} value={bed._id}>
          {bed.bedType} - Room {bed.roomNumber}, Bed {bed.bedNumber} - ₹{bed.pricePerDay}/day
          {bed.departmentId && ` (${bed.departmentId.name})`}
        </option>
      ))}
    </select>
    
    {availableBedsForReferral.length === 0 && (
      <p className="text-sm text-red-600 mt-1">
        No available beds found for {selectedReferralForAccept.careType}
      </p>
    )}
    
    {acceptReferralForm.assignedBedId && (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          Bed charges will be automatically added to final price
        </p>
        {(() => {
          const selectedBed = availableBedsForReferral.find(b => b._id === acceptReferralForm.assignedBedId);
          const estimatedDays = selectedReferralForAccept.estimatedStayDays || 1;
          const bedCharges = selectedBed ? selectedBed.pricePerDay * estimatedDays : 0;
          const totalPrice = (selectedReferralForAccept.estimatedPrice || 0) + bedCharges;
          
          return (
            <div className="text-sm text-gray-700 mt-2 space-y-1">
              <p>Operation/Procedure: ₹{(selectedReferralForAccept.estimatedPrice || 0).toLocaleString()}</p>
              <p>Bed Charges ({estimatedDays} {estimatedDays > 1 ? 'days' : 'day'}): ₹{bedCharges.toLocaleString()}</p>
              <p className="font-semibold text-green-600 pt-1 border-t border-blue-300">
                Total Estimated: ₹{totalPrice.toLocaleString()}
              </p>
            </div>
          );
        })()}
      </div>
    )}
  </div>
)}

            {/* Hospital Response */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Response Message
              </label>
              <textarea
                value={acceptReferralForm.hospitalResponse}
                onChange={(e) => setAcceptReferralForm({ ...acceptReferralForm, hospitalResponse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Add any message for the referring doctor..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Accepting..." : "Accept Referral"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAcceptReferralModal(false);
                  resetAcceptReferralForm();
                }}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Referral Details Modal */}
    {showViewReferralModal && viewReferral && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Referral Details</h3>
              <button
                onClick={() => {
                  setShowViewReferralModal(false);
                  setViewReferral(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                viewReferral.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                viewReferral.status === "accepted" ? "bg-green-100 text-green-800 border-green-200" :
                viewReferral.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                viewReferral.status === "completed" ? "bg-blue-100 text-blue-800 border-blue-200" :
                "bg-gray-100 text-gray-800 border-gray-200"
              }`}>
                Status: {viewReferral.status.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                viewReferral.urgency === "Critical" ? "bg-red-100 text-red-800" :
                viewReferral.urgency === "High" ? "bg-orange-100 text-orange-800" :
                viewReferral.urgency === "Medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }`}>
                {viewReferral.urgency} Priority
              </span>
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">{viewReferral.patientName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">{viewReferral.patientPhone}</p>
                </div>
                {viewReferral.patientEmail && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{viewReferral.patientEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Referring Doctor */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Referring Doctor</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">{viewReferral.referringDoctorId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Specialization</p>
                  <p className="font-medium text-gray-800">{viewReferral.referringDoctorId?.specialization || "N/A"}</p>
                </div>
                {viewReferral.referringDoctorId?.hospitalId?.name && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Hospital</p>
                    <p className="font-medium text-gray-800">{viewReferral.referringDoctorId.hospitalId.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Operation Details */}
            {viewReferral.operationId && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Operation/Procedure</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Operation Name</p>
                    <p className="font-medium text-gray-800">{viewReferral.operationId.operationName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-semibold text-green-600">₹{viewReferral.operationId.price.toLocaleString()}</p>
                  </div>
                  {viewReferral.operationId.duration && (
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">{viewReferral.operationId.duration}</p>
                    </div>
                  )}
                  {viewReferral.operationId.departmentId?.name && (
                    <div>
                      <p className="text-gray-600">Department</p>
                      <p className="font-medium text-gray-800">{viewReferral.operationId.departmentId.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Referral Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Referral Details</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Reason</p>
                  <p className="font-medium text-gray-800">{viewReferral.reason}</p>
                </div>
                {viewReferral.medicalNotes && (
                  <div>
                    <p className="text-gray-600">Medical Notes</p>
                    <p className="font-medium text-gray-800">{viewReferral.medicalNotes}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Care Type</p>
                    <p className="font-medium text-gray-800">{viewReferral.careType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Price</p>
                    <p className="font-semibold text-gray-800">₹{viewReferral.estimatedPrice.toLocaleString()}</p>
                  </div>
                  {viewReferral.estimatedStayDays > 0 && (
                    <div>
                      <p className="text-gray-600">Estimated Stay</p>
                      <p className="font-medium text-gray-800">{viewReferral.estimatedStayDays} days</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details (if accepted) */}
            {viewReferral.status === "accepted" && viewReferral.appointmentDate && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-3">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{formatDate(viewReferral.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">{viewReferral.appointmentTime}</p>
                  </div>
                  {viewReferral.assignedDoctorId && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Assigned Doctor</p>
                      <p className="font-medium text-gray-800">
                        {viewReferral.assignedDoctorId.name} - {viewReferral.assignedDoctorId.specialization}
                      </p>
                    </div>
                  )}
                  {viewReferral.hospitalResponse && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Hospital Response</p>
                      <p className="font-medium text-gray-800">{viewReferral.hospitalResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rejection Details */}
            {viewReferral.status === "rejected" && viewReferral.rejectionReason && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-gray-800 mb-2">Rejection Reason</h4>
                <p className="text-sm text-gray-800">{viewReferral.rejectionReason}</p>
              </div>
            )}

            {/* Prescription Link */}
            {viewReferral.prescriptionId && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-2">Linked Prescription</h4>
                <div className="text-sm">
                  <p className="text-gray-600">Diagnosis: <span className="font-medium text-gray-800">{viewReferral.prescriptionId.diagnosis}</span></p>
                  <p className="text-gray-600">Created: <span className="font-medium text-gray-800">{formatDate(viewReferral.prescriptionId.createdAt)}</span></p>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setShowViewReferralModal(false);
                setViewReferral(null);
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
    // ==================== MAIN RENDER ====================
    const menuItems = [
        {
            id: "doctors",
            label: "Doctors",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
         {
    id: "operations", // Add this
    label: "Operations",
    badge: operations.length,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
        {
    id: "referrals",
    label: "Referrals",
    badge: referrals.filter(r => r.status === "pending").length > 0 
      ? referrals.filter(r => r.status === "pending").length 
      : null,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "beds",
    label: "Beds",
    badge: beds.filter(b => b.isAvailable).length > 0 
      ? beds.filter(b => b.isAvailable).length 
      : null,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
   {
            id: "profile",
            label: "Profile",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-orange-600 to-amber-700 text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-orange-500">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-orange-600"
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
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Hospital Panel</h2>
                            <p className="text-xs text-orange-200">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activePage === item.id
                                ? "bg-white text-orange-600 shadow-lg"
                                : "text-white hover:bg-orange-500"
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-orange-500">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {/* Topbar */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Welcome, {hospitalInfo?.hospital?.name || profile?.name || "Hospital"}!
                            </h1>
                            <p className="text-sm text-gray-500">
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
                                <p className="text-sm font-semibold text-gray-800">
                                    {hospitalInfo?.hospital?.name || profile?.name || "Hospital"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {hospitalInfo?.hospital?.email || profile?.email || "hospital@example.com"}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {hospitalInfo?.hospital?.name?.charAt(0) || profile?.name?.charAt(0) || "H"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {activePage === "doctors" && renderDoctors()}
                    {activePage === "operations" && renderOperations()}
                      {activePage === "beds" && renderBeds()} 
                    {activePage === "referrals" && renderReferrals()}
                    {activePage === "profile" && renderProfile()}


                </main>
            </div>
        </div>
    );
};

export default HospitalDashboard;