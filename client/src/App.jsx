import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Listing from "./pages/Listing";
import ItemDetails from "./pages/ItemDetails";
import ReportItem from "./pages/ReportItem";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/items" element={<Listing />} />
                <Route path="/items/:id" element={<ItemDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

