import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import { AuthContext } from '../context/AuthContext';
import { FiFilter, FiPlus, FiTrendingDown } from 'react-icons/fi';

const ManageExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const { user } = useContext(AuthContext);
  
  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Dining & Food', 'Transport', 'Academic Tools', 'Housing', 'Utilities', 'Lifestyle', 'Other'];

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses');
      setExpenses(res.data);
      applyFilter(res.data, filterCategory);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTotal = res.data.reduce((acc, curr) => {
        const itemDate = new Date(curr.date);
        if(itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
          return acc + Number(curr.amount);
        }
        return acc;
      }, 0);
      setTotalMonthly(monthlyTotal);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load expenses');
    }
  };

  const applyFilter = (expenseList, category) => {
    if (category === 'All') {
      setFilteredExpenses(expenseList);
    } else {
      setFilteredExpenses(expenseList.filter(exp => exp.category === category));
    }
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
    applyFilter(expenses, category);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const currentMonth = new Date();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const budget = user?.monthlyBudget || 1000;
  const budgetHealth = budget > 0 ? Math.min((totalMonthly / budget) * 100, 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Expenses</h1>
          <p className="text-slate-500 mt-1">Keep your budget on track with precise transaction control.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm">
               <FiFilter /> Filter ({filterCategory})
            </button>
            <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 min-w-max z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleCategoryFilter(cat)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors font-medium ${
                    filterCategory === cat 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button 
             onClick={() => setShowAddModal(true)} 
             className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 text-sm active:translate-y-0.5"
          >
             <FiPlus /> Add New Expense
          </button>
        </div>
      </div>

      {/* Top Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Monthly Spend */}
        <div className="dashboard-card md:col-span-2 flex justify-between relative overflow-hidden group">
           <div className="z-10 bg-white/60 p-1 rounded-xl">
             <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Total Monthly Spend</h3>
             <div className="text-4xl font-bold text-primary-700 mb-2">₹{totalMonthly.toFixed(2)}</div>
             <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <FiTrendingDown /> 12% less than last month
             </div>
           </div>
           
           {/* Abstract chart illusion matching the gray backdrop on the design */}
           <div className="absolute right-0 bottom-0 h-[120%] w-[50%] bg-slate-50 -skew-x-12 translate-x-4 border-l border-slate-100 flex items-end">
              <div className="w-full h-1/2 opacity-20 flex items-end justify-around px-4">
                 <div className="w-2 h-full bg-primary-500 rounded-t"></div>
                 <div className="w-2 h-2/3 bg-primary-500 rounded-t"></div>
                 <div className="w-2 h-1/4 bg-primary-500 rounded-t"></div>
                 <div className="w-2 h-4/5 bg-primary-500 rounded-t"></div>
              </div>
           </div>
        </div>

        {/* Budget Health */}
        <div className="dashboard-card bg-emerald-50 border-emerald-100 relative overflow-hidden">
           <h3 className="text-xs font-bold tracking-wider text-emerald-700 uppercase mb-2">Budget Health</h3>
           <div className="text-4xl font-bold text-emerald-600 mb-4">{Math.round(budgetHealth)}%</div>
           <div className="flex justify-between items-center text-xs font-medium text-emerald-700 mb-2">
             <span>Usage</span>
             <span>Remaining</span>
           </div>
           <div className="w-full bg-emerald-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${100 - budgetHealth}%` }}></div>
           </div>
        </div>
        
      </div>

      <ExpenseList 
        expenses={filteredExpenses} 
        fetchExpenses={fetchExpenses} 
        setExpenseToEdit={setExpenseToEdit} 
      />

      {(showAddModal || expenseToEdit) && (
        <ExpenseForm 
          fetchExpenses={fetchExpenses} 
          expenseToEdit={expenseToEdit} 
          onClose={() => {
            setShowAddModal(false);
            setExpenseToEdit(null);
          }}
        />
      )}
      
    </div>
  );
};

export default ManageExpenses;
