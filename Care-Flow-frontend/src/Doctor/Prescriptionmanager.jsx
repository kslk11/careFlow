import React, { useState, useEffect } from "react";
import axios from "axios";

const PrescriptionManager = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);
       
  const [formData, setFormData] = useState({
    reason: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    nextVisitDate: ""
  });

  const token = localStorage.getItem("doctorToken");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
// console.log(appointments)
// console.log(prescriptions)
  useEffect(() => {
    fetchPrescriptions();
    fetchCompletedAppointments();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/prescription/doctor", config);
      setPrescriptions(res.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/appointment/doctor", config);
      // Filter only completed appointments without prescriptions
      const completed = res.data.filter(apt => 
        apt.status?.toLowerCase() === "completed" || apt.status?.toLowerCase() === "approved"
      );
      setAppointments(completed);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: "", dosage: "", frequency: "", duration: "" }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData({ ...formData, medicines: newMedicines });
  };
//   console.log(selectedAppointment)
  const handleCreatePrescription = async (e) => {
  e.preventDefault();
  if (!selectedAppointment) return;

  setLoading(true);

  try {
    await axios.post(
      "https://careflow-lsf5.onrender.com/api/prescription/create",
      {
        appointmentId:            selectedAppointment._id,
        patientId:               selectedAppointment.userId._id,
        patientName:             selectedAppointment.userId.name,
        doctorId:                selectedAppointment.doctorId._id,
        doctorName:              selectedAppointment.doctorId.name,
        reason:                  formData.reason,
        medicines:               formData.medicines.filter(m => m.name),
        dateOfVisit:             selectedAppointment.appointmentDate,
        nextVisitDate:           formData.nextVisitDate || null
      },
      config
    );
    alert("Prescription created successfully!");
    setShowModal(false);
    resetForm();
    fetchPrescriptions();
  } catch (error) {
    console.error("Error creating prescription:", error.response?.data || error);
    alert(error.response?.data?.message || "Failed to create prescription");
  } finally {
    setLoading(false);
  }
};

// console.log(selectedAppointment)
  const handleDeletePrescription = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;

    setLoading(true);
    try {
      await axios.delete(
        "https://careflow-lsf5.onrender.com/api/prescription/delete",
        { ...config, data: { appointmentId } }
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
      nextVisitDate: ""
    });
    setSelectedAppointment(null);
  };

  const openCreateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Prescriptions</h2>
        <p className="text-gray-600">Create and manage patient prescriptions</p>
      </div>

      {/* Appointments Ready for Prescription */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Create Prescription
        </h3>

        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No appointments available for prescription</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    {apt.patientName.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{apt.patientName || "Patient"}</p>
                    <p className="text-sm text-gray-500">{formatDate(apt.appointmentDate)}</p>
                  </div>
                </div>
                <button
                  onClick={() => openCreateModal(apt)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Prescription
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Recent Prescriptions</h3>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No prescriptions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date of Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Next Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{prescription.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 max-w-xs truncate">{prescription.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(prescription.dateOfVisit)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {prescription.nextVisitDate ? formatDate(prescription.nextVisitDate) : "Not set"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewPrescription(prescription)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription.appointmentId)}
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

      {/* Create Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Create Prescription</h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedAppointment && (
                <p className="text-gray-600 mt-1">
                  Patient: <span className="font-medium">{selectedAppointment.patientName}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleCreatePrescription} className="p-6 space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason / Diagnosis *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="2"
                  required
                  placeholder="Enter diagnosis or reason for visit"
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.medicines.map((medicine, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Medicine {index + 1}</span>
                        {formData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="text-red-500 hover:text-red-700"
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
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 500mg)"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={medicine.frequency}
                          onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={medicine.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Visit Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Next Visit Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Prescription"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition-colors"
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
                <button
                  onClick={() => setViewPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Patient Name</label>
                  <p className="text-gray-800">{viewPrescription.patientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Doctor Name</label>
                  <p className="text-gray-800">{viewPrescription.doctorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Date of Visit</label>
                  <p className="text-gray-800">{formatDate(viewPrescription.dateOfVisit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Next Visit</label>
                  <p className="text-gray-800">
                    {viewPrescription.nextVisitDate ? formatDate(viewPrescription.nextVisitDate) : "Not scheduled"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Reason / Diagnosis</label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{viewPrescription.reason}</p>
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Medicines</label>
                {viewPrescription.medicines?.length > 0 ? (
                  <div className="space-y-2">
                    {viewPrescription.medicines.map((med, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-semibold text-green-800">{med.name}</p>
                        <p className="text-sm text-green-700">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No medicines prescribed</p>
                )}
              </div>

              <button
                onClick={() => setViewPrescription(null)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition-colors"
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

export default PrescriptionManager;