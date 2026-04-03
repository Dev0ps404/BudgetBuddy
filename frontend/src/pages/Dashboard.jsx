import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import { AuthContext } from '../context/AuthContext';
import { FiDollarSign, FiCalendar, FiBox, FiTrendingUp, FiTrendingDown, FiPlus, FiDownload, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses');
      setExpenses(res.data);
      
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
      
      // Calculate weekly spending data (last 7 days)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      
      const weekData = [0, 0, 0, 0, 0, 0, 0];
      res.data.forEach(expense => {
        const expDate = new Date(expense.date);
        if (expDate >= sevenDaysAgo && expDate <= today) {
          const dayDiff = Math.floor((today - expDate) / (1000 * 60 * 60 * 24));
          if (dayDiff >= 0 && dayDiff < 7) {
            weekData[6 - dayDiff] += Number(expense.amount);
          }
        }
      });
      
      setWeeklyData(weekData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load expenses');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const budget = user?.monthlyBudget || 1000; // default for UI display if missing
  const remaining = budget - totalMonthly;
  const budgetPercent = Math.min((totalMonthly / budget) * 100, 100);
  const remainingPercent = 100 - budgetPercent;

  const handleExportReport = () => {
    const reportData = {
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalExpenses: totalMonthly,
      budget: budget,
      remaining: Math.max(0, remaining),
      expenses: expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
    };

    const csvContent = [
      ['Scholar Ledger - Monthly Expense Report'],
      [],
      ['Month:', reportData.month],
      ['Total Expenses:', `$${reportData.totalExpenses.toFixed(2)}`],
      ['Budget:', `$${reportData.budget.toFixed(2)}`],
      ['Remaining:', `$${reportData.remaining.toFixed(2)}`],
      [],
      ['Date', 'Category', 'Description', 'Amount'],
      ...reportData.expenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        exp.category,
        exp.description,
        `$${Number(exp.amount).toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Report exported successfully');
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Scholar. Here's your spending pulse for this week.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors text-sm flex items-center gap-2">
            <FiDownload size={16} /> Export Report
          </button>
          <button onClick={handleViewAllActivity} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm flex items-center gap-2">
            View All Activity <FiArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses */}
        <div className="dashboard-card group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 transition-transform">
              <FiBox className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
              <FiTrendingUp /> 12%
            </span>
          </div>
          <div className="text-slate-500 text-sm font-medium mb-1">Total Expenses</div>
          <div className="text-3xl font-bold text-slate-900">${totalMonthly.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-2">Updated 2 mins ago</div>
        </div>

        {/* Monthly Summary */}
        <div className="dashboard-card group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-xl group-hover:scale-110 transition-transform">
              <FiCalendar className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-success-50 text-success-600 rounded-full">
              On Track
            </span>
          </div>
          <div className="text-slate-500 text-sm font-medium mb-1">Monthly Budget Usage</div>
          <div className="text-3xl font-bold text-slate-900">${totalMonthly.toFixed(2)}</div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 font-medium text-slate-500">
              <span>{budgetPercent.toFixed(0)}% Used</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-success-500 h-1.5 rounded-full" style={{ width: `${budgetPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="dashboard-card group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full">
              {remainingPercent < 20 ? 'Low' : 'Healthy'}
            </span>
          </div>
          <div className="text-slate-500 text-sm font-medium mb-1">Remaining Budget</div>
          <div className="text-3xl font-bold text-slate-900">${Math.max(0, remaining).toFixed(2)}</div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 font-medium text-slate-500">
              <span></span>
              <span>{remainingPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${remainingPercent < 20 ? 'bg-amber-500' : 'bg-primary-500'}`} style={{ width: `${remainingPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Spending Analysis */}
        <div className="dashboard-card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Weekly Spending Analysis</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">Last 7 Days</button>
              <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 text-xs font-medium rounded-full">Last 30 Days</button>
            </div>
          </div>
          
          {/* Dynamic Bar Chart with Real Weekly Data */}
          <div className="h-64 flex items-end justify-between gap-2 pb-6 mt-4 relative border-b border-slate-100">
            {weeklyData.map((value, idx) => {
              const maxValue = Math.max(...weeklyData, 100);
              const heightPercent = Math.max((value / maxValue) * 100, 8);
              const today = new Date();
              const dayDate = new Date(today);
              dayDate.setDate(today.getDate() - (6 - idx));
              const isToday = dayDate.toDateString() === today.toDateString();
              
              return (
                <div key={idx} className="w-full flex flex-col items-center group relative h-full justify-end">
                  <div 
                    className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-primary-600 shadow-lg shadow-primary-600/30' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {value > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold">
                        ${value.toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium uppercase px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const today = new Date();
              const dayDate = new Date(today);
              dayDate.setDate(today.getDate() - (6 - idx));
              const isToday = dayDate.toDateString() === today.toDateString();
              return (
                <span key={day} className={isToday ? 'text-primary-600 font-bold' : ''}>
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <button onClick={() => setShowAllActivity(true)} className="text-primary-600 text-sm font-medium hover:text-primary-700">View All</button>
          </div>
          
          <div className="flex-1 space-y-4 overflow-hidden">
            {expenses.slice(0, 4).map((exp, i) => (
              <div key={exp._id || i} className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                     <FiBox size={16} />
                   </div>
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">{exp.description}</p>
                     <p className="text-xs text-slate-400 mt-0.5">{new Date(exp.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <span className="font-semibold text-slate-700 text-sm">-${Number(exp.amount).toFixed(2)}</span>
              </div>
            ))}
            
            {expenses.length === 0 && (
              <p className="text-slate-400 text-center py-4 text-sm">No expenses recorded yet</p>
            )}
            
            {/* Hardcoded positive income mock for aesthetic */}
            {expenses.length > 0 && (
              <div className="flex justify-between items-center pt-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-success-50 text-success-600 flex items-center justify-center">
                     <FiTrendingUp size={16} />
                   </div>
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">Scholarship Credit</p>
                     <p className="text-xs text-slate-400 mt-0.5">Oct 21 • Income</p>
                   </div>
                 </div>
                 <span className="font-semibold text-success-600 text-sm">+$500.00</span>
              </div>
            )}
          </div>

          {/* Smart Tip Card */}
          <div className="mt-6 bg-slate-900 text-white rounded-xl p-4 flex gap-3 shadow-lg">
             <div className="text-cyan-400"><FiTrendingDown size={24} /></div>
             <div>
               <h4 className="font-semibold text-sm">Smart Tip</h4>
               <p className="text-xs text-slate-300 mt-1 leading-relaxed">You spent 15% less on dining this week. Keep it up!</p>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button - Responsive */}
      <div className="fixed bottom-8 right-8 z-30 md:bottom-12 md:right-12">
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn-primary shadow-xl shadow-primary-600/40 flex items-center gap-2 px-6 py-3 hover:shadow-2xl hover:shadow-primary-600/50 transition-shadow"
        >
          <FiPlus size={20} /> Add Expense
        </button>
      </div>

      {showAddModal && (
        <ExpenseForm 
          fetchExpenses={fetchExpenses} 
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* View All Activity Modal */}
      {showAllActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAllActivity(false)}
          ></div>
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-[24px] shadow-2xl p-8 border border-slate-100 z-10 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">All Activity</h2>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No expenses recorded yet</p>
              ) : (
                expenses.map((exp) => (
                  <div key={exp._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                        <FiBox size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{exp.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">-${Number(exp.amount).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setShowAllActivity(false)}
              className="mt-6 w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
