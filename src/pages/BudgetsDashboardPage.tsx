

import React, { useState, useEffect } from 'react';
import { BudgetDisplay, BudgetItemDetail, BudgetStatusType } from '../types/budget';
import Icon from '../components/ui/Icon'; 
import Button from '../components/ui/Button'; 

const mockBudgetItems: BudgetItemDetail[] = [
  { id: 'item1', name: 'Sofa', quantity: 1, unitPrice: 2000, totalPrice: 2000 },
  { id: 'item2', name: 'Coffee Table', quantity: 1, unitPrice: 500, totalPrice: 500 },
  { id: 'item3', name: 'Rug', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
];

const mockBudgetsData: BudgetDisplay[] = [
  {
    id: 'budget-0001',
    orderNumber: 'Order #12345',
    totalAmount: 5000,
    status: 'Draft',
    supplierName: 'Supplier A',
    items: mockBudgetItems,
  },
  {
    id: 'budget-0002',
    orderNumber: 'Order #67890',
    totalAmount: 7500,
    status: 'Sent',
    supplierName: 'Supplier B',
    items: [
      { id: 'item4', name: 'Dining Table', quantity: 1, unitPrice: 3000, totalPrice: 3000 },
      { id: 'item5', name: 'Dining Chairs', quantity: 6, unitPrice: 250, totalPrice: 1500 },
      { id: 'item6', name: 'Sideboard', quantity: 1, unitPrice: 3000, totalPrice: 3000 },
    ],
  },
  {
    id: 'budget-0003',
    orderNumber: 'Order #11223',
    totalAmount: 3200,
    status: 'Approved',
    supplierName: 'Supplier C',
    items: [
      { id: 'item7', name: 'Bed Frame', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
      { id: 'item8', name: 'Mattress', quantity: 1, unitPrice: 1000, totalPrice: 1000 },
      { id: 'item9', name: 'Nightstands', quantity: 2, unitPrice: 500, totalPrice: 1000 },
    ],
  },
];

const BudgetsDashboardPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetDisplay[]>(mockBudgetsData);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBudgets(mockBudgetsData);
      if (mockBudgetsData.length > 0) {
        setSelectedBudgetId(mockBudgetsData[0].id);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSelectBudget = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
  };
  
  // Using Tailwind classes directly now that they are in globals.css
  const getStatusBadgeClass = (status: BudgetStatusType) => {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Sent': return 'status-sent';
      case 'Approved': return 'status-approved';
      default: return 'bg-gray-200 text-gray-800'; // Fallback
    }
  };

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        <p className="ml-4 text-slate-700">Loading budgets...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-1 h-full max-h-[calc(100vh-var(--header-height,64px)-2rem)]"> {/* Adjust height based on actual header */}
      {/* Budget List Pane */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Budgets</h2>
          <Button 
            onClick={() => alert('New Budget clicked')}
            variant="primary"
            className="!h-9 !px-3 !text-xs !bg-[#c5d9eb] !text-gray-800 hover:!bg-opacity-90" // Matching style from HTML
          >
            <Icon iconName="add_circle_outline" className="text-lg mr-1" />
            New Budget
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-100">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                onClick={() => handleSelectBudget(budget.id)}
                className={`p-4 cursor-pointer border-l-4 hover:bg-gray-50
                            ${selectedBudgetId === budget.id ? 'border-l-[var(--color-primary)] bg-gray-50' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 text-sm font-medium">{budget.id.replace('budget-', 'Budget #')}</p>
                  <p className="text-gray-700 text-sm font-medium">${budget.totalAmount.toLocaleString()}</p>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{budget.orderNumber}</p>
                <span className={`mt-1 ${getStatusBadgeClass(budget.status)}`}>
                  {budget.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Detail Pane */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
        {selectedBudget ? (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 pb-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedBudget.id.replace('budget-', 'Budget #')}</h1>
                  <p className="text-gray-500 text-sm mt-1">Budget for {selectedBudget.orderNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outlined"
                    onClick={() => alert(`Edit ${selectedBudget.id}`)}
                    className="!h-10 !px-4 !text-sm !border-gray-300 !text-gray-700 hover:!bg-gray-50"
                  >
                    <Icon iconName="edit" className="text-lg mr-2" />
                    Edit Budget
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => alert(`Send ${selectedBudget.id}`)}
                    className="!h-10 !px-4 !text-sm !bg-[#c5d9eb] !text-gray-800 hover:!bg-opacity-90"
                  >
                    <Icon iconName="send" className="text-lg mr-2" />
                    Send to Supplier
                  </Button>
                </div>
              </div>
            </header>

            <section className="mb-8 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Order Number', value: selectedBudget.orderNumber },
                  { label: 'Supplier', value: selectedBudget.supplierName },
                  { label: 'Budget Amount', value: `$${selectedBudget.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isBold: true },
                  { label: 'Status', value: <span className={`${getStatusBadgeClass(selectedBudget.status)}`}>{selectedBudget.status}</span> }
                ].map(detail => (
                  <div key={detail.label} className="py-3 border-b border-gray-100 last:border-b-0">
                    <dt className="text-xs text-gray-500 uppercase font-medium">{detail.label}</dt>
                    <dd className={`text-sm text-gray-800 mt-0.5 ${detail.isBold ? 'font-semibold' : ''}`}>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
              <div className="overflow-x-auto @container"> {/* Ensure Tailwind JIT sees @container for responsiveness if needed */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBudget.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase">Total Budget</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">${selectedBudget.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <Icon iconName="request_quote" className="text-5xl mb-3" />
              <p>Select a budget from the list to view its details.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsDashboardPage;
