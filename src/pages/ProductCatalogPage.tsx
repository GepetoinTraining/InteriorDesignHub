
import React, { useState, useEffect, useMemo } from 'react';
import * as productService from '../services/productService';
import { Product, ProductCategory } from '../types/product';
import ProductCard from '../components/products/ProductCard';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

const ProductCatalogPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.fetchProducts();
        setAllProducts(data.filter(p => p.isVisible !== false)); // Default to visible if isVisible is undefined
      } catch (err) {
        console.error("Failed to fetch products for catalog", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsData();
  }, []);
  
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allProducts.map(p => p.category));
    return ['All', ...Array.from(uniqueCategories).sort()] as (ProductCategory | 'All')[];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearchTerm = 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearchTerm && matchesCategory;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Product Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load products</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight mb-2">Product Catalog</h1>
        <p className="text-slate-500 text-sm sm:text-base">Browse our curated collection of fine products.</p>
      </div>

      <div className="mb-6 sticky top-[calc(var(--header-height,64px)+1rem)] z-5 bg-slate-50 py-3"> {/* Adjust var(--header-height) if header height changes */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon iconName="search" className="text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Search products by name, description, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full !h-11" 
            aria-label="Search products"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-700 mr-2">Categories:</span>
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? 'primary' : 'outlined'}
              className={`h-8 px-3 text-xs rounded-full ${selectedCategory === cat ? '' : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400'}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 flex-1 flex flex-col justify-center items-center">
          <Icon iconName="search_off" className="text-5xl mb-3" />
          <p className="text-lg">No products found matching your criteria.</p>
          { (searchTerm || selectedCategory !== 'All') &&
            <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} variant="secondary" className="mt-4">
              Clear Filters
            </Button>
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
