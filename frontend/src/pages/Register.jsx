import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
        toast.success("Successfully registered via Google!");
        navigate("/dashboard");
      } catch (err) {
        console.error("Google register error:", err.response?.data || err);
        const errorMsg =
          err.response?.data?.message || "Google authentication failed.";
        toast.error(errorMsg);
      }
    },
    onError: (err) => {
      console.error("Google popup error:", err);
      toast.error("Google sign-in failed. Check your browser popup settings.");
    },
  });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.warning("Passwords do not match.");
    }
    if (formData.password.length < 6) {
      return toast.warning("Password must be at least 6 characters long.");
    }
    if (!formData.username.trim()) {
      return toast.warning("Please enter your full name.");
    }
    try {
      await register(formData.username, formData.email, formData.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      ></div>

      {/* Main Split Card Container */}
      <div className="bg-white w-full max-w-6xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl md:h-[680px]">
        {/* Left Side: Form */}
        <div className="w-full md:w-[45%] flex flex-col pt-8 px-6 sm:px-10 pb-6 h-full bg-white relative">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-primary-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2.12-1.15V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
            </svg>
            <div className="font-bold text-xl tracking-tight text-primary-700">
              BudgetBuddy
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                Join BudgetBuddy
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
                The smartest way to manage your financial life.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="student@university.edu"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-mono"
                />
              </div>

              {/* Passwords Flex */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#4f46e5] text-white font-bold tracking-wide py-3 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-2 text-sm"
              >
                Create Account
              </button>
            </form>

            <div className="flex items-center my-4">
              <hr className="flex-1 border-slate-100" />
              <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Continue With
              </span>
              <hr className="flex-1 border-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Standard Visible Google Login */}
              <div className="flex items-center justify-center bg-white rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  className="w-full h-[44px] flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-sm group"
                >
                  <FcGoogle
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Google
                </button>
              </div>

              {/* Apple mockup */}
              <button
                onClick={() => toast.info("Apple Login coming soon.")}
                type="button"
                className="h-[44px] flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-sm group"
              >
                <FaApple
                  size={18}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />{" "}
                Apple
              </button>
            </div>
          </div>

          <div className="mt-auto text-center pt-6 flex flex-col gap-2 w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest relative">
            <div className="text-xs tracking-normal font-medium text-slate-500 capitalize">
              Already have an account?{" "}
              <Link
                to="/login"
                className="ml-1 font-bold text-primary-600 hover:text-primary-700"
              >
                Log In
              </Link>
            </div>
            <div className="flex justify-between mt-2">
              <div>© 2026 BUDGETBUDDY.</div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Image and Glass block */}
        <div
          className="hidden md:flex w-[55%] relative h-full bg-slate-900 border-l border-slate-800 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1500')",
          }}
        >
          {/* Dark Gradient Overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0f172a] to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply"></div>

          {/* Center Glass Block */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-md rounded-[2rem] bg-black/20 backdrop-blur-xl border border-white/20 p-10 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex flex-col overflow-hidden">
                  <div className="h-1/2 w-full bg-[#fca5a5]"></div>
                  <div className="flex-1 bg-indigo-500"></div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex flex-col overflow-hidden">
                  <div className="h-1/2 w-full bg-[#fdba74]"></div>
                  <div className="flex-1 bg-teal-500"></div>
                </div>
                <div className="w-6 h-6 rounded-full bg-primary-600 border-2 border-transparent flex items-center justify-center text-[8px] font-bold text-white">
                  +50k
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-white uppercase pr-2">
                Trusted By Students
              </span>
            </div>

            <h3 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              Empowering 50,000+ students to build their financial future today.
            </h3>

            <p className="text-sm font-medium text-white/90 italic mt-2 leading-relaxed">
              "BudgetBuddy changed how I think about my loans and savings. It's
              the essential toolkit for every student."
            </p>
          </div>

          <div className="absolute bottom-6 right-8 text-[10px] font-bold text-white/50 tracking-widest uppercase">
            EST. 2026 / BUDGETBUDDY GLOBAL
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
