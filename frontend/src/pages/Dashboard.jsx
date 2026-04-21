import React, { useState, useEffect, useContext, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import ExpenseForm from "../components/ExpenseForm";
import AIInsights from "../components/AIInsights";
import CompactExpenseCalendar from "../components/CompactExpenseCalendar";
import CalendarSidebar from "../components/CalendarSidebar";
import BudgetAlertModal from "../components/BudgetAlertModal";
import BudgetProgressBar from "../components/BudgetProgressBar";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import {
  FiDollarSign,
  FiCalendar,
  FiBox,
  FiTrendingUp,
  FiPlus,
  FiDownload,
  FiArrowRight,
  FiCoffee,
  FiTruck,
  FiBook,
  FiHome,
  FiZap,
  FiHeart,
  FiMoreHorizontal,
  FiClock,
  FiChevronRight,
  FiTarget,
  FiActivity,
  FiShield,
  FiCompass,
  FiCheckCircle,
} from "react-icons/fi";

// Category icon & color mapping
const CATEGORY_MAP = {
  "Dining & Food": {
    icon: FiCoffee,
    bg: "bg-amber-50",
    text: "text-amber-600",
    pill: "bg-amber-100 text-amber-700",
  },
  Transport: {
    icon: FiTruck,
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    pill: "bg-indigo-100 text-indigo-700",
  },
  "Academic Tools": {
    icon: FiBook,
    bg: "bg-blue-50",
    text: "text-blue-600",
    pill: "bg-blue-100 text-blue-700",
  },
  Housing: {
    icon: FiHome,
    bg: "bg-violet-50",
    text: "text-violet-600",
    pill: "bg-violet-100 text-violet-700",
  },
  Utilities: {
    icon: FiZap,
    bg: "bg-orange-50",
    text: "text-orange-600",
    pill: "bg-orange-100 text-orange-700",
  },
  Lifestyle: {
    icon: FiHeart,
    bg: "bg-pink-50",
    text: "text-pink-600",
    pill: "bg-pink-100 text-pink-700",
  },
  Other: {
    icon: FiMoreHorizontal,
    bg: "bg-slate-100",
    text: "text-slate-600",
    pill: "bg-slate-200 text-slate-700",
  },
};
const DEFAULT_CAT = {
  icon: FiBox,
  bg: "bg-primary-50",
  text: "text-primary-600",
  pill: "bg-primary-100 text-primary-700",
};

// Relative time formatter
const getRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const Dashboard = () => {
  const [chartRange, setChartRange] = useState("7d");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [budgetStats, setBudgetStats] = useState(null);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const { user } = useContext(AuthContext);
  const { searchQuery, expenses, fetchExpenses } = useContext(SearchContext);
  const [insightIdx, setInsightIdx] = useState(0);

  // Generate insights from real data - moved to top level to comply with Rules of Hooks
  const insights = useMemo(() => {
    const list = [];
    if (expenses.length === 0) {
      list.push({
        emoji: "🚀",
        title: "Get Started",
        text: "Add your first expense and unlock personalized spending insights!",
        gradient: "from-indigo-600 to-violet-600",
      });
    } else {
      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();
      const monthExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      });

      if (monthExpenses.length === 0) {
        list.push({
          emoji: "📭",
          title: "No Activity",
          text: "No expenses logged this month yet. Start tracking to see your insights!",
          gradient: "from-slate-600 to-slate-700",
        });
      } else {
        const monthTotal = monthExpenses.reduce(
          (s, e) => s + Number(e.amount),
          0,
        );
        const cats = {};
        monthExpenses.forEach((e) => {
          cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
        });
        const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
        const topCat = sorted[0];
        if (topCat) {
          const pct = ((topCat[1] / monthTotal) * 100).toFixed(0);
          list.push({
            emoji: "🔥",
            title: "Top Spender",
            text: `${topCat[0]} takes ${pct}% of your budget (₹${topCat[1].toFixed(0)}). ${Number(pct) > 40 ? "Consider cutting back!" : "Looking balanced!"}`,
            gradient: "from-orange-600 to-red-600",
          });
        }
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
        const dailyAvg = monthTotal / dayOfMonth;
        const projectedTotal = dailyAvg * daysInMonth;
        list.push({
          emoji: "📊",
          title: "Daily Average",
          text: `You're spending ~₹${dailyAvg.toFixed(0)}/day. Projected total: ₹${projectedTotal.toFixed(0)} by month end.`,
          gradient: "from-blue-600 to-cyan-600",
        });
        const biggest = monthExpenses.reduce(
          (max, e) => (Number(e.amount) > Number(max.amount) ? e : max),
          monthExpenses[0],
        );
        if (biggest) {
          list.push({
            emoji: "💸",
            title: "Biggest Expense",
            text: `"${biggest.description || biggest.category}" at ₹${Number(biggest.amount).toFixed(0)} was your largest single spend.`,
            gradient: "from-pink-600 to-rose-600",
          });
        }
        const uniqueCats = Object.keys(cats).length;
        list.push({
          emoji: uniqueCats >= 4 ? "🌈" : "🎯",
          title: uniqueCats >= 4 ? "Diverse Spender" : "Focused Spender",
          text:
            uniqueCats >= 4
              ? `Spending across ${uniqueCats} categories — you have a well-distributed budget!`
              : `Only ${uniqueCats} categories this month. Try tracking more for better insights.`,
          gradient: "from-emerald-600 to-teal-600",
        });
      }
    }
    return list;
  }, [expenses]);

  // Insight rotation timer
  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setInsightIdx((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const currentInsight = insights[insightIdx % insights.length] || insights[0];

  const { totalMonthly, trendData, trendLabels } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

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

    const daysCount = chartRange === "7d" ? 7 : 30;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - (daysCount - 1));
    start.setHours(0, 0, 0, 0);

    const labels = [];
    const data = Array(daysCount).fill(0);
    const dayIndexMap = new Map();

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dayIndexMap.set(dayKey, i);

      labels.push(
        chartRange === "7d"
          ? d.toLocaleDateString("en-IN", { weekday: "short" })
          : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      );
    }

    expenses.forEach((expense) => {
      const expDate = new Date(expense.date);
      const normalizedDate = new Date(
        expDate.getFullYear(),
        expDate.getMonth(),
        expDate.getDate(),
      );

      if (normalizedDate >= start && normalizedDate <= end) {
        const key = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, "0")}-${String(normalizedDate.getDate()).padStart(2, "0")}`;
        const idx = dayIndexMap.get(key);
        if (idx !== undefined) {
          data[idx] += Number(expense.amount);
        }
      }
    });

    return {
      totalMonthly: monthlyTotal,
      trendData: data,
      trendLabels: labels,
    };
  }, [expenses, chartRange]);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch budget stats and show alert if needed
  useEffect(() => {
    const fetchBudgetStats = async () => {
      try {
        // Check if alert was already dismissed this session
        const dismissed = sessionStorage.getItem("budgetAlertDismissed");

        const token = localStorage.getItem("authToken");
        const response = await axios.get("/api/expenses/budget-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBudgetStats(response.data);

        // Show alert only if percentage >= 50% and not dismissed this session
        if (response.data.percentageUsed >= 50 && !dismissed) {
          setShowBudgetAlert(true);
        }
      } catch (error) {
        console.error("Error fetching budget stats:", error);
      }
    };

    if (user) {
      fetchBudgetStats();
    }
  }, [user]);

  // Filtered expenses for "Recent Activity" and other lists based on global search
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (exp) =>
        exp.description?.toLowerCase().includes(query) ||
        exp.category?.toLowerCase().includes(query) ||
        exp.amount?.toString().includes(query),
    );
  }, [expenses, searchQuery]);
  const budget = user?.monthlyBudget || 1000; // default for UI display if missing
  const remaining = budget - totalMonthly;
  const budgetPercent = Math.min((totalMonthly / budget) * 100, 100);
  const remainingPercent = 100 - budgetPercent;

  const advancedData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthTotal = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const daysElapsed = Math.max(now.getDate(), 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeft = Math.max(daysInMonth - daysElapsed, 1);
    const dailyBurn = monthTotal / daysElapsed;
    const projectedTotal = dailyBurn * daysInMonth;
    const remainingBudgetValue = budget - monthTotal;
    const safeDailyLimit =
      remainingBudgetValue > 0 ? remainingBudgetValue / daysLeft : 0;
    const runwayDays =
      dailyBurn > 0 && remainingBudgetValue > 0
        ? Math.floor(remainingBudgetValue / dailyBurn)
        : remainingBudgetValue > 0
          ? daysLeft
          : 0;

    const categoryTotals = {};
    monthExpenses.forEach((e) => {
      const key = e.category || "Other";
      categoryTotals[key] = (categoryTotals[key] || 0) + Number(e.amount);
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    );
    const topCategory = sortedCategories[0] || null;

    const last7ByDay = Array(7).fill(0);
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - 6);

    monthExpenses.forEach((e) => {
      const exp = new Date(e.date);
      const normalized = new Date(
        exp.getFullYear(),
        exp.getMonth(),
        exp.getDate(),
      );
      if (normalized >= weekStart && normalized <= now) {
        const diffDays = Math.floor(
          (normalized - weekStart) / (1000 * 60 * 60 * 24),
        );
        if (diffDays >= 0 && diffDays < 7) {
          last7ByDay[diffDays] += Number(e.amount);
        }
      }
    });

    const maxDaySpend = Math.max(...last7ByDay, 1);

    let riskTone = "safe";
    let riskLabel = "On Track";
    if (projectedTotal > budget) {
      riskTone = "high";
      riskLabel = "Overshoot Risk";
    } else if (projectedTotal > budget * 0.9) {
      riskTone = "watch";
      riskLabel = "Watch Zone";
    }

    const scenarios = [10, 20, 30].map((pct) => ({
      pct,
      savings: topCategory ? (Number(topCategory[1]) * pct) / 100 : 0,
    }));

    const actionPlan =
      monthExpenses.length === 0
        ? [
            "Add 3 expenses today to activate stronger AI forecasting.",
            "Set your monthly budget cap for better pace tracking.",
            "Track one fixed and one flexible expense category.",
          ]
        : projectedTotal > budget
          ? [
              `Keep daily spending close to ₹${safeDailyLimit.toFixed(0)} for the next 7 days.`,
              topCategory
                ? `Cut ${topCategory[0]} by 20% to recover around ₹${((Number(topCategory[1]) * 20) / 100).toFixed(0)}.`
                : "Trim discretionary spending by 20% this week.",
              "Run a 2-minute nightly review: planned vs actual spend.",
            ]
          : [
              `Maintain a daily spending ceiling near ₹${Math.max(safeDailyLimit, dailyBurn).toFixed(0)}.`,
              topCategory
                ? `Optimize ${topCategory[0]} by 10% to unlock extra savings.`
                : "Keep category mix balanced to avoid sudden spikes.",
              `Auto-save ₹${Math.max(50, Math.round(Math.max(remainingBudgetValue, 0) * 0.1))} from the remaining budget.`,
            ];

    return {
      monthTotal,
      projectedTotal,
      remainingBudgetValue,
      daysLeft,
      dailyBurn,
      safeDailyLimit,
      runwayDays,
      topCategory,
      last7ByDay,
      maxDaySpend,
      riskTone,
      riskLabel,
      scenarios,
      actionPlan,
    };
  }, [expenses, budget]);

  const handleExportReport = () => {
    const reportData = {
      month: new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      totalExpenses: totalMonthly,
      budget: budget,
      remaining: Math.max(0, remaining),
      expenses: expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          expDate.getMonth() === currentMonth &&
          expDate.getFullYear() === currentYear
        );
      }),
    };

    const csvContent = [
      ["BudgetBuddy - Monthly Expense Report"],
      [],
      ["Month:", reportData.month],
      ["Total Expenses:", `₹${reportData.totalExpenses.toFixed(2)}`],
      ["Budget:", `₹${reportData.budget.toFixed(2)}`],
      ["Remaining:", `₹${reportData.remaining.toFixed(2)}`],
      [],
      ["Date", "Category", "Description", "Amount"],
      ...reportData.expenses.map((exp) => [
        new Date(exp.date).toLocaleDateString(),
        exp.category,
        exp.description,
        `₹${Number(exp.amount).toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Report exported successfully");
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const renderRemainingBudgetCard = () => (
    <div className="dashboard-card group h-full">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
          <FiDollarSign className="w-4 md:w-6 h-4 md:h-6" />
        </div>
        <span className="flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-50 text-amber-600 rounded-full">
          {remainingPercent < 20 ? "Low" : "Healthy"}
        </span>
      </div>
      <div className="text-slate-500 text-xs md:text-sm font-medium mb-1 min-h-[2.75rem] md:min-h-[3rem]">
        Remaining Budget
      </div>
      <div className="text-2xl md:text-3xl font-bold text-slate-900">
        ₹{Math.max(0, remaining).toFixed(2)}
      </div>
      <div className="mt-3 md:mt-4">
        <div className="flex justify-between text-[10px] md:text-xs mb-1 font-medium text-slate-500">
          <span></span>
          <span>{remainingPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2">
          <div
            className={`h-1.5 md:h-2 rounded-full ${remainingPercent < 20 ? "bg-amber-500" : "bg-primary-500"}`}
            style={{ width: `${remainingPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderRecentActivityCard = () => (
    <div className="dashboard-card flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 md:gap-0 mb-3 md:mb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-sm md:text-base">
            Recent Activity
          </h3>
          {expenses.length > 0 && (
            <span className="text-[10px] md:text-xs font-bold bg-primary-100 text-primary-700 px-1.5 md:px-2 py-0.5 rounded-full">
              {expenses.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAllActivity(true)}
          className="text-primary-600 text-xs md:text-sm font-medium hover:text-primary-700 flex items-center gap-1 group justify-start sm:justify-end"
        >
          View All{" "}
          <FiChevronRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
            <div className="w-10 md:w-14 h-10 md:h-14 rounded-full bg-slate-100 flex items-center justify-center mb-2 md:mb-3">
              <FiClock size={20} className="md:w-6 md:h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium text-xs md:text-sm">
              No transactions found
            </p>
            <p className="text-[10px] md:text-xs text-slate-300 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          filteredExpenses.slice(0, 5).map((exp, i) => {
            const cat = CATEGORY_MAP[exp.category] || DEFAULT_CAT;
            const IconComp = cat.icon;
            return (
              <div
                key={exp._id || i}
                className="flex justify-between items-center p-2 md:p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-default gap-2"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div
                    className={`w-8 md:w-10 h-8 md:h-10 rounded-xl ${cat.bg} ${cat.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComp size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-xs md:text-sm truncate">
                      {exp.description || exp.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[8px] md:text-[10px] font-semibold px-1 md:px-1.5 py-0.5 rounded-md ${cat.pill}`}
                      >
                        {exp.category}
                      </span>
                      <span className="text-[8px] md:text-[10px] text-slate-400 flex items-center gap-0.5">
                        <FiClock size={9} /> {getRelativeTime(exp.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-800 text-sm flex-shrink-0 ml-2">
                  -₹{Number(exp.amount).toFixed(0)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic Smart Insight — Rotating Cards */}
      {currentInsight && (
        <div
          onClick={() =>
            insights.length > 1 &&
            setInsightIdx((prev) => (prev + 1) % insights.length)
          }
          className={`mt-4 bg-gradient-to-r ${currentInsight.gradient} text-white rounded-xl p-4 shadow-lg cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden`}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>

          <div className="flex gap-3 relative z-10">
            <div className="text-2xl flex-shrink-0 mt-0.5">
              {currentInsight.emoji}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm tracking-tight">
                {currentInsight.title}
              </h4>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                {currentInsight.text}
              </p>
            </div>
          </div>

          {insights.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3 relative z-10">
              {insights.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === insightIdx % insights.length
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/30"
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderFinanceCommandCenter = () => {
    const riskBadgeClass =
      advancedData.riskTone === "high"
        ? "bg-red-50 text-red-600"
        : advancedData.riskTone === "watch"
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600";

    const projectionBgClass =
      advancedData.riskTone === "high"
        ? "bg-gradient-to-r from-red-900 via-red-800 to-red-700"
        : advancedData.riskTone === "watch"
          ? "bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700"
          : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700";

    const isOverBudget = advancedData.projectedTotal > budget;
    const budgetPercent = Math.min(
      (advancedData.monthTotal / budget) * 100,
      100,
    );

    return (
      <div className="dashboard-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
            <FiCompass className="text-primary-600" /> Finance Command Center
          </h3>
          <span
            className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold animate-pulse ${riskBadgeClass}`}
          >
            {advancedData.riskLabel}
          </span>
        </div>

        {/* Projection Card - Dynamic Color */}
        <div
          className={`mt-4 ${projectionBgClass} text-white rounded-2xl p-4 md:p-5 transition-all duration-500`}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wide">
                Month-End Projection
              </p>
              <p
                className={`text-2xl md:text-3xl font-black mt-1 transition-all duration-300 ${
                  isOverBudget ? "text-red-200" : "text-white"
                }`}
              >
                ₹{advancedData.projectedTotal.toFixed(0)}
              </p>
              <div className="text-xs text-white/70 mt-2 space-y-1">
                <p>
                  Budget ₹{budget.toFixed(0)} • Remaining ₹
                  {Math.max(0, advancedData.remainingBudgetValue).toFixed(0)}
                </p>
                {isOverBudget && (
                  <p className="text-red-200 font-semibold">
                    ⚠️ Will overshoot by ₹
                    {(advancedData.projectedTotal - budget).toFixed(0)}
                  </p>
                )}
              </div>
            </div>

            {/* 7-Day Spending Pulse - Interactive */}
            <div className="min-w-0">
              <p className="text-white/70 text-[11px] uppercase tracking-wide mb-2">
                7-Day Spending Pulse
              </p>
              <div className="flex items-end gap-1.5 h-11 group">
                {advancedData.last7ByDay.map((amount, idx) => {
                  const height =
                    amount > 0
                      ? Math.max((amount / advancedData.maxDaySpend) * 100, 14)
                      : 6;
                  const isToday = idx === advancedData.last7ByDay.length - 1;
                  return (
                    <div
                      key={`${idx}-${amount}`}
                      className="w-3.5 bg-white/15 rounded-md overflow-hidden hover:bg-white/25 transition-all duration-200 cursor-pointer group relative"
                      title={`₹${amount.toFixed(0)}`}
                    >
                      <div
                        className={`w-full rounded-md transition-all duration-300 ${
                          isToday
                            ? "bg-cyan-300 shadow-lg shadow-cyan-300/50"
                            : "bg-cyan-300"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      {amount > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{amount.toFixed(0)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/70">Current Progress</span>
              <span className="text-sm font-bold text-white">
                {budgetPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercent >= 80
                    ? "bg-red-400"
                    : budgetPercent >= 50
                      ? "bg-yellow-400"
                      : "bg-emerald-400"
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Metrics - Dynamic Colors */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`rounded-xl border-2 p-3 transition-all duration-300 ${
              advancedData.dailyBurn > advancedData.safeDailyLimit
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <FiActivity
                className={
                  advancedData.dailyBurn > advancedData.safeDailyLimit
                    ? "text-red-600"
                    : "text-primary-600"
                }
              />{" "}
              Daily Burn
            </p>
            <p
              className={`text-lg font-bold mt-1 transition-all ${
                advancedData.dailyBurn > advancedData.safeDailyLimit
                  ? "text-red-700"
                  : "text-slate-900"
              }`}
            >
              ₹{advancedData.dailyBurn.toFixed(0)}
            </p>
            {advancedData.dailyBurn > advancedData.safeDailyLimit && (
              <p className="text-[10px] text-red-600 mt-1">⚠️ Above limit</p>
            )}
          </div>

          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 transition-all duration-300">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <FiTarget className="text-emerald-600" /> Safe Daily Limit
            </p>
            <p className="text-lg font-bold text-emerald-700 mt-1">
              ₹{advancedData.safeDailyLimit.toFixed(0)}
            </p>
            <p className="text-[10px] text-emerald-600 mt-1">✓ Recommended</p>
          </div>

          <div
            className={`rounded-xl border-2 p-3 transition-all duration-300 ${
              advancedData.runwayDays <= 7
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <FiShield
                className={
                  advancedData.runwayDays <= 7
                    ? "text-amber-600"
                    : "text-indigo-600"
                }
              />{" "}
              Runway
            </p>
            <p
              className={`text-lg font-bold mt-1 transition-all ${
                advancedData.runwayDays <= 7
                  ? "text-amber-700"
                  : "text-slate-900"
              }`}
            >
              {advancedData.runwayDays}d
            </p>
            {advancedData.runwayDays <= 7 && (
              <p className="text-[10px] text-amber-600 mt-1">⚠️ Running low</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 auto-rows-max">
          {/* What-If Simulator - Professional */}
          <div
            className={`rounded-2xl border shadow-sm p-6 transition-all duration-300 h-full flex flex-col ${
              advancedData.topCategory
                ? "bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50 border-blue-200/60 hover:shadow-md"
                : "bg-gradient-to-br from-slate-50 to-slate-50/50 border-slate-200/60"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="text-lg">🎯</span> What-If Simulator
              </p>
              {advancedData.topCategory && (
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-700 px-3 py-1 rounded-full border border-blue-200/50">
                  ACTIVE
                </span>
              )}
            </div>

            {advancedData.topCategory ? (
              <>
                <p className="text-sm leading-relaxed text-slate-700 mb-5">
                  If you cut{" "}
                  <span className="font-bold text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded">
                    {advancedData.topCategory[0]}
                  </span>{" "}
                  spending by % below, you could recover:
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4 flex-1">
                  {advancedData.scenarios.map((item) => (
                    <div
                      key={item.pct}
                      className="rounded-xl border-1.5 border-blue-200/70 bg-white p-4 text-center hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                    >
                      <p className="text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                        -{item.pct}%
                      </p>
                      <p className="text-lg font-black text-indigo-600 mt-3 group-hover:text-indigo-700">
                        ₹{item.savings.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-2 uppercase tracking-wide">
                        savings/month
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-blue-100/60 rounded-lg border border-blue-200/70 backdrop-blur-sm mt-auto">
                  <p className="text-[12px] text-blue-800 font-medium leading-relaxed">
                    <span className="font-bold">💡 Insight:</span> Reducing{" "}
                    <span className="font-bold text-blue-700">
                      {advancedData.topCategory[0]}
                    </span>{" "}
                    by 20% would free up{" "}
                    <span className="font-bold text-blue-700">
                      ₹{(advancedData.scenarios[1]?.savings || 0).toFixed(0)}
                    </span>
                    /month
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-600 font-medium">
                  📊 Add categorized expenses to unlock insights
                </p>
              </div>
            )}
          </div>

          {/* Action Protocol - Professional */}
          <div
            className={`rounded-2xl border shadow-sm p-6 transition-all duration-300 h-full flex flex-col ${
              advancedData.riskTone === "high"
                ? "bg-gradient-to-br from-red-50 via-red-50/50 to-pink-50 border-red-200/60 hover:shadow-md"
                : advancedData.riskTone === "watch"
                  ? "bg-gradient-to-br from-amber-50 via-amber-50/50 to-orange-50 border-amber-200/60 hover:shadow-md"
                  : "bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50 border-emerald-200/60 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="text-lg">
                  {advancedData.riskTone === "high"
                    ? "🚨"
                    : advancedData.riskTone === "watch"
                      ? "⚠️"
                      : "✅"}
                </span>
                {advancedData.riskTone === "high"
                  ? "Critical Actions"
                  : advancedData.riskTone === "watch"
                    ? "Recommended Actions"
                    : "Optimization Tips"}
              </p>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  advancedData.riskTone === "high"
                    ? "bg-red-500/20 text-red-700 border-red-200/50"
                    : advancedData.riskTone === "watch"
                      ? "bg-amber-500/20 text-amber-700 border-amber-200/50"
                      : "bg-emerald-500/20 text-emerald-700 border-emerald-200/50"
                }`}
              >
                {advancedData.riskLabel}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {advancedData.actionPlan.map((step, idx) => (
                <div
                  key={`${step}-${idx}`}
                  className={`flex items-start gap-4 p-3.5 rounded-lg transition-all duration-200 hover:shadow-md border-l-3 ${
                    advancedData.riskTone === "high"
                      ? "bg-red-100/40 hover:bg-red-100/60 border-l-red-400"
                      : advancedData.riskTone === "watch"
                        ? "bg-amber-100/40 hover:bg-amber-100/60 border-l-amber-400"
                        : "bg-emerald-100/40 hover:bg-emerald-100/60 border-l-emerald-400"
                  }`}
                >
                  <div
                    className={`min-w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${
                      advancedData.riskTone === "high"
                        ? "bg-red-500/20 text-red-700"
                        : advancedData.riskTone === "watch"
                          ? "bg-amber-500/20 text-amber-700"
                          : "bg-emerald-500/20 text-emerald-700"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className={`text-sm leading-relaxed font-medium pt-0.5 ${
                      advancedData.riskTone === "high"
                        ? "text-red-900"
                        : advancedData.riskTone === "watch"
                          ? "text-amber-900"
                          : "text-emerald-900"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      {/* Budget Alert Modal */}
      {budgetStats && (
        <BudgetAlertModal
          isOpen={showBudgetAlert}
          percentageUsed={budgetStats.percentageUsed}
          monthlyBudget={budgetStats.monthlyBudget}
          totalExpenses={budgetStats.totalExpenses}
          onClose={() => setShowBudgetAlert(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:items-end md:justify-between md:flex-row">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
            Financial Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Welcome back! Here's your spending pulse for this week.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
          <button
            onClick={handleExportReport}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors text-xs md:text-sm flex items-center gap-2 flex-shrink-0"
          >
            <FiDownload size={14} className="md:w-4 md:h-4" />{" "}
            <span className="hidden sm:inline">Export Report</span>
          </button>
          <button
            onClick={handleViewAllActivity}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-xs md:text-sm flex items-center gap-2 flex-shrink-0"
          >
            View All <FiArrowRight size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-4 md:space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {/* Total Expenses */}
            <div className="dashboard-card group h-full">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 transition-transform">
                  <FiBox className="w-4 md:w-6 h-4 md:h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 bg-red-50 text-red-600 rounded-full">
                  <FiTrendingUp size={12} /> 12%
                </span>
              </div>
              <div className="text-slate-500 text-xs md:text-sm font-medium mb-1 min-h-[2.75rem] md:min-h-[3rem]">
                Total Expenses
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900">
                ₹{totalMonthly.toFixed(2)}
              </div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-2">
                Updated 2 mins ago
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="dashboard-card group h-full">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-success-50 text-success-600 rounded-xl group-hover:scale-110 transition-transform">
                  <FiCalendar className="w-4 md:w-6 h-4 md:h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 bg-success-50 text-success-600 rounded-full">
                  On Track
                </span>
              </div>
              <div className="text-slate-500 text-xs md:text-sm font-medium mb-1 min-h-[2.75rem] md:min-h-[3rem]">
                Monthly Budget Usage
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900">
                ₹{totalMonthly.toFixed(2)}
              </div>
              <div className="mt-3 md:mt-4">
                <div className="flex justify-between text-[10px] md:text-xs mb-1 font-medium text-slate-500">
                  <span>{budgetPercent.toFixed(0)}% Used</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2">
                  <div
                    className="bg-success-500 h-1.5 md:h-2 rounded-full"
                    style={{ width: `${budgetPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="sm:col-span-2 xl:hidden">
              {renderRemainingBudgetCard()}
            </div>
          </div>

          {/* Calendar Fallback (shown below xl when right sidebar is hidden) */}
          <div className="xl:hidden">
            <CompactExpenseCalendar expenses={expenses} />
          </div>

          <div className="xl:hidden">{renderRecentActivityCard()}</div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Spending Analysis */}
            <div className="dashboard-card">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-0 mb-4 md:mb-6">
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Spending Analysis
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setChartRange("7d")}
                    className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 transition-colors ${
                      chartRange === "7d"
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setChartRange("30d")}
                    className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 transition-colors ${
                      chartRange === "30d"
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>

              {/* Dynamic Bar Chart with 7d/30d Data */}
              <div className="mt-2 md:mt-4 overflow-x-auto">
                <div
                  className={chartRange === "30d" ? "min-w-[900px]" : "w-full"}
                >
                  <div className="border-b border-slate-100">
                    <div
                      className={`h-40 md:h-64 flex items-end pb-4 md:pb-6 relative px-2 md:px-4 ${
                        chartRange === "30d"
                          ? "gap-2"
                          : "justify-around gap-2 md:gap-4"
                      }`}
                    >
                      {trendData.map((value, idx) => {
                        const maxValue = Math.max(...trendData, 100);
                        const heightPercent = Math.max(
                          (value / maxValue) * 100,
                          5,
                        );
                        const isToday = idx === trendData.length - 1;

                        return (
                          <div
                            key={idx}
                            className={`${
                              chartRange === "30d" ? "w-5" : "flex-1 max-w-10"
                            } flex flex-col items-center group relative h-full justify-end shrink-0`}
                          >
                            {value > 0 && (
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                ₹{value.toFixed(0)}
                              </div>
                            )}
                            <div
                              className={`w-full rounded-lg transition-all duration-300 ${isToday ? "bg-primary-600 shadow-md shadow-primary-600/30" : "bg-slate-200 group-hover:bg-slate-300"}`}
                              style={{ height: `${heightPercent}%` }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2 md:mt-3">
                    <div
                      className={`text-[10px] md:text-xs text-slate-400 font-medium uppercase ${
                        chartRange === "30d"
                          ? "flex gap-2 px-2 md:px-4"
                          : "flex justify-between px-1 md:px-2"
                      }`}
                    >
                      {trendLabels.map((label, idx) => {
                        const isToday = idx === trendLabels.length - 1;
                        const showThirtyDayLabel =
                          chartRange === "7d" ||
                          idx % 5 === 0 ||
                          idx === trendLabels.length - 1;

                        return (
                          <span
                            key={`${label}-${idx}`}
                            className={`${isToday ? "text-primary-600 font-bold" : ""} ${
                              chartRange === "30d"
                                ? "w-5 text-center shrink-0"
                                : ""
                            }`}
                          >
                            {showThirtyDayLabel ? label : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div>
            <AIInsights showRecommendations={false} />
          </div>

          {/* Advanced Space Filler Section */}
          <div>{renderFinanceCommandCenter()}</div>
        </div>

        <div className="hidden min-w-0 space-y-4 xl:block">
          {renderRemainingBudgetCard()}
          {/* Budget Progress Bar */}
          {budgetStats && (
            <div className="dashboard-card">
              <BudgetProgressBar
                percentageUsed={budgetStats.percentageUsed}
                monthlyBudget={budgetStats.monthlyBudget}
                totalExpenses={budgetStats.totalExpenses}
              />
            </div>
          )}
          <CalendarSidebar expenses={expenses} />
          {renderRecentActivityCard()}
          <AIInsights
            showInsights={false}
            showPrediction={false}
            showRefreshButton={false}
          />
        </div>
      </div>

      {/* Floating Add Button - Responsive */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary shadow-xl shadow-primary-600/40 flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base hover:shadow-2xl hover:shadow-primary-600/50 transition-shadow"
        >
          <FiPlus size={16} className="md:w-5 md:h-5" />{" "}
          <span className="hidden sm:inline">Add</span> Expense
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 sm:p-6 pb-16 md:pb-20">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAllActivity(false)}
          ></div>
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl md:rounded-[24px] shadow-2xl border border-slate-100 z-10 max-h-[75vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                  All Activity
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
                  {expenses.length} transactions total
                </p>
              </div>
              <button
                onClick={() => setShowAllActivity(false)}
                className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors text-lg md:text-xl flex-shrink-0"
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 md:pt-3 space-y-2">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <FiClock
                    size={28}
                    className="md:w-9 md:h-9 mx-auto text-slate-300 mb-2 md:mb-3"
                  />
                  <p className="text-slate-400 font-medium text-sm md:text-base">
                    No matches found
                  </p>
                </div>
              ) : (
                filteredExpenses.map((exp) => {
                  const cat = CATEGORY_MAP[exp.category] || DEFAULT_CAT;
                  const IconComp = cat.icon;
                  return (
                    <div
                      key={exp._id}
                      className="flex justify-between items-center p-2.5 md:p-3.5 border border-slate-100 rounded-lg md:rounded-xl hover:bg-slate-50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div
                          className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl ${cat.bg} ${cat.text} flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComp size={14} className="md:w-4 md:h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {exp.description || exp.category}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cat.pill}`}
                            >
                              {exp.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(exp.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 text-sm flex-shrink-0 ml-3">
                        -₹{Number(exp.amount).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {/* Modal Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowAllActivity(false)}
                className="w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
