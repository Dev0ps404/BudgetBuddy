import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create axios instance with proper base URL for production
const RAW_API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "").endsWith("/api")
  ? RAW_API_BASE_URL.replace(/\/+$/, "")
  : `${RAW_API_BASE_URL.replace(/\/+$/, "")}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Also set default for global axios
axios.defaults.baseURL = API_BASE_URL;

const safeParseUser = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user synchronously from localStorage to prevent race condition
  const [user, setUser] = useState(() =>
    safeParseUser(localStorage.getItem("user")),
  );
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile", { timeout: 5000 });
      // Update local storage and state with fresh data
      const storedUser = safeParseUser(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...res.data };
      if (!updatedUser.token) {
        updatedUser.token =
          storedUser?.token || localStorage.getItem("authToken") || null;
      }
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.token) {
        localStorage.setItem("authToken", updatedUser.token);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${updatedUser.token}`;
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${updatedUser.token}`;
      }
    } catch (error) {
      // Only clear user for 401 (unauthorized token)
      if (error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        delete axios.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.common["Authorization"];
      }
      // For network errors, timeouts, 404, 500 etc - DON'T clear user
      // User session from localStorage is still valid
    }
  };

  useEffect(() => {
    const parsedUser = safeParseUser(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("authToken");
    const effectiveToken = storedToken || parsedUser?.token || null;

    if (parsedUser) {
      setUser(parsedUser);
    }

    if (effectiveToken) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${effectiveToken}`;
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${effectiveToken}`;
      if (!storedToken) {
        localStorage.setItem("authToken", effectiveToken);
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      delete apiClient.defaults.headers.common["Authorization"];
    }

    setLoading(false);
  }, []);

  const updateProfile = async (profileData) => {
    const res = await apiClient.put("/auth/profile", profileData);
    const storedUser = safeParseUser(localStorage.getItem("user"));
    const mergedUser = {
      ...storedUser,
      ...res.data,
      token:
        res.data?.token ||
        storedUser?.token ||
        localStorage.getItem("authToken"),
    };
    setUser(mergedUser);
    localStorage.setItem("user", JSON.stringify(mergedUser));
    if (mergedUser.token) {
      localStorage.setItem("authToken", mergedUser.token);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${mergedUser.token}`;
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${mergedUser.token}`;
    }
    return mergedUser;
  };

  const login = async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    localStorage.setItem("authToken", res.data.token);
    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.token}`;
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
    localStorage.setItem("authToken", res.data.token);
    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.token}`;
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  };

  const googleLogin = async (token) => {
    const res = await apiClient.post("/auth/google", { token });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    localStorage.setItem("authToken", res.data.token);
    apiClient.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.token}`;
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
    delete apiClient.defaults.headers.common["Authorization"];
  };

  const isAuthenticated = Boolean(
    user?.token || localStorage.getItem("authToken"),
  );

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
        isAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
