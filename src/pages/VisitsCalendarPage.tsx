
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Views, Event as CalendarEvent } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { localizer } from '../../calendarLocalizer';
import * as visitaService from '../../services/visitaService';
import { Visita, ListVisitasFilters } from '../../types/visita';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useNotifier } from '../../hooks/useNotifier';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
// import VisitFormModal from '../../components/visitas/VisitFormModal'; // TODO: To be created/used later

const VisitsCalendarPage: React.FC = () => {
import VisitaForm from '../../components/visitas/VisitaForm'; // Import VisitaForm
import * as authService from '../../services/authService'; // For fetching users (salespersons)
import { User } from '../../types/user';
import { Lead } from '../../types/lead';
import { ClientProfile } from '../../types/client';
import { useHasPermission } from '../../hooks/useHasPermission';


const VisitsCalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, tenantId } = useAuth();
  const { addNotification } = useNotifier();

  // const [visitas, setVisitas] = useState<Visita[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial data and event fetching
  const [isFetchingRelatedData, setIsFetchingRelatedData] = useState(true); // For salespersons, leads, clients
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [newVisitaSlotInfo, setNewVisitaSlotInfo] = useState<{ start: Date, end: Date } | null>(null);

  const [availableSalespersons, setAvailableSalespersons] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [clientProfiles, setClientProfiles] = useState<(ClientProfile & { user?: { name?: string | null } })[]>([]);
  const isAdmin = useHasPermission([UserRole.ADMIN]);

  const fetchVisitasAndSetEvents = useCallback(async () => {
    if (!tenantId) {
      setError(t('visitaListPage.errorNoTenantId')); // Using existing key for now
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let filters: ListVisitasFilters = {};
      if (currentUser?.role === UserRole.VENDEDOR) {
        filters.assignedToUserId = currentUser.id;
      }
      const data = await visitaService.listVisitas(filters);
      // setVisitas(data); // If you need the raw data elsewhere
      const events = data.map(visita => ({
        title: visita.subject,
        start: new Date(visita.dateTime),
        end: new Date(new Date(visita.dateTime).getTime() + visita.durationMinutes * 60000),
        resource: visita, // Store the original visita object
      }));
      setCalendarEvents(events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('visitaListPage.errorLoadingDefault');
      setError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, currentUser, t, addNotification]);

  useEffect(() => {
    fetchVisitasAndSetEvents();
  }, [fetchVisitasAndSetEvents]);

  // Fetch related data for the form dropdowns
  useEffect(() => {
    const loadRelatedData = async () => {
      if (!tenantId) return;
      setIsFetchingRelatedData(true);
      try {
        // Fetch Salespersons (Users with VENDEDOR role)
        // Using mock authService.fetchUsers and client-side filtering as a placeholder
        const allUsers = await authService.fetchUsers(); 
        setAvailableSalespersons(
          allUsers.filter(user => user.role === UserRole.VENDEDOR && user.tenantId === tenantId)
        );
        
        // Placeholder for fetching leads and client profiles - pass empty arrays for now
        setLeads([]); 
        setClientProfiles([]);

      } catch (err) {
        console.error("Failed to fetch related data for form:", err);
        addNotification(t('visitaForm.errorFetchingRelatedData', "Error fetching data for form dropdowns."), 'error');
      } finally {
        setIsFetchingRelatedData(false);
      }
    };
    // Fetch if Admin or if Vendedor (to set themselves if needed, though form logic might already handle this)
    if (isAdmin || (currentUser && currentUser.role === UserRole.VENDEDOR)) {
        loadRelatedData();
    } else {
        setIsFetchingRelatedData(false); 
    }
  }, [tenantId, isAdmin, currentUser, addNotification, t]);
  
  const calendarMessages = useMemo(() => ({
    today: t('calendar.today'),
    previous: t('calendar.previous'),
    next: t('calendar.next'),
    month: t('calendar.month'),
    week: t('calendar.week'),
    day: t('calendar.day'),
    agenda: t('calendar.agenda'),
    noEventsInRange: t('calendar.noEventsInRange'),
    showMore: (total: number) => t('calendar.showMore', { count: total }),
  }), [t]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedVisita(event.resource as Visita);
    setNewVisitaSlotInfo(null);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedVisita(null);
    setNewVisitaSlotInfo({ start, end });
    setIsModalOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false);
    fetchVisitasAndSetEvents();
  };


  if ((isLoading && calendarEvents.length === 0) || (isModalOpen && isFetchingRelatedData)) { // Show loading if calendar data or related form data is loading
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">{t('visitaListPage.loadingData')}</p> {/* Re-use existing key */}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">{t('visitaListPage.errorLoadingTitle')}</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchVisitasAndSetEvents} variant="primary">
          {t('visitaListPage.tryAgainButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">
            {t('visitaListPage.title')} {/* Reuse title from list page for now */}
          </h1>
           <p className="text-slate-600 text-sm">
            {t('visitaListPage.subtitle')} {/* Reuse subtitle from list page */}
          </p>
        </div>
         <Button onClick={() => { setSelectedVisita(null); setNewVisitaSlotInfo(null); setIsModalOpen(true); }}>
            <Icon iconName="add_circle_outline" className="mr-2" />
            {t('visitaListPage.scheduleNewButton')}
        </Button> 
      </div>
      
      <div className="flex-1 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200 min-h-[calc(100vh-250px)]"> {/* Ensure calendar has enough height */}
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          style={{ minHeight: '100%' }} // Make calendar fill its container
          messages={calendarMessages}
          culture={i18n.language} // Dynamically set culture based on i18next language
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable // Allow slot selection
        />
      </div>
      
      {isModalOpen && (
        <VisitaForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={handleFormSubmitSuccess}
          initialData={selectedVisita}
          slotInfo={newVisitaSlotInfo}
          availableSalespersons={availableSalespersons}
          leads={leads} 
          clientProfiles={clientProfiles}
        />
      )}
    </div>
  );
};

export default VisitsCalendarPage;
