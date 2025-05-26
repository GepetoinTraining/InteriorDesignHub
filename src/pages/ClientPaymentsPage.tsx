
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface Payment {
  id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

const mockPayments: Payment[] = [
  { id: 'pay-001', invoiceId: 'INV-2024-001', clientName: 'Alice Wonderland', amount: 1500.00, paymentDate: '2024-07-10', paymentMethod: 'Credit Card', status: 'Completed' },
  { id: 'pay-002', invoiceId: 'INV-2024-002', clientName: 'Bob The Builder', amount: 850.00, paymentDate: '2024-07-12', paymentMethod: 'Bank Transfer', status: 'Pending' },
  { id: 'pay-003', invoiceId: 'INV-2024-003', clientName: 'Catherine Zeta', amount: 2500.00, paymentDate: '2024-07-15', paymentMethod: 'Credit Card', status: 'Completed' },
  { id: 'pay-004', invoiceId: 'INV-2024-004', clientName: 'David Copperfield', amount: 120.00, paymentDate: '2024-07-18', paymentMethod: 'PayPal', status: 'Failed' },
];

const ClientPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(payment =>
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  const getStatusBadgeVariant = (status: Payment['status']): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 flex flex-1 justify-center py-8 bg-slate-50">
      <div className="layout-content-container flex flex-col w-full max-w-5xl">
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6">
          <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold leading-tight">Client Payments</h1>
          <Button onClick={() => alert("Make a Payment action (redirect to payment popup)")} className="h-10 px-5">
            <Icon iconName="payment" className="mr-2" />
            Make a Payment
          </Button>
        </div>

        <div className="px-4 py-5">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon iconName="search" className="text-xl" />
            </div>
            <Input
              className="!h-11 !pl-10 !pr-4 !py-2"
              placeholder="Search payments by invoice ID, client, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 py-3 @container">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Icon iconName="credit_card_off" className="text-4xl mb-2"/>
              <p>No payments found{searchTerm && ' matching your search'}.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden sm:table-cell">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden md:table-cell">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{payment.invoiceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{payment.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{payment.paymentDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(payment.status)} size="small">
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => alert(`View details for payment ${payment.id}`)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          Details
                        </button>
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

export default ClientPaymentsPage;