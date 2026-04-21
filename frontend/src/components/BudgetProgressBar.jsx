import React from "react";
import { FiTrendingUp, FiAlertTriangle } from "react-icons/fi";

/**
 * BudgetProgressBar Component
 *
 * Displays a dynamic progress bar showing budget usage with color-coded status:
 * - Green (<50%): Healthy spending
 * - Yellow (50-80%): Warning zone
 * - Red (>80%): Critical zone
 *
 * Props:
 * - percentageUsed: number (0-100)
 * - monthlyBudget: number
 * - totalExpenses: number
 * - className: optional string for additional styling
 */
const BudgetProgressBar = ({
  percentageUsed = 0,
  monthlyBudget = 0,
  totalExpenses = 0,
  className = "",
}) => {
  // Determine color based on percentage
  const getProgressColor = () => {
    if (percentageUsed >= 80) return "bg-red-500";
    if (percentageUsed >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getStatusBadgeColor = () => {
    if (percentageUsed >= 80) return "bg-red-100 text-red-800";
    if (percentageUsed >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-emerald-100 text-emerald-800";
  };

  const getStatusText = () => {
    if (percentageUsed >= 80) return "Critical";
    if (percentageUsed >= 50) return "Warning";
    return "Healthy";
  };

  const getStatusIcon = () => {
    if (percentageUsed >= 80) return <FiAlertTriangle className="w-4 h-4" />;
    if (percentageUsed >= 50) return <FiAlertTriangle className="w-4 h-4" />;
    return <FiTrendingUp className="w-4 h-4" />;
  };

  const remaining = monthlyBudget - totalExpenses;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with title and status badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-700">Budget Usage</h3>
          <p className="text-sm text-gray-500">
            ₹{totalExpenses.toLocaleString("en-IN")} of ₹
            {monthlyBudget.toLocaleString("en-IN")}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBadgeColor()} font-semibold text-sm`}
        >
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {/* Progress bar container */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div className="text-sm font-medium text-gray-600">
            Usage: {percentageUsed}%
          </div>
          <div
            className={`text-sm font-semibold ${percentageUsed >= 80 ? "text-red-600" : percentageUsed >= 50 ? "text-yellow-600" : "text-emerald-600"}`}
          >
            {remaining >= 0
              ? `₹${remaining.toLocaleString("en-IN")} remaining`
              : `₹${Math.abs(remaining).toLocaleString("en-IN")} over`}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-sm">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="p-2 bg-gray-50 rounded-lg text-center">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-bold text-gray-800">
            ₹{(monthlyBudget / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg text-center">
          <p className="text-xs text-gray-500">Spent</p>
          <p className="text-sm font-bold text-gray-800">
            ₹{(totalExpenses / 1000).toFixed(0)}K
          </p>
        </div>
        <div
          className={`p-2 rounded-lg text-center ${remaining >= 0 ? "bg-green-50" : "bg-red-50"}`}
        >
          <p className="text-xs text-gray-500">Left</p>
          <p
            className={`text-sm font-bold ${remaining >= 0 ? "text-green-700" : "text-red-700"}`}
          >
            ₹{(remaining / 1000).toFixed(0)}K
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgressBar;
