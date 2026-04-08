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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile");
      // Update local storage and state with fresh data
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to fetch profile", error);
      // Only clear user for specific auth errors (401 Unauthorized)
      // Don't clear for 404 or network errors - user session is still valid
      if (error.response && error.response.status === 401) {
        console.warn("Authentication token invalid, logging out");
        setUser(null);
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      }
      // For other errors (404, network), keep user session intact
      // The stored user is still valid even if profile fetch fails
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${parsedUser.token}`;
      // Attempt to refresh profile in background, but don't wait for it
      // This way even if backend is slow/unreachable, user stays logged in
      fetchProfile().catch(() => {
        // Silently ignore profile fetch errors, user session remains valid
      });
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
