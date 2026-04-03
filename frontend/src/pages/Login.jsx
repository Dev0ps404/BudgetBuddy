import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff, FiTrendingUp } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.warning("Please enter both email and password.");
    }

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMsg);
    }
  };

  const handleAppleLogin = () => {
    toast.info(
      "Apple Login is pending App Store configuration. Please use Google or Email.",
    );
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background Dots Pattern (Simulating standard dark backdrop in image) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4b5563 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      ></div>

      {/* Main Split Card Container */}
      <div className="bg-white w-full max-w-6xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl h-[650px]">
        {/* Left Side: Form */}
        <div className="w-full md:w-[45%] flex flex-col pt-8 px-6 sm:px-10 pb-6 h-full bg-white relative">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-xl tracking-tight text-primary-700">
              Scholar Ledger
            </div>
            <div className="text-xs font-semibold text-slate-400 tracking-wider">
              NEED HELP?
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Welcome Back!
              </h2>
              <p className="text-sm text-slate-500 font-medium tracking-wide">
                Continue your journey toward academic financial mastery.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="Email Address"
                    className="w-full bg-primary-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                      />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="Password"
                    className="w-full bg-primary-50 border-none rounded-xl pl-12 pr-12 py-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Checks */}
              <div className="flex justify-between items-center py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${rememberMe ? "bg-primary-600 border-primary-600" : "bg-slate-50 border-slate-200"}`}
                  >
                    {rememberMe && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                    Remember Me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Password reset instructions sent (Simulated)")
                  }
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submits */}
              <button
                type="submit"
                className="w-full bg-[#4f46e5] text-white font-bold tracking-wide py-3 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 text-sm"
              >
                Log In <span className="text-lg">→</span>
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
              <div className="flex items-center justify-center bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <GoogleLogin
                  onSuccess={async (res) => {
                    try {
                      await googleLogin(res.credential);
                      toast.success("Successfully logged in with Google!");
                      navigate("/dashboard");
                    } catch (err) {
                      toast.error("Google authentication failed.");
                    }
                  }}
                  onError={() => toast.error("Google popup failed to load")}
                  width="100%"
                  size="large"
                  theme="outline"
                  shape="rectangular"
                  logo_alignment="center"
                />
              </div>

              {/* Apple mockup */}
              <button
                onClick={handleAppleLogin}
                type="button"
                className="h-[44px] flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-slate-700 font-semibold rounded-xl transition-all text-sm group"
              >
                <FaApple
                  size={18}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />{" "}
                iOS Apple
              </button>
            </div>
          </div>

          <div className="mt-auto text-center pt-6 flex flex-col gap-2 w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest relative">
            <div className="text-xs tracking-normal font-medium text-slate-500 capitalize">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="ml-1 font-bold text-primary-600 hover:text-primary-700"
              >
                Create Account
              </Link>
            </div>
            <div className="flex justify-between mt-2">
              <div>© 2024 SCHOLAR LEDGER.</div>
              <div className="flex gap-4">
                <span>PRIVACY POLICY</span>
                <span>TERMS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Hero Image and Glass block */}
        <div
          className="hidden md:flex w-[55%] relative h-full bg-slate-900 border-l border-slate-800 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1500')",
          }}
        >
          {/* Dark Gradient Overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0f172a] to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>

          {/* Center Glass Block */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-sm rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl flex flex-col gap-6 transform transition-all hover:scale-105 duration-500">
            <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
            <h3 className="text-3xl font-bold text-white leading-tight italic tracking-tight">
              "Empowering your academic financial journey."
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white">
                  MK
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold text-white">
                  +12k
                </div>
              </div>
              <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                Join 12,000+ Students Today
              </div>
            </div>
          </div>

          {/* Small Floating Savings Goal Block */}
          <div className="absolute bottom-12 right-12 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex gap-4 hidden lg:flex shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FiTrendingUp size={24} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Savings Goal
              </span>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-white">$1,240.00</span>
                <span className="text-xs font-bold text-emerald-400 mb-1">
                  +8%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
