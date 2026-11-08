import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🔍</span> Lost & Found
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`navbar-nav ${mobileMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/items" className="nav-link" onClick={closeMenu}>
            Browse Items
          </Link>
          <Link to="/report" className="nav-link nav-btn-report" onClick={closeMenu}>
            + Report Item
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="nav-link nav-badge-admin" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              <span className="user-greeting">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn-register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

