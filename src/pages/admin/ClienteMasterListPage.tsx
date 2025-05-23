import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as clienteMasterService from '../../services/clienteMasterService';
import { ClienteMaster } from '../../types/clienteMaster';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useHasPermission } from '../../hooks/useHasPermission';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { useNotifier } from '../../hooks/useNotifier';
import ClienteMasterForm from '../../components/clientemaster/ClienteMasterForm'; // Import the form

const ClienteMasterListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, tenantId } = useAuth();
  const { addNotification } = useNotifier();

  const [clienteMasters, setClienteMasters] = useState<ClienteMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Permissions
  const canCreate = useHasPermission([UserRole.ADMIN, UserRole.VENDEDOR]);
  const canEdit = useHasPermission([UserRole.ADMIN, UserRole.VENDEDOR]);
  const canDelete = useHasPermission([UserRole.ADMIN]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClienteMaster, setEditingClienteMaster] = useState<ClienteMaster | null>(null);

  const fetchClienteMasters = useCallback(async () => {
    if (!tenantId) {
      setError(t('clienteMasterListPage.errorNoTenantId'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await clienteMasterService.listClienteMastersByTenant(tenantId);
      setClienteMasters(data);
    } catch (err) {
      console.error("Failed to fetch cliente masters", err);
      const errorMessage = err instanceof Error ? err.message : t('clienteMasterListPage.errorLoadingDefault');
      setError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, t, addNotification]);

  useEffect(() => {
    fetchClienteMasters();
  }, [fetchClienteMasters]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(t('clienteMasterListPage.confirmDeleteMessage', { name }))) {
      try {
        await clienteMasterService.deleteClienteMaster(id);
        addNotification(t('clienteMasterListPage.deleteSuccess', { name }), 'success');
        fetchClienteMasters(); // Refresh list
      } catch (err) {
        console.error("Failed to delete cliente master", err);
        const errorMessage = err instanceof Error ? err.message : t('clienteMasterListPage.errorDeletingDefault');
        setError(errorMessage);
        addNotification(errorMessage, 'error');
      }
    }
  };
  
  const handleOpenCreateModal = () => {
    setEditingClienteMaster(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (clienteMaster: ClienteMaster) => {
    setEditingClienteMaster(clienteMaster);
    setIsModalOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false);
    fetchClienteMasters(); // Refresh the list
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">{t('clienteMasterListPage.loadingData')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">{t('clienteMasterListPage.errorLoadingTitle')}</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchClienteMasters} variant="primary">
          {t('clienteMasterListPage.tryAgainButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">
            {t('clienteMasterListPage.title')}
          </h1>
          <p className="text-slate-600 text-sm">
            {t('clienteMasterListPage.subtitle')}
          </p>
        </div>
        {canCreate && (
          <Button 
            onClick={handleOpenCreateModal}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
          >
            <Icon iconName="add" className="mr-2" />
            {t('clienteMasterListPage.addNewButton')}
          </Button>
        )}
      </div>

      {clienteMasters.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow border">
          <Icon iconName="domain_add" className="text-5xl text-slate-400 mb-3" />
          <p className="text-slate-500 mb-3">{t('clienteMasterListPage.noRecordsFound')}</p>
          {canCreate && (
            <Button 
              variant="secondary"
              onClick={handleOpenCreateModal}
            >
               {t('clienteMasterListPage.createFirstButton')}
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('clienteMasterListPage.tableNameHeader')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('clienteMasterListPage.tableAdminNotesHeader')}
                </th>
                {/* Add client count header later */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('clienteMasterListPage.tableActionsHeader')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {clienteMasters.map((cm) => (
                <tr key={cm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cm.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cm.adminNotes || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canEdit && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenEditModal(cm)}
                      >
                        <Icon iconName="edit" className="text-xs mr-1" /> {t('clienteMasterListPage.editButton')}
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="danger-outlined" 
                        size="small"
                        onClick={() => handleDelete(cm.id, cm.name)}
                      >
                         <Icon iconName="delete" className="text-xs mr-1" /> {t('clienteMasterListPage.deleteButton')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ClienteMasterForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleFormSubmitSuccess}
        initialData={editingClienteMaster}
      />
    </div>
  );
};

export default ClienteMasterListPage;
