
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';

type InvoiceStatus = 'Paid' | 'Sent' | 'Draft' | 'Overdue';

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

const mockInvoices: Invoice[] = [
  { id: 'inv-001', clientName: 'Emily Carter', amount: 1200.00, dueDate: '2024-05-15', status: 'Paid' },
  { id: 'inv-002', clientName: 'David Lee', amount: 850.00, dueDate: '2024-05-20', status: 'Sent' },
  { id: 'inv-003', clientName: 'Sophia Clark', amount: 2500.00, dueDate: '2024-05-25', status: 'Draft' },
  { id: 'inv-004', clientName: 'Ethan Harris', amount: 1500.00, dueDate: '2024-04-30', status: 'Overdue' }, // Past due date
  { id: 'inv-005', clientName: 'Olivia White', amount: 600.00, dueDate: '2024-06-05', status: 'Sent' },
  { id: 'inv-006', clientName: 'James Brown', amount: 3200.00, dueDate: '2024-06-10', status: 'Paid' },
  { id: 'inv-007', clientName: 'Isabella Garcia', amount: 750.00, dueDate: '2024-06-15', status: 'Draft' },
];

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isLoading, setIsLoading] = useState(false); // For future API calls
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Calculate 'Overdue' status dynamically based on current date for demo purposes
  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0); // Normalize today's date to midnight for comparison

    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => {
        if (invoice.status !== 'Paid' && invoice.status !== 'Draft') {
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < today) {
            return { ...invoice, status: 'Overdue' };
          }
        }
        return invoice;
      })
    );
  }, []);


  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.amount.toString().includes(searchTerm) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const getStatusBadgeClass = (status: InvoiceStatus): string => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    alert(`View details for invoice ${invoiceId} - (Not implemented yet)`);
    // navigate(`/invoices/${invoiceId}`); // Future route
  };

  const handleRemindClient = (invoiceId: string) => {
    alert(`Send reminder for invoice ${invoiceId} - (Not implemented yet)`);
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6">
          <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold leading-tight">Invoices</h1>
          <Button onClick={() => alert("New Invoice creation coming soon!")} className="h-10 px-5">
            <Icon iconName="add" className="mr-2" />
            New Invoice
          </Button>
        </div>

        <div className="px-4 py-5">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon iconName="search" className="text-xl" />
            </div>
            <Input
              className="!h-11 !pl-10 !pr-4 !py-2"
              placeholder="Search invoices by client, amount, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 py-3 @container">
          {isLoading ? (
            <div className="text-center py-10"><p>Loading invoices...</p></div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Icon iconName="receipt_long" className="text-4xl mb-2"/>
              <p>No invoices found{searchTerm && ' matching your search'}.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{invoice.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{invoice.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleViewInvoice(invoice.id)} className="text-blue-600 hover:text-blue-800 transition-colors">View</button>
                        {(invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                          <button onClick={() => handleRemindClient(invoice.id)} className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors">Remind</button>
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