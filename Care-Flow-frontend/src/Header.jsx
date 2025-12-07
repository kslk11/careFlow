import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  // Trigger UI refresh on login/logout
  const [refresh, setRefresh] = React.useState(false);
  const navigate = useNavigate()
  // LISTEN for localStorage updates from anywhere in the app
  React.useEffect(() => {
    const handler = () => setRefresh((prev) => !prev);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // --- Check which user is logged in ---
  const tokens = {
    Hospital: localStorage.getItem("hospitalToken"),
    Doctor: localStorage.getItem("doctorToken"),
    Admin: localStorage.getItem("AdminToken"),
    Patient: localStorage.getItem("UserToken"),
  };

  const userType = Object.keys(tokens).find((role) => tokens[role]) || null;
  const isLoggedIn = Boolean(userType);

  // --- Load user info ---
  const infoMap = {
    Hospital: JSON.parse(localStorage.getItem("hospitalinfo") || "{}"),
    Doctor: JSON.parse(localStorage.getItem("doctorinfo") || "{}"),
    Admin: JSON.parse(localStorage.getItem("Admininfo") || "{}"),
    Patient: JSON.parse(localStorage.getItem("Userinfo") || "{}"),
  };

  const currentUser = infoMap[userType] || {};

  // --- THEME BASED ON USER TYPE ---
  const THEMES = {
    Hospital: "from-orange-600 to-amber-700",
    Doctor: "from-green-600 to-emerald-700",
    Admin: "from-blue-600 to-indigo-700",
    Patient: "from-cyan-600 to-blue-700",
  };

  const themeGradient = THEMES[userType] || "from-cyan-600 to-blue-700";

  // --- LOGOUT ---
  const handleLogout = () => {
    [
      "hospitalToken", "doctorToken", "AdminToken", "UserToken",
      "hospitalinfo", "doctorinfo", "Admininfo", "Userinfo",
    ].forEach((key) => localStorage.removeItem(key));
    navigate('/')
    // trigger header update instantly
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-white/20 shadow-lg 
      ${
        isLoggedIn
          ? `bg-gradient-to-r ${themeGradient} text-white`
          : "bg-white/10 backdrop-blur-md text-cyan-600"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md 
                ${isLoggedIn ? "bg-white/20 text-white" : "bg-white text-cyan-600"}`}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>

            <div>
              <span className={`text-xl sm:text-2xl font-bold ${isLoggedIn ? "text-white" : "text-cyan-600"}`}>
                CareFlow HMS
              </span>
              <p
                className={`text-xs hidden sm:block ${
                  isLoggedIn ? "text-white/80" : "text-cyan-600"
                }`}
              >
                Healthcare Management System
              </p>
            </div>
          </Link>

          {/* Show only when NOT logged in */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className="px-4 py-2 hover:bg-white/40 rounded-lg">
                Home
              </Link>
              <Link to="/about" className="px-4 py-2 hover:bg-white/40 rounded-lg">
                About
              </Link>
              <Link to="/services" className="px-4 py-2 hover:bg-white/40 rounded-lg">
                Services
              </Link>
              <Link to="/contact" className="px-4 py-2 hover:bg-white/40 rounded-lg">
                Contact
              </Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/SignupOptions"
                  className="px-5 py-2 bg-white/20 text-cyan-600 rounded-lg font-semibold"
                >
                  Sign Up
                </Link>
                <Link
                  to="/LoginOptions"
                  className="px-5 py-2 bg-white text-cyan-600 rounded-lg font-semibold"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-lg">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md bg-white/30 text-white">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || userType?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-white">
                      {currentUser?.name || "User"}
                    </p>
                    <p className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">
                      {userType}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/20 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/30 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
