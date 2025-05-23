import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as visitaService from '../services/visitaService';
import { Visita, VisitaStatus } from '../types/visita';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useHasPermission } from '../hooks/useHasPermission';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useNotifier } from '../hooks/useNotifier';
// import VisitaForm from '../components/visitas/VisitaForm'; // To be imported later

const VisitaListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, tenantId } = useAuth();
  const { addNotification } = useNotifier();

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permissions
  const canCreate = useHasPermission([UserRole.ADMIN, UserRole.VENDEDOR]);
  const isAdmin = useHasPermission([UserRole.ADMIN]);

  // TODO: State for Modal and selected Visita for edit/delete/form
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingVisita, setEditingVisita] = useState<Visita | null>(null);

  const fetchVisitas = useCallback(async () => {
    if (!tenantId) {
      setError(t('visitaListPage.errorNoTenantId')); // Placeholder for actual key
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let filters: visitaService.ListVisitasFilters = {};
      if (!isAdmin && currentUser) { // VENDEDOR sees their own visits by default
        filters.assignedToUserId = currentUser.id;
      }
      // TODO: Add UI for ADMIN to filter by assignedToUserId and date range
      const data = await visitaService.listVisitas(filters);
      setVisitas(data);
    } catch (err) {
      console.error("Failed to fetch visitas", err);
      const errorMessage = err instanceof Error ? err.message : t('visitaListPage.errorLoadingDefault');
      setError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, currentUser, isAdmin, t, addNotification]);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  const handleDelete = async (visita: Visita) => {
    if (window.confirm(t('visitaListPage.confirmDeleteMessage', { subject: visita.subject }))) {
      try {
        await visitaService.deleteVisita(visita.id);
        addNotification(t('visitaListPage.deleteSuccess', { subject: visita.subject }), 'success');
        fetchVisitas(); // Refresh list
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('visitaListPage.errorDeletingDefault');
        setError(errorMessage);
        addNotification(errorMessage, 'error');
      }
    }
  };
  
  const handleCancelVisita = async (visita: Visita) => {
     if (window.confirm(t('visitaListPage.confirmCancelMessage', { subject: visita.subject }))) {
      try {
        await visitaService.updateVisita(visita.id, { status: VisitaStatus.CANCELLED });
        addNotification(t('visitaListPage.cancelSuccess', { subject: visita.subject }), 'success');
        fetchVisitas(); // Refresh list
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('visitaListPage.errorCancellingDefault');
        setError(errorMessage);
        addNotification(errorMessage, 'error');
      }
    }
  };
  
  // TODO: Functions for opening create/edit modal

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">{t('visitaListPage.loadingData')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">{t('visitaListPage.errorLoadingTitle')}</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchVisitas} variant="primary">
          {t('visitaListPage.tryAgainButton')}
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };
  
  const canPerformAction = (visita: Visita) => {
    if (isAdmin) return true;
    return visita.assignedToUserId === currentUser?.id;
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">
            {t('visitaListPage.title')}
          </h1>
          <p className="text-slate-600 text-sm">
            {t('visitaListPage.subtitle')}
          </p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => alert("Schedule New Visit - To be implemented with modal")} // Placeholder
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
          >
            <Icon iconName="add_circle_outline" className="mr-2" />
            {t('visitaListPage.scheduleNewButton')}
          </Button>
        )}
      </div>

      {visitas.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow border">
          <Icon iconName="calendar_today" className="text-5xl text-slate-400 mb-3" />
          <p className="text-slate-500 mb-3">{t('visitaListPage.noVisitsFound')}</p>
          {canCreate && (
            <Button 
              variant="secondary"
              onClick={() => alert("Schedule New Visit - To be implemented with modal")} // Placeholder
            >
               {t('visitaListPage.scheduleFirstButton')}
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('visitaListPage.tableHeaderSubject')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('visitaListPage.tableHeaderDateTime')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('visitaListPage.tableHeaderAssignedTo')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('visitaListPage.tableHeaderRelatedTo')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('visitaListPage.tableHeaderStatus')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('visitaListPage.tableHeaderActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {visitas.map((visita) => (
                <tr key={visita.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{visita.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(visita.dateTime)} ({visita.durationMinutes}m)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{visita.assignedTo?.name || visita.assignedToUserId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                    {visita.lead ? `Lead: ${visita.lead.name}` : visita.clientProfile ? `Client: ${visita.clientProfile.user?.name || visita.clientProfile.companyName || 'N/A'}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${visita.status === VisitaStatus.PLANNED ? 'bg-blue-100 text-blue-800' :
                          visita.status === VisitaStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                          visita.status === VisitaStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                          visita.status === VisitaStatus.RESCHEDULED ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                      {t(`visitaStatus.${visita.status.toLowerCase()}`, visita.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canPerformAction(visita) && (
                      <>
                        <Button variant="outlined" size="small" onClick={() => alert(`Edit ${visita.subject}`)}>
                           <Icon iconName="edit" className="text-xs mr-1" /> {t('visitaListPage.editButton')}
                        </Button>
                        {visita.status === VisitaStatus.PLANNED &&
                          <Button variant="warning-outlined" size="small" onClick={() => handleCancelVisita(visita)}>
                            <Icon iconName="cancel" className="text-xs mr-1" /> {t('visitaListPage.cancelButton')}
                          </Button>
                        }
                        <Button variant="danger-outlined" size="small" onClick={() => handleDelete(visita)}>
                           <Icon iconName="delete" className="text-xs mr-1" /> {t('visitaListPage.deleteButton')}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add Modal with VisitaForm here */}
    </div>
  );
};

export default VisitaListPage;
