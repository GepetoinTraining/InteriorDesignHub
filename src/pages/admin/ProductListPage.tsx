

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as productService from '../../services/productService';
import { Product } from '../../types/product';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProductsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      setIsLoading(true); // Consider a more granular loading state for delete
      try {
        await productService.deleteProduct(productId);
        // Refetch products after deletion or filter locally
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        // Optionally show a success message
      } catch (err) {
        console.error(`Failed to delete product ${productId}`, err);
        setError(err instanceof Error ? err.message : "Could not delete product.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (isLoading && products.length === 0) { // Show full page loader only on initial load
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load products</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchProductsData} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage your inventory and product details.</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')} className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]">
          <Icon iconName="add" className="mr-2 text-base" />
          New Product
        </Button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      {isLoading && products.length > 0 && (
         <div className="text-center py-4 text-slate-600">Updating product list...</div>
      )}

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {filteredProducts.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-slate-500">
            <Icon iconName="inventory_2" className="text-4xl mb-2" />
            <p>No products found{searchTerm && ' matching your search'}.</p>
            {!searchTerm && (
                <Button onClick={() => navigate('/admin/products/new')} className="mt-4">
                    Add Your First Product
                </Button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=EBF4FF&color=0B80EE&font-size=0.5`} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-xs">{product.name}</div>
                           <div className="text-xs text-slate-500 sm:hidden">{product.category} / {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stockLevel > 10 ? 'bg-green-100 text-green-800' :
                        product.stockLevel > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stockLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Fix: Removed unsupported 'size' prop. Sizing is handled by className 'h-8 text-xs px-2 py-1'. */}
                      <Button variant="outlined" onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="mr-2 !h-8 !text-xs !px-2 !py-1">
                        <Icon iconName="edit" className="text-xs mr-1" /> Edit
                      </Button>
                      {/* Fix: Removed unsupported 'size' prop. Sizing is handled by className 'h-8 text-xs px-2 py-1'. */}
                      <Button variant="outlined" onClick={() => handleDelete(product.id, product.name)} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 !h-8 !text-xs !px-2 !py-1">
                         <Icon iconName="delete" className="text-xs mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
