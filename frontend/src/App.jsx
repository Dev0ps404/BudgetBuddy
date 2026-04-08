import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "./context/AuthContext";
import { SearchProvider, SearchContext } from "./context/SearchContext";
import {
  NotificationProvider,
  NotificationContext,
} from "./context/NotificationContext";
import Sidebar from "./components/Sidebar";
import MobileMenu from "./components/MobileMenu";
import NotificationDropdown from "./components/NotificationDropdown";
import SearchDropdown from "./components/SearchDropdown";
import AIAssistant from "./components/AIAssistant";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ManageExpenses from "./pages/ManageExpenses";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const PrivateLayout = ({ children }) => {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const { unreadCount } = useContext(NotificationContext);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Safety check: if still loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    console.warn("⚠️ No user found, redirecting to login");
    return <Navigate to="/login" />;
  }

  return (
    <>
      <MobileMenu />
      <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
          {/* We can put a universal Topbar here if needed, or handle headers per-page */}
          <div className="flex justify-between items-center px-4 md:px-8 py-3.5 bg-white/70 backdrop-blur-md border-b border-slate-100 z-10 sticky top-14 md:top-0">
            {/* Left — Greeting & Date */}
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-slate-800">
                Welcome back, {user.name?.split(" ")[0]} 👋
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {/* Right — Search + Notification + Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative hidden lg:block">
                <form onSubmit={(e) => e.preventDefault()}>
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-56 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all font-medium"
                  />
                </form>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <SearchDropdown
                    onResultClick={() => setIsSearchFocused(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`text-slate-400 hover:text-slate-600 relative p-2 rounded-xl transition-all ${showNotifications ? "bg-slate-100 text-primary-600" : "hover:bg-slate-50"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">
                    Pro Member
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-md shadow-primary-600/20 active:scale-95 transition-transform cursor-pointer hover:scale-105"
                  onClick={() => navigate("/profile")}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name?.charAt(0)
                  )}
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <NotificationProvider>
      <SearchProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <PrivateLayout>
                  <Dashboard />
                </PrivateLayout>
              }
            />
            <Route
              path="/manage-expenses"
              element={
                <PrivateLayout>
                  <ManageExpenses />
                </PrivateLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateLayout>
                  <Reports />
                </PrivateLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateLayout>
                  <Profile />
                </PrivateLayout>
              }
            />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer theme="light" position="bottom-right" />
          <AIAssistant />
        </Router>
      </SearchProvider>
    </NotificationProvider>
  );
}

export default App;
