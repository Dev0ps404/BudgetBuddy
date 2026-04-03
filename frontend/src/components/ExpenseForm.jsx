import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiActivity } from 'react-icons/fi';

const ExpenseForm = ({ fetchExpenses, expenseToEdit, onClose }) => {
  const [formData, setFormData] = useState({
    amount: expenseToEdit ? expenseToEdit.amount : '',
    category: expenseToEdit ? expenseToEdit.category : 'Dining & Food',
    description: expenseToEdit ? expenseToEdit.description : '',
    date: expenseToEdit ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const categories = ['Dining & Food', 'Transport', 'Academic Tools', 'Housing', 'Utilities', 'Lifestyle', 'Other'];

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (expenseToEdit) {
        await axios.put(`/expenses/${expenseToEdit._id}`, formData);
        toast.success('Expense updated');
      } else {
        await axios.post('/expenses', formData);
        toast.success('Expense added successfully');
      }
      fetchExpenses();
      if(onClose) onClose();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20">
      {/* Blurred Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
        
        {/* Header Title inside flow */}
        <div className="text-center mb-6 relative z-10 w-full flex-col items-center">
            <h2 className="text-3xl font-bold text-slate-800">Log New Expense</h2>
            <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide">Categorize your spending to keep your academic budget healthy.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[24px] shadow-2xl p-8 w-full border border-slate-100 z-10 relative">
          <form onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 font-medium text-xl">$</span>
                <input 
                  type="number" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={onChange} 
                  required 
                  min="0.01" step="0.01"
                  placeholder="0.00"
                  className="w-full bg-primary-50/50 border-none rounded-xl pl-8 py-4 text-xl text-slate-800 font-medium placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={onChange}
                  className="w-full bg-primary-50/50 border-none rounded-xl px-4 py-3.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={onChange} 
                  className="w-full bg-primary-50/50 border-none rounded-xl px-4 py-3.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Description</label>
              <input 
                type="text" 
                name="description" 
                value={formData.description} 
                onChange={onChange} 
                placeholder="What did you buy?"
                className="w-full bg-primary-50/50 border-none rounded-xl px-4 py-4 text-sm text-slate-700 font-medium placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-primary-600/20 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FiCheckCircle size={18} /> {expenseToEdit ? 'Update Expense' : 'Save Expense'}
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3.5 text-slate-500 font-semibold text-sm hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tip Card */}
        <div className="mt-6 bg-success-50 border border-success-100 rounded-xl p-4 flex gap-3 text-left w-full relative z-10 shadow-sm">
           <div className="text-success-600 mt-0.5"><FiActivity size={18} /></div>
           <div>
             <h4 className="font-bold text-success-800 text-sm tracking-tight mb-1">Financial Intelligence Tip</h4>
             <p className="text-xs text-success-700/80 leading-relaxed font-medium">Categorizing this expense helps Scholar Ledger predict your end-of-semester savings more accurately.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
