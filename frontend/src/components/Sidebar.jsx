import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  FiGrid, FiList, FiPieChart, FiUser, FiLogOut,
  FiChevronRight, FiTrendingUp, FiZap, FiSettings,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [expenseCount, setExpenseCount] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/expenses');
        const now = new Date();
        const monthExp = res.data.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setExpenseCount(monthExp.length);
        setMonthlyTotal(monthExp.reduce((s, e) => s + Number(e.amount), 0));
      } catch (err) { /* silent */ }
    };
    fetchStats();
  }, [location.pathname]); // re-fetch when navigating

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      icon: FiGrid,
      label: 'Dashboard',
      description: 'Overview',
    },
    {
      to: '/manage-expenses',
      icon: FiList,
      label: 'Expenses',
      description: 'Manage',
      badge: expenseCount > 0 ? expenseCount : null,
    },
    {
      to: '/reports',
      icon: FiPieChart,
      label: 'Reports',
      description: 'Analytics',
    },
    {
      to: '/profile',
      icon: FiSettings,
      label: 'Settings',
      description: 'Account',
    },
  ];

  const budget = user?.monthlyBudget || 1000;
  const budgetUsed = Math.min((monthlyTotal / budget) * 100, 100);

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col h-full z-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-20 left-0 w-32 h-32 bg-primary-600/5 rounded-full -translate-x-1/2"></div>

      {/* Brand Header */}
      <div className="p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
            <FiZap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">BudgetBuddy</h2>
            <p className="text-[0.6rem] uppercase font-semibold text-primary-400 tracking-widest">Smart Finance</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mb-5">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden flex-shrink-0">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : user?.name?.charAt(0)?.toUpperCase() || 'U'
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || user?.username || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@email.com'}</p>
            </div>
          </div>

          {/* Mini Budget Bar */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Monthly Spend</span>
              <span className="text-[10px] font-bold text-white tracking-widest">₹{monthlyTotal.toFixed(0)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  budgetUsed > 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                  budgetUsed > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                  'bg-gradient-to-r from-emerald-400 to-primary-400'
                }`}
                style={{ width: `${budgetUsed}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-6 mb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'bg-primary-600/15 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-md shadow-primary-500/50"></div>
                )}

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                    : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
                }`}>
                  <item.icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? 'text-primary-300' : 'text-slate-500'}`}>{item.description}</p>
                </div>

                {/* Badge or Chevron */}
                {item.badge ? (
                  <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <FiChevronRight size={14} className="text-primary-400 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Pro Card */}
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-4 relative overflow-hidden shadow-lg shadow-primary-900/30">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp size={16} className="text-white/80" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Insight</span>
            </div>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              {expenseCount > 0
                ? `${expenseCount} transactions tracked this month. Keep going! 💪`
                : 'Start tracking expenses to unlock financial insights!'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all font-medium text-sm group"
        >
          <FiLogOut size={16} className="group-hover:rotate-[-12deg] transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
