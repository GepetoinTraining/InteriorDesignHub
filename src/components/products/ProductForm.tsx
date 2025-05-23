
import React, { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory } from '../../types/product';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useTenant } from '../../contexts/TenantContext'; // Import useTenant

interface ProductFormProps {
  initialProduct?: Product | null;
  onSubmit: (productData: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

const productCategories: ProductCategory[] = ['Furniture', 'Decor', 'Lighting', 'Textiles', 'Accessories', 'Kitchenware', 'Outdoor', 'Other'];

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  isLoading,
  submitButtonText = 'Save Product',
  onCancel,
}) => {
  const { currentTenant } = useTenant(); // Get tenant context

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Furniture');
  const [sellingPrice, setSellingPrice] = useState<number | string>(''); // This is product.price
  const [buyingPrice, setBuyingPrice] = useState<number | string>('');
  const [productionCost, setProductionCost] = useState<number | string>('');
  const [stockLevel, setStockLevel] = useState<number | string>('');
  const [supplierName, setSupplierName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [pricingCalculationMethod, setPricingCalculationMethod] = useState<'manual' | 'apply_tenant_markup'>('manual');

  const calculateSellingPrice = useCallback(() => {
    if (pricingCalculationMethod === 'apply_tenant_markup') {
      const bp = parseFloat(buyingPrice as string);
      const markup = currentTenant?.defaultProductMarkup;
      if (!isNaN(bp) && typeof markup === 'number' && markup >= 0) {
        setSellingPrice((bp * (1 + markup)).toFixed(2));
      } else {
        setSellingPrice(''); // Or '0.00' or some indicator
      }
    }
  }, [buyingPrice, currentTenant, pricingCalculationMethod]);


  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setSku(initialProduct.sku || '');
      setCategory(initialProduct.category || 'Furniture');
      setSellingPrice(initialProduct.price?.toString() || '');
      setBuyingPrice(initialProduct.buyingPrice?.toString() || '');
      setProductionCost(initialProduct.productionCost?.toString() || '');
      setStockLevel(initialProduct.stockLevel?.toString() || '');
      setSupplierName(initialProduct.supplierName || '');
      setDescription(initialProduct.description || '');
      setImageUrl(initialProduct.imageUrl || '');
      setIsVisible(initialProduct.isVisible !== undefined ? initialProduct.isVisible : true);
      setPricingCalculationMethod(initialProduct.pricingCalculation || 'manual');
    } else {
      // Reset form for new product
      setName(''); setSku(''); setCategory('Furniture'); setSellingPrice('');
      setBuyingPrice(''); setProductionCost(''); setStockLevel('');
      setSupplierName(''); setDescription(''); setImageUrl('');
      setIsVisible(true); setPricingCalculationMethod('manual');
    }
  }, [initialProduct]);

  useEffect(() => {
    calculateSellingPrice();
  }, [calculateSellingPrice]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalSellingPrice = parseFloat(sellingPrice as string);
    if (isNaN(finalSellingPrice) || finalSellingPrice < 0) {
        alert("Please ensure Selling Price is a valid non-negative number.");
        return;
    }

    const productData = {
      name,
      sku,
      category,
      price: finalSellingPrice, // Use the state value of sellingPrice
      buyingPrice: buyingPrice ? parseFloat(buyingPrice as string) : undefined,
      productionCost: productionCost ? parseFloat(productionCost as string) : undefined,
      stockLevel: parseInt(stockLevel as string, 10) || 0,
      supplierName: supplierName || undefined,
      description,
      imageUrl: imageUrl || undefined,
      isVisible,
      pricingCalculation: pricingCalculationMethod,
      images: initialProduct?.images || [],
      dimensions: initialProduct?.dimensions,
      weight: initialProduct?.weight,
      material: initialProduct?.material,
      color: initialProduct?.color,
      variations: initialProduct?.variations || [],
      tags: initialProduct?.tags || [],
    };
    onSubmit(productData);
  };

  const isSellingPriceReadOnly = pricingCalculationMethod === 'apply_tenant_markup';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
        <Input id="product-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} placeholder="e.g., Modern Velvet Sofa" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
          <Input id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={isLoading} placeholder="e.g., SOFA-BLU-LG-001" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            required
            disabled={isLoading}
            className="form-select block w-full rounded-lg border-slate-300 bg-slate-50 h-12 px-4 text-sm text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="buyingPrice" className="block text-sm font-medium text-slate-700 mb-1">Buying Price ($)</label>
            <Input id="buyingPrice" type="number" value={buyingPrice} 
                   onChange={(e) => { setBuyingPrice(e.target.value); }} 
                   disabled={isLoading} placeholder="0.00" step="0.01" 
            />
        </div>
         <div>
            <label htmlFor="pricingCalculationMethod" className="block text-sm font-medium text-slate-700 mb-1">Selling Price Calculation</label>
            <select
              id="pricingCalculationMethod"
              value={pricingCalculationMethod}
              onChange={(e) => {
                setPricingCalculationMethod(e.target.value as 'manual' | 'apply_tenant_markup');
              }}
              disabled={isLoading}
              className="form-select block w-full rounded-lg border-slate-300 bg-slate-50 h-12 px-4 text-sm text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="manual">Manual Entry</option>
              <option value="apply_tenant_markup">Apply Tenant Markup ({((currentTenant?.defaultProductMarkup || 0) * 100).toFixed(0)}%)</option>
            </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($) *</label>
            <Input id="sellingPrice" type="number" value={sellingPrice} 
                   onChange={(e) => { if (!isSellingPriceReadOnly) setSellingPrice(e.target.value);}} 
                   required disabled={isLoading || isSellingPriceReadOnly} 
                   readOnly={isSellingPriceReadOnly}
                   placeholder="0.00" step="0.01" 
                   className={isSellingPriceReadOnly ? "bg-slate-200 cursor-not-allowed" : ""}
            />
        </div>
        <div>
            <label htmlFor="productionCost" className="block text-sm font-medium text-slate-700 mb-1">Production Cost ($)</label>
            <Input id="productionCost" type="number" value={productionCost} onChange={(e) => setProductionCost(e.target.value)} disabled={isLoading} placeholder="0.00" step="0.01" />
        </div>
      </div>

      <div>
        <label htmlFor="stockLevel" className="block text-sm font-medium text-slate-700 mb-1">Stock Level *</label>
        <Input id="stockLevel" type="number" value={stockLevel} onChange={(e) => setStockLevel(e.target.value)} required disabled={isLoading} placeholder="0" step="1" />
      </div>

      <div>
        <label htmlFor="supplierName" className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
        <Input id="supplierName" type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} disabled={isLoading} placeholder="e.g., Quality Furnishings Inc." />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          disabled={isLoading}
          placeholder="Detailed product description..."
          className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">Main Image URL</label>
        <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={isLoading} placeholder="https://example.com/image.jpg" />
      </div>
      
      <div className="flex items-center">
        <input
          id="isVisible"
          name="isVisible"
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
        />
        <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
          Visible in Public Catalog
        </label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-8">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          <Icon iconName={initialProduct ? "save" : "add_circle"} className="mr-2 text-base" />
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
