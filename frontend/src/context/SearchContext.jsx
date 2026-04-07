import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchExpenses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Failed to fetch expenses in SearchContext', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, expenses, setExpenses, fetchExpenses, loading }}>
      {children}
    </SearchContext.Provider>
  );
};
