import React from "react";
import { Link } from "react-router-dom";
import {
  FiPlayCircle,
  FiTrendingUp,
  FiCreditCard,
  FiUsers,
  FiCheckCircle,
  FiShield,
  FiFileText,
  FiCamera,
  FiBarChart2,
  FiGlobe,
  FiShare2,
  FiAtSign,
} from "react-icons/fi";
import BrandLogo from "../components/BrandLogo";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-200">
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto border-b border-transparent">
        <BrandLogo
          size="sm"
          titleClassName="text-xl text-indigo-700"
          markClassName="shadow-indigo-500/25"
        />
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
          <a href="#home" className="hover:text-indigo-600 transition-colors">
            Home
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-indigo-600 transition-colors"
          >
            Pricing
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            className="text-sm font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-bold hover:bg-indigo-800 transition-all shadow-md active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-8 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16 relative"
      >
        {/* Left Copy */}
        <div className="flex-1 space-y-6 z-10">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
            New: Smart Receipt Parsing 2.0
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
            Your Smart <br />
            <span className="text-indigo-700">Financial</span>
            <br />
            Intelligence.
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
            Master your budget with ease. Track expenses, analyze spending
            trends, and secure your future—all in one place.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-indigo-700 text-white rounded-xl font-bold text-lg hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Start Tracking Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-blue-100 text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-200 transition-all flex items-center gap-3"
            >
              <FiPlayCircle size={22} /> See How It Works
            </a>
          </div>
        </div>

        {/* Right Dashboard Mockup Graphic */}
        <div className="flex-1 relative w-full h-[550px] flex items-center justify-center">
          {/* Slanted device base */}
          <div className="absolute w-[90%] h-[90%] bg-[#1e293b] rounded-[2rem] shadow-2xl -rotate-6 transition-transform hover:-rotate-3 duration-500 overflow-hidden border-8 border-slate-800">
            {/* Inner Dashboard Mock */}
            <div className="w-full h-full bg-[#0f172a] p-6 flex flex-col gap-4 opacity-90">
              <div className="flex justify-between items-center mb-2">
                <div className="text-slate-300 font-bold text-sm tracking-wider">
                  Student Finance
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                </div>
              </div>
              <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col justify-end p-4 relative overflow-hidden">
                {/* Simulated Area Chart */}
                <svg
                  className="absolute bottom-0 w-full h-1/2 left-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M0,100 L0,50 Q10,40 20,60 T40,60 T60,40 T80,80 T100,20 L100,100 Z"
                    fill="rgba(20, 184, 166, 0.4)"
                    stroke="#14b8a6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4 border-dashed relative">
                {/* Simulated smaller line chart */}
                <svg
                  className="absolute top-1/2 w-full left-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 20"
                >
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    points="0,10 20,15 40,5 60,18 80,8 100,12"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Floating Floating Cards */}
          <div className="absolute top-24 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4 animate-[bounce_6s_infinite]">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 flex items-center justify-center rounded-full">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">
                Savings Goal
              </div>
              <div className="text-sm font-extrabold text-slate-800">
                92% Reached
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 -right-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4 animate-[bounce_7s_infinite_1s]">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg">
              <FiCreditCard size={20} />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <div className="text-xs font-bold text-slate-800">
                Tuition Fund
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES BENTO SECTION --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Engineered for Success
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              BudgetBuddy combines high-end financial tools with an intuitive
              student-first interface.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Feature 1 - Wide Card */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <FiBarChart2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Deep Insight Analytics
                </h3>
                <p className="text-slate-500">
                  Visualize your spending patterns over the semester. Understand
                  exactly where your money goes with our custom "Spending Pulse"
                  metrics.
                </p>
              </div>
              <div className="flex-1 w-full bg-slate-900 h-64 rounded-2xl p-4 relative overflow-hidden flex items-end">
                {/* Simulated bar chart graph visually */}
                <div className="w-full flex justify-between items-end gap-1 h-3/4 opacity-80">
                  {[10, 30, 20, 50, 40, 80, 60, 90, 70, 40, 60].map((h, i) => (
                    <div
                      key={i}
                      className="w-full bg-[#0ea5e9] rounded-t-sm"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
                {/* Overlay sweeping line */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    points="0,80 20,60 40,70 60,40 80,30 100,10"
                  />
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1"
                    points="0,70 20,80 40,50 60,50 80,40 100,20"
                  />
                </svg>
              </div>
            </div>

            {/* Feature 2 - Tall Card */}
            <div className="bg-[#4338ca] text-white rounded-3xl p-8 shadow-lg flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-auto backdrop-blur-sm">
                <FiCamera size={24} />
              </div>
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-3">Receipt Scanning</h3>
                <p className="text-indigo-100/90 leading-relaxed">
                  Snap a photo and let our AI extract total, tax, and category
                  automatically.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <FiCheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Smart Budgeting
              </h3>
              <p className="text-slate-500 text-sm">
                Set limits for coffee, textbooks, and nightlife. Get notified
                before you overspend.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <FiFileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Loan Management
              </h3>
              <p className="text-slate-500 text-sm">
                Keep track of your student loans and interest rates without the
                headache.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <FiUsers size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Shared Expenses
              </h3>
              <p className="text-slate-500 text-sm">
                Split rent and groceries with roommates easily. No more awkward
                conversations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL & CTA SECTION --- */}
      <section id="pricing" className="py-24 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-8 flex flex-col gap-24">
          {/* Top Split */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Text / Checks */}
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Built by Students,
                <br />
                For Scholars.
              </h2>
              <p className="text-slate-600 text-lg">
                We understand your unique financial challenges. From monthly
                subscriptions to daily expenses, we've built tools to handle it
                all.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-slate-700 font-semibold">
                  <FiShield className="text-teal-500" size={20} /> Encrypted
                  Bank-Level Security
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-semibold">
                  <FiCheckCircle className="text-teal-500" size={20} /> No Ads,
                  No Selling Data
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-semibold">
                  <FiCheckCircle className="text-teal-500" size={20} /> Export
                  to CSV/Excel for Reports
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="flex-1 w-full bg-[#f1f5f9] p-10 rounded-3xl relative overflow-hidden border border-slate-200 shadow-sm">
              <div className="absolute -top-6 -right-6 text-[150px] font-serif text-indigo-100 leading-none select-none">
                "
              </div>
              <p className="text-xl italic text-slate-800 font-medium relative z-10 leading-relaxed">
                "BudgetBuddy changed how I view my money. It feels like a
                high-end journal rather than a boring spreadsheet. I saved ₹800
                in my first semester."
              </p>
              <div className="flex items-center gap-4 mt-8 relative z-10">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm overflow-hidden">
                  <img
                    src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexC&backgroundColor=14b8a6"
                    alt="Alex Chen"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Alex Chen</div>
                  <div className="text-sm text-slate-500">
                    Economics Major, Year 3
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Giant CTA Box */}
          <div className="bg-[#4f46e5] rounded-[2.5rem] p-16 text-center shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl font-extrabold text-white mb-6">
                Ready to Take Control?
              </h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
                Join 50,000+ students managing their finances with BudgetBuddy
                today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/info/student-plan"
                  className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  View Student Plan
                </Link>
              </div>
            </div>
            {/* Decorative backgrounds */}
            <div
              className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 150%, #ffffff 0%, transparent 50%)",
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand Col */}
            <div className="md:col-span-1 space-y-6">
              <BrandLogo
                size="md"
                titleClassName="text-2xl text-indigo-700"
                markClassName="shadow-indigo-500/25"
              />
              <p className="text-slate-500 text-sm leading-relaxed">
                Financial Intelligence for the modern lifestyle. Secure,
                intuitive, powerful.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/info/about-us"
                  className="w-8 h-8 rounded-full bg-blue-50 text-indigo-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <FiGlobe size={16} />
                </Link>
                <Link
                  to="/info/blog"
                  className="w-8 h-8 rounded-full bg-blue-50 text-indigo-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <FiShare2 size={16} />
                </Link>
                <Link
                  to="/info/contact"
                  className="w-8 h-8 rounded-full bg-blue-50 text-indigo-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <FiAtSign size={16} />
                </Link>
              </div>
            </div>

            {/* Links Cols */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li>
                  <a
                    href="#features"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    to="/info/integrations"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/student-plan"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Student Plan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li>
                  <Link
                    to="/info/blog"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/scholarships"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Scholarships
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/help-center"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/api-docs"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li>
                  <Link
                    to="/info/about-us"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/careers"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/privacy-policy"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/contact"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-500">
            <div>© 2026 BudgetBuddy. All rights reserved.</div>
            <div className="flex gap-8">
              <Link
                to="/info/terms-of-service"
                className="hover:text-indigo-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/info/cookie-settings"
                className="hover:text-indigo-600 transition-colors"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
