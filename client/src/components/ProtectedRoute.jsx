import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Component to protect routes requiring authentication and optional admin role
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // Wait until auth check completes before redirecting
  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

