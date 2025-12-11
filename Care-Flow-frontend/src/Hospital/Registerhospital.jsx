import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterHospital = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    departments: [],
    registrationNumber: "",
    establishedYear: "",
    website: "",
  });

  const [departmentsList, setDepartmentsList] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all departments from backend
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://careflow-lsf5.onrender.com/api/department/get");
      setDepartmentsList(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCheckboxChange = (depName) => {
    let updatedDepartments = [...form.departments];
    if (updatedDepartments.includes(depName)) {
      updatedDepartments = updatedDepartments.filter((d) => d !== depName);
    } else {
      updatedDepartments.push(depName);
    }
    setForm({ ...form, departments: updatedDepartments });
  };

  // Select all departments
  const selectAllDepartments = () => {
    setForm({ ...form, departments: departmentsList.map(dep => dep.name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://careflow-lsf5.onrender.com/api/hospital/register", {
        ...form,
        establishedYear: Number(form.establishedYear),
      });
      setMessage(res.data.message);
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        departments: [],
        registrationNumber: "",
        establishedYear: "",
        website: "",
      });
      navigate('/LoginOptions')
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage(error.response?.data?.message || "Error registering hospital");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Hospital Registration</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hospital Name" className="border px-2 py-1 w-full" required />
        <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border px-2 py-1 w-full" required />
        <input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="border px-2 py-1 w-full" required />
        <input type="text" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border px-2 py-1 w-full" required />
        <input type="text" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="border px-2 py-1 w-full" required />

        {/* Departments checkboxes */}
        <div className="border p-2 mb-2">
          <h3 className="font-semibold mb-1">Select Departments</h3>
          <button type="button" onClick={selectAllDepartments} className="bg-gray-500 text-white px-2 py-1 rounded mb-2">
            Select All
          </button>
          <div className="flex flex-wrap gap-2">
            {departmentsList.map((dep) => (
              <label key={dep._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.departments.includes(dep.name)}
                  onChange={() => handleCheckboxChange(dep.name)}
                />
                {dep.name}
              </label>
            ))}
          </div>
        </div>

        <input type="text" name="registrationNumber" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="Registration Number" className="border px-2 py-1 w-full" required />
        <input type="number" name="establishedYear" value={form.establishedYear} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })} placeholder="Established Year" className="border px-2 py-1 w-full" />
        <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website" className="border px-2 py-1 w-full" />

        <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded w-full">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterHospital;
