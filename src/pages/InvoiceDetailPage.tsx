import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { invoiceService } from '../services/invoiceService';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../hooks/useNotifier';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';

const InvoiceDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotifier();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});


  const fetchInvoiceDetails = React.useCallback(async () => {
    if (!invoiceId || !currentUser) {
      setError(t('invoicesPage.errorLoading')); // Or a specific error
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedInvoice = await invoiceService.getInvoice(invoiceId);
      if (!fetchedInvoice) {
        setError(t('invoicesPage.noInvoicesFound')); // Or "Invoice not found"
        notify(t('invoicesPage.noInvoicesFound'), { type: 'error' });
        setInvoice(null);
      } else {
        // Dynamic overdue check
        let currentStatus = fetchedInvoice.status;
        if (currentStatus !== InvoiceStatus.PAID && currentStatus !== InvoiceStatus.CANCELLED) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const dueDate = new Date(fetchedInvoice.dueDate);
            if (dueDate < today) {
                currentStatus = InvoiceStatus.OVERDUE;
            }
        }
        setInvoice({...fetchedInvoice, status: currentStatus});
      }
    } catch (err: any) {
      console.error("Error fetching invoice details:", err);
      setError(err.message || t('invoicesPage.errorLoading'));
      notify(err.message || t('invoicesPage.errorLoading'), { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, currentUser, t, notify]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  const handleGenerateXml = async () => {
    if (!invoice || !invoice.id) return;
    setActionLoading(prev => ({...prev, xml: true}));
    try {
      const result = await invoiceService.generateInvoiceXml(invoice.id);
      notify(t('invoicesPage.successGeneratingXml', { invoiceNumber: invoice.invoiceNumber }), { type: 'success' });
      setInvoice(prev => prev ? {...prev, status: result.status as InvoiceStatus, xmlContent: result.xmlContent } : null);
    } catch (err) {
      console.error("Error generating XML:", err);
      notify(t('invoicesPage.errorGeneratingXml'), { type: 'error' });
    } finally {
      setActionLoading(prev => ({...prev, xml: false}));
    }
  };

  const handleSendToSefaz = async () => {
    if (!invoice || !invoice.id) return;
    setActionLoading(prev => ({...prev, sefaz: true}));
    try {
      const result = await invoiceService.sendInvoiceToSefaz(invoice.id);
      notify(t('invoicesPage.successSendingToSefaz', { invoiceNumber: invoice.invoiceNumber, protocol: result.sefazReference }), { type: 'success' });
      setInvoice(prev => prev ? {...prev, status: result.status as InvoiceStatus, sefazReference: result.sefazReference } : null);
    } catch (err: any) {
      console.error("Error sending to SEFAZ:", err);
      notify(t('invoicesPage.errorSendingToSefaz', { invoiceNumber: invoice.invoiceNumber, error: err.message || 'Unknown error' }), { type: 'error' });
    } finally {
      setActionLoading(prev => ({...prev, sefaz: false}));
    }
  };
  
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

  if (isLoading) {
    return <div className="text-center py-10"><p>{t('invoicesPage.loading')}</p></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <Icon iconName="error_outline" className="text-4xl mb-2"/>
        <p>{error}</p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          {t('addProductPage.backToListButton')} {/* Back to Invoices List */}
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-10 text-slate-500">
        <Icon iconName="receipt_long" className="text-4xl mb-2"/>
        <p>{t('invoicesPage.noInvoicesFound')}</p>
         <Button onClick={() => navigate('/invoices')} className="mt-4">
            {t('addProductPage.backToListButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold">
            {/* Invoice Details */} {t('invoicesPage.title')} #{invoice.invoiceNumber} 
          </h1>
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            <Icon iconName="arrow_back" className="mr-2"/>
            {t('addProductPage.backToListButton')} {/* Back to Invoices List */}
          </Button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500">{t('invoicesPage.tableHeaderClient')}</h3>
              <p className="text-slate-900 text-lg">{invoice.client?.name || invoice.clientId}</p> {/* TODO: Ensure client name is available */}
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{t('invoicesPage.tableHeaderInvoiceNumber')}</h3>
              <p className="text-slate-900 text-lg">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{t('invoicesPage.tableHeaderStatus')}</h3>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold leading-5 ${getStatusBadgeClass(invoice.status)}`}>
                {t(`invoiceStatus.${invoice.status}`)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{t('invoicesPage.tableHeaderAmount')}</h3>
              <p className="text-slate-900 text-lg">${invoice.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{t('invoicesPage.tableHeaderDueDate')}</h3>
              <p className="text-slate-900 text-lg">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
             <div>
              <h3 className="text-sm font-medium text-slate-500">Issue Date</h3> {/* TODO: Translate */}
              <p className="text-slate-900 text-lg">{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.PENDING_PAYMENT || invoice.status === InvoiceStatus.SEFAZ_ERROR) && (
            <Button 
                variant="primary" 
                onClick={handleGenerateXml} 
                disabled={actionLoading.xml}
                className="mr-3 mb-3"
            >
                {actionLoading.xml ? t('invoicesPage.loading') : t('invoicesPage.generateXmlButton')}
            </Button>
          )}
          {invoice.status === InvoiceStatus.XML_GENERATED && (
             <Button 
                variant="primary" 
                onClick={handleSendToSefaz}
                disabled={actionLoading.sefaz}
                className="mr-3 mb-3"
            >
                {actionLoading.sefaz ? t('invoicesPage.loading') : t('invoicesPage.sendToSefazButton')}
            </Button>
          )}
          {/* Add more actions as needed, e.g., Edit, Cancel, Record Payment */}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('preBudget.itemsSectionTitle')}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('preBudget.tableHeaderDescription')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('preBudget.tableHeaderQuantity')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('preBudget.tableHeaderUnitPrice')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('preBudget.tableHeaderTotalPrice')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right">${item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoice.xmlContent && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">XML Content</h2> {/* TODO: Translate */}
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {invoice.xmlContent}
            </pre>
          </div>
        )}

        {invoice.sefazReference && (
           <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">SEFAZ Reference</h2> {/* TODO: Translate */}
            <p className="text-slate-800">
                Status: <span className="font-semibold">{t(`invoiceStatus.${invoice.status}`)}</span>
            </p>
            <p className="text-slate-800">
                Reference/Protocol: <span className="font-semibold">{invoice.sefazReference}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
