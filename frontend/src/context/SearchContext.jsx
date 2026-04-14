import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const getStoredUser = () => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  };

  const getEffectiveToken = () => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = getStoredUser();
    return user?.token || storedToken || storedUser?.token || null;
  };

  const fetchExpenses = async () => {
    const token = getEffectiveToken();
    if (!token) {
      setExpenses([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch expenses in SearchContext", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getEffectiveToken();
    if (token) {
      fetchExpenses();
    } else {
      setExpenses([]);
    }
    // We intentionally key this off `user` updates; token fallback handles page reload cases.
  }, [user]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        expenses,
        setExpenses,
        fetchExpenses,
        loading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
