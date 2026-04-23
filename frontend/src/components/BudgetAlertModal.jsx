import React, { useState, useEffect } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

/**
 * BudgetAlertModal Component
 *
 * Shows a dynamic alert when user has used 50%+ of their budget
 * Features:
 * - 50%+ warning alert with moderate styling
 * - 80%+ critical alert with strong styling
 * - Smooth fade/scale animation
 * - Close button with session state tracking
 * - Dark overlay background
 */
const BudgetAlertModal = ({
  isOpen,
  percentageUsed,
  monthlyBudget,
  totalExpenses,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(false);
    // Store in sessionStorage so alert doesn't show again this session
    sessionStorage.setItem("budgetAlertDismissed", "true");

    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  // Determine alert level and styling
  const isCritical = percentageUsed >= 80;
  const isWarning = percentageUsed >= 50 && percentageUsed < 80;

  const bgColor = isCritical ? "bg-red-50" : "bg-yellow-50";
  const borderColor = isCritical ? "border-red-200" : "border-yellow-200";
  const headerBg = isCritical ? "bg-red-100" : "bg-yellow-100";
  const headerText = isCritical ? "text-red-800" : "text-yellow-800";
  const iconBg = isCritical ? "bg-red-200" : "bg-yellow-200";
  const buttonBg = isCritical ? "hover:bg-red-200" : "hover:bg-yellow-200";
  const messageText = isCritical ? "text-red-700" : "text-yellow-700";

  return (
    <>
      {/* Dark overlay background */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isAnimating ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal centered on screen */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 pointer-events-auto transition-all duration-300 ${borderColor} ${
            isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Header */}
          <div
            className={`${headerBg} rounded-t-xl p-6 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className={`${iconBg} p-3 rounded-full`}>
                <FiAlertTriangle className={`w-6 h-6 ${headerText}`} />
              </div>
              <h2 className={`text-xl font-bold ${headerText}`}>
                {isCritical ? "🚨 Budget Alert!" : "⚠️ Budget Warning"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`${buttonBg} p-2 rounded-lg transition-colors`}
              aria-label="Close alert"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className={`${bgColor} p-8 rounded-b-xl`}>
            {/* Message */}
            <p className={`text-lg font-semibold ${messageText} mb-6`}>
              {isCritical
                ? "🚨 Warning! You have used more than 80% of your budget."
                : "⚠️ You have used more than 50% of your budget. Track your expenses carefully."}
            </p>

            {/* Budget Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                <span className="font-medium text-gray-700">
                  Monthly Budget:
                </span>
                <span className="font-bold text-2xl text-blue-600">
                  ₹{monthlyBudget.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                <span className="font-medium text-gray-700">Total Spent:</span>
                <span
                  className={`font-bold text-2xl ${isCritical ? "text-red-600" : "text-yellow-600"}`}
                >
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Usage
                  </span>
                  <span
                    className={`text-lg font-bold ${isCritical ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {percentageUsed}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? "bg-red-500"
                        : isCritical
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-6">
              <p className="text-sm text-gray-600 mb-1">Remaining Budget:</p>
              <p
                className={`text-2xl font-bold ${monthlyBudget - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ₹
                {Math.max(monthlyBudget - totalExpenses, 0).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                isCritical
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
            >
              I Understand, Let Me Review
            </button>

            {/* Info text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              This alert will not show again during this session
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetAlertModal;
