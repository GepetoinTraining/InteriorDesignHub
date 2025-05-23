
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import * as productService from '../services/productService';
import { Product, ProductCategory } from '../types/product';
import ProductCard from '../components/products/ProductCard';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CartDrawer from '../components/cart/CartDrawer'; // Import CartDrawer
import { CartItem } from '../components/cart/CartDrawer'; // Import CartItem type

const ShopPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Cart State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'prod-1', // Corresponds to a Product ID
      name: 'Modern Sofa',
      unitPrice: 1200.00,
      quantity: 1,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPgEpq0djcoZvCrUwvFkemWd3J82vJrw3b4558pgKh-vXkJel-tGEZH7UeggjNGeW0lJIOHQdr-KdTpZpmJOYz6RnJmxoAxptgoStR_8Oo5HKCSDY_tQ9Ash5BUE7Sa7knbK-AeEzlcIkrjI9DbPnufAXvzCKE2Uq9S6Jz_DgYraV365paHVUZAcCOBhpX7wDMNDAxGcZuRvn6itsHK8rmPiD2Z9X1l6NWWIlRT3C64mn9CjgoB9GsWJ2O7OPB6gVSQW2A6lFlUYUo',
    },
    {
      id: 'prod-2',
      name: 'Minimalist Coffee Table',
      unitPrice: 150.00,
      quantity: 2,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVntZ6pT3HcmDioopglPnI853cq1y9OElp3DdQn4_v0Udy1tPmf9Uk3L9UnR2pqO3tnNECIDlQPmlndiXOShXPDaajaAaALX_9WKIFxxdQrIpX88s-e7duHSE4V3ZPL5BLrZFUfltH0ncW3CpVavIxSRgIqbUnxlkNlH8ab_bWxyynIqj42OmsVkh45ZCRfP3-VlqjZ_z9y0OCxKhecsDdUy5XU1AjDyQIdPfzc6BS6xcMmDHLG8EVNtypn7qSdAPn47J6jQ___qs4',
    },
    {
      id: 'prod-3',
      name: 'Abstract Art Print',
      unitPrice: 80.00, // Example: Different unit price for cart item
      quantity: 1,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSRCjNsvSU7uGMCYxt73g3_Tx72IcRsYY4i_uSDk8bZB1WfZz60W5L9IA7yBuz-ikmEkZI0a6FPGE3h3E9dkTdb3N5MY6JTtbY7d2SYqPr_Ok4-95UP770ExVvGyLsm0qaswmZj3984ACbmiki0GqAxDQE71J0D5pC6wSO-Xm5bCJ3kGZNq6EWVQwORAjRywU1Pguvx_Tk3PtGeAOASay1G_j2SNnauUp08PeJDYFO3cMdxTTYPCcH7zJwCipRG_kejIaXqpahfqHf',
    },
  ]);
  
  const location = useLocation();
  const isReferred = useMemo(() => new URLSearchParams(location.search).has('ref'), [location.search]);


  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const toggleCartDrawer = () => setIsCartDrawerOpen(!isCartDrawerOpen);

  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, {
          id: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          imageUrl: product.imageUrl
        }];
      }
    });
    // Optionally open cart drawer when item is added
    // setIsCartDrawerOpen(true); 
  }, []);
  
  const cartItemCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);


  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.fetchProducts();
        setAllProducts(data.filter(p => p.isVisible !== false));
      } catch (err) {
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

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCategoryFilter = (category: ProductCategory | 'All') => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
      productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(headerSearchTerm);
    setCurrentPage(1);
  };

  if (isLoading && allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cedfed] mb-4"></div>
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
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }
  
  const primaryColorStyle = { color: '#cedfed' };
  const hoverPrimaryTextStyle = 'hover:text-[#cedfed]';
  const activePrimaryBgStyle = { backgroundColor: '#cedfed' };
  const hoverPrimaryBgStyle = 'hover:bg-[#cedfed]';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-neutral-200 px-4 sm:px-6 md:px-10 py-4 shadow-sm sticky top-0 bg-white z-20">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/shop" className="flex items-center gap-3 text-slate-800">
            <Icon iconName="storefront" style={primaryColorStyle} className="text-3xl"/>
            <h2 className="text-slate-800 text-xl font-bold leading-tight tracking-tight">Design Hub</h2>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 md:gap-8">
            <Link className={`text-slate-700 text-sm font-medium leading-normal ${hoverPrimaryTextStyle} transition-colors`} to="/shop">Shop</Link>
            <Link className={`text-slate-700 text-sm font-medium leading-normal ${hoverPrimaryTextStyle} transition-colors`} to="#">Design Services</Link>
            <Link className={`text-slate-700 text-sm font-medium leading-normal ${hoverPrimaryTextStyle} transition-colors`} to="#">Inspiration</Link>
            <Link className={`text-slate-700 text-sm font-medium leading-normal ${hoverPrimaryTextStyle} transition-colors`} to="#">Contact</Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-2 sm:gap-4">
          <form onSubmit={handleHeaderSearchSubmit} className="relative hidden md:flex items-center min-w-40 max-w-xs h-10">
            <div className="absolute left-3 text-neutral-500">
              <Icon iconName="search" className="text-xl" />
            </div>
            <Input
              className="!h-full rounded-full !border-neutral-200 !bg-neutral-100 !pl-10 !pr-4 !py-2 !text-sm focus:!ring-1 focus:!ring-[#cedfed]/50 focus:!border-[#cedfed]"
              placeholder="Search"
              value={headerSearchTerm}
              onChange={(e) => setHeaderSearchTerm(e.target.value)}
              aria-label="Search products in header"
            />
          </form>
          <div className="flex gap-1 sm:gap-2 items-center">
            <Button variant="secondary" className={`!rounded-full !h-10 !px-3 sm:!px-4 text-xs sm:text-sm ${hoverPrimaryBgStyle} hover:text-white`}>
              Sign In
            </Button>
            <Button variant="secondary" className={`!rounded-full !h-10 !w-10 !p-0 ${hoverPrimaryBgStyle} hover:text-white`}>
              <Icon iconName="favorite_border" className="text-xl" />
            </Button>
            <Button variant="secondary" className={`relative !rounded-full !h-10 !w-10 !p-0 ${hoverPrimaryBgStyle} hover:text-white`} onClick={toggleCartDrawer}>
              <Icon iconName="shopping_cart" className="text-xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-slate-800" style={activePrimaryBgStyle}>
                  {cartItemCount}
                </span>
              )}
            </Button>
            <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">${cartSubtotal.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 flex flex-1 justify-center py-8 bg-neutral-50">
        <div className="layout-content-container flex flex-col max-w-screen-xl w-full">
          <div className="px-0 sm:px-4 py-6">
             <form onSubmit={(e) => {e.preventDefault(); setCurrentPage(1);}} className="relative flex items-center min-w-40 h-12 w-full max-w-2xl mx-auto">
              <div className="absolute left-4 text-neutral-500">
                <Icon iconName="search" className="text-2xl" />
              </div>
              <Input
                className="!h-full !rounded-full !border-neutral-300 !bg-white !pl-12 !pr-4 !py-3 !text-base focus:!ring-1 focus:!ring-[#cedfed]/50 focus:!border-[#cedfed]"
                placeholder="Search products, brands, and inspiration"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products in main content"
              />
            </form>
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-3 p-4 flex-wrap mb-6">
            {categories.map(cat => (
              <Button 
                key={cat} 
                onClick={() => handleCategoryFilter(cat)}
                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                className={`!h-10 !rounded-full !px-4 text-xs sm:text-sm shadow-sm 
                            ${selectedCategory === cat ? 'text-white' : `!bg-white !text-slate-700 border !border-slate-300 ${hoverPrimaryBgStyle} hover:!text-white`}
                            transition-colors`}
                style={selectedCategory === cat ? activePrimaryBgStyle : {}}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-0 sm:p-4">
             {paginatedProducts.map((product) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    // onAddToCart={() => handleAddToCart(product)} // This would be needed if ProductCard had its own add to cart logic. For now, ProductCard has a placeholder.
                />
            ))}
          </div>
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-20 text-slate-500">
              <Icon iconName="search_off" className="text-6xl mb-4" />
              <p className="text-xl">No products found matching your criteria.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center p-6 space-x-1 mt-8">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                className="!rounded-full !w-10 !h-10 !p-0 disabled:opacity-50"
              >
                <Icon iconName="chevron_left" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <Button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  variant={currentPage === pageNumber ? 'primary' : 'secondary'}
                  className={`!rounded-full !w-10 !h-10 !p-0 !text-sm 
                              ${currentPage === pageNumber ? 'text-white' : '!bg-white !text-slate-700 hover:!bg-slate-100'}`}
                  style={currentPage === pageNumber ? activePrimaryBgStyle : {}}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
                className="!rounded-full !w-10 !h-10 !p-0 disabled:opacity-50"
              >
                <Icon iconName="chevron_right" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-800 text-neutral-300 py-12 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Design Hub</h3>
            <p className="text-sm">Your destination for stylish and modern interior design products.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link className={`${hoverPrimaryTextStyle} transition-colors text-sm`} to="/shop">Shop</Link></li>
              <li><Link className={`${hoverPrimaryTextStyle} transition-colors text-sm`} to="#">About Us</Link></li>
              <li><Link className={`${hoverPrimaryTextStyle} transition-colors text-sm`} to="#">Contact</Link></li>
              <li><Link className={`${hoverPrimaryTextStyle} transition-colors text-sm`} to="#">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stay Connected</h3>
            <p className="text-sm mb-2">Sign up for our newsletter to get the latest updates.</p>
            <form className="flex">
              <Input
                className="!w-full !rounded-l-md !border-neutral-600 !bg-slate-700 !text-white placeholder:!text-neutral-400 focus:!ring-1 focus:!ring-[#cedfed]/50 focus:!border-[#cedfed] !text-sm !h-10"
                placeholder="Your email"
                type="email"
                aria-label="Email for newsletter"
              />
              <Button
                type="submit"
                className="text-slate-800 !px-3 sm:!px-4 !py-2 !rounded-r-md font-semibold hover:!bg-opacity-80 transition-colors !text-sm !h-10"
                style={activePrimaryBgStyle}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-10 border-t border-neutral-700 pt-8 text-center text-sm">
          <p>© 2024 Design Hub. All rights reserved.</p>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={toggleCartDrawer}
        items={cartItems}
        subtotal={cartSubtotal}
        onQuantityChange={handleQuantityChange}
        onRemoveItem={handleRemoveItem}
        isReferred={isReferred}
      />
    </div>
  );
};

export default ShopPage;