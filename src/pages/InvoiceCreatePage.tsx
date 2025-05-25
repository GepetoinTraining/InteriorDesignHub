import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { invoiceService } from '../services/invoiceService';
import { CreateInvoiceData, InvoiceItem, InvoiceStatus } from '../types/invoice';
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../hooks/useNotifier';

const InvoiceCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotifier();

  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
        const numValue = Number(value);
        (item[field] as number) = isNaN(numValue) ? 0 : numValue;
    } else if (field === 'description') {
        (item[field] as string) = value as string;
    }
    
    item.totalPrice = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.tenantId) {
      setError("Tenant information is missing. Cannot create invoice."); // TODO: Translate
      return;
    }

    // Basic Validation
    if (!clientId.trim() || !invoiceNumber.trim() || !dueDate) {
      setError("Client ID, Invoice Number, and Due Date are required."); // TODO: Translate
      return;
    }
    if (items.some(item => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      setError("All invoice items must have a description, positive quantity, and non-negative unit price."); // TODO: Translate
      return;
    }

    setIsLoading(true);
    setError(null);

    const invoiceData: CreateInvoiceData = {
      clientId,
      invoiceNumber,
      dueDate,
      items,
      totalAmount,
      status: InvoiceStatus.DRAFT, // Default status
      tenantId: currentUser.tenantId,
    };

    try {
      const newInvoice = await invoiceService.createInvoice(invoiceData);
      notify("Invoice created successfully!", { type: 'success' }); // TODO: Translate
      navigate(`/invoices/${newInvoice.id}`); // Navigate to detail page or list page
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      setError(err.message || "Failed to create invoice. Please try again."); // TODO: Translate
      notify(err.message || "Failed to create invoice.", { type: 'error' }); // TODO: Translate
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold">
            {t('invoicesPage.newInvoiceButton')} {/* Create Invoice */}
          </h1>
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            {t('addProductPage.backToListButton')} {/* Back to Invoices */}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">{t('addProductPage.errorMessagePrefix')} </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-slate-700 mb-1">
                {t('invoicesPage.tableHeaderInvoiceNumber')} {/* Invoice Number */}
              </label>
              <Input
                id="invoiceNumber"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g., INV-2024-001" // TODO: Translate
                required
              />
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-1">
                {t('invoicesPage.tableHeaderClient')} ID {/* Client ID */}
              </label>
              <Input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter Client ID" // TODO: Translate
                required
              />
              {/* Future: Replace with a client selection dropdown */}
            </div>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
              {t('invoicesPage.tableHeaderDueDate')} {/* Due Date */}
            </label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <hr />

          <h2 className="text-xl font-semibold text-slate-700 mb-3">
            {t('preBudget.itemsSectionTitle')} {/* Items */}
          </h2>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border rounded-md mb-3 items-end">
              <div className="md:col-span-5">
                <label htmlFor={`item-desc-${index}`} className="block text-xs font-medium text-slate-600">
                  {t('preBudget.tableHeaderDescription')} {/* Description */}
                </label>
                <Input
                  id={`item-desc-${index}`}
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Item or service description" // TODO: Translate
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`item-qty-${index}`} className="block text-xs font-medium text-slate-600">
                  {t('preBudget.tableHeaderQuantity')} {/* Qty */}
                </label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`item-price-${index}`} className="block text-xs font-medium text-slate-600">
                  {t('preBudget.tableHeaderUnitPrice')} {/* Unit Price */}
                </label>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="md:col-span-2 text-right">
                <p className="text-xs text-slate-500">{t('preBudget.tableHeaderTotalPrice')}</p> {/* Total */}
                <p className="text-sm font-medium text-slate-700">${item.totalPrice.toFixed(2)}</p>
              </div>
              <div className="md:col-span-1 flex items-center">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="mt-4"
                  >
                    <Icon iconName="delete" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem} className="mr-2">
            <Icon iconName="add" className="mr-2"/>
            {t('preBudget.buttonAddNewItem')} {/* Add Item */}
          </Button>

          <hr />
          
          <div className="flex justify-end items-center mt-6">
            <span className="text-xl font-semibold text-slate-800 mr-4">
              {t('invoicesPage.tableHeaderAmount')}: ${totalAmount.toFixed(2)} {/* Total Amount */}
            </span>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <Icon iconName="loader" className="animate-spin" />
              ) : (
                t('addProductPage.createProductButton') // Create Invoice (reuse translation for now)
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
