import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import {
  FiCalendar,
  FiDownload,
  FiPieChart,
  FiCoffee,
  FiTruck,
  FiBook,
  FiActivity,
  FiHome,
  FiZap,
  FiHeart,
  FiMoreHorizontal,
  FiShoppingBag,
  FiChevronDown,
} from "react-icons/fi";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Category configuration map for icons and colors
const CATEGORY_CONFIG = {
  "Dining & Food": {
    icon: FiCoffee,
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    subtitle: "Cafeteria, Groceries, Delivery",
  },
  Transport: {
    icon: FiTruck,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    subtitle: "Public Transit, Uber, Fuel",
  },
  "Academic Tools": {
    icon: FiBook,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    subtitle: "Books, Software, Stationery",
  },
  Housing: {
    icon: FiHome,
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    subtitle: "Rent, Maintenance, Furnishing",
  },
  Utilities: {
    icon: FiZap,
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    subtitle: "Electricity, Internet, Phone",
  },
  Lifestyle: {
    icon: FiHeart,
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    subtitle: "Entertainment, Shopping, Fitness",
  },
  Other: {
    icon: FiMoreHorizontal,
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    subtitle: "Miscellaneous expenses",
  },
};

const DEFAULT_CONFIG = {
  icon: FiShoppingBag,
  bgColor: "bg-slate-100",
  textColor: "text-slate-600",
  subtitle: "General expenses",
};

// Determine health status based on category's share of total spending
const getSpendingHealth = (percentage) => {
  if (percentage <= 15) return { label: "Optimal", barColor: "bg-emerald-500" };
  if (percentage <= 30) return { label: "Healthy", barColor: "bg-emerald-400" };
  if (percentage <= 45) return { label: "Moderate", barColor: "bg-amber-500" };
  if (percentage <= 60) return { label: "High", barColor: "bg-orange-500" };
  return { label: "Critical", barColor: "bg-red-500" };
};

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get("/expenses");
        setExpenses(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Close month picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(e.target)
      ) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate last 12 months for the picker
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      });
    }
    return options;
  }, []);

  // Filter expenses for the selected month
  const currentMonthExpenses = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month - 1 && d.getFullYear() === year;
    });
  }, [expenses, selectedMonth]);

  const totalMonthly = currentMonthExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // Process Data for Doughnut Chart (Expenses by Category)
  const categoryData = useMemo(() => {
    const cats = {};
    currentMonthExpenses.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
    });

    // Fallback if empty
    if (Object.keys(cats).length === 0) cats["No Data"] = 1;

    return {
      labels: Object.keys(cats),
      datasets: [
        {
          data: Object.values(cats),
          backgroundColor: [
            "#4f46e5", // indigo-600
            "#10b981", // emerald-500
            "#f59e0b", // amber-500
            "#3b82f6", // blue-500
            "#8b5cf6", // violet-500
            "#ec4899", // pink-500
            "#64748b", // slate-500
          ],
          borderWidth: 0,
          hoverOffset: 4,
          cutout: "75%",
        },
      ],
      raw: cats,
    };
  }, [currentMonthExpenses]);

  // Process data for Category Breakdown section
  const breakdownData = useMemo(() => {
    const result = {};
    currentMonthExpenses.forEach((e) => {
      if (!result[e.category]) {
        result[e.category] = { total: 0, count: 0 };
      }
      result[e.category].total += Number(e.amount);
      result[e.category].count += 1;
    });

    // Sort by total descending
    return Object.entries(result)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalMonthly > 0 ? (data.total / totalMonthly) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [currentMonthExpenses, totalMonthly]);

  const chartOptions = {
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  const lineOptions = {
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: { family: "Inter", size: 10 },
        },
      },
    },
    scales: {
      y: { display: false, min: 0 },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "#94a3b8" },
      },
    },
    maintainAspectRatio: false,
    elements: { line: { tension: 0.4 } },
  };

  // Build dynamic line chart from actual expense data (last 6 months)
  const lineData = useMemo(() => {
    const now = new Date();
    const months = [];
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.getMonth(), year: d.getFullYear() });
      monthLabels.push(
        d.toLocaleString("default", { month: "short" }).toUpperCase(),
      );
    }

    const actualData = months.map(({ month, year }) =>
      expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0),
    );

    const maxSpend = Math.max(...actualData, 1);
    const avgBudget =
      actualData.reduce((a, b) => a + b, 0) / actualData.length || maxSpend;
    const budgetData = months.map(() => Math.round(avgBudget));

    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Actual",
          data: actualData,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#4f46e5",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: "Average",
          data: budgetData,
          borderColor: "#cbd5e1",
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [expenses]);

  const selectedMonthDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const currentMonthName = selectedMonthDate.toLocaleString("default", {
    month: "long",
  });

  const currentMonthLabel = selectedMonthDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const displayedCategories = showAllCategories
    ? breakdownData
    : breakdownData.slice(0, 5);

  // Export PDF handler
  const handleExportPDF = () => {
    // Build a printable report
    const printWindow = window.open("", "_blank");
    const categoryRows = breakdownData
      .map(
        (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-weight:500">${item.category}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center">${item.count}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center">${item.percentage.toFixed(1)}%</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700">₹${item.total.toFixed(2)}</td>
      </tr>`,
      )
      .join("");

    const expenseRows = currentMonthExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (exp) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:13px">${new Date(exp.date).toLocaleDateString("en-IN")}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:13px">${exp.category}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:13px">${exp.description || "-"}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;font-size:13px">₹${Number(exp.amount).toFixed(2)}</td>
      </tr>`,
      )
      .join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>BudgetBuddy - Expense Report - ${currentMonthLabel}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 14px; margin-bottom: 30px; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f8fafc; border-radius: 12px; padding: 20px; flex: 1; }
          .summary-card h3 { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin:0 0 8px 0; }
          .summary-card .value { font-size: 28px; font-weight: 700; color: #4f46e5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
          .section-title { font-size: 16px; font-weight: 700; margin: 30px 0 12px 0; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📊 BudgetBuddy — Expense Report</h1>
        <p class="subtitle">${currentMonthLabel} • Generated on ${new Date().toLocaleDateString("en-IN")}</p>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Spent</h3>
            <div class="value">₹${totalMonthly.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h3>Transactions</h3>
            <div class="value">${currentMonthExpenses.length}</div>
          </div>
          <div class="summary-card">
            <h3>Categories</h3>
            <div class="value">${breakdownData.length}</div>
          </div>
        </div>

        <div class="section-title">Category Breakdown</div>
        <table>
          <thead><tr>
            <th>Category</th>
            <th style="text-align:center">Items</th>
            <th style="text-align:center">Share</th>
            <th style="text-align:right">Amount</th>
          </tr></thead>
          <tbody>${categoryRows}</tbody>
        </table>

        <div class="section-title">All Transactions</div>
        <table>
          <thead><tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th style="text-align:right">Amount</th>
          </tr></thead>
          <tbody>${expenseRows}</tbody>
        </table>

        <div class="footer">BudgetBuddy — Your Personal Expense Tracker</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
    toast.success("Report generated! Use the print dialog to save as PDF.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Financial Intelligence
          </h1>
          <p className="text-slate-500 mt-1">
            Deep dive into your spending patterns for {currentMonthName}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Month Filter Dropdown */}
          <div className="relative" ref={monthPickerRef}>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm"
            >
              <FiCalendar /> {currentMonthLabel} <FiChevronDown size={14} />
            </button>
            {showMonthPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-2 w-56 max-h-80 overflow-y-auto">
                {monthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedMonth(opt.value);
                      setShowMonthPicker(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors font-medium ${
                      selectedMonth === opt.value
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm shadow-sm"
          >
            <FiDownload /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart Card */}
        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Expense Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Spending by category this month
              </p>
            </div>
            <FiPieChart className="text-slate-400" size={18} />
          </div>

          <div className="relative h-64 flex justify-center items-center">
            <Doughnut data={categoryData} options={chartOptions} />
            {/* Center Label for Doughnut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-primary-700">
                ₹{totalMonthly.toFixed(0)}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                Total Spent
              </span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-4 mt-6 px-4">
            {categoryData.labels.slice(0, 4).map((label, i) => (
              <div
                key={label}
                className="flex justify-between items-center text-sm font-medium text-slate-600"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        categoryData.datasets[0].backgroundColor[i],
                    }}
                  ></span>
                  <span>{label}</span>
                </div>
                <span className="text-slate-400">
                  {Math.round(
                    (categoryData.raw[label] / totalMonthly) * 100 || 0,
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="dashboard-card flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800">Monthly Comparison</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Spending trends over the last 6 months
            </p>
          </div>

          <div className="h-48 mt-4 flex-1 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>

          <div className="mt-6 bg-emerald-50 rounded-xl p-4 flex gap-3 shadow-sm border border-emerald-100">
            <div className="text-emerald-500 mt-0.5">
              <FiActivity size={18} />
            </div>
            <p className="text-sm text-slate-700 font-medium">
              Your total spending in <strong>{currentMonthName}</strong> is{" "}
              <span className="text-primary-600 font-bold">
                ₹{totalMonthly.toFixed(0)}
              </span>{" "}
              across {currentMonthExpenses.length} transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown list */}
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 inline-block mr-2">
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-400">({currentMonthName})</span>
          </div>
          {breakdownData.length > 5 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
            >
              {showAllCategories
                ? "Show Less"
                : `View All (${breakdownData.length})`}{" "}
              &gt;
            </button>
          )}
        </div>

        {breakdownData.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-400 font-medium">No expenses this month</p>
            <p className="text-xs text-slate-300 mt-1">
              Start adding expenses to see your category breakdown
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 items-center pb-3 border-b border-slate-100">
              <div className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Items
              </div>
              <div className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Health
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Amount
              </div>
            </div>

            {displayedCategories.map((item, index) => {
              const config = CATEGORY_CONFIG[item.category] || DEFAULT_CONFIG;
              const IconComponent = config.icon;
              const health = getSpendingHealth(item.percentage);

              return (
                <div
                  key={item.category}
                  className={`grid grid-cols-12 gap-4 items-center py-4 transition-colors hover:bg-slate-50 rounded-lg ${
                    index < displayedCategories.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgColor} ${config.textColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item.category}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-500 font-medium">
                    {item.count} {item.count === 1 ? "Item" : "Items"}
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`${health.barColor} h-1.5 rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.max(item.percentage, 3)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 w-16 flex-shrink-0">
                      {health.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-bold text-slate-800">
                    ₹{item.total.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Savings Potential Card */}
        <div className="group relative bg-gradient-to-br from-primary-50 to-indigo-50 p-6 rounded-2xl border-2 border-primary-200 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/0 to-primary-600/0 group-hover:from-primary-600/5 group-hover:via-primary-600/10 group-hover:to-primary-600/5 transition-all duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          <div className="relative">
            <h4 className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2 group-hover:text-primary-700 transition-colors">
              💰 Savings Potential
            </h4>
            <h3 className="font-bold text-slate-800 mb-3 text-lg group-hover:text-slate-900 transition-colors">
              Optimizing Travel
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
              By using the student railcard more frequently, you could save
              approximately{" "}
              <span className="font-bold text-primary-600 group-hover:text-primary-700">
                ₹45/month
              </span>
              .
            </p>
            <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
              <span className="text-xs font-semibold text-primary-600">
                Potential yearly savings
              </span>
            </div>
          </div>
        </div>

        {/* Academic ROI Card */}
        <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/5 group-hover:via-emerald-600/10 group-hover:to-emerald-600/5 transition-all duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          <div className="relative">
            <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 group-hover:text-emerald-700 transition-colors">
              🎓 Academic ROI
            </h4>
            <h3 className="font-bold text-slate-800 mb-3 text-lg group-hover:text-slate-900 transition-colors">
              Software Grants
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
              Your Adobe subscription is eligible for a university rebate. Claim{" "}
              <span className="font-bold text-emerald-600 group-hover:text-emerald-700">
                ₹120 back
              </span>{" "}
              this week.
            </p>
            <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              <span className="text-xs font-semibold text-emerald-600">
                Claim now →
              </span>
            </div>
          </div>
        </div>

        {/* Budget Alert Card */}
        <div className="group relative bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/0 to-orange-600/0 group-hover:from-orange-600/5 group-hover:via-orange-600/10 group-hover:to-orange-600/5 transition-all duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          <div className="relative">
            <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2 group-hover:text-orange-700 transition-colors">
              ⚠️ Budget Alert
            </h4>
            <h3 className="font-bold text-slate-800 mb-3 text-lg group-hover:text-slate-900 transition-colors">
              Utility Spike
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
              Electricity costs are{" "}
              <span className="font-bold text-orange-600 group-hover:text-orange-700">
                22% higher
              </span>{" "}
              than last semester. Consider review of peak usage times.
            </p>
            <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
              <span className="text-xs font-semibold text-orange-600">
                View details →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
