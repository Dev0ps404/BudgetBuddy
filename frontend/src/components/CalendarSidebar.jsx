import React from "react";
import CompactExpenseCalendar from "./CompactExpenseCalendar";

const CalendarSidebar = ({ expenses = [] }) => {
  return (
    <aside className="w-[330px] xl:w-[340px] xl:shrink-0">
      <div className="sticky top-4">
        <CompactExpenseCalendar expenses={expenses} />
      </div>
    </aside>
  );
};

export default CalendarSidebar;
