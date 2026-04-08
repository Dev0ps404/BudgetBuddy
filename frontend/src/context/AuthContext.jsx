import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create axios instance with proper base URL for production
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Also set default for global axios
axios.defaults.baseURL = API_BASE_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user synchronously from localStorage to prevent race condition
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (_) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile", { timeout: 5000 });
      // Update local storage and state with fresh data
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ Profile fetched successfully");
    } catch (error) {
      console.error("⚠️ Failed to fetch profile:", error.message);
      // Only clear user for 401 (unauthorized token)
      if (error.response?.status === 401) {
        console.warn("❌ Auth token invalid, logging out");
        setUser(null);
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      }
      // For network errors, timeouts, 404, 500 etc - DON'T clear user
      // User session from localStorage is still valid
    }
  };

  useEffect(() => {
    // Just set up the auth headers from localStorage
    // Don't call fetchProfile during initialization - it can fail and cause issues
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure user is properly set from localStorage
        setUser(parsedUser);
        // Set auth header for all future requests
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${parsedUser.token}`;
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${parsedUser.token}`;
        console.log("✅ User loaded from localStorage");
      } catch (err) {
        console.warn("⚠️ Invalid stored user, clearing");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      console.log("ℹ️ No stored user found");
    }
    setLoading(false);
  }, []);

  const updateProfile = async (profileData) => {
    const res = await apiClient.put("/auth/profile", profileData);
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  };

  const login = async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  };

  const register = async (username, email, password) => {
    const res = await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  };

  const googleLogin = async (token) => {
    console.log("Google login with token, API URL:", API_BASE_URL);
    const res = await apiClient.post("/auth/google", { token });
    console.log("Google login successful:", res.data);
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.token}`;
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        googleLogin,
        updateProfile,
        fetchProfile,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
