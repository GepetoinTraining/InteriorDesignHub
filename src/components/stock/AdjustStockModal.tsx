
import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productId: string, newStockLevel: number) => Promise<void>;
  isLoading?: boolean;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  onSave,
  isLoading: isSaving = false 
}) => {
  const [newStockLevel, setNewStockLevel] = useState<string>('');

  useEffect(() => {
    if (product) {
      setNewStockLevel(product.stockLevel.toString());
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || newStockLevel === '') return;
    const stock = parseInt(newStockLevel, 10);
    if (isNaN(stock) || stock < 0) {
      alert("Please enter a valid non-negative stock level.");
      return;
    }
    await onSave(product.id, stock);
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjustStockModalTitle"
    >
      <div 
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 p-1 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <Icon iconName="close" className="text-2xl" />
        </button>
        
        <h2 id="adjustStockModalTitle" className="text-xl font-semibold text-slate-800 mb-2">Adjust Stock for</h2>
        <p className="text-slate-700 mb-1 font-medium">{product.name}</p>
        <p className="text-xs text-slate-500 mb-4">SKU: {product.sku}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentStock" className="block text-sm font-medium text-slate-700 mb-1">
              Current Stock Level
            </label>
            <Input
              id="currentStock"
              type="number"
              value={product.stockLevel}
              disabled
              className="bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="newStockLevel" className="block text-sm font-medium text-slate-700 mb-1">
              New Stock Level
            </label>
            <Input
              id="newStockLevel"
              type="number"
              value={newStockLevel}
              onChange={(e) => setNewStockLevel(e.target.value)}
              required
              min="0"
              step="1"
              disabled={isSaving}
              placeholder="Enter new stock amount"
              aria-describedby="stockLevelHelp"
            />
            <p id="stockLevelHelp" className="text-xs text-slate-500 mt-1">Enter the total new quantity for this product.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
