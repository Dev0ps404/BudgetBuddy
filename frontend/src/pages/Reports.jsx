import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalMonthly = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // Process Data for Doughnut Chart (Expenses by Category)
  const categoryData = useMemo(() => {
    const cats = {};
    expenses.forEach((e) => {
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
          ],
          borderWidth: 0,
          hoverOffset: 4,
          cutout: "75%",
        },
      ],
      raw: cats,
    };
  }, [expenses]);

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

  const lineData = {
    labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
    datasets: [
      {
        label: "Actual",
        data: [1200, 1900, 1500, 2100, 2400, 2200],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#4f46e5",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Budget",
        data: [1500, 1500, 1500, 2000, 2000, 2500],
        borderColor: "#cbd5e1",
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
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
            Deep dive into your spending patterns for Semester 2
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm">
            <FiCalendar /> Current Month
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm shadow-sm">
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
                ${totalMonthly.toFixed(0)}
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
              Your spending in <strong>June</strong> is{" "}
              <span className="text-emerald-600 font-bold">8.2% lower</span>{" "}
              than the average budget. Great job!
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
            <span className="text-xs text-slate-400">(Current Month)</span>
          </div>
          <button className="text-primary-600 text-sm font-semibold">
            View All Categories &gt;
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4 items-center border-b border-slate-50 pb-4">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <FiCoffee />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Dining & Food
                </p>
                <p className="text-xs text-slate-400">
                  Cafeteria, Groceries, Delivery
                </p>
              </div>
            </div>
            <div className="col-span-2 text-sm text-slate-500">24 Items</div>
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full w-2/3"></div>
              </div>
              <span className="text-xs text-slate-400 w-16">Healthy</span>
            </div>
            <div className="col-span-2 text-right font-bold text-slate-800">
              $612.50
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center border-b border-slate-50 pb-4">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiTruck />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Transport
                </p>
                <p className="text-xs text-slate-400">Public Transit, Uber</p>
              </div>
            </div>
            <div className="col-span-2 text-sm text-slate-500">12 Items</div>
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full w-11/12"></div>
              </div>
              <span className="text-xs text-slate-400 w-16">Critical</span>
            </div>
            <div className="col-span-2 text-right font-bold text-slate-800">
              $367.50
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <FiBook />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Academic Tools
                </p>
                <p className="text-xs text-slate-400">Books, Software</p>
              </div>
            </div>
            <div className="col-span-2 text-sm text-slate-500">4 Items</div>
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-emerald-600 h-1.5 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs text-slate-400 w-16">Optimal</span>
            </div>
            <div className="col-span-2 text-right font-bold text-slate-800">
              $490.00
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-50 p-5 rounded-2xl border-l-4 border-primary-600 border-t border-r border-b border-white shadow-sm">
          <h4 className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">
            Savings Potential
          </h4>
          <h3 className="font-bold text-slate-800 mb-2">Optimizing Travel</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By using the student railcard more frequently, you could save
            approximately $45/month.
          </p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border-l-4 border-emerald-600 border-t border-r border-b border-white shadow-sm">
          <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Academic ROI
          </h4>
          <h3 className="font-bold text-slate-800 mb-2">Software Grants</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your Adobe subscription is eligible for a university rebate. Claim
            $120 back this week.
          </p>
        </div>
        <div className="bg-orange-50 p-5 rounded-2xl border-l-4 border-orange-600 border-t border-r border-b border-white shadow-sm">
          <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
            Budget Alert
          </h4>
          <h3 className="font-bold text-slate-800 mb-2">Utility Spike</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Electricity costs are 22% higher than last semester. Consider review
            of peak usage times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
