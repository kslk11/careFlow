// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(undefined); // undefined = loading
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const tokens = {
      Admin: localStorage.getItem("AdminToken"),
      Hospital: localStorage.getItem("HospitalToken"),
      Doctor: localStorage.getItem("DoctorToken"),
      Patient: localStorage.getItem("UserToken"),
    };

    const type = Object.keys(tokens).find((r) => tokens[r]) || null;
    setUserType(type);

    if (type) {
      const infoMap = {
        Admin: JSON.parse(localStorage.getItem("Admininfo") || "{}"),
        Hospital: JSON.parse(localStorage.getItem("Hospitalinfo") || "{}"),
        Doctor: JSON.parse(localStorage.getItem("Doctorinfo") || "{}"),
        Patient: JSON.parse(localStorage.getItem("Userinfo") || "{}"),
      };
      setUserInfo(infoMap[type] || {});
    } else {
      setUserInfo({});
    }
  }, []);

  const login = (role, token, info) => {
    // role must be: "Admin" | "Hospital" | "Doctor" | "Patient"
    const tokenKey = role + "Token";
    const infoKey = role + "info";

    localStorage.setItem(tokenKey, token);
    localStorage.setItem(infoKey, JSON.stringify(info || {}));
    setUserType(role);
    setUserInfo(info || {});
  };

  const logout = () => {
    [
      "AdminToken", "HospitalToken", "DoctorToken", "UserToken",
      "Admininfo", "Hospitalinfo", "Doctorinfo", "Userinfo",
    ].forEach((k) => localStorage.removeItem(k));

    setUserType(null);
    setUserInfo({});
  };

  return (
    <AuthContext.Provider value={{ userType, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
