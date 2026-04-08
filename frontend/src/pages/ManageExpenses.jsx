import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import { FiFilter, FiPlus, FiTrendingDown } from "react-icons/fi";

const ManageExpenses = () => {
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(0);
  const { user } = useContext(AuthContext);
  const { searchQuery, expenses, fetchExpenses } = useContext(SearchContext);

  const [filterCategory, setFilterCategory] = useState("All");
  const categories = [
    "All",
    "Dining & Food",
    "Transport",
    "Academic Tools",
    "Housing",
    "Utilities",
    "Lifestyle",
    "Other",
  ];

  useEffect(() => {
    if (expenses.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Calculate current month total
      const monthlyTotal = expenses.reduce((acc, curr) => {
        const itemDate = new Date(curr.date);
        if (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        ) {
          return acc + Number(curr.amount);
        }
        return acc;
      }, 0);

      // Calculate previous month total
      const previousMonthTotalAmount = expenses.reduce((acc, curr) => {
        const itemDate = new Date(curr.date);
        if (
          itemDate.getMonth() === previousMonth &&
          itemDate.getFullYear() === previousYear
        ) {
          return acc + Number(curr.amount);
        }
        return acc;
      }, 0);

      setTotalMonthly(monthlyTotal);
      setPreviousMonthTotal(previousMonthTotalAmount);
    }
  }, [expenses]);

  // Removed applyFilter in favor of a unified useEffect filter logic

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
  };

  // Update filtered list when source expenses, chosen category, OR topbar search query changes
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Apply Category Filter
    if (filterCategory !== "All") {
      result = result.filter((exp) => exp.category === filterCategory);
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.description?.toLowerCase().includes(q) ||
          exp.category?.toLowerCase().includes(q) ||
          exp.amount?.toString().includes(q),
      );
    }

    return result;
  }, [expenses, filterCategory, searchQuery]);

  const currentMonth = new Date();
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const budget = user?.monthlyBudget || 1000;
  const budgetUsedPercent =
    budget > 0 ? Math.min((totalMonthly / budget) * 100, 100) : 0;
  const budgetRemaining = Math.max(0, budget - totalMonthly);
  const budgetRemainingPercent = 100 - budgetUsedPercent;

  // Calculate month-over-month change
  const monthlyChangeValue =
    previousMonthTotal > 0
      ? Number(
          (
            ((totalMonthly - previousMonthTotal) / previousMonthTotal) *
            100
          ).toFixed(1),
        )
      : null;
  const isSpendingLess = monthlyChangeValue !== null && monthlyChangeValue < 0;
  const isSpendingSame =
    monthlyChangeValue !== null && monthlyChangeValue === 0;

  const stableTrendQuotes = [
    "Perfect consistency. Discipline looks great.",
    "Same pace, strong habits. Keep this streak alive.",
    "Steady spending this month. Smart and predictable.",
    "Expenses are stable. You're in control.",
  ];
  const quoteSeed =
    new Date().getDate() + Math.round(totalMonthly) + expenses.length;
  const dynamicStableQuote =
    stableTrendQuotes[quoteSeed % stableTrendQuotes.length];

  const spendingTrendText = isSpendingLess
    ? `${Math.abs(monthlyChangeValue)}% less than last month`
    : monthlyChangeValue === null
      ? totalMonthly === 0
        ? "No spending yet this month. Start strong."
        : "First tracked month - this sets your baseline."
      : isSpendingSame
        ? dynamicStableQuote
        : `${monthlyChangeValue}% more than last month`;

  const trendTextColorClass =
    monthlyChangeValue === null || isSpendingSame
      ? "text-primary-600"
      : isSpendingLess
        ? "text-emerald-600"
        : "text-orange-600";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Expenses</h1>
          <p className="text-slate-500 mt-1">
            Keep your budget on track with precise transaction control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm">
              <FiFilter /> Filter ({filterCategory})
            </button>
            <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 min-w-max z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilter(cat)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors font-medium ${
                    filterCategory === cat
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-700 hover:bg-slate-50"
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
        <div
          className="dashboard-card md:col-span-2 flex justify-between relative overflow-hidden group animate-fade-in hover:shadow-lg transition-all duration-300"
          style={{ animationDuration: "0.6s" }}
        >
          <div className="z-10 bg-white/60 p-1 rounded-xl">
            <h3
              className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2 animate-fade-in"
              style={{ animationDuration: "0.8s", animationDelay: "0.1s" }}
            >
              Total Monthly Spend
            </h3>
            <div
              className="text-4xl font-bold text-primary-700 mb-2 animate-scale-in-bounce"
              style={{ animationDuration: "0.7s", animationDelay: "0.2s" }}
            >
              ₹{totalMonthly.toFixed(2)}
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium transition-colors duration-500 ${trendTextColorClass}`}
              style={{
                animation: `fade-in 0.6s ease-out forwards`,
                animationDelay: "0.3s",
              }}
            >
              <FiTrendingDown
                className="animate-bounce"
                style={{ animationDuration: "2s", animationDelay: "0.4s" }}
              />{" "}
              {spendingTrendText}
            </div>
          </div>

          {/* Abstract chart illusion matching the gray backdrop on the design */}
          <div className="absolute right-0 bottom-0 h-[120%] w-[50%] bg-slate-50 -skew-x-12 translate-x-4 border-l border-slate-100 flex items-end animate-slide-right group-hover:scale-105 transition-transform duration-300">
            <div
              key={`${totalMonthly}-${previousMonthTotal}`}
              className="w-full h-1/2 opacity-20 flex items-end justify-around px-4"
            >
              <div
                className="w-2 bg-primary-500 rounded-t"
                style={{
                  "--bar-height": "100%",
                  animation:
                    "chart-bar-rise 0.8s ease-out 0.2s forwards, pulse-glow 2.2s ease-in-out 1.1s infinite",
                  filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                }}
              ></div>
              <div
                className="w-2 bg-primary-500 rounded-t"
                style={{
                  "--bar-height": "66%",
                  animation:
                    "chart-bar-rise 0.8s ease-out 0.3s forwards, pulse-glow 2.2s ease-in-out 1.2s infinite",
                  filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                }}
              ></div>
              <div
                className="w-2 bg-primary-500 rounded-t"
                style={{
                  "--bar-height": "25%",
                  animation:
                    "chart-bar-rise 0.8s ease-out 0.4s forwards, pulse-glow 2.2s ease-in-out 1.3s infinite",
                  filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                }}
              ></div>
              <div
                className="w-2 bg-primary-500 rounded-t"
                style={{
                  "--bar-height": "80%",
                  animation:
                    "chart-bar-rise 0.8s ease-out 0.5s forwards, pulse-glow 2.2s ease-in-out 1.4s infinite",
                  filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Budget Health */}
        <div
          className="dashboard-card bg-emerald-50 border-emerald-100 relative overflow-hidden animate-fade-in group hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
          style={{ animationDuration: "0.6s", animationDelay: "0.1s" }}
        >
          <h3
            className="text-xs font-bold tracking-wider text-emerald-700 uppercase mb-2 animate-fade-in"
            style={{ animationDuration: "0.8s", animationDelay: "0.2s" }}
          >
            Budget Health
          </h3>
          <div
            className="text-4xl font-bold text-emerald-600 mb-4 animate-scale-in-bounce group-hover:scale-110 transition-transform duration-300"
            style={{ animationDuration: "0.7s", animationDelay: "0.3s" }}
          >
            {Math.round(budgetRemainingPercent)}%
          </div>
          <div className="flex justify-between items-center text-xs font-medium text-emerald-700 mb-2">
            <span
              className="animate-fade-in"
              style={{ animationDuration: "0.8s", animationDelay: "0.3s" }}
            >
              Usage
            </span>
            <span
              className="animate-fade-in"
              style={{ animationDuration: "0.8s", animationDelay: "0.35s" }}
            >
              Remaining
            </span>
          </div>
          <div
            className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden animate-fade-in"
            style={{ animationDuration: "0.8s", animationDelay: "0.4s" }}
          >
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out group-hover:bg-emerald-500 shadow-lg shadow-emerald-500/50"
              style={{ width: `${budgetUsedPercent}%` }}
            ></div>
          </div>
          <div
            className="text-xs text-emerald-600 font-semibold mt-3 animate-fade-in"
            style={{ animationDuration: "0.8s", animationDelay: "0.5s" }}
          >
            ₹{budgetRemaining.toFixed(2)} remaining of ₹{budget}
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
