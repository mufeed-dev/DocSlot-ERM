import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    toast.error("Unauthorized: Access denied for your user role");
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PublicRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
