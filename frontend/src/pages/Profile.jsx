import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiSave, FiUser, FiMail, FiDollarSign } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: user?.username || user?.name || '',
    email: user?.email || '',
    monthlyBudget: user?.monthlyBudget || 0
  });

  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-3xl animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and set your monthly budget goal.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-md">
              {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 m-0">{user?.username || user?.name}</h2>
            <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
            <div className="mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg inline-block">Active Scholar</div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Display Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiUser size={18} />
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
          
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Email Address <span className="text-slate-400 font-normal ml-2">(Read Only)</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiMail size={18} />
              </div>
              <input 
                type="email" 
                name="email" 
                value={formData.email}  
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-500 font-medium focus:outline-none cursor-not-allowed"
                disabled 
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Goals</h3>
            
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Monthly Budget Limit (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiDollarSign size={18} />
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
              <p className="text-slate-500 text-xs font-medium mt-2">
                Set a monthly limit to track your remaining allowance on the dashboard widget.
              </p>
            </div>
          </div>

          <div className="pt-4">
             <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:scale-100" disabled={loading}>
               <FiSave size={18} /> {loading ? 'Saving...' : 'Save Profile Settings'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
