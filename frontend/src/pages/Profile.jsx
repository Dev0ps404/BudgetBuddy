import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSave, FiUser, FiMail, FiTarget, FiTrendingUp, FiCalendar, FiPieChart, FiShield, FiAward } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: user?.username || user?.name || '',
    email: user?.email || '',
    monthlyBudget: user?.monthlyBudget || 0
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalExpenses: 0, thisMonth: 0, categories: 0, avgDaily: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/expenses');
        const now = new Date();
        const monthExp = res.data.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const monthTotal = monthExp.reduce((s, e) => s + Number(e.amount), 0);
        const uniqueCats = new Set(monthExp.map(e => e.category)).size;
        setStats({
          totalExpenses: res.data.length,
          thisMonth: monthTotal,
          categories: uniqueCats,
          avgDaily: now.getDate() > 0 ? monthTotal / now.getDate() : 0,
        });
      } catch (err) { /* silent */ }
    };
    fetchStats();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        username: formData.username,
        monthlyBudget: Number(formData.monthlyBudget)
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const budget = user?.monthlyBudget || formData.monthlyBudget || 1;
  const budgetUsed = Math.min((stats.thisMonth / budget) * 100, 100);

  const statCards = [
    { label: 'Total Transactions', value: stats.totalExpenses, icon: FiTrendingUp, color: 'from-blue-500 to-indigo-500' },
    { label: 'This Month', value: `₹${stats.thisMonth.toFixed(0)}`, icon: FiCalendar, color: 'from-emerald-500 to-teal-500' },
    { label: 'Categories Used', value: stats.categories, icon: FiPieChart, color: 'from-violet-500 to-purple-500' },
    { label: 'Daily Average', value: `₹${stats.avgDaily.toFixed(0)}`, icon: FiTarget, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your profile, budget goals, and view your spending summary.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-600 via-violet-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60"></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-end gap-5 -mt-12 mb-6">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white">
                {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="pb-1">
              <h2 className="text-xl font-bold text-slate-800">{user?.username || user?.name}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <FiShield size={10} /> Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <FiAward size={10} /> Pro Member
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 group hover:bg-slate-100 transition-colors">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <stat.icon size={16} />
                </div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Budget Progress */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Monthly Budget Progress</h3>
                <p className="text-xs text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">₹{stats.thisMonth.toFixed(0)} <span className="text-sm font-normal text-slate-400">/ ₹{Number(budget).toLocaleString()}</span></p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  budgetUsed > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  budgetUsed > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-emerald-400 to-primary-500'
                }`}
                style={{ width: `${budgetUsed}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{budgetUsed.toFixed(0)}% used — ₹{Math.max(0, budget - stats.thisMonth).toFixed(0)} remaining</p>
          </div>

          {/* Settings Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">Profile Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FiUser size={16} />
                  </div>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={onChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-slate-300">(Read Only)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FiMail size={16} />
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}  
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-400 font-medium focus:outline-none cursor-not-allowed"
                    disabled 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Budget Goal (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiTarget size={16} />
                </div>
                <input 
                  type="number" 
                  name="monthlyBudget" 
                  value={formData.monthlyBudget} 
                  onChange={onChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-mono" 
                  min="0" step="1"
                  placeholder="e.g. 10000"
                />
              </div>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Your budget limit is used to track spending progress across the dashboard and sidebar.
              </p>
            </div>

            <div className="pt-2">
               <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:scale-100" disabled={loading}>
                 <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
