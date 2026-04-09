import React, { useMemo } from "react";
import { format } from "date-fns";
import { FiActivity, FiCalendar, FiDollarSign } from "react-icons/fi";
import CompactExpenseCalendar from "./CompactExpenseCalendar";

const CalendarSidebar = ({ expenses = [] }) => {
  const { monthlyTotal, transactionCount, activeDays } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthExpenses = expenses.filter((expense) => {
      if (!expense?.date) return false;
      const expenseDate = new Date(expense.date);
      if (Number.isNaN(expenseDate.getTime())) return false;
      return (
        expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      );
    });

    const total = monthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const uniqueDays = new Set(
      monthExpenses.map((expense) =>
        format(new Date(expense.date), "yyyy-MM-dd"),
      ),
    );

    return {
      monthlyTotal: total,
      transactionCount: monthExpenses.length,
      activeDays: uniqueDays.size,
    };
  }, [expenses]);

  return (
    <aside className="h-full w-[330px] overflow-hidden border-l border-slate-200/70 bg-gradient-to-b from-white via-slate-50/60 to-white xl:w-[340px]">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200/70 bg-white/75 px-5 py-5 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-600">
            Calendar Sidebar
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Spend Planner
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2.5">
              <div className="mb-1 flex items-center gap-1 text-slate-400">
                <FiDollarSign size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  Month
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                ₹{monthlyTotal.toFixed(0)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2.5">
              <div className="mb-1 flex items-center gap-1 text-slate-400">
                <FiActivity size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  Txn
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {transactionCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2.5">
              <div className="mb-1 flex items-center gap-1 text-slate-400">
                <FiCalendar size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  Days
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">{activeDays}</p>
            </div>
          </div>

          <CompactExpenseCalendar expenses={expenses} />
        </div>
      </div>
    </aside>
  );
};

export default CalendarSidebar;
