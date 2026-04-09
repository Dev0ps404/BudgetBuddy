import React, { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const WEEK_DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

const aggregateByDay = (expenses = []) => {
  return expenses.reduce((acc, expense) => {
    if (!expense?.date) return acc;

    const parsedDate =
      typeof expense.date === "string"
        ? parseISO(expense.date)
        : new Date(expense.date);

    if (Number.isNaN(parsedDate.getTime())) return acc;

    const key = format(parsedDate, "yyyy-MM-dd");
    const amount = Number(expense.amount) || 0;
    const existing = acc[key] || { total: 0, count: 0 };

    existing.total += amount;
    existing.count += 1;
    acc[key] = existing;
    return acc;
  }, {});
};

const CompactExpenseCalendar = ({ expenses = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const expenseByDay = useMemo(() => aggregateByDay(expenses), [expenses]);

  const { highThreshold } = useMemo(() => {
    const totals = Object.values(expenseByDay).map((entry) => entry.total);
    const avg = totals.length
      ? totals.reduce((sum, total) => sum + total, 0) / totals.length
      : 0;

    return {
      highThreshold: Math.max(600, avg * 1.25),
    };
  }, [expenseByDay]);

  const visibleDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const intervalStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const intervalEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: intervalStart,
      end: intervalEnd,
    });
  }, [currentMonth]);

  const getDayType = (summary) => {
    if (!summary) return null;
    if (summary.total >= highThreshold) return "high";
    if (summary.count >= 2) return "milestone";
    return null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">
          {format(currentMonth, "MMMM yyyy")}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {visibleDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const summary = expenseByDay[key];
          const type = getDayType(summary);
          const outside = !isSameMonth(day, currentMonth);
          const selected = selectedDay === key;
          const today = isToday(day);

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(key)}
              aria-label={`${format(day, "MMMM d, yyyy")}${summary ? `: ₹${summary.total.toFixed(0)} total` : ""}`}
              className={`relative flex h-8 items-center justify-center rounded-lg text-[11px] font-semibold transition-all ${
                outside ? "text-slate-300" : "text-slate-700 hover:bg-slate-100"
              } ${
                type === "high"
                  ? "bg-rose-50 text-rose-600"
                  : type === "milestone"
                    ? "bg-emerald-50 text-emerald-600"
                    : ""
              } ${selected ? "ring-1 ring-primary-500" : ""} ${
                today && !selected ? "bg-slate-100" : ""
              }`}
            >
              {format(day, "d")}
              {summary && (
                <span
                  className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                    type === "high" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-[10px]">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>High Spending Event</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Financial Milestone</span>
        </div>
      </div>
    </section>
  );
};

export default CompactExpenseCalendar;
