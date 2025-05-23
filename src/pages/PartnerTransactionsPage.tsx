

import React, { useState, useMemo, useEffect } from 'react';
import { PartnerTransaction } from '../types/partnerTransaction';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge'; // Import Badge component

// Mock Data (assuming current tenant is "Design Firm A")
const MOCK_PAYABLES: PartnerTransaction[] = [
  { id: 'payable-1', partnerTenantId: 'tenant-b', partnerTenantName: 'Supplier B (Artisan Goods)', projectName: 'Luxury Apartment Build', itemDescription: 'Custom Millwork Package', amount: 3500, dueDate: '2024-08-15', status: 'Pending Payment', fundingStatus: 'Funds Received From Client', type: 'payable', transactionDate: '2024-07-01' },
  { id: 'payable-2', partnerTenantId: 'tenant-c', partnerTenantName: 'Installer Pro Services', projectName: 'Retail Space Fit-out', itemDescription: 'Specialty Lighting Installation', amount: 1200, dueDate: '2024-07-30', status: 'Pending Payment', fundingStatus: 'Awaiting Client Payment', type: 'payable', transactionDate: '2024-07-05' },
  { id: 'payable-3', partnerTenantId: 'tenant-d', partnerTenantName: 'Fabric Warehouse Direct', projectName: 'Boutique Hotel Furnishings', itemDescription: 'Bulk Velvet Fabric Order', amount: 5200, dueDate: '2024-07-20', status: 'Paid', fundingStatus: 'Funds Received From Client', type: 'payable', transactionDate: '2024-06-15', paymentDate: '2024-07-10' },
  { id: 'payable-4', partnerTenantId: 'tenant-b', partnerTenantName: 'Supplier B (Artisan Goods)', projectName: 'Residential Renovation', itemDescription: 'Hand-blown Glass Fixtures', amount: 850, dueDate: '2024-08-05', status: 'Overdue', fundingStatus: 'Funds Received From Client', type: 'payable', transactionDate: '2024-06-25' },
  { id: 'payable-5', partnerTenantId: 'tenant-e', partnerTenantName: 'Tech Consultants Inc.', itemDescription: 'Software Subscription - Annual', amount: 300, dueDate: '2024-07-28', status: 'Pending Payment', fundingStatus: 'N/A', type: 'payable', transactionDate: '2024-07-01'},
];

const MOCK_RECEIVABLES: PartnerTransaction[] = [
  { id: 'receivable-1', partnerTenantId: 'tenant-x', partnerTenantName: 'Client X (Design Firm)', projectName: 'Project Phoenix', itemDescription: 'Wholesale Furniture Supply', amount: 7800, dueDate: '2024-08-01', status: 'Awaiting Payment', type: 'receivable', transactionDate: '2024-07-10' },
  { id: 'receivable-2', partnerTenantId: 'tenant-y', partnerTenantName: 'Client Y (Contractor)', projectName: 'Commercial Build', itemDescription: 'Consulting Services Q2', amount: 2500, dueDate: '2024-07-25', status: 'Paid', type: 'receivable', transactionDate: '2024-06-20', paymentDate: '2024-07-15' },
  { id: 'receivable-3', partnerTenantId: 'tenant-z', partnerTenantName: 'Client Z (Retailer)', itemDescription: 'Decor Items - Batch 3', amount: 1500, dueDate: '2024-07-15', status: 'Overdue', type: 'receivable', transactionDate: '2024-06-01' },
];


const PartnerTransactionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payables' | 'receivables'>('payables');
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching data based on active tab
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setTransactions(activeTab === 'payables' ? MOCK_PAYABLES : MOCK_RECEIVABLES);
      setIsLoading(false);
    }, 500);
  }, [activeTab]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(transaction =>
      transaction.partnerTenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.projectName && transaction.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.fundingStatus && transaction.fundingStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [transactions, searchTerm]);

  const handleTabChange = (tab: 'payables' | 'receivables') => {
    setActiveTab(tab);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadgeVariant = (status: PartnerTransaction['status']): 'success' | 'warning' | 'error' | 'primary' | 'secondary' => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Overdue': return 'error';
      case 'Pending Payment':
      case 'Awaiting Payment': return 'warning';
      case 'Disputed': return 'error'; // Or a different color for disputed
      default: return 'secondary';
    }
  };
  
  const getFundingStatusBadgeVariant = (status?: PartnerTransaction['fundingStatus']): 'success' | 'warning' | 'secondary' => {
    switch (status) {
      case 'Funds Received From Client': return 'success';
      case 'Awaiting Client Payment': return 'warning';
      default: return 'secondary'; // For N/A or undefined
    }
  };


  const renderTable = () => {
    if (isLoading) {
      return <div className="text-center py-10 text-slate-500">Loading transactions...</div>;
    }
    if (filteredTransactions.length === 0) {
      return <div className="text-center py-10 text-slate-500">No transactions found.</div>;
    }

    return (
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {activeTab === 'payables' ? 'Payable To' : 'Receivable From'}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Project</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Due Date</th>
              {activeTab === 'payables' && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funding Status</th>
              )}
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{transaction.partnerTenantName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{transaction.projectName || 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 max-w-xs truncate" title={transaction.itemDescription}>{transaction.itemDescription}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right font-semibold">${transaction.amount.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{formatDate(transaction.dueDate)}</td>
                {activeTab === 'payables' && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <Badge variant={getFundingStatusBadgeVariant(transaction.fundingStatus)} size="small">
                      {transaction.fundingStatus || 'N/A'}
                    </Badge>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Badge variant={getStatusBadgeVariant(transaction.status)} size="small">
                    {transaction.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {/* Fix: Removed unsupported 'size' prop. Sizing is handled by className '!h-7 !px-2 !text-xs'. */}
                  <Button variant="outlined" className="!h-7 !px-2 !text-xs" onClick={() => alert(`View details for ${transaction.id}`)}>
                    Details
                  </Button>
                  {activeTab === 'payables' && transaction.status === 'Pending Payment' && transaction.fundingStatus === 'Funds Received From Client' && (
                    // Fix: Removed unsupported 'size' prop. Sizing is handled by className 'ml-2 !h-7 !px-2 !text-xs'.
                    <Button variant="primary" className="ml-2 !h-7 !px-2 !text-xs" onClick={() => alert(`Mark ${transaction.id} as paid`)}>
                      Mark Paid
                    </Button>
                  )}
                   {activeTab === 'receivables' && transaction.status === 'Awaiting Payment' && (
                    // Fix: Removed unsupported 'size' prop. Sizing is handled by className 'ml-2 !h-7 !px-2 !text-xs'.
                    <Button variant="primary" className="ml-2 !h-7 !px-2 !text-xs" onClick={() => alert(`Send reminder for ${transaction.id}`)}>
                      Send Reminder
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Partner Transactions</h1>
        <Button 
            onClick={() => alert("New Transaction functionality coming soon!")} 
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Icon iconName="add_circle" className="mr-2 text-base" />
          New Transaction
        </Button>
      </div>

      <div className="mb-4 border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('payables')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors
              ${activeTab === 'payables' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            aria-current={activeTab === 'payables' ? 'page' : undefined}
          >
            Payables to Partners
          </button>
          <button
            onClick={() => handleTabChange('receivables')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors
              ${activeTab === 'receivables' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            aria-current={activeTab === 'receivables' ? 'page' : undefined}
          >
            Receivables from Partners
          </button>
        </nav>
      </div>

      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder={`Search ${activeTab === 'payables' ? 'payables' : 'receivables'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!pl-10 w-full"
          aria-label="Search transactions"
        />
      </div>
      
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-md mb-4">{error}</div>}

      <div className="flex-grow bg-white shadow-md rounded-lg border border-slate-200 overflow-hidden">
        {renderTable()}
      </div>
    </div>
  );
};

export default PartnerTransactionsPage;
