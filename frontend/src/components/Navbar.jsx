import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiLogOut, FiPieChart } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar animate-fade-in">
      <Link
        to="/"
        className="brand"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <FiPieChart size={24} color="var(--accent-color)" />
        <h2
          style={{
            marginBottom: 0,
            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1rem",
            lineHeight: 1,
          }}
        >
          BudgetBuddy
        </h2>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              <span className="hidden sm:inline">Welcome, </span>
              <strong>{user.username}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
              }}
            >
              <FiLogOut size={16} />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn"
              style={{
                border: "1px solid var(--accent-color)",
                color: "var(--accent-color)",
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
