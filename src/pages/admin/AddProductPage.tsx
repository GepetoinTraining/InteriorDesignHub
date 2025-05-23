
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import * as productService from '../../services/productService';
import { Product } from '../../types/product';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    setIsLoading(true);
    setError(null);
    try {
      await productService.addProduct(productData);
      // Optionally: show a success toast/message before navigating
      navigate('/admin/products');
    } catch (err) {
      console.error("Failed to add product", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while adding the product.");
      setIsLoading(false);
    }
    // setIsLoading(false) is handled in the finally block of the try-catch if navigation happens
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Add New Product</h1>
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

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <ProductForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          submitButtonText="Create Product"
          onCancel={() => navigate('/admin/products')}
        />
      </div>
    </div>
  );
};

export default AddProductPage;
