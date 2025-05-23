
import React from 'react';
import { VisitEvent } from '../../types/visit';
import Icon from '../ui/Icon';

interface CalendarGridProps {
  currentDisplayDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: VisitEvent[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDisplayDate,
  selectedDate,
  onDateSelect,
  events,
}) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth();

  const numDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-prev-${i}`} className="p-1 sm:p-2 h-10 sm:h-12"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= numDays; day++) {
    const currentDateObj = new Date(year, month, day);
    const isSelected = selectedDate.toDateString() === currentDateObj.toDateString();
    const today = new Date();
    const isToday = today.toDateString() === currentDateObj.toDateString();

    const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00'); // Ensure date is parsed in local timezone
        return eventDate.toDateString() === currentDateObj.toDateString();
    });
    const hasEvents = dayEvents.length > 0;

    calendarDays.push(
      <button
        key={day}
        onClick={() => onDateSelect(currentDateObj)}
        className={`p-1 sm:p-2 rounded-full text-sm h-10 sm:h-12 w-10 sm:w-12 flex flex-col items-center justify-center transition-colors duration-150 relative
                    ${isSelected ? 'bg-[var(--color-primary)] text-white font-semibold shadow-md ring-2 ring-offset-1 ring-[var(--color-primary-dark)]' 
                                : isToday ? 'bg-slate-200 text-slate-800 font-medium' 
                                : 'text-slate-700 hover:bg-slate-100'}
                  `}
      >
        <span>{day}</span>
        {hasEvents && !isSelected && <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] opacity-75"></span>}
      </button>
    );
  }
  
  // Fill remaining cells to complete the grid (e.g., up to 35 or 42 cells)
    const totalCells = Math.ceil((firstDay + numDays) / 7) * 7;
    for (let i = calendarDays.length; i < totalCells; i++) {
        calendarDays.push(<div key={`empty-next-${i - (firstDay + numDays)}`} className="p-1 sm:p-2 h-10 sm:h-12"></div>);
    }


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="font-medium text-slate-500 py-2">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {calendarDays}
      </div>
    </div>
  );
};

export default CalendarGrid;
