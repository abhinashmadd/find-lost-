import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, FormField } from "../components";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container auth-form-container">
      <div className="form-card auth-card">
        <h2>Welcome Back</h2>
        <p className="form-subtitle">Log in to report items and manage your claims</p>

        {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}
        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        <form onSubmit={handleSubmit} className="form-body">
          <FormField
            id="email"
            name="email"
            type="email"
            label="College Email Address"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g., student@college.edu"
            required={true}
          />

          <FormField
            id="password"
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required={true}
          />

          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account yet? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

