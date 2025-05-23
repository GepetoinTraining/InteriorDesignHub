
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';

type VendorInvoiceStatus = 'Paid' | 'Pending' | 'Unpaid';

interface VendorInvoice {
  id: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  status: VendorInvoiceStatus;
}

const mockVendorInvoices: VendorInvoice[] = [
  { id: 'vinv-001', supplierName: 'Modern Furniture Inc.', amount: 2500.00, dueDate: '2024-07-15', status: 'Paid' },
  { id: 'vinv-002', supplierName: 'Elegant Lighting Co.', amount: 1800.00, dueDate: '2024-07-20', status: 'Pending' },
  { id: 'vinv-003', supplierName: 'Luxury Textiles Ltd.', amount: 3200.00, dueDate: '2024-07-25', status: 'Unpaid' },
  { id: 'vinv-004', supplierName: 'Artistic Decor LLC', amount: 1500.00, dueDate: '2024-07-30', status: 'Paid' },
  { id: 'vinv-005', supplierName: 'Custom Carpets Inc.', amount: 2000.00, dueDate: '2024-08-05', status: 'Pending' },
  { id: 'vinv-006', supplierName: 'Steelworks Ltd.', amount: 500.00, dueDate: '2024-08-10', status: 'Unpaid' },
  { id: 'vinv-007', supplierName: 'Glass & Mirror LLC', amount: 1250.00, dueDate: '2024-08-15', status: 'Paid' },
];

type ActiveTab = 'vendors' | 'invoices';

const VendorsPage: React.FC = () => {
  const [invoices, setInvoices] = useState<VendorInvoice[]>(mockVendorInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('invoices');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.amount.toString().includes(searchTerm) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status: VendorInvoiceStatus): string => {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'Unpaid': return 'status-unpaid';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-50">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">Vendors</h1>
        <Button onClick={() => alert("New Vendor functionality coming soon!")} className="h-10 px-4">
          <Icon iconName="add_business" className="mr-2 text-lg" />
          New Vendor
        </Button>
      </header>

      <div className="mb-6">
        <label className="relative">
          <Icon iconName="search" className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="!pl-10 !pr-4 !py-2.5 !text-sm"
            placeholder="Search vendors or invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-3 text-sm font-medium hover:text-slate-700 ${activeTab === 'vendors' ? 'text-sky-600 border-b-2 border-sky-600 font-semibold' : 'text-slate-500'}`}
          >
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-3 text-sm font-medium hover:text-slate-700 ${activeTab === 'invoices' ? 'text-sky-600 border-b-2 border-sky-600 font-semibold' : 'text-slate-500'}`}
          >
            Invoices
          </button>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-900 text-xl font-semibold">Invoices</h2>
            <Button variant="secondary" onClick={() => alert("Import Invoices functionality coming soon!")} className="h-9 px-4 text-sm">
              <Icon iconName="file_upload" className="mr-2 text-lg" />
              Import Invoices
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 @container">
            {isLoading ? (
              <div className="text-center py-10"><p>Loading invoices...</p></div>
            ) : paginatedInvoices.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Icon iconName="receipt_long" className="text-4xl mb-2" />
                <p>No invoices found{searchTerm && ' matching your search'}.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-2/5">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-1/5 hidden sm:table-cell">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-1/5 hidden md:table-cell">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-1/5">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-auto"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedInvoices.map((invoice) => (
                    <tr key={invoice.id} data-id={invoice.id} className="hover:bg-slate-50">
                      <td data-label="Supplier" className="px-4 py-3 text-sm text-slate-700">{invoice.supplierName}</td>
                      <td data-label="Amount" className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">${invoice.amount.toFixed(2)}</td>
                      <td data-label="Due Date" className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{invoice.dueDate}</td>
                      <td data-label="Status" className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => alert(`View invoice ${invoice.id}`)} className="text-sky-600 hover:text-sky-700 text-sm font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center p-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center size-9 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <Icon iconName="chevron_left" className="text-xl" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center size-9 rounded-md text-sm font-medium mx-1 ${currentPage === page ? 'bg-sky-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center size-9 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <Icon iconName="chevron_right" className="text-xl" />
              </button>
            </nav>
          )}
        </>
      )}

      {activeTab === 'vendors' && (
        <div className="text-center py-10 text-slate-500">
          <Icon iconName="groups" className="text-4xl mb-2" />
          <p>Vendor list functionality coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
