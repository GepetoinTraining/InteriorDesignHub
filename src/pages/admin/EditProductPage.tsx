
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import * as productService from '../../services/productService';
import { Product } from '../../types/product';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true); // For initial data fetch
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError("No product ID provided.");
      setIsFetching(false);
      return;
    }

    const fetchProduct = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const product = await productService.fetchProductById(productId);
        if (product) {
          setInitialProduct(product);
        } else {
          setError(`Product with ID ${productId} not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching product details.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      await productService.updateProduct(productId, productData);
      // Optionally: show a success toast/message
      navigate('/admin/products'); 
    } catch (err) {
      console.error("Failed to update product", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while updating the product.");
      setIsLoading(false); // Only set to false on error, as navigation handles success
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Product Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Edit Product</h1>
         <Button variant="secondary" onClick={() => navigate('/admin/products')}>
            <Icon iconName="arrow_back" className="mr-2 text-sm"/> Back to List
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {initialProduct && !error && (
        <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
          <ProductForm
            initialProduct={initialProduct}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButtonText="Update Product"
            onCancel={() => navigate('/admin/products')}
          />
        </div>
      )}
      {!initialProduct && !error && !isFetching && (
         <p className="text-center text-slate-500">Product data could not be loaded.</p>
      )}
    </div>
  );
};

export default EditProductPage;
