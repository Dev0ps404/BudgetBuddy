import React from "react";
import CompactExpenseCalendar from "./CompactExpenseCalendar";

const CalendarSidebar = ({ expenses = [] }) => {
  return (
    <aside className="w-full xl:shrink-0">
      <div className="sticky top-4 md:top-6">
        <CompactExpenseCalendar expenses={expenses} />
      </div>
    </aside>
  );
};

export default CalendarSidebar;
