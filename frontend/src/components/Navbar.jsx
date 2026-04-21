import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import BrandLogo from "./BrandLogo";

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
        <BrandLogo
          size="md"
          markClassName="shadow-indigo-500/30"
          titleClassName="text-base bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent"
        />
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
