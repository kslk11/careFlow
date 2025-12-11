import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HospitalLogin = () => {
    const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://careflow-lsf5.onrender.com/api/hospital/login", form);
      setMessage(res.data.message);
      // Save token in localStorage for further API requests
      localStorage.setItem("hospitalToken", res.data.token);
      localStorage.setItem("hospitalinfo", JSON.stringify(res.data));
      navigate('/DashboardHos')
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Hospital Login</h2>
      {message && <p className="mb-4 text-red-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border px-2 py-1 w-full"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="border px-2 py-1 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default HospitalLogin;
