
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as prebudgetService from '../services/prebudgetService';
import { PreBudget, PreBudgetItem } from '../types/budget';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';

const PreBudgetDetailsPage: React.FC = () => {
  const { preBudgetId } = useParams<{ preBudgetId: string }>();
  const navigate = useNavigate();
  const [preBudget, setPreBudget] = useState<PreBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preBudgetId) {
      setError("No pre-budget ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await prebudgetService.fetchPreBudgetById(preBudgetId);
        if (data) {
          setPreBudget(data);
        } else {
          setError(`Pre-budget with ID ${preBudgetId} not found.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch pre-budget details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [preBudgetId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Pre-Budget Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Error Loading Pre-Budget</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={() => navigate('/prebudgets/new')} variant="secondary">
          Back to Pre-Budgets
        </Button>
      </div>
    );
  }

  if (!preBudget) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="find_in_page" className="text-slate-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold">Pre-Budget Not Found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 px-0 py-3 mb-6 text-sm">
        <Link to="/prebudgets/new" className="text-slate-500 hover:text-[var(--color-primary)] font-medium leading-normal transition-colors">Pre-Budget</Link>
        <span className="text-slate-400 font-medium leading-normal">/</span>
        <span className="text-slate-900 font-medium leading-normal">Pre-Budget Details</span>
      </div>

      <div className="flex flex-wrap justify-between items-start gap-4 p-0 mb-6">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-slate-900 text-3xl font-bold leading-tight">Pre-Budget Details</h1>
          <p className="text-slate-500 text-sm font-normal leading-normal">View and manage the details of this pre-budget.</p>
        </div>
        <Button 
          onClick={() => alert('Edit functionality coming soon!')} // Placeholder for edit
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Icon iconName="edit" className="mr-2 text-base" />
          Edit Pre-Budget
        </Button>
      </div>

      {/* Client and Meta Info Section */}
      <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-slate-900 text-xl font-semibold leading-tight mb-4">General Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Client Name:</dt>
            <dd className="text-slate-800 mt-0.5">{preBudget.clientName}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Pre-Budget ID:</dt>
            <dd className="text-slate-800 mt-0.5">{preBudget.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Status:</dt>
            <dd className="text-slate-800 mt-0.5">
                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    preBudget.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    preBudget.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                    preBudget.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800' // Draft or Archived
                }`}>
                    {preBudget.status}
                </span>
            </dd>
          </div>
           <div>
            <dt className="font-medium text-slate-500">Created At:</dt>
            <dd className="text-slate-800 mt-0.5">{formatDate(preBudget.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Last Updated:</dt>
            <dd className="text-slate-800 mt-0.5">{formatDate(preBudget.updatedAt)}</dd>
          </div>
          {preBudget.notes && (
            <div className="md:col-span-2">
              <dt className="font-medium text-slate-500">Notes:</dt>
              <dd className="text-slate-700 mt-0.5 whitespace-pre-wrap">{preBudget.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Items Table Section */}
      <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden mb-6">
        <h2 className="text-slate-900 text-xl font-semibold leading-tight px-6 py-4 border-b border-slate-200">Items</h2>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {preBudget.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{item.productType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right hidden md:table-cell">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium text-right">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Summary Section */}
        <div className="border-t border-slate-200 px-6 py-4">
          <h3 className="text-slate-900 text-lg font-semibold leading-tight mb-3">Summary</h3>
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-800">{formatCurrency(preBudget.subTotal)}</span>
            </div>
            {preBudget.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount:</span>
                <span className="font-medium text-green-600">-{formatCurrency(preBudget.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax ({ (preBudget.taxRate * 100).toFixed(0) }%):</span>
              <span className="font-medium text-slate-800">{formatCurrency(preBudget.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[var(--color-primary)] pt-2 border-t border-slate-200 mt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(preBudget.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4">
          <Button variant="secondary" onClick={() => alert("Send to client functionality coming soon!")}>
            <Icon iconName="send" className="mr-2 text-base" /> Send to Client
          </Button>
          <Button variant="primary" onClick={() => alert("Convert to quote functionality coming soon!")}>
            <Icon iconName="request_quote" className="mr-2 text-base" /> Convert to Formal Quote
          </Button>
      </div>

    </div>
  );
};

export default PreBudgetDetailsPage;
