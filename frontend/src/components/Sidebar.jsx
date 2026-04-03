import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiGrid, FiList, FiPieChart, FiUser, FiLogOut, FiBookOpen } from 'react-icons/fi';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3.5 mx-4 my-1 font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600 shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg text-white">
          <FiBookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Curator</h2>
          <p className="text-[0.65rem] uppercase font-bold text-slate-400 tracking-wider">Financial Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
        <NavLink to="/dashboard" className={navClass}>
          <FiGrid size={20} /> <span className="text-sm">Dashboard</span>
        </NavLink>
        <NavLink to="/manage-expenses" className={navClass}>
          <FiList size={20} /> <span className="text-sm">Expenses</span>
        </NavLink>
        <NavLink to="/reports" className={navClass}>
          <FiPieChart size={20} /> <span className="text-sm">Reports</span>
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          <FiUser size={20} /> <span className="text-sm">Profile</span>
        </NavLink>
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium text-sm shadow-sm"
        >
          <FiLogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
