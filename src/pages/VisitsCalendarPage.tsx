
import React, { useState, useEffect, useMemo } from 'react';
import CalendarGrid from '../components/calendar/CalendarGrid';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import { VisitEvent } from '../types/visit'; 
import VisitFormModal from '../components/visits/VisitFormModal'; // Import the modal

const mockVisits: VisitEvent[] = [
  { id: 'v1', title: 'Initial Consultation with Sarah Miller', date: '2024-10-05', startTime: '10:00', endTime: '11:00', location: "Client's Home", description: "Discuss living room redesign, preferences, budget. Bring samples." },
  { id: 'v2', title: 'Site Visit at 123 Oak Street', date: '2024-10-05', startTime: '14:00', endTime: '15:00', location: '123 Oak Street', description: 'Measure kitchen for remodel.' },
  { id: 'v3', title: 'Follow-up with David Lee', date: '2024-10-05', startTime: '16:00', endTime: '17:00', location: "David Lee's Office", description: 'Review proposal feedback.' },
  { id: 'v4', title: 'Design Presentation for Project Alpha', date: '2024-11-12', startTime: '11:00', endTime: '12:00', location: 'Conference Room B', description: 'Present final design concepts.' },
  { id: 'v5', title: 'Client Meeting with Emily Chen', date: '2024-11-20', startTime: '15:00', endTime: '16:00', location: 'Our Showroom', description: 'Select materials for bathroom renovation.' },
  { id: 'v6', title: "Today's important meeting", date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', location: 'Virtual via Meet', description: 'Quick sync on project timelines.' }
];


const VisitsCalendarPage: React.FC = () => {
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visits, setVisits] = useState<VisitEvent[]>(mockVisits); 

  // Modal state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisitData, setEditingVisitData] = useState<VisitEvent | null>(null);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentDisplayDate.getMonth() || date.getFullYear() !== currentDisplayDate.getFullYear()) {
      setCurrentDisplayDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDisplayDate(today);
    setSelectedDate(today);
  };

  const upcomingVisitsForSelectedDate = useMemo(() => {
    return visits
      .filter(visit => {
        const visitDate = new Date(visit.date + 'T00:00:00'); 
        return visitDate.toDateString() === selectedDate.toDateString();
      })
      .sort((a, b) => {
        const timeA = new Date(`01/01/2000 ${a.startTime}`);
        const timeB = new Date(`01/01/2000 ${b.startTime}`);
        return timeA.getTime() - timeB.getTime();
      });
  }, [visits, selectedDate]);
  
  const monthYearFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });

  // Modal handlers
  const handleOpenNewVisitModal = () => {
    setEditingVisitData(null);
    setIsVisitModalOpen(true);
  };
  
  const handleOpenEditVisitModal = (visit: VisitEvent) => {
    setEditingVisitData(visit);
    setIsVisitModalOpen(true);
  };

  const handleCloseVisitModal = () => {
    setIsVisitModalOpen(false);
    setEditingVisitData(null);
  };

  const handleSaveVisit = async (visitData: Omit<VisitEvent, 'id'> | VisitEvent) => {
    setIsSubmittingVisit(true);
    console.log("Saving visit:", visitData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if ('id' in visitData) { // Editing existing visit
      setVisits(prev => prev.map(v => v.id === visitData.id ? visitData as VisitEvent : v));
    } else { // Adding new visit
      const newVisit: VisitEvent = {
        ...visitData,
        id: `v-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };
      setVisits(prev => [newVisit, ...prev]);
    }
    setIsSubmittingVisit(false);
    handleCloseVisitModal();
  };


  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Visits</h1>
        <Button onClick={handleOpenNewVisitModal} className="h-10 px-4 text-sm">
          <Icon iconName="add" className="mr-2 text-lg" />
          New Visit
        </Button>
      </header>

      <div className="grid grid-cols-1 @[960px]:grid-cols-3 gap-6 sm:gap-8 flex-grow overflow-hidden">
        <div className="@[960px]:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <Button variant="secondary" onClick={handlePrevMonth} className="!p-2 !h-9 !w-9" aria-label="Previous month">
              <Icon iconName="chevron_left" />
            </Button>
            <div className="flex flex-col items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-700">
                {monthYearFormat.format(currentDisplayDate)}
                </h2>
                 <Button variant="secondary" onClick={handleGoToToday} className="!h-7 !px-2 !text-xs mt-1">Today</Button>
            </div>
            <Button variant="secondary" onClick={handleNextMonth} className="!p-2 !h-9 !w-9" aria-label="Next month">
              <Icon iconName="chevron_right" />
            </Button>
          </div>
          <CalendarGrid
            currentDisplayDate={currentDisplayDate}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            events={visits}
          />
        </div>

        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col overflow-hidden">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-200">
            Visits for: <span className="text-[var(--color-primary)]">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </h3>
          {upcomingVisitsForSelectedDate.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto custom-scrollbar flex-grow">
              {upcomingVisitsForSelectedDate.map(visit => (
                <li 
                  key={visit.id} 
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group" 
                  onClick={() => handleOpenEditVisitModal(visit)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenEditVisitModal(visit);}}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for visit: ${visit.title}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    <Icon iconName="event" className="text-xl" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-slate-800 text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">{visit.title}</p>
                    <p className="text-slate-500 text-xs">{visit.startTime} - {visit.endTime}</p>
                    {visit.location && <p className="text-xs text-slate-400 mt-0.5 flex items-center"><Icon iconName="location_on" className="text-xs mr-1"/>{visit.location}</p>}
                  </div>
                  <Icon iconName="chevron_right" className="text-slate-400 group-hover:text-slate-600 transition-colors self-center" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-500 py-10 flex flex-col items-center justify-center flex-grow">
              <Icon iconName="event_busy" className="text-3xl sm:text-4xl mb-2" />
              <p className="text-sm">No visits scheduled for this date.</p>
            </div>
          )}
        </section>
      </div>
      
      <VisitFormModal
        isOpen={isVisitModalOpen}
        onClose={handleCloseVisitModal}
        onSubmit={handleSaveVisit}
        initialVisitData={editingVisitData}
        isLoading={isSubmittingVisit}
      />
    </div>
  );
};

export default VisitsCalendarPage;
