import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiList,
  FiPieChart,
  FiUser,
  FiLogOut,
  FiHome,
} from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const MobileMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const navItems = [
    { to: "/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/manage-expenses", icon: FiList, label: "Expenses" },
    { to: "/reports", icon: FiPieChart, label: "Reports" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="flex justify-between items-center px-4 py-3">
        <BrandLogo size="sm" titleClassName="text-primary-700" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white border-t border-slate-200 animate-fade-in">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-600 border-l-4 border-l-primary-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
