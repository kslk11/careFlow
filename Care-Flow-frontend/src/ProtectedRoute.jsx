import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const tokens = {
    Admin: localStorage.getItem("AdminToken"),
    Hospital: localStorage.getItem("hospitalToken"),
    Doctor: localStorage.getItem("doctorToken"),
    Patient: localStorage.getItem("UserToken"),
  };

  // If a role is required but the token is missing
  if (role && !tokens[role]) {
    return <Navigate to="/LoginOptions" replace />;
  }

  return children;
};

export default ProtectedRoute;
