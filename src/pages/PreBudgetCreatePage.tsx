
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PreBudgetItem as LocalPreBudgetItemType, PreBudgetProductType } from '../types/budget'; // Assuming this is the local type for form items
import { PreBudgetItem, PreBudgetStatus, NewPreBudgetData } from '../types/prebudget'; // Canonical types
import * as preBudgetService from '../services/preBudgetService';
import * as preBudgetItemService from '../services/preBudgetItemService'; // Import item service
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../hooks/useNotifier';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';

// Temporary definition for form's item state to include customInputsJsonString
interface FormPreBudgetItem extends Omit<LocalPreBudgetItemType, 'id' | 'totalPrice' | 'customInputsJson'> {
  productName: string;
  productType: PreBudgetProductType;
  quantity: number;
  unitPrice: number;
  customInputsJsonString?: string; // For textarea input
  customInputsJson?: any; // Parsed JSON
  notes?: string; // Item specific notes
}

// Item that gets stored in the `items` array, with an ID and calculated total
interface StoredPreBudgetItem extends FormPreBudgetItem {
    id: string; // Client-side generated ID for list management
    totalPrice: number;
}


const productTypesArray: PreBudgetProductType[] = ['Curtains', 'Blinds', 'Shades', 'Furniture', 'Decor', 'Lighting', 'Textiles', 'Accessories', 'Flooring', 'Wallpaper', 'Paint', 'Services', 'Other'];

const PreBudgetCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotifier();

  const [clientName, setClientName] = useState('');
  const [projectScope, setProjectScope] = useState(''); // New state for projectScope
  const [items, setItems] = useState<StoredPreBudgetItem[]>([]); // Use StoredPreBudgetItem
  const [currentItem, setCurrentItem] = useState<FormPreBudgetItem>({ // Use FormPreBudgetItem
    productName: '',
    productType: 'Other', 
    quantity: 1,
    unitPrice: 0,
    customInputsJsonString: '',
    notes: '',
  });
  const [currentItemTotalPrice, setCurrentItemTotalPrice] = useState('0.00');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [taxRate, setTaxRate] = useState('0'); 
  const [notes, setNotes] = useState(''); // Overall PreBudget notes

  const [isSaving, setIsSaving] = useState(false);
  // Using useNotifier now, so local message state might be less needed or used for specific form errors
  // const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const quantity = Number(currentItem.quantity);
    const unitPrice = Number(currentItem.unitPrice);
    if (!isNaN(quantity) && !isNaN(unitPrice) && quantity >= 0 && unitPrice >= 0) {
      setCurrentItemTotalPrice((quantity * unitPrice).toFixed(2));
    } else {
      setCurrentItemTotalPrice('0.00');
    }
  }, [currentItem.quantity, currentItem.unitPrice]);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'unitPrice') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddItem = () => {
    if (!currentItem.productName.trim() || currentItem.quantity <= 0 || currentItem.unitPrice < 0) {
      notify(t('preBudget.errorItemValidation'), { type: 'error' });
      return;
    }

    let parsedCustomJson: any = null;
    if (currentItem.customInputsJsonString) {
      try {
        parsedCustomJson = JSON.parse(currentItem.customInputsJsonString);
      } catch (error) {
        notify(t('preBudget.errorInvalidJson'), { type: 'error' });
        return;
      }
    }

    const newItem: StoredPreBudgetItem = {
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Client-side ID
      ...currentItem,
      quantity: Number(currentItem.quantity),
      unitPrice: Number(currentItem.unitPrice),
      totalPrice: parseFloat(currentItemTotalPrice),
      customInputsJson: parsedCustomJson, // Store parsed JSON
    };
    setItems(prev => [...prev, newItem]);
    // Reset currentItem form, including customInputsJsonString
    setCurrentItem({ productName: '', productType: 'Other', quantity: 1, unitPrice: 0, customInputsJsonString: '', notes: '' });
    setCurrentItemTotalPrice('0.00');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [items]);

  const calculatedTaxAmount = useMemo(() => {
    const numericDiscount = parseFloat(discountAmount) || 0;
    const numericTaxRatePercent = parseFloat(taxRate) || 0;
    if (isNaN(subTotal) || isNaN(numericDiscount) || isNaN(numericTaxRatePercent)) return 0;
    const taxableAmount = subTotal - numericDiscount;
    return taxableAmount > 0 ? taxableAmount * (numericTaxRatePercent / 100) : 0;
  }, [subTotal, discountAmount, taxRate]);

  const calculatedGrandTotal = useMemo(() => {
    const numericDiscount = parseFloat(discountAmount) || 0;
    if (isNaN(subTotal) || isNaN(numericDiscount) || isNaN(calculatedTaxAmount)) return 0;
    return subTotal - numericDiscount + calculatedTaxAmount;
  }, [subTotal, discountAmount, calculatedTaxAmount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !currentUser.tenantId) {
      notify(t('preBudget.errorNoTenant'), { type: 'error' });
      return;
    }
    if (!clientName.trim()) {
      notify(t('preBudget.errorClientNameRequired'), { type: 'error' });
      return;
    }
     if (!projectScope.trim()) {
      notify(t('preBudget.errorProjectScopeRequired'), { type: 'error' });
      return;
    }
    if (items.length === 0) {
      notify(t('preBudget.errorNoItems'), { type: 'error' });
      return;
    }

    setIsSaving(true);

    const preBudgetDataForHeader: NewPreBudgetData = {
      clientName,
      projectScope, // Added
      estimatedCost: calculatedGrandTotal, // Use calculated grand total as initial estimate
      status: PreBudgetStatus.DRAFT,
      // tenantId is added by service using currentUser
      notes: notes || undefined,
      subTotal: subTotal,
      discountAmount: parseFloat(discountAmount) || 0,
      taxRate: (parseFloat(taxRate) || 0) / 100, // Store as decimal
      taxAmount: calculatedTaxAmount,
      grandTotal: calculatedGrandTotal,
    };

    try {
      const createdPreBudget = await preBudgetService.addPreBudget(preBudgetDataForHeader, currentUser.tenantId);
      
      // Now add items
      let itemsSavedSuccessfully = true;
      for (const item of items) {
        const itemData: preBudgetItemService.AddPreBudgetItemData = {
          preBudgetId: createdPreBudget.id,
          productId: item.productId, // Assuming StoredPreBudgetItem might have productId
          customDescription: item.productName, // Using productName as customDescription
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customInputsJson: item.customInputsJson,
          notes: item.notes,
        };
        try {
          await preBudgetItemService.addPreBudgetItem(itemData);
        } catch (itemError) {
          console.error("Error saving item:", item.productName, itemError);
          notify(t('preBudget.errorSavingItem', {itemName: item.productName }), { type: 'error' });
          itemsSavedSuccessfully = false;
          // Decide if to break or try saving other items
        }
      }

      if (itemsSavedSuccessfully) {
        notify(t('preBudget.saveSuccess'), { type: 'success' });
        // Reset form
        setClientName('');
        setProjectScope('');
        setItems([]);
        setCurrentItem({ productName: '', productType: 'Other', quantity: 1, unitPrice: 0, customInputsJsonString: '', notes: '' });
        setCurrentItemTotalPrice('0.00');
        setDiscountAmount('0');
        setTaxRate('0');
        setNotes('');
        navigate(`/prebudgets/${createdPreBudget.id}`); // Navigate to details page
      } else {
        notify(t('preBudget.savePartialSuccess'), { type: 'warning' });
        // Don't reset form if some items failed, allow user to retry or manage from details page
         navigate(`/prebudgets/${createdPreBudget.id}`); // Still navigate to see what was saved
      }

    } catch (error: any) {
      console.error("Save pre-budget error:", error);
      notify(error.message || t('preBudget.saveError'), { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
    }, [items]);


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Create New Pre-Budget</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${ message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200' }`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl flex flex-col flex-grow">
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
            {/* Client and Project Scope Section */}
            <section>
            <h2 className="text-slate-800 text-xl font-semibold leading-tight border-b border-slate-200 pb-3 mb-4">{t('preBudget.clientInfoTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 mb-1">{t('preBudget.labelClientName')} *</label>
                    <Input id="clientName" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required disabled={isSaving} placeholder={t('preBudget.placeholderClientName')} />
                </div>
                <div>
                    <label htmlFor="projectScope" className="block text-sm font-medium text-slate-700 mb-1">{t('preBudget.labelProjectScope')} *</label>
                    <Input id="projectScope" type="text" value={projectScope} onChange={(e) => setProjectScope(e.target.value)} required disabled={isSaving} placeholder={t('preBudget.placeholderProjectScope')} />
                </div>
            </div>
            </section>

            {/* Item Entry Section */}
            <section className="border border-slate-200 p-4 rounded-lg bg-slate-50/50">
            <h3 className="text-slate-700 text-lg font-semibold mb-3">{t('preBudget.addItemTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                <label htmlFor="productName" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelProductName')} *</label>
                <Input id="productName" name="productName" type="text" value={currentItem.productName} onChange={handleItemChange} placeholder={t('preBudget.placeholderProductName')} disabled={isSaving} className="!h-10 text-sm" />
                </div>
                <div>
                <label htmlFor="productType" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelProductType')} *</label>
                <select id="productType" name="productType" value={currentItem.productType} onChange={handleItemChange} className="form-select block w-full rounded-lg border-slate-300 bg-white h-10 px-3 text-sm text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" disabled={isSaving} >
                    {productTypesArray.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
                </div>
                <div>
                <label htmlFor="quantity" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelQuantity')} *</label>
                <Input id="quantity" name="quantity" type="number" value={currentItem.quantity.toString()} onChange={handleItemChange} placeholder="1" min="0.01" step="0.01" disabled={isSaving} className="!h-10 text-sm" />
                </div>
                <div>
                <label htmlFor="unitPrice" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelUnitPrice')} *</label>
                <Input id="unitPrice" name="unitPrice" type="number" value={currentItem.unitPrice.toString()} onChange={handleItemChange} placeholder="0.00" min="0" step="0.01" disabled={isSaving} className="!h-10 text-sm" />
                </div>
            </div>
             <div className="mt-3">
                <label htmlFor="customInputsJsonString" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelCustomInputsJson')}</label>
                <textarea id="customInputsJsonString" name="customInputsJsonString" value={currentItem.customInputsJsonString} onChange={handleItemChange} placeholder={t('preBudget.placeholderCustomInputsJson')} rows={3} disabled={isSaving} className="form-textarea block w-full rounded-lg border-slate-300 bg-white p-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
             <div className="mt-3">
                <label htmlFor="itemNotes" className="block text-xs font-medium text-slate-600 mb-1">{t('preBudget.labelItemNotes')}</label>
                <Input id="itemNotes" name="notes" type="text" value={currentItem.notes} onChange={handleItemChange} placeholder={t('preBudget.placeholderItemNotes')} disabled={isSaving} className="!h-10 text-sm" />
            </div>
            <div className="mt-3 text-right">
                <p className="text-sm text-slate-600">{t('preBudget.itemTotal')}: <span className="font-semibold text-slate-800">${currentItemTotalPrice}</span></p>
            </div>
            <div className="mt-4 flex justify-end">
                <Button type="button" onClick={handleAddItem} variant="secondary" disabled={isSaving} className="!h-9 text-xs">
                <Icon iconName="add_circle_outline" className="mr-1.5 text-sm" /> {t('preBudget.buttonAddItem')}
                </Button>
            </div>
            </section>

            {/* Added Items Table Section */}
            {items.length > 0 && (
            <section>
                <h3 className="text-slate-800 text-lg font-semibold mb-3">Pre-Budget Items</h3>
                <div ref={tableContainerRef} className="overflow-x-auto custom-scrollbar max-h-96 rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0 z-1">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product/Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                    {items.map(item => (
                        <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">{item.productName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{item.productType}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right hidden md:table-cell">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700 font-medium text-right">${item.totalPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                            <Button type="button" onClick={() => handleDeleteItem(item.id)} variant="outlined" className="text-red-600 border-red-300 hover:bg-red-50 !h-8 !px-2 !text-xs" disabled={isSaving}>
                            <Icon iconName="delete_outline" className="text-sm"/>
                            </Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </section>
            )}
            
            {/* Notes Section */}
            <section>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    disabled={isSaving}
                    placeholder="Any additional notes for this pre-budget..."
                    className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
            </section>

            {/* Summary Section */}
            {items.length > 0 && (
            <section className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-slate-800 text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-2 max-w-sm ml-auto bg-slate-50/70 p-4 rounded-md">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium text-slate-800">${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label htmlFor="discountAmount" className="text-slate-600">Discount Amount ($):</label>
                    <Input id="discountAmount" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} min="0" step="0.01" disabled={isSaving} className="w-28 !h-8 !text-xs text-right" />
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label htmlFor="taxRate" className="text-slate-600">Tax Rate (%):</label>
                    <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} min="0" step="0.01" max="100" disabled={isSaving} className="w-20 !h-8 !text-xs text-right" />
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax Amount:</span>
                    <span className="font-medium text-slate-800">${calculatedTaxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span>${calculatedGrandTotal.toFixed(2)}</span>
                </div>
                </div>
            </section>
            )}
        </div>


        {/* Actions Section */}
        <div className="flex justify-end p-6 md:p-8 border-t border-slate-200 mt-auto">
          <Button type="submit" isLoading={isSaving} disabled={isSaving || items.length === 0 || !clientName.trim()} className="min-w-[150px]">
            <Icon iconName="save" className="mr-2 text-base" />
            {isSaving ? 'Saving...' : 'Save Pre-Budget'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PreBudgetCreatePage;
