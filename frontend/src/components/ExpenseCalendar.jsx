import React, { useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  addDays,
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

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const reduceExpensesByDay = (expenses = []) => {
  return expenses.reduce((acc, expense) => {
    if (!expense?.date) return acc;

    const parsedDate =
      typeof expense.date === "string"
        ? parseISO(expense.date)
        : new Date(expense.date);

    if (Number.isNaN(parsedDate.getTime())) return acc;

    const dayKey = format(parsedDate, "yyyy-MM-dd");
    const amount = Number(expense.amount) || 0;
    const existing = acc[dayKey] || { total: 0, count: 0 };

    existing.total += amount;
    existing.count += 1;
    acc[dayKey] = existing;

    return acc;
  }, {});
};

const TODAY = new Date();

const DUMMY_CALENDAR_EXPENSES = [
  { date: format(addDays(TODAY, -8), "yyyy-MM-dd"), amount: 220 },
  { date: format(addDays(TODAY, -6), "yyyy-MM-dd"), amount: 830 },
  { date: format(addDays(TODAY, -6), "yyyy-MM-dd"), amount: 260 },
  { date: format(addDays(TODAY, -4), "yyyy-MM-dd"), amount: 120 },
  { date: format(addDays(TODAY, -2), "yyyy-MM-dd"), amount: 540 },
  { date: format(addDays(TODAY, -2), "yyyy-MM-dd"), amount: 170 },
  { date: format(addDays(TODAY, -1), "yyyy-MM-dd"), amount: 95 },
  { date: format(TODAY, "yyyy-MM-dd"), amount: 480 },
  { date: format(addDays(TODAY, 2), "yyyy-MM-dd"), amount: 310 },
  { date: format(addDays(TODAY, 5), "yyyy-MM-dd"), amount: 270 },
];

const ExpenseCalendar = ({ expenses = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [hoveredDay, setHoveredDay] = useState(null);
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slideDirection, setSlideDirection] = useState(0);

  const calendarExpenses = useMemo(
    () => (expenses.length > 0 ? expenses : DUMMY_CALENDAR_EXPENSES),
    [expenses],
  );

  const expenseByDay = useMemo(
    () => reduceExpensesByDay(calendarExpenses),
    [calendarExpenses],
  );

  const visibleDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const intervalStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const intervalEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({
      start: intervalStart,
      end: intervalEnd,
    });
  }, [currentMonth]);

  const monthKey = format(currentMonth, "yyyy-MM");

  const handleMonthChange = (step) => {
    setSlideDirection(step);
    setCurrentMonth((prevMonth) => addMonths(prevMonth, step));
  };

  return (
    <section className="relative overflow-visible rounded-3xl border border-white/40 bg-gradient-to-br from-white/80 via-white/70 to-emerald-50/70 p-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-5 dark:border-slate-700/60 dark:from-slate-900/80 dark:via-slate-900/70 dark:to-emerald-950/30">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_42%)]" />

      <div className="relative mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Expense Calendar
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Hover a day to inspect spend and transaction count
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Go to previous month"
            onClick={() => handleMonthChange(-1)}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-600 shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary-300 hover:text-primary-600 hover:shadow-primary-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
          >
            <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label="Go to next month"
            onClick={() => handleMonthChange(1)}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-600 shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary-300 hover:text-primary-600 hover:shadow-primary-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
          >
            <FiChevronRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div className="relative mb-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {format(currentMonth, "MMMM yyyy")}
      </div>

      <div className="relative mb-3 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase text-slate-400 dark:text-slate-500">
        {WEEK_DAYS.map((dayLabel) => (
          <span key={dayLabel}>{dayLabel}</span>
        ))}
      </div>

      <div className="relative overflow-visible">
        <AnimatePresence initial={false} mode="wait">
          <Motion.div
            key={monthKey}
            initial={{
              opacity: 0,
              x: slideDirection > 0 ? 28 : -28,
              scale: 0.98,
            }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              x: slideDirection > 0 ? -28 : 28,
              scale: 0.98,
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7 gap-1.5 sm:gap-2"
          >
            {visibleDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const summary = expenseByDay[dayKey];
              const isOutsideMonth = !isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const isHoveredDay = hoveredDay === dayKey;
              const isActiveDay = activeDay === dayKey;

              return (
                <div key={dayKey} className="relative overflow-visible">
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredDay(dayKey)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onFocus={() => setHoveredDay(dayKey)}
                    onBlur={() => setHoveredDay(null)}
                    onClick={() => setActiveDay(dayKey)}
                    aria-label={`${format(day, "MMMM d, yyyy")}${summary ? `: ₹${summary.total.toFixed(2)} across ${summary.count} transactions` : ": no expenses"}`}
                    className={`relative flex h-14 w-full flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all duration-300 sm:h-16 ${
                      isOutsideMonth
                        ? "border-transparent bg-transparent text-slate-300 dark:text-slate-600"
                        : "border-slate-200/70 bg-white/65 text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)] backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200"
                    } ${
                      summary
                        ? "hover:scale-[1.03] hover:border-emerald-300 hover:shadow-[0_14px_35px_-18px_rgba(16,185,129,0.65)]"
                        : "hover:scale-[1.02] hover:border-primary-200 hover:shadow-[0_14px_35px_-20px_rgba(99,102,241,0.45)]"
                    } ${
                      isCurrentDay
                        ? "ring-2 ring-primary-400/70 dark:ring-primary-500/80"
                        : ""
                    } ${
                      isActiveDay || isHoveredDay
                        ? "shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_20px_35px_-22px_rgba(79,70,229,0.8)]"
                        : ""
                    }`}
                  >
                    <span
                      className={`${
                        isCurrentDay
                          ? "font-bold text-primary-700 dark:text-primary-300"
                          : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        summary
                          ? "scale-100 bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.7)]"
                          : "scale-0 opacity-0"
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {summary && isHoveredDay && (
                      <Motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-44 -translate-x-1/2 rounded-xl border border-emerald-300/40 bg-slate-900/90 px-3 py-2 text-left text-xs text-slate-100 shadow-2xl backdrop-blur-xl dark:border-emerald-200/20"
                      >
                        <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
                          {format(day, "EEE, MMM d")}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-slate-300">Total</span>
                          <span className="font-semibold text-emerald-300">
                            ₹{summary.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-slate-300">Transactions</span>
                          <span className="font-semibold text-slate-100">
                            {summary.count}
                          </span>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </Motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          <span>Expense logged</span>
        </div>
        <span className="rounded-lg bg-white/60 px-2 py-1 font-medium text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
          Today: {format(new Date(), "d MMM")}
        </span>
      </div>
    </section>
  );
};

export default ExpenseCalendar;