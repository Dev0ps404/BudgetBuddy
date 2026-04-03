import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageExpenses from './pages/ManageExpenses';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

const PrivateLayout = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* We can put a universal Topbar here if needed, or handle headers per-page */}
        <div className="flex justify-end items-center px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-100 z-10 sticky top-0">
           <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">Academic Account</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden border border-primary-200 shadow-sm">
                    {user.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover"/> : user.name?.charAt(0)}
                 </div>
              </div>
           </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/manage-expenses" element={<PrivateLayout><ManageExpenses /></PrivateLayout>} />
        <Route path="/reports" element={<PrivateLayout><Reports /></PrivateLayout>} />
        <Route path="/profile" element={<PrivateLayout><Profile /></PrivateLayout>} />
        
        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer theme="light" position="bottom-right" />
    </Router>
  );
}

export default App;
