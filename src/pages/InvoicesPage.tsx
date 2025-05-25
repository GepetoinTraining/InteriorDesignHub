
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { invoiceService } from '../services/invoiceService';
import { Invoice, InvoiceStatus } from '../types/invoice'; // Assuming InvoiceStatus is exported from types
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../hooks/useNotifier';

const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotifier();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({}); // For specific row actions

  const fetchInvoices = useCallback(async () => {
    if (!currentUser || !currentUser.tenantId) {
      setError(t('invoicesPage.errorLoading')); // Or a more specific tenant error
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceService.listInvoices({ tenantId: currentUser.tenantId });
      // Calculate 'Overdue' status dynamically
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const processedInvoices = data.invoices.map(inv => {
        if (inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED) {
          const dueDate = new Date(inv.dueDate);
          if (dueDate < today) {
            return { ...inv, status: InvoiceStatus.OVERDUE };
          }
        }
        return inv;
      });
      setInvoices(processedInvoices);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setError(t('invoicesPage.errorLoading'));
      notify(t('invoicesPage.errorLoading'), { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, t, notify]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
      (invoice.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || // Assuming client is populated
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.totalAmount.toString().includes(searchTerm) ||
      t(`invoiceStatus.${invoice.status}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm, t]);

  const getStatusBadgeClass = (status: InvoiceStatus): string => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800';
      case InvoiceStatus.SEFAZ_SENT: return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-800';
      case InvoiceStatus.PENDING_PAYMENT: return 'bg-yellow-100 text-yellow-800';
      case InvoiceStatus.XML_GENERATED: return 'bg-indigo-100 text-indigo-800';
      case InvoiceStatus.SEFAZ_ERROR: return 'bg-pink-100 text-pink-800';
      case InvoiceStatus.CANCELLED: return 'bg-red-200 text-red-900';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };
  
  const handleNewInvoice = () => {
    navigate('/invoices/new');
  };

  const handleGenerateXml = async (invoiceId: string, invoiceNumber: string) => {
    setActionLoading(prev => ({...prev, [`xml-${invoiceId}`]: true}));
    try {
      const result = await invoiceService.generateInvoiceXml(invoiceId);
      notify(t('invoicesPage.successGeneratingXml', { invoiceNumber }), { type: 'success' });
      // Update local state or refetch
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, status: result.status as InvoiceStatus, xmlContent: result.xmlContent} : inv));
    } catch (err) {
      console.error("Error generating XML:", err);
      notify(t('invoicesPage.errorGeneratingXml'), { type: 'error' });
    } finally {
      setActionLoading(prev => ({...prev, [`xml-${invoiceId}`]: false}));
    }
  };

  const handleSendToSefaz = async (invoiceId: string, invoiceNumber: string) => {
    setActionLoading(prev => ({...prev, [`sefaz-${invoiceId}`]: true}));
    try {
      const result = await invoiceService.sendInvoiceToSefaz(invoiceId);
      notify(t('invoicesPage.successSendingToSefaz', { invoiceNumber, protocol: result.sefazReference }), { type: 'success' });
      // Update local state or refetch
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, status: result.status as InvoiceStatus, sefazReference: result.sefazReference} : inv));
    } catch (err: any) {
      console.error("Error sending to SEFAZ:", err);
      notify(t('invoicesPage.errorSendingToSefaz', { invoiceNumber, error: err.message || 'Unknown error' }), { type: 'error' });
       // Optionally update status to SEFAZ_ERROR if the backend doesn't do it on error HttpsError
       setInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId) {
          // Check if error indicates it should be marked as SEFAZ_ERROR
          // This part is tricky as backend might or might not update status on throwing error
          // For now, let's assume backend handles status update to SEFAZ_ERROR on failure if applicable
          // Or, we can optimistically set it if we know the error means it's a SEFAZ_ERROR
          // For the mock, the backend sets it.
        }
        return inv;
      }));
    } finally {
      setActionLoading(prev => ({...prev, [`sefaz-${invoiceId}`]: false}));
    }
  };


  return (
    <div className="px-4 sm:px-6 md:px-10 flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6">
          <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold leading-tight">{t('invoicesPage.title')}</h1>
          <Button onClick={handleNewInvoice} className="h-10 px-5">
            <Icon iconName="add" className="mr-2" />
            {t('invoicesPage.newInvoiceButton')}
          </Button>
        </div>

        <div className="px-4 py-5">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon iconName="search" className="text-xl" />
            </div>
            <Input
              className="!h-11 !pl-10 !pr-4 !py-2"
              placeholder={t('invoicesPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 py-3 @container">
          {isLoading ? (
            <div className="text-center py-10"><p>{t('invoicesPage.loading')}</p></div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <Icon iconName="error_outline" className="text-4xl mb-2"/>
              <p>{error}</p>
              <Button onClick={fetchInvoices} className="mt-4">
                {t('userManagementPage.tryAgainButton')}
              </Button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Icon iconName="receipt_long" className="text-4xl mb-2"/>
              <p>{searchTerm ? t('invoicesPage.noInvoicesFoundMatchingSearch') : t('invoicesPage.noInvoicesFound')}.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('invoicesPage.tableHeaderInvoiceNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('invoicesPage.tableHeaderClient')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">{t('invoicesPage.tableHeaderAmount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">{t('invoicesPage.tableHeaderDueDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('invoicesPage.tableHeaderStatus')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('invoicesPage.tableHeaderActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{invoice.invoiceNumber}</td>
                      {/* TODO: Fetch and display client name. For now, using clientId or placeholder */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{invoice.client?.name || invoice.clientId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">${invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClass(invoice.status)}`}>
                          {t(`invoiceStatus.${invoice.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="link" onClick={() => handleViewInvoice(invoice.id)} className="mr-2 p-1">
                          {t('invoicesPage.viewButton')}
                        </Button>
                        {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.PENDING_PAYMENT || invoice.status === InvoiceStatus.SEFAZ_ERROR) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateXml(invoice.id, invoice.invoiceNumber)} 
                            disabled={actionLoading[`xml-${invoice.id}`]}
                            className="mr-2"
                          >
                            {actionLoading[`xml-${invoice.id}`] ? t('invoicesPage.loading') : t('invoicesPage.generateXmlButton')}
                          </Button>
                        )}
                        {invoice.status === InvoiceStatus.XML_GENERATED && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendToSefaz(invoice.id, invoice.invoiceNumber)}
                            disabled={actionLoading[`sefaz-${invoice.id}`]}
                          >
                             {actionLoading[`sefaz-${invoice.id}`] ? t('invoicesPage.loading') : t('invoicesPage.sendToSefazButton')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;