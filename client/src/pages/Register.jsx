import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, FormField } from "../components";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      // Redirect to login page upon successful account creation
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container auth-form-container">
      <div className="form-card auth-card">
        <h2>Create an Account</h2>
        <p className="form-subtitle">Register to submit reports and connect with campus finders</p>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        <form onSubmit={handleSubmit} className="form-body">
          <FormField
            id="name"
            name="name"
            type="text"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Ayush Chaturvedi"
            required={true}
          />

          <FormField
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g., student@college.edu"
            required={true}
          />

          <FormField
            id="phone"
            name="phone"
            type="tel"
            label="Contact Phone (Optional)"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g., +91 9876543210 (private until claim approved)"
          />

          <FormField
            id="password"
            name="password"
            type="password"
            label="Password (min. 8 characters)"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required={true}
          />

          <FormField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required={true}
          />

          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

