
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import * as productService from '../../services/productService';
import { Product } from '../../types/product';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';
import AdjustStockModal from '../../components/stock/AdjustStockModal';

const StockManagementPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  const navigate = useNavigate();

  const fetchProductsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products for stock management", err);
      setError(err instanceof Error ? err.message : t('stockManagementPage.errorUnknownFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleAdjustStock = async (productId: string, newStockLevel: number) => {
    setIsAdjustingStock(true);
    try {
      await productService.adjustStockLevel(productId, newStockLevel);
      // Refresh product list to show updated stock
      await fetchProductsData(); 
      handleCloseModal();
      // Optionally: show success message
    } catch (err) {
      console.error(`Failed to adjust stock for product ${productId}`, err);
      // Optionally: show error message to user in modal or page
      setError(err instanceof Error ? err.message : t('stockManagementPage.errorAdjustStock'));
    } finally {
      setIsAdjustingStock(false);
    }
  };
  
  const formatLastUpdated = (isoString?: string): string => {
    if (!isoString) return t('stockManagementPage.labelNotApplicable');
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) {
      return t('stockManagementPage.labelInvalidDate');
    }
  };

  const getStockStatusStyles = (stockLevel: number): { text: string, colorClass: string, badgeClass: string } => {
    if (stockLevel <= 0) {
      return { text: t('stockManagementPage.statusOutOfStock'), colorClass: 'text-red-600', badgeClass: 'bg-red-100 text-red-800' };
    }
    if (stockLevel <= 10) {
      return { text: t('stockManagementPage.statusLowStock'), colorClass: 'text-amber-600', badgeClass: 'bg-amber-100 text-amber-800' };
    }
    if (stockLevel <= 20) {
      return { text: t('stockManagementPage.statusModerate'), colorClass: 'text-yellow-600', badgeClass: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: t('stockManagementPage.statusSufficient'), colorClass: 'text-green-600', badgeClass: 'bg-green-100 text-green-800' };
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">{t('stockManagementPage.loadingStockData')}</p>
      </div>
    );
  }

  if (error && !isLoading) { // Only show main error if not also loading
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">{t('stockManagementPage.failedToLoadStockData')}</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchProductsData} variant="primary">
          {t('stockManagementPage.tryAgainButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">{t('stockManagementPage.title')}</h1>
          <p className="text-slate-500 text-sm sm:text-base">{t('stockManagementPage.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/admin/products/new')} variant="outlined" className="h-10 text-xs sm:text-sm">
            <Icon iconName="add" className="mr-1 sm:mr-2 text-sm" /> {t('stockManagementPage.buttonAddNewProduct')}
          </Button>
          <Button onClick={() => alert(t('stockManagementPage.alertExportComingSoon'))} className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] h-10 text-xs sm:text-sm">
            <Icon iconName="download" className="mr-1 sm:mr-2 text-sm" /> {t('stockManagementPage.buttonExportData')}
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder={t('stockManagementPage.placeholderSearch')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      {isLoading && products.length > 0 && (
         <div className="text-center py-4 text-slate-600">{t('stockManagementPage.updatingStockList')}</div>
      )}

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {filteredProducts.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-slate-500">
            <Icon iconName="inventory" className="text-4xl mb-2" />
            <p>{t('stockManagementPage.messageNoProductsFound')}{searchTerm && t('stockManagementPage.messageMatchingSearchSuffix')}.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stockManagementPage.tableHeaderProduct')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('stockManagementPage.tableHeaderSku')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stockManagementPage.tableHeaderStockLevel')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('stockManagementPage.tableHeaderLastUpdated')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stockManagementPage.tableHeaderActions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatusStyles(product.stockLevel);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=EBF4FF&color=0B80EE&font-size=0.5`} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 truncate max-w-xs">{product.name}</div>
                            <div className="text-xs text-slate-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.badgeClass}`}>
                          {product.stockLevel}
                        </span>
                         <span className={`ml-2 text-xs ${stockStatus.colorClass} hidden lg:inline`}>({stockStatus.text})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                        {formatLastUpdated(product.lastUpdated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outlined" onClick={() => handleOpenModal(product)} className="h-8 text-xs px-2 py-1">
                          <Icon iconName="tune" className="text-xs mr-1" /> {t('stockManagementPage.buttonAdjust')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedProduct && (
        <AdjustStockModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          onSave={handleAdjustStock}
          isLoading={isAdjustingStock}
        />
      )}
    </div>
  );
};

export default StockManagementPage;
