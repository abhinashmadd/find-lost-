import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  const id = rawUser.id || rawUser._id;
  const _id = rawUser._id || rawUser.id;
  return { ...rawUser, id, _id };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Check token on initial load and fetch current user profile
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getMe();
        setUser(normalizeUser(userData));
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { token: receivedToken, user: receivedUser } = data;
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    setUser(normalizeUser(receivedUser));
    return data;
  };

  // Register handler
  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Re-fetch current user profile
  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      const normalized = normalizeUser(userData);
      setUser(normalized);
      return normalized;
    } catch (err) {
      logout();
      return null;
    }
  };

  // Synchronize authentication state across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (!e.newValue) {
          // Token removed in another tab -> log out in this tab
          setToken(null);
          setUser(null);
        } else if (e.newValue !== token) {
          // Token updated in another tab -> re-sync session
          setToken(e.newValue);
          authService.getMe().then((data) => setUser(normalizeUser(data))).catch(logout);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token]);

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user?.role === "admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

