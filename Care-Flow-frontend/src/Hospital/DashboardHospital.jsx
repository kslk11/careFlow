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
  const [darkMode, setDarkMode] = useState(false);

  // Operations State
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

  // Referrals State
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [referralStatusFilter, setReferralStatusFilter] = useState("all");
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  const [selectedReferralForBed, setSelectedReferralForBed] = useState(null);
  const [showViewReferralModal, setShowViewReferralModal] = useState(false);
  const [viewReferral, setViewReferral] = useState(null);

  // Beds State
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
  const [availableBedsForReferral, setAvailableBedsForReferral] = useState([]);

  // Billing/Income State
  const [bills, setBills] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [adminShare, setAdminShare] = useState(0);
  const [hospitalShare, setHospitalShare] = useState(0);

  // Assign Bed Form
  const [assignBedForm, setAssignBedForm] = useState({
    bedId: "",
    appointmentDate: "",
    appointmentTime: "",
    assignedDoctorId: "",
    hospitalResponse: ""
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
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

  // Dark mode effect
  useEffect(() => {
    const savedTheme = localStorage.getItem("hospitalTheme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hospitalTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
    fetchOperations();
    fetchReferrals();
    fetchBeds();
    fetchBills();
  }, []);

  // Filter Effects
  useEffect(() => {
    if (referralStatusFilter === "all") {
      setFilteredReferrals(referrals);
    } else {
      setFilteredReferrals(referrals.filter(r => r.status === referralStatusFilter));
    }
  }, [referrals, referralStatusFilter]);

  useEffect(() => {
    if (bedTypeFilter === "all") {
      setFilteredBeds(beds);
    } else {
      setFilteredBeds(beds.filter(b => b.bedType === bedTypeFilter));
    }
  }, [beds, bedTypeFilter]);

  // ==================== PAYMENT FUNCTIONS ====================

const handleRecordPayment = async (e) => {
  e.preventDefault();
  if (!selectedBillForPayment) return;

  if (paymentForm.amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const maxAmount = (selectedBillForPayment.totalAmount || 0) - (selectedBillForPayment.amountPaid || 0);
  if (paymentForm.amount > maxAmount) {
    alert(`Amount cannot exceed due amount: ₹${maxAmount}`);
    return;
  }

  setLoading(true);
  try {
    await axios.post(
      `https://careflow-lsf5.onrender.com/api/bill/payment/${selectedBillForPayment._id}`,
      paymentForm,
      config
    );
    alert("Payment recorded successfully!");
    setShowPaymentModal(false);
    setSelectedBillForPayment(null);
    fetchBills();
  } catch (error) {
    console.error("Error recording payment:", error);
    alert(error.response?.data?.message || "Failed to record payment");
  } finally {
    setLoading(false);
  }
};

  // Theme-aware classes
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgSecondary = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // ==================== FETCH FUNCTIONS ====================

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/department/get");
      setAvailableDepartments(res.data);
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/hospital/getdocs", config);
      setDoctors(res.data);
    } catch (err) {
      console.log("Error fetching doctors:", err);
    }
  };

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

  const fetchOperations = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/operation/hospital", config);
      setOperations(res.data);
    } catch (error) {
      console.error("Error fetching operations:", error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/refer/hospital", config);
      setReferrals(res.data);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const fetchBeds = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/bed/hospital", config);
      setBeds(res.data);
    } catch (error) {
      console.error("Error fetching beds:", error);
    }
  };
 const fetchBills = async () => {
  try {
    const res = await axios.get("https://careflow-lsf5.onrender.com/api/bill/hospital", config);
    
    // Your backend returns: { success: true, data: [...], summary: {...} }
    const billsData = res.data.data || []; // Get the 'data' property
    
    // Ensure it's an array
    if (!Array.isArray(billsData)) {
      console.error("Bills data is not an array:", billsData);
      setBills([]);
      return;
    }

    setBills(billsData);

    // Use summary from backend if available, otherwise calculate
    if (res.data.summary) {
      setTotalIncome(res.data.summary.totalRevenue || 0);
      setHospitalShare(res.data.summary.hospitalShare || 0);
      setAdminShare(res.data.summary.adminShare || 0);
    } else {
      // Fallback calculation if summary not provided
      const total = billsData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const admin = total * 0.1;
      const hospital = total * 0.9;

      setTotalIncome(total);
      setAdminShare(admin);
      setHospitalShare(hospital);
    }

  } catch (error) {
    console.error("Error fetching bills:", error);
    console.error("Error details:", error.response?.data);
    setBills([]);
    setTotalIncome(0);
    setAdminShare(0);
    setHospitalShare(0);
  }
};

  const fetchAvailableBedsForCareType = async (careType) => {
    try {
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

  // ==================== DOCTOR FUNCTIONS ====================

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

  // ==================== OPERATION FUNCTIONS ====================

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

  // ==================== BED FUNCTIONS ====================

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

  // ==================== BILL HELPER FUNCTIONS ====================

const calculateBillTotals = (items, tax = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const taxAmount = (subtotal * tax) / 100;
  const totalAmount = subtotal + taxAmount - discount;

  return {
    subtotal,
    taxAmount,
    discount,
    totalAmount
  };
};

const getDisplayTotals = () => {
  const subtotal = billForm.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const taxAmount = (subtotal * billForm.tax) / 100;
  const totalAmount = subtotal + taxAmount - billForm.discount;
  const hospitalShare = totalAmount * 0.9;
  const adminShare = totalAmount * 0.1;

  return {
    subtotal,
    taxAmount,
    discount: billForm.discount,
    totalAmount,
    hospitalShare,
    adminShare
  };
};
const resetBillForm = () => {
  setBillForm({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    patientAddress: "",
    referralId: "",
    appointmentId: "",
    prescriptionId: "",
    assignedDoctorId: "",
    items: [],
    tax: 0,
    discount: 0,
    notes: "",
    bedDetails: null,
    operationDetails: null,
    paymentMethod: "",
    paymentStatus: "pending"
  });
  setEditingBill(null);
};

const handleAddBillItem = () => {
  if (!billItem.itemName || billItem.unitPrice <= 0) {
    alert("Please fill item name and valid price");
    return;
  }

  const newItem = {
    ...billItem,
    totalPrice: billItem.quantity * billItem.unitPrice
  };

  setBillForm({
    ...billForm,
    items: [...billForm.items, newItem]
  });

  setBillItem({
    itemType: "Operation",
    itemName: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });
};

const handleRemoveBillItem = (index) => {
  const updatedItems = billForm.items.filter((_, i) => i !== index);
  setBillForm({
    ...billForm,
    items: updatedItems
  });
};

const handleUpdateTaxDiscount = (field, value) => {
  const numValue = parseFloat(value) || 0;
  setBillForm({
    ...billForm,
    [field]: numValue
  });
};
// ==================== BILL CRUD FUNCTIONS ====================

const handleCreateBill = async (e) => {
  e.preventDefault();

  if (billForm.items.length === 0) {
    alert("Please add at least one item to the bill");
    return;
  }

  setLoading(true);
  try {
     console.log("📤 Bill Data Being Sent:", JSON.stringify(billData, null, 2));
    await axios.post(
      "https://careflow-lsf5.onrender.com/api/bill/create",
      billForm,
      config
    );
    alert("Bill created successfully!");
    setShowBillModal(false);
    resetBillForm();
    fetchBills();
  } catch (error) {
    console.error("Error creating bill:", error);
    alert(error.response?.data?.message || "Failed to create bill");
  } finally {
    setLoading(false);
  }
};

const handleEditBill = (bill) => {
  setEditingBill(bill);
  setBillForm({
    patientName: bill.patientName || "",
    patientPhone: bill.patientPhone || "",
    patientEmail: bill.patientEmail || "",
    patientAddress: bill.patientAddress || "",
    referralId: bill.referralId?._id || "",
    appointmentId: bill.appointmentId?._id || "",
    prescriptionId: bill.prescriptionId?._id || "",
    assignedDoctorId: bill.assignedDoctorId?._id || "",
    items: bill.items || [],
    tax: bill.tax || 0,
    discount: bill.discount || 0,
    notes: bill.notes || "",
    bedDetails: bill.bedDetails || null,
    operationDetails: bill.operationDetails || null,
    paymentMethod: bill.paymentMethod || "",
    paymentStatus: bill.paymentStatus || "pending"
  });
  setShowBillModal(true);
};

const handleUpdateBill = async (e) => {
  e.preventDefault();
  if (!editingBill) return;

  setLoading(true);
  try {
    await axios.put(
      `https://careflow-lsf5.onrender.com/api/bill/${editingBill._id}`,
      billForm,
      config
    );
    alert("Bill updated successfully!");
    setShowBillModal(false);
    resetBillForm();
    fetchBills();
  } catch (error) {
    console.error("Error updating bill:", error);
    alert(error.response?.data?.message || "Failed to update bill");
  } finally {
    setLoading(false);
  }
};

const handleDeleteBill = async (billId) => {
  if (!window.confirm("Are you sure you want to delete this bill?")) return;

  setLoading(true);
  try {
    await axios.delete(`https://careflow-lsf5.onrender.com/api/bill/${billId}`, config);
    alert("Bill deleted successfully!");
    fetchBills();
  } catch (error) {
    console.error("Error deleting bill:", error);
    alert(error.response?.data?.message || "Failed to delete bill");
  } finally {
    setLoading(false);
  }
};

const handleGenerateBillFromReferral = async (referralId) => {
  if (!window.confirm("Generate bill from this referral?")) return;

  setLoading(true);
  try {
    await axios.post(`https://careflow-lsf5.onrender.com/api/bill/create-from-referral/${referralId}`,{});
    alert("Bill generated successfully!");
    fetchBills();
    fetchReferrals(); // Refresh referrals to update status
  } catch (error) {
    console.error("Error generating bill:", error);
    alert(error.response?.data?.message || "Failed to generate bill");
  } finally {
    setLoading(false);
  }
};

const generateBillFromCompletedReferral = async (referral) => {
  try {
    // Calculate bed charges
    let bedCharges = 0;
    let bedDetails = null;

    if (referral.bedId || referral.assignedBedId) {
      const bedId = referral.bedId?._id || referral.assignedBedId?._id;
      const assignedBed = beds.find(b => String(b._id) === String(bedId));
      const days = referral.estimatedStayDays || 1;

      bedCharges = assignedBed ? (assignedBed.pricePerDay * days) : 0;

      bedDetails = {
        bedId: bedId,
        bedType: assignedBed?.bedType || referral.bedId?.bedType || referral.assignedBedId?.bedType,
        roomNumber: assignedBed?.roomNumber || referral.bedId?.roomNumber || referral.assignedBedId?.roomNumber,
        bedNumber: assignedBed?.bedNumber || referral.bedId?.bedNumber || referral.assignedBedId?.bedNumber,
        pricePerDay: assignedBed?.pricePerDay || referral.bedId?.pricePerDay || referral.assignedBedId?.pricePerDay,
        days: days,
        bedCharges: bedCharges
      };
    }

    // Operation charges
    const operationCharges = referral.estimatedPrice || referral.operationId?.price || 0;

    const operationDetails = {
      operationId: referral.operationId?._id || null,
      operationType: referral.operationType,
      careType: referral.careType,
      operationFee: operationCharges,
      description: referral.description || ""
    };

    // Build items array
    const items = [];

    if (operationCharges > 0) {
      items.push({
        itemType: "Operation",
        itemName: referral.operationType || referral.operationId?.operationName || "Medical Operation",
        description: referral.description || "",
        quantity: 1,
        unitPrice: operationCharges,
        totalPrice: operationCharges
      });
    }

    if (bedCharges > 0 && bedDetails) {
      items.push({
        itemType: "Bed",
        itemName: `${bedDetails.bedType} - Room ${bedDetails.roomNumber}, Bed ${bedDetails.bedNumber}`,
        description: `${bedDetails.days} day(s) stay`,
        quantity: bedDetails.days,
        unitPrice: bedDetails.pricePerDay,
        totalPrice: bedCharges
      });
    }

    const totalAmount = operationCharges + bedCharges;
    const adminShare = Number((totalAmount * 0.10).toFixed(2));
    const hospitalShare = Number((totalAmount * 0.90).toFixed(2));

    // Prepare bill data with ALL required fields
    const billData = {
      patientName: referral.patientName,
      patientPhone: referral.patientPhone,
      patientEmail: referral.patientEmail || "",
      patientAddress: referral.patientAddress || "",
      referralId: referral._id,
      appointmentId: referral.appointmentId || null,
      assignedDoctorId: referral.assignedDoctorId?._id || referral.assignedDoctorId || null,
      items,
      tax: 0,
      discount: 0,
      notes: `Auto-generated bill for referral - ${referral.operationType}`,
      bedDetails,
      operationDetails,
      paymentMethod: "cash",
      paymentStatus: "pending",
      // Add revenue split fields expected by model
      hospitalShare,
      adminShare,
      totalAmount
    };

    const response = await axios.post(
      "https://careflow-lsf5.onrender.com/api/bill/create",
      billData,
      config
    );

    console.log("Bill generated successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error generating bill:", error);
    throw error;
  }
};


  // ==================== REFERRAL FUNCTIONS ====================

  const openAssignBedModal = (referral) => {
    setSelectedReferralForBed(referral);
    fetchAvailableBedsForCareType(referral.careType);
    setShowAssignBedModal(true);
  };

  const handleAcceptReferral = async (referralId) => {
    if (!window.confirm("Accept this referral? You'll assign a bed and appointment details next.")) return;

    setLoading(true);
    try {
      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/refer/accept/${referralId}`,
        { status: "accepted" },
        config
      );
      alert("Referral accepted! Now assign a bed and appointment details.");
      fetchReferrals();
    } catch (error) {
      console.error("Error accepting referral:", error);
      alert(error.response?.data?.message || "Failed to accept referral");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBed = async (e) => {
    e.preventDefault();
    if (!selectedReferralForBed) return;

    setLoading(true);
    try {
      // Calculate total price with bed charges
      const selectedBed = availableBedsForReferral.find(b => b._id === assignBedForm.bedId);
      const estimatedDays = selectedReferralForBed.estimatedStayDays || 1;
      const bedCharges = selectedBed ? selectedBed.pricePerDay * estimatedDays : 0;
      const totalPrice = (selectedReferralForBed.estimatedPrice || 0) + bedCharges;

      await axios.patch(
        `https://careflow-lsf5.onrender.com/api/refer/assign-bed/${selectedReferralForBed._id}`,
        {
          ...assignBedForm,
          totalPrice,
          bedCharges
        },
        config
      );
      alert("Bed assigned successfully!");
      setShowAssignBedModal(false);
      resetAssignBedForm();
      fetchReferrals();
      fetchBeds();
    } catch (error) {
      console.error("Error assigning bed:", error);
      alert(error.response?.data?.message || "Failed to assign bed");
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
  if (!window.confirm("Mark this referral as completed? A bill will be automatically generated.")) return;

  setLoading(true);
  try {
    // Step 1: Mark referral as completed
    console.log("🔄 Step 1: Completing referral...");
    await axios.patch(
      `https://careflow-lsf5.onrender.com/api/refer/complete/${referralId}`,
      {},
      config
    );
    console.log("✅ Step 1: Referral marked as completed");

    // Step 2: Find the completed referral
    console.log("🔄 Step 2: Finding referral data...");
    const completedReferral = referrals.find(r => r._id === referralId);
    
    if (!completedReferral) {
      console.error("❌ Referral not found in state");
      alert("Referral completed but couldn't generate bill - referral not found");
      fetchReferrals();
      return;
    }

    console.log("✅ Step 2: Referral found:", completedReferral);

    // Step 3: Generate bill automatically
    console.log("🔄 Step 3: Generating bill...");
    try {
      await generateBillFromCompletedReferral(completedReferral);
      console.log("✅ Step 3: Bill generated successfully!");
      alert("✅ Referral completed successfully!\n💰 Bill has been generated automatically!");
    } catch (billError) {
      console.error("❌ Step 3 Failed - Bill generation error:", billError);
      
      // Extract error message from backend
      const errorMsg = billError.response?.data?.message 
        || billError.response?.data?.error 
        || billError.message 
        || "Unknown error";
      
      console.error("❌ Error Message:", errorMsg);
      alert(`⚠️ Referral completed but bill generation failed!\n\nError: ${errorMsg}\n\nPlease check console and create bill manually.`);
    }

    // Step 4: Refresh data
    console.log("🔄 Step 4: Refreshing data...");
    fetchReferrals();
    fetchBills();
    console.log("✅ Step 4: Data refreshed");

  } catch (error) {
    console.error("❌ Error completing referral:", error);
    alert(error.response?.data?.message || "Failed to complete referral");
  } finally {
    setLoading(false);
  }
};
  const resetAssignBedForm = () => {
    setAssignBedForm({
      bedId: "",
      appointmentDate: "",
      appointmentTime: "",
      assignedDoctorId: "",
      hospitalResponse: ""
    });
    setSelectedReferralForBed(null);
    setAvailableBedsForReferral([]);
  };

  // ==================== PROFILE FUNCTIONS ====================

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

  // ==================== HELPER FUNCTIONS ====================

  const getStatusColor = (status) => {
    const colors = {
      pending: darkMode
        ? "bg-yellow-900/30 text-yellow-300 border-yellow-700"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: darkMode
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

  const getBedName = (bed) => {
    if (!bed) return "N/A";
    return `${bed.bedType} - Room ${bed.roomNumber}, Bed ${bed.bedNumber}`;
  };

  const calculateTotalPrice = (referral) => {
    if (!referral) return 0;
    const basePrice = referral.estimatedPrice || 0;
    const bedCharges = referral.bedCharges || 0;
    return basePrice + bedCharges;
  };

  // / ==================== BILLS STATE (Add to your existing state) ====================
// Add these to your useState declarations at the top:
const [showBillModal, setShowBillModal] = useState(false);
const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [editingBill, setEditingBill] = useState(null);
const [selectedBillForDetails, setSelectedBillForDetails] = useState(null);
const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
const [billStatusFilter, setBillStatusFilter] = useState("all");
const [filteredBills, setFilteredBills] = useState([]);

const [billForm, setBillForm] = useState({
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  patientAddress: "",
  referralId: "",
  appointmentId: "",
  prescriptionId: "",
  assignedDoctorId: "",
  items: [],
  tax: 0,
  discount: 0,
  notes: "",
  bedDetails: null,
  operationDetails: null,
  paymentMethod: "cash",        // Set default
  paymentStatus: "pending",
  hospitalShare: 0,            // Add missing fields
  adminShare: 0,
  totalAmount: 0               // Add missing field
});

const [billItem, setBillItem] = useState({
  itemType: "Operation",
  itemName: "",
  description: "",             // Add missing field
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0
});

const [paymentForm, setPaymentForm] = useState({
  amount: 0,
  paymentMethod: "card",
  transactionId: "",
  paymentDate: new Date().toISOString().split('T')[0]
});
const [billsOfHospital,SetbillsOfHospital] = useState({})

const fetchAllbills = async()=>{
  const res = await axios.get('https://careflow-lsf5.onrender.com/api/bill/getAll/bill',config)
  SetbillsOfHospital(res.data)
}
// ==================== FILTER EFFECT ====================
useEffect(()=>{
  fetchAllbills();
},[])
// console.log(billsOfHospital)
useEffect(() => {

  if (billStatusFilter === "all") {
    setFilteredBills(bills);
  } else {
    setFilteredBills(bills.filter(b => b.paymentStatus === billStatusFilter));
  }
}, [bills, billStatusFilter]);


  // ==================== RENDER INCOME DASHBOARD ====================

  const renderIncome = () => {
  // Calculate monthly income
    const safeBills = Array.isArray(bills) ? bills : [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyBills = safeBills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });
  const monthlyIncome = monthlyBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  const monthlyAdmin = monthlyIncome * 0.1;
  const monthlyHospital = monthlyIncome - monthlyAdmin;

  // Calculate payment method breakdown
  const paymentMethodStats = safeBills.reduce((acc, bill) => {
    if (bill.paymentStatus === 'paid' && bill.paymentMethod) {
      acc[bill.paymentMethod] = (acc[bill.paymentMethod] || 0) + bill.totalAmount;
    }
    return acc;
  }, {});

  // Calculate bill status counts
  const paidBills = safeBills.filter(b => b.paymentStatus === 'paid').length;
  const pendingBills = safeBills.filter(b => b.paymentStatus === 'pending').length;
  const partialBills = safeBills.filter(b => b.paymentStatus === 'partial').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Income & Bills Dashboard</h2>
            <p className={textSecondary}>Track hospital revenue, bills, and earnings</p>
          </div>
          <button
            onClick={() => setActivePage("bills")}
            className={`flex items-center gap-2 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Bills
          </button>
        </div>
      </div>

      {/* Total Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Revenue</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>
                ₹{totalIncome.toLocaleString()}
              </p>
              <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'} mt-1`}>
                All time earnings
              </p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Hospital Share (90%)</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                ₹{totalIncome*0.9.toLocaleString()}
              </p>
              <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'} mt-1`}>
                Your earnings
              </p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Admin Share (10%)</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>
                ₹{totalIncome*.1.toLocaleString()}
              </p>
              <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'} mt-1`}>
                Platform fee
              </p>
            </div>
            <div className={`w-14 h-14 ${darkMode ? 'bg-purple-700' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly & Bills Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>This Month</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>
                ₹{monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-500'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Paid Bills</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                {paidBills}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-700' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Pending</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mt-2`}>
                {pendingBills}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-red-700' : 'bg-red-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/40 border-orange-700' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Bills</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mt-2`}>
                {bills.length}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-orange-700' : 'bg-orange-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(paymentMethodStats).length > 0 && (
        <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-6`}>
          <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Payment Method Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(paymentMethodStats).map(([method, amount]) => (
              <div key={method} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={`text-sm ${textSecondary} capitalize`}>{method}</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'} mt-1`}>
                  ₹{amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bills Table */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${textPrimary}`}>Recent Bills</h3>
            <button
              onClick={() => setActivePage("bills")}
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-semibold`}
            >
              View All →
            </button>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={textSecondary}>No bills generated yet</p>
            <p className={`${textSecondary} text-sm mt-1`}>Bills will appear here once created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Bill #</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Patient</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Total Amount</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Hospital Share</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Admin Share</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {safeBills.slice(0, 10).map((bill) => {
                  const hospitalAmount = (bill.totalAmount || 0) * 0.9;
                  const adminAmount = (bill.totalAmount || 0) * 0.1;

                  return (
                    <tr key={bill._id} className={hoverBg}>
                      <td className="px-6 py-4">
                        <p className={`font-mono text-sm ${textPrimary}`}>
                          {bill.billNumber || `#${bill._id?.substring(0, 8)}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{bill.patientName || "N/A"}</p>
                          {bill.patientPhone && (
                            <p className={`text-xs ${textSecondary}`}>{bill.patientPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${textSecondary}`}>
                        {formatDate(bill.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          ₹{(bill.totalAmount || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ₹{hospitalAmount.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          ₹{adminAmount.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          bill.paymentStatus === "paid"
                            ? darkMode ? "bg-green-900/30 text-green-300 border-green-700" : "bg-green-100 text-green-800 border-green-200"
                            : bill.paymentStatus === "partial"
                            ? darkMode ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : darkMode ? "bg-red-900/30 text-red-300 border-red-700" : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {bill.paymentStatus || "pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};



  // ==================== RENDER DOCTORS ====================

  const renderDoctors = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Doctor Management</h2>
            <p className={textSecondary}>Manage doctors in your hospital</p>
          </div>
          <button
            onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
            className={`${darkMode ? 'bg-orange-700 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showAddDoctorForm ? "Cancel" : "Add Doctor"}</span>
          </button>
        </div>
      </div>

      {/* Add Doctor Form */}
      {showAddDoctorForm && (
        <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Add New Doctor</h3>

          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Doctor Name</label>
                <input
                  type="text"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newDoctor.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newDoctor.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={newDoctor.specialization}
                  onChange={handleChange}
                  placeholder="Cardiologist"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={newDoctor.qualification}
                  onChange={handleChange}
                  placeholder="MBBS, MD"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={newDoctor.experience}
                  onChange={handleChange}
                  placeholder="5"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Consultation Fee</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={newDoctor.consultationFee}
                  onChange={handleChange}
                  placeholder="500"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  min="0"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={newDoctor.licenseNumber}
                  onChange={handleChange}
                  placeholder="MED123456"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Bio (Optional)</label>
                <textarea
                  name="bio"
                  value={newDoctor.bio}
                  onChange={handleChange}
                  placeholder="Brief bio about the doctor..."
                  rows="3"
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                />
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Available Days (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-2 cursor-pointer p-3 border ${borderColor} rounded-lg ${hoverBg} transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={newDoctor.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className={`text-sm font-medium ${textPrimary}`}>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Start Time (Optional)</label>
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
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>End Time (Optional)</label>
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
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'}`}
                />
              </div>
            </div>

            {/* Departments Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm font-semibold ${textSecondary}`}>
                  Select Departments (at least one required)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllDepartments}
                    className={`${darkMode ? 'bg-orange-700 hover:bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 py-1 rounded text-sm`}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllDepartments}
                    className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600'} text-white px-3 py-1 rounded text-sm`}
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
                      className={`flex items-center gap-2 cursor-pointer p-3 border ${borderColor} rounded-lg ${hoverBg} transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={newDoctor.departments.includes(dept.name)}
                        onChange={() => handleDepartmentSelect(dept.name)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className={`text-sm font-medium ${textPrimary}`}>{dept.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-red-500 text-sm">No departments available. Please contact admin.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${darkMode ? 'bg-orange-700 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Adding Doctor..." : "Add Doctor"}
            </button>
          </form>
        </div>
      )}

      {/* Doctors List */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>All Doctors ({doctors.length})</h3>

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className={textSecondary}>No doctors added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className={`${darkMode ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/40 border-orange-700' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'} border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-14 h-14 ${darkMode ? 'bg-orange-700' : 'bg-orange-600'} rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {doc.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${textPrimary} text-lg mb-1`}>{doc.name}</h4>
                    <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'} font-semibold`}>
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                <div className={`space-y-2 text-sm ${textSecondary}`}>
                  <p><span className="font-semibold">Email:</span> {doc.email}</p>
                  <p><span className="font-semibold">Phone:</span> {doc.phone}</p>
                  <p><span className="font-semibold">Qualification:</span> {doc.qualification}</p>
                  <p><span className="font-semibold">Experience:</span> {doc.experience} years</p>
                  <p><span className="font-semibold">Fee:</span> ₹{doc.consultationFee}</p>
                  <p><span className="font-semibold">License:</span> {doc.licenseNumber}</p>
                  {doc.departments && doc.departments.length > 0 && (
                    <p><span className="font-semibold">Departments:</span> {doc.departments.join(", ")}</p>
                  )}
                  {doc.availableDays && doc.availableDays.length > 0 && (
                    <p><span className="font-semibold">Available:</span> {doc.availableDays.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==================== RENDER OPERATIONS ====================

  const renderOperations = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Operations Management</h2>
            <p className={textSecondary}>Manage surgical operations and procedures</p>
          </div>
          <button
            onClick={() => setShowOperationModal(true)}
            className={`flex items-center gap-2 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Operation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Operations</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>{operations.length}</p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Departments Covered</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                {new Set(operations.map(op => op.departmentId._id)).size}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Avg. Price</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>
                ₹{operations.length > 0 ? Math.round(operations.reduce((acc, op) => acc + op.price, 0) / operations.length) : 0}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-purple-700' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Operations List - Continued in remaining response due to length */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>All Operations</h3>
        </div>

        {operations.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={`${textSecondary} text-lg`}>No operations added yet</p>
            <p className={`${textSecondary} text-sm mt-1`}>Click "Add Operation" to create your first operation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Operation Name</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Department</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Duration</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Price</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {operations.map((operation) => (
                  <tr key={operation._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{operation.operationName}</p>
                        {operation.description && (
                          <p className={`text-sm ${textSecondary} mt-1`}>{operation.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full text-sm font-medium`}>
                        {operation.departmentId?.name || "N/A"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${textPrimary}`}>
                      <p>{operation.duration || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>₹{operation.price.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditOperation(operation)}
                          className={`px-3 py-1 ${darkMode ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-900/60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-lg text-sm font-medium transition-colors`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOperation(operation._id)}
                          disabled={loading}
                          className={`px-3 py-1 ${darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
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

  // ==================== RENDER REFERRALS ====================

  const renderReferrals = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Patient Referrals</h2>
            <p className={textSecondary}>Manage incoming referrals from doctors</p>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={referralStatusFilter}
              onChange={(e) => setReferralStatusFilter(e.target.value)}
              className={`px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                }`}
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
        {[
          { label: "Total", count: referrals.length, color: "blue" },
          { label: "Pending", count: referrals.filter(r => r.status === "pending").length, color: "yellow" },
          { label: "Accepted", count: referrals.filter(r => r.status === "accepted").length, color: "green" },
          { label: "Rejected", count: referrals.filter(r => r.status === "rejected").length, color: "red" },
          { label: "Completed", count: referrals.filter(r => r.status === "completed").length, color: "purple" }
        ].map((stat) => (
          <div key={stat.label} className={`${darkMode
              ? `bg-gradient-to-br from-${stat.color}-900/40 to-${stat.color}-900/40 border-${stat.color}-700`
              : `bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-50 border-${stat.color}-200`
            } border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${textSecondary}`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${darkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`} mt-2`}>
                  {stat.count}
                </p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? `bg-${stat.color}-700` : `bg-${stat.color}-600`} rounded-full flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referrals Table */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            {referralStatusFilter === "all" ? "All Referrals" : `${referralStatusFilter.charAt(0).toUpperCase() + referralStatusFilter.slice(1)} Referrals`}
          </h3>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={textSecondary}>No referrals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Patient</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Doctor</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Operation</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Care Type</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Urgency</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Bed Assigned</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Total Price</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderColor}`}>
                {filteredReferrals.map((referral) => (
                  <tr key={referral._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{referral.patientName}</p>
                        <p className={`text-sm ${textSecondary}`}>{referral.patientPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{referral.referringDoctorId?.name || "N/A"}</p>
                        <p className={`text-sm ${textSecondary}`}>{referral.referringDoctorId?.specialization || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {referral.operationId ? (
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{referral.operationId.operationName}</p>
                          <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                            ₹{referral.operationId.price.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No operation</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${referral.careType === "ICU" ? (darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800") :
                          referral.careType === "Emergency" ? (darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-800") :
                            referral.careType === "Ward" || referral.careType === "General Ward" ? (darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800") :
                              (darkMode ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-800")
                        }`}>
                        {referral.careType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${referral.urgency === "Critical" ? (darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800") :
                          referral.urgency === "High" ? (darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-800") :
                            referral.urgency === "Medium" ? (darkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800") :
                              (darkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800")
                        }`}>
                        {referral.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {referral.assignedBedId ? (
                        <div>
                          <p className={`font-medium ${textPrimary} text-sm`}>
                            {getBedName(referral.assignedBedId)}
                          </p>
                          {referral.bedCharges > 0 && (
                            <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              +₹{referral.bedCharges.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ₹{calculateTotalPrice(referral).toLocaleString()}
                      </p>
                      {referral.bedCharges > 0 && (
                        <p className={`text-xs ${textSecondary}`}>
                          (Base: ₹{referral.estimatedPrice.toLocaleString()})
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
  <div className="flex flex-col gap-2">
    {/* Action Buttons */}
    <div className="flex gap-2">
      {referral.status === "pending" && (
        <>
          <button 
            onClick={() => handleAcceptReferral(referral._id)}
            className="text-green-600 hover:text-green-900 font-medium"
          >
            Accept
          </button>
          <button 
            onClick={() => handleRejectReferral(referral._id)}
            className="text-red-600 hover:text-red-900 font-medium"
          >
            Reject
          </button>
        </>
      )}
      {referral.status === "accepted" && referral.bedId && (
        <button 
          onClick={() => handleCompleteReferral(referral._id)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium"
        >
          ✅ Complete & Generate Bill
        </button>
      )}
      {referral.status === "accepted" && !referral.bedId && (
        <button 
          onClick={() => openAssignBedModal(referral)}
          className="text-blue-600 hover:text-blue-900 font-medium"
        >
          Assign Bed
        </button>
      )}
      
      
    </div>

    {/* Bill Status Indicator */}
    {referral.status === "completed" && (
      <div className="flex items-center gap-2">
        {bills.find(b => b.referralId?._id === referral._id) ? (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode 
              ? 'bg-green-900/30 text-green-300 border border-green-700' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            💰 Bill Generated
          </span>
        ) : (
          <button
            onClick={() => handleGenerateBillFromReferral(referral._id)}
            className="text-xs text-orange-600 hover:text-orange-900 font-medium"
          >
            Generate Bill
          </button>
        )}
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

      {/* Assign Bed Modal */}
      {showAssignBedModal && selectedReferralForBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgSecondary} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${textPrimary}`}>Assign Bed & Appointment</h3>
                <button
                  onClick={() => {
                    setShowAssignBedModal(false);
                    resetAssignBedForm();
                  }}
                  className={`${textSecondary} hover:${textPrimary}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAssignBed} className="p-6 space-y-6">
              {/* Patient Info */}
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
                <h4 className={`font-semibold ${textPrimary} mb-2`}>Patient Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={textSecondary}>Name:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{selectedReferralForBed.patientName}</span>
                  </div>
                  <div>
                    <span className={textSecondary}>Care Type:</span>
                    <span className={`ml-2 font-medium ${textPrimary}`}>{selectedReferralForBed.careType}</span>
                  </div>
                </div>
              </div>

              {/* Select Bed */}
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                  Select Bed *
                </label>
                <select
                  value={assignBedForm.bedId}
                  onChange={(e) => setAssignBedForm({ ...assignBedForm, bedId: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                    }`}
                  required
                >
                  <option value="">Select a bed</option>
                  {availableBedsForReferral.map((bed) => (
                    <option key={bed._id} value={bed._id}>
                      {getBedName(bed)} - ₹{bed.pricePerDay}/day
                    </option>
                  ))}
                </select>
                {availableBedsForReferral.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No available beds found for {selectedReferralForBed.careType}
                  </p>
                )}

                {/* Price Calculation */}
                {assignBedForm.bedId && (
                  <div className={`mt-3 p-3 ${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'} font-medium mb-2`}>
                      Price Calculation
                    </p>
                    {(() => {
                      const selectedBed = availableBedsForReferral.find(b => b._id === assignBedForm.bedId);
                      const estimatedDays = selectedReferralForBed.estimatedStayDays || 1;
                      const bedCharges = selectedBed ? selectedBed.pricePerDay * estimatedDays : 0;
                      const totalPrice = (selectedReferralForBed.estimatedPrice || 0) + bedCharges;

                      return (
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                          <p>Operation/Procedure: ₹{(selectedReferralForBed.estimatedPrice || 0).toLocaleString()}</p>
                          <p>Bed Charges ({estimatedDays} {estimatedDays > 1 ? 'days' : 'day'}): ₹{bedCharges.toLocaleString()}</p>
                          <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} pt-1 border-t ${borderColor}`}>
                            Total: ₹{totalPrice.toLocaleString()}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Appointment Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={assignBedForm.appointmentDate}
                    onChange={(e) => setAssignBedForm({ ...assignBedForm, appointmentDate: e.target.value })}
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                      }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    value={assignBedForm.appointmentTime}
                    onChange={(e) => setAssignBedForm({ ...assignBedForm, appointmentTime: e.target.value })}
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Assign Doctor */}
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                  Assign Doctor (Optional)
                </label>
                <select
                  value={assignBedForm.assignedDoctorId}
                  onChange={(e) => setAssignBedForm({ ...assignBedForm, assignedDoctorId: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                    }`}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital Response */}
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
                  Response Message
                </label>
                <textarea
                  value={assignBedForm.hospitalResponse}
                  onChange={(e) => setAssignBedForm({ ...assignBedForm, hospitalResponse: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-orange-400 bg-gray-700 text-gray-100' : 'focus:ring-orange-500 bg-white'
                    }`}
                  rows="3"
                  placeholder="Add any message for the referring doctor..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 ${darkMode ? 'bg-orange-700 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-lg`}
                >
                  {loading ? "Assigning..." : "Assign Bed"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignBedModal(false);
                    resetAssignBedForm();
                  }}
                  className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-3 rounded-lg font-semibold transition-colors`}
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${bedTypeFilter === "all"
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${bedTypeFilter === type
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${bed.bedType === "ICU" ? "bg-red-100 text-red-800" :
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${bed.status === "Available" ? "bg-green-100 text-green-800 border-green-200" :
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

const renderBills = () => {
  // Calculate stats
  const paidBills = bills.filter(b => b.paymentStatus === 'paid');
  const pendingBills = bills.filter(b => b.paymentStatus === 'pending');
  const partialBills = bills.filter(b => b.paymentStatus === 'partial');
  const totalPaid = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPending = pendingBills.reduce((sum, b) => sum + ((b.totalAmount || 0) - (b.amountPaid || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Bills Management</h2>
            <p className={textSecondary}>Create, manage, and track patient bills</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingBill(null);
                resetBillForm();
                setShowBillModal(true);
              }}
              className={`flex items-center gap-2 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Bill
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Total Bills</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>
                {bills.length}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Paid ({paidBills.length})</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-green-700' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-700' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Pending ({pendingBills.length})</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mt-2`}>
                ₹{totalPending.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-red-700' : 'bg-red-600'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${textSecondary}`}>Partial ({partialBills.length})</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>
                ₹{partialBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-500'} rounded-full flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} p-4`}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setBillStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billStatusFilter === "all"
                ? darkMode ? "bg-blue-700 text-white" : "bg-blue-600 text-white"
                : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({bills.length})
          </button>
          <button
            onClick={() => setBillStatusFilter("paid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billStatusFilter === "paid"
                ? darkMode ? "bg-green-700 text-white" : "bg-green-600 text-white"
                : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Paid ({paidBills.length})
          </button>
          <button
            onClick={() => setBillStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billStatusFilter === "pending"
                ? darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
                : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({pendingBills.length})
          </button>
          <button
            onClick={() => setBillStatusFilter("partial")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billStatusFilter === "partial"
                ? darkMode ? "bg-yellow-700 text-white" : "bg-yellow-600 text-white"
                : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Partial ({partialBills.length})
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className={`${bgSecondary} rounded-xl shadow-md border ${borderColor} overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            {billStatusFilter === "all" ? "All Bills" : `${billStatusFilter.charAt(0).toUpperCase() + billStatusFilter.slice(1)} Bills`}
          </h3>
        </div>

        {filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <svg className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={`${textSecondary} text-lg`}>No bills found</p>
            <p className={`${textSecondary} text-sm mt-1`}>Create your first bill to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-b ${borderColor}`}>
  <tr>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Bill #</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Patient</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Type</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Date</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Amount</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Paid</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Due</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Status</th>
    <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase`}>Actions</th>
  </tr>
</thead>
              <tbody className={`divide-y ${borderColor}`}>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className={hoverBg}>
                    <td className="px-6 py-4">
                      <p className={`font-mono text-sm font-semibold ${textPrimary}`}>
                        {bill.billNumber || `#${bill._id?.substring(0, 8)}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{bill.patientName || "N/A"}</p>
                        {bill.patientPhone && (
                          <p className={`text-xs ${textSecondary}`}>{bill.patientPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
  {bill.referralId ? (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-800'
    }`}>
      Referral
    </span>
  ) : (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
    }`}>
      Manual
    </span>
  )}
</td>
                    <td className={`px-6 py-4 ${textSecondary} text-sm`}>
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ₹{(bill.totalAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ₹{(bill.amountPaid || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        ₹{((bill.totalAmount || 0) - (bill.amountPaid || 0)).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        bill.paymentStatus === "paid"
                          ? darkMode ? "bg-green-900/30 text-green-300 border-green-700" : "bg-green-100 text-green-800 border-green-200"
                          : bill.paymentStatus === "partial"
                          ? darkMode ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : darkMode ? "bg-red-900/30 text-red-300 border-red-700" : "bg-red-100 text-red-800 border-red-200"
                      }`}>
                        {bill.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedBillForDetails(bill);
                            setShowBillDetailsModal(true);
                          }}
                          className={`px-3 py-1 ${darkMode ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-900/60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-lg text-sm font-medium transition-colors`}
                        >
                          View
                        </button>

                        {bill.paymentStatus !== "paid" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBillForPayment(bill);
                                setPaymentForm({
                                  amount: (bill.totalAmount || 0) - (bill.amountPaid || 0),
                                  paymentMethod: "card",
                                  transactionId: "",
                                  paymentDate: new Date().toISOString().split('T')[0]
                                });
                                setShowPaymentModal(true);
                              }}
                              className={`px-3 py-1 ${darkMode ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60' : 'bg-green-100 text-green-700 hover:bg-green-200'} rounded-lg text-sm font-medium transition-colors`}
                            >
                              💳 Pay
                            </button>

                            <button
                              onClick={() => handleEditBill(bill)}
                              className={`px-3 py-1 ${darkMode ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'} rounded-lg text-sm font-medium transition-colors`}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              disabled={loading}
                              className={`px-3 py-1 ${darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg text-sm font-medium transition-colors disabled:opacity-50`}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {bill.paymentStatus === "paid" && (
                          <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                            Paid ✓
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
    </div>
  );
};

const renderBillModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
      <div className={`p-6 border-b ${borderColor} bg-gradient-to-r ${darkMode ? 'from-green-900 to-emerald-900' : 'from-green-600 to-emerald-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {editingBill ? "Edit Bill" : "Create New Bill"}
            </h3>
            <p className="text-green-100 text-sm">
              {editingBill ? "Update bill information" : "Generate a new patient bill"}
            </p>
          </div>
          <button
            onClick={() => {
              setShowBillModal(false);
              resetBillForm();
            }}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={editingBill ? handleUpdateBill : handleCreateBill} className="p-6 space-y-6">
       
       {/* Patient Information */}
<div>
  <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>Patient Information</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Patient Name *
      </label>
      <input
        type="text"
        value={billForm.patientName}
        onChange={(e) => setBillForm({ ...billForm, patientName: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
        required
      />
    </div>
    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Phone *
      </label>
      <input
        type="tel"
        value={billForm.patientPhone}
        onChange={(e) => setBillForm({ ...billForm, patientPhone: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
        required
      />
    </div>
    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Email (Optional)
      </label>
      <input
        type="email"
        value={billForm.patientEmail}
        onChange={(e) => setBillForm({ ...billForm, patientEmail: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
      />
    </div>
    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Address
      </label>
      <input
        type="text"
        value={billForm.patientAddress}
        onChange={(e) => setBillForm({ ...billForm, patientAddress: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
      />
    </div>
    
    {/* ADD DROPDOWNS FOR IDs */}
    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Referral (Optional)
      </label>
      <select
        value={billForm.referralId}
        onChange={(e) => setBillForm({ ...billForm, referralId: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
      >
        <option value="">Select Referral</option>
        {referrals.map(ref => (
          <option key={ref._id} value={ref._id}>
            {ref.patientName} - {ref.careType}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
        Assigned Doctor (Optional)
      </label>
      <select
        value={billForm.assignedDoctorId}
        onChange={(e) => setBillForm({ ...billForm, assignedDoctorId: e.target.value })}
        className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
      >
        <option value="">Select Doctor</option>
        {doctors.map(doc => (
          <option key={doc._id} value={doc._id}>
            Dr. {doc.name} - {doc.specialization}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

        {/* Add Items Section */}
        <div>
          <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>Bill Items</h4>
          
          {/* Add Item Form */}
          <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <select
                  value={billItem.itemType}
                  onChange={(e) => setBillItem({ ...billItem, itemType: e.target.value })}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-600 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                >
                  <option value="Operation">Operation</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Bed">Bed</option>
                  <option value="Test">Test</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={billItem.itemName}
                  onChange={(e) => setBillItem({ ...billItem, itemName: e.target.value })}
                  placeholder="Item name"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-600 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                />
              </div>
              <div>
                <input
                  type="number"
                  value={billItem.quantity}
                  onChange={(e) => setBillItem({ ...billItem, quantity: parseInt(e.target.value) || 1 })}
                  placeholder="Qty"
                  min="1"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-600 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                />
              </div>
              <div>
                <input
                  type="number"
                  value={billItem.unitPrice}
                  onChange={(e) => setBillItem({ ...billItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Price"
                  min="0"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-600 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddBillItem}
                  className={`w-full ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-2 rounded-lg font-medium transition-colors`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {/* Calculations */}
{billForm.items.length > 0 && (() => {
  const totals = getDisplayTotals();
  return (
    <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
      <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>Billing Summary</h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={textSecondary}>Subtotal:</span>
          <span className={`font-bold ${textPrimary}`}>₹{totals.subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center gap-4">
          <span className={textSecondary}>Tax (%):</span>
          <input
            type="number"
            value={billForm.tax}
            onChange={(e) => handleUpdateTaxDiscount('tax', e.target.value)}
            className={`w-24 px-3 py-1 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
            min="0"
            max="100"
          />
        </div>

        <div className="flex justify-between items-center gap-4">
          <span className={textSecondary}>Discount (₹):</span>
          <input
            type="number"
            value={billForm.discount}
            onChange={(e) => handleUpdateTaxDiscount('discount', e.target.value)}
            className={`w-24 px-3 py-1 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
            min="0"
          />
        </div>

        <div className={`flex justify-between items-center pt-3 border-t ${borderColor}`}>
          <span className={`font-bold ${textPrimary}`}>Total Amount:</span>
          <span className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            ₹{totals.totalAmount.toLocaleString()}
          </span>
        </div>

        <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${borderColor}`}>
          <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-3`}>
            <p className={`text-xs ${textSecondary}`}>Hospital Share (90%)</p>
            <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ₹{totals.hospitalShare.toLocaleString()}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
            <p className={`text-xs ${textSecondary}`}>Admin Share (10%)</p>
            <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              ₹{totals.adminShare.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
})()}
        </div>

        {/* Calculations */}
        {billForm.items.length > 0 && (
          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>Billing Summary</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={textSecondary}>Subtotal:</span>
                <span className={`font-bold ${textPrimary}`}>₹{billForm.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className={textSecondary}>Tax (%):</span>
                <input
                  type="number"
                  value={billForm.tax}
                  onChange={(e) => handleUpdateTaxDiscount('tax', e.target.value)}
                  className={`w-24 px-3 py-1 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className={textSecondary}>Discount (₹):</span>
                <input
                  type="number"
                  value={billForm.discount}
                  onChange={(e) => handleUpdateTaxDiscount('discount', e.target.value)}
                  className={`w-24 px-3 py-1 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
                  min="0"
                />
              </div>

              <div className={`flex justify-between items-center pt-3 border-t ${borderColor}`}>
                <span className={`font-bold ${textPrimary}`}>Total Amount:</span>
                <span className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ₹{billForm.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${borderColor}`}>
                <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-3`}>
                  <p className={`text-xs ${textSecondary}`}>Hospital Share (90%)</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ₹{billForm.hospitalShare.toLocaleString()}
                  </p>
                </div>
                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
                  <p className={`text-xs ${textSecondary}`}>Admin Share (10%)</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    ₹{billForm.adminShare.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
            Notes (Optional)
          </label>
          <textarea
            value={billForm.notes}
            onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
            className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
            rows="3"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || billForm.items.length === 0}
            className={`flex-1 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-lg`}
          >
            {loading ? (editingBill ? "Updating..." : "Creating...") : (editingBill ? "Update Bill" : "Create Bill")}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBillModal(false);
              resetBillForm();
            }}
            className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-3 rounded-lg font-semibold transition-colors`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
// ==================== BILL DETAILS MODAL ====================

const renderBillDetailsModal = () => {
  if (!selectedBillForDetails) return null;

  const bill = selectedBillForDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-2xl font-bold ${textPrimary}`}>Bill Details</h3>
              <p className={`${textSecondary} text-sm`}>
                Bill #: {bill.billNumber || `#${bill._id?.substring(0, 12)}`}
              </p>
            </div>
            <button
              onClick={() => {
                setShowBillDetailsModal(false);
                setSelectedBillForDetails(null);
              }}
              className={textSecondary + " hover:" + textPrimary}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Hospital Header */}
          <div className="text-center border-b pb-6">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{profile?.name || "Hospital Name"}</h2>
            <p className={textSecondary}>{profile?.address || ""}</p>
            <p className={textSecondary}>Phone: {profile?.phone || ""}</p>
            <p className={`text-sm ${textSecondary} mt-2`}>Date: {formatDate(bill.createdAt)}</p>
          </div>

          {/* Patient & Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
  <h4 className={`font-semibold ${textPrimary} mb-2`}>Patient Information</h4>
  <div className={`space-y-1 text-sm ${textSecondary}`}>
    <p><span className="font-medium">Name:</span> {bill.patientName}</p>
    <p><span className="font-medium">Phone:</span> {bill.patientPhone}</p>
    {bill.patientEmail && (
      <p><span className="font-medium">Email:</span> {bill.patientEmail}</p>
    )}
    {bill.patientAddress && (
      <p><span className="font-medium">Address:</span> {bill.patientAddress}</p>
    )}
    {bill.referralId && (
      <p><span className="font-medium">Referral ID:</span> #{bill.referralId._id?.substring(0, 8) || bill.referralId.substring(0, 8)}</p>
    )}
  </div>
</div>

            <div>
              <h4 className={`font-semibold ${textPrimary} mb-2`}>Bill Status</h4>
              <div className="space-y-2">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
                  bill.paymentStatus === "paid"
                    ? darkMode ? "bg-green-900/30 text-green-300 border-green-700" : "bg-green-100 text-green-800 border-green-200"
                    : bill.paymentStatus === "partial"
                    ? darkMode ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : darkMode ? "bg-red-900/30 text-red-300 border-red-700" : "bg-red-100 text-red-800 border-red-200"
                }`}>
                  {(bill.paymentStatus || "pending").toUpperCase()}
                </span>
                {bill.paymentMethod && (
                  <p className={`text-sm ${textSecondary}`}>
                    Method: <span className="font-medium capitalize">{bill.paymentMethod}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

{/* Operation & Bed Details */}
{(bill.operationDetails || bill.bedDetails) && (
  <div className="grid grid-cols-2 gap-6">
    {bill.operationDetails && (
      <div>
        <h4 className={`font-semibold ${textPrimary} mb-2`}>Operation Details</h4>
        <div className={`space-y-1 text-sm ${textSecondary}`}>
          <p><span className="font-medium">Type:</span> {bill.operationDetails.operationType}</p>
          <p><span className="font-medium">Care Type:</span> {bill.operationDetails.careType}</p>
          <p><span className="font-medium">Fee:</span> ₹{bill.operationDetails.operationFee?.toLocaleString()}</p>
        </div>
      </div>
    )}

    {bill.bedDetails && (
      <div>
        <h4 className={`font-semibold ${textPrimary} mb-2`}>Bed Details</h4>
        <div className={`space-y-1 text-sm ${textSecondary}`}>
          <p><span className="font-medium">Type:</span> {bill.bedDetails.bedType}</p>
          <p><span className="font-medium">Location:</span> Room {bill.bedDetails.roomNumber}, Bed {bill.bedDetails.bedNumber}</p>
          <p><span className="font-medium">Duration:</span> {bill.bedDetails.days} days × ₹{bill.bedDetails.pricePerDay?.toLocaleString()}/day</p>
          <p><span className="font-medium">Total:</span> ₹{bill.bedDetails.totalBedCharges?.toLocaleString()}</p>
        </div>
      </div>
    )}
  </div>
)}
          {/* Bill Items */}
          {bill.items && bill.items.length > 0 && (
            <div>
              <h4 className={`font-semibold ${textPrimary} mb-3`}>Bill Items</h4>
              <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Type</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Item</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Qty</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${textSecondary} uppercase`}>Price</th>
                      <th className={`px-4 py-3 text-right text-xs font-semibold ${textSecondary} uppercase`}>Total</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderColor}`}>
                    {bill.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded text-xs font-medium`}>
                            {item.itemType}
                          </span>
                        </td>
                        <td className={`px-4 py-3 ${textPrimary}`}>{item.itemName}</td>
                        <td className={`px-4 py-3 ${textSecondary}`}>{item.quantity}</td>
                        <td className={`px-4 py-3 ${textSecondary}`}>₹{item.unitPrice.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${textPrimary}`}>
                          ₹{item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={textSecondary}>Subtotal:</span>
                <span className={textPrimary}>₹{(bill.subtotal || 0).toLocaleString()}</span>
              </div>
              {bill.tax > 0 && (
                <div className="flex justify-between">
                  <span className={textSecondary}>Tax:</span>
                  <span className={textPrimary}>₹{(bill.tax || 0).toLocaleString()}</span>
                </div>
              )}
              {bill.discount > 0 && (
                <div className="flex justify-between">
                  <span className={textSecondary}>Discount:</span>
                  <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    -₹{(bill.discount || 0).toLocaleString()}
                  </span>
                </div>
              )}
              <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                <span className={`font-bold ${textPrimary}`}>Total Amount:</span>
                <span className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  ₹{(bill.totalAmount || 0).toLocaleString()}
                </span>
              </div>

              {/* 90/10 Split */}
              <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${borderColor}`}>
                <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-3`}>
                  <p className={`text-xs ${textSecondary}`}>Hospital Share (90%)</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ₹{(bill.hospitalShare || (bill.totalAmount * 0.9)).toLocaleString()}
                  </p>
                </div>
                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-3`}>
                  <p className={`text-xs ${textSecondary}`}>Admin Share (10%)</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    ₹{(bill.adminShare || (bill.totalAmount * 0.1)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <h4 className={`font-semibold ${textPrimary} mb-3`}>Payment Information</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className={textSecondary}>Amount Paid:</p>
                <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ₹{(bill.amountPaid || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className={textSecondary}>Amount Due:</p>
                <p className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ₹{((bill.totalAmount || 0) - (bill.amountPaid || 0)).toLocaleString()}
                </p>
              </div>
              {bill.transactionId && (
                <div>
                  <p className={textSecondary}>Transaction ID:</p>
                  <p className={`font-medium ${textPrimary}`}>{bill.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
              <h4 className={`font-semibold ${textPrimary} mb-2`}>Notes</h4>
              <p className={`text-sm ${textSecondary}`}>{bill.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className={`flex-1 ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
            <button
              onClick={() => {
                setShowBillDetailsModal(false);
                setSelectedBillForDetails(null);
              }}
              className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-3 rounded-lg font-semibold transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PAYMENT MODAL ====================

const renderPaymentModal = () => {
  if (!selectedBillForPayment) return null;

  const bill = selectedBillForPayment;
  const dueAmount = (bill.totalAmount || 0) - (bill.amountPaid || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgSecondary} rounded-2xl shadow-2xl max-w-lg w-full`}>
        <div className={`p-6 border-b ${borderColor} bg-gradient-to-r ${darkMode ? 'from-green-900 to-emerald-900' : 'from-green-600 to-emerald-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Record Payment</h3>
              <p className="text-green-100 text-sm">
                Bill #: {bill.billNumber || `#${bill._id?.substring(0, 12)}`}
              </p>
            </div>
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedBillForPayment(null);
              }}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleRecordPayment} className="p-6 space-y-6">
          {/* Bill Summary */}
          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <h4 className={`font-semibold ${textPrimary} mb-3`}>Bill Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={textSecondary}>Patient:</span>
                <span className={`font-semibold ${textPrimary}`}>{bill.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Total Amount:</span>
                <span className={`font-bold ${textPrimary}`}>₹{(bill.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Already Paid:</span>
                <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ₹{(bill.amountPaid || 0).toLocaleString()}
                </span>
              </div>
              <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                <span className={`font-bold ${textPrimary}`}>Amount Due:</span>
                <span className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ₹{dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'} text-lg font-semibold`}
              min="0"
              max={dueAmount}
              step="0.01"
              required
            />
            <p className={`text-xs ${textSecondary} mt-1`}>
              Maximum: ₹{dueAmount.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
              Payment Method *
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
              required
            >
              <option value="card">💳 Credit/Debit Card</option>
              <option value="upi">📱 UPI</option>
              <option value="netbanking">🏦 Net Banking</option>
              <option value="cash">💵 Cash</option>
              <option value="cheque">📄 Cheque</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={paymentForm.transactionId}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
              placeholder="Enter transaction reference"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              className={`w-full px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400 bg-gray-700 text-gray-100' : 'focus:ring-green-500 bg-white'}`}
              required
            />
          </div>

          {/* Payment Preview */}
          <div className={`${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm ${textSecondary}`}>You are paying:</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ₹{paymentForm.amount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${textSecondary}`}>Remaining after payment:</p>
                <p className={`text-lg font-semibold ${textPrimary}`}>
                  ₹{(dueAmount - paymentForm.amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || paymentForm.amount <= 0 || paymentForm.amount > dueAmount}
              className={`flex-1 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-lg`}
            >
              {loading ? "Processing..." : `Record Payment ₹${paymentForm.amount.toLocaleString()}`}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedBillForPayment(null);
              }}
              className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} py-3 rounded-lg font-semibold transition-colors`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // ==================== MENU ITEMS ====================

 const menuItems = [
    {
      id: "doctors",
      label: "Doctors",
      badge: doctors.length > 0 ? doctors.length : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "operations",
      label: "Operations",
      badge: operations.length > 0 ? operations.length : null,
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
      id: "bills",
      label: "Bills",
      badge: bills.filter(b => b.paymentStatus === 'pending').length > 0
        ? bills.filter(b => b.paymentStatus === 'pending').length
        : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "income",
      label: "Income",
      badge: bills.length > 0 ? bills.length : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];
  // ==================== MAIN RENDER ====================

  return (
    <div className={`flex h-screen ${bgPrimary}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-orange-600 to-amber-700'} text-white flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-orange-500'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg flex items-center justify-center shadow-lg`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Hospital Panel</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-orange-200'}`}>Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${activePage === item.id
                  ? darkMode
                    ? "bg-gray-700 text-orange-400 shadow-lg ring-2 ring-orange-400/50"
                    : "bg-white text-orange-600 shadow-lg"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700/50"
                    : "text-white hover:bg-orange-500"
                }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`${darkMode ? 'bg-orange-600' : 'bg-red-500'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-orange-500'}`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-500 hover:bg-orange-600'
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-red-500 hover:bg-red-600'
              } transition-all duration-200 shadow-md`}
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
                Welcome, {hospitalInfo?.hospital?.name || profile?.name || "Hospital"}!
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
                  {hospitalInfo?.hospital?.name || profile?.name || "Hospital"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {hospitalInfo?.hospital?.email || profile?.email || "hospital@example.com"}
                </p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? 'bg-gradient-to-br from-orange-700 to-amber-700' : 'bg-gradient-to-br from-orange-500 to-amber-600'} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {hospitalInfo?.hospital?.name?.charAt(0) || profile?.name?.charAt(0) || "H"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${bgPrimary} p-6`}>
          {activePage === "doctors" && renderDoctors()}
          {activePage === "operations" && renderOperations()}
          {activePage === "beds" && renderBeds()}
          {activePage === "referrals" && renderReferrals()}
          {activePage === "bills" && renderBills()}
          {activePage === "income" && renderIncome()}
          {activePage === "profile" && renderProfile()}
        </main>
      </div>
      {showBillModal && renderBillModal()}
      {showBillDetailsModal && renderBillDetailsModal()}
      {showPaymentModal && renderPaymentModal()}
    </div>
  );
};
export default HospitalDashboard;