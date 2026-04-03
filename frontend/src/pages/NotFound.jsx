import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-8 font-sans text-center relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <FiAlertCircle size={48} />
        </div>
        
        <h1 className="text-8xl font-extrabold text-slate-900 tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you made a small typo in the URL.
        </p>

        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <FiHome size={20} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
