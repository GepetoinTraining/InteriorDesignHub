
import { Product } from '../types/product';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
export const fetchProducts = async (tenantId: string): Promise<Product[]> => {
  const getProducts = httpsCallable(functions, 'getProducts');
  try {
    const result = await getProducts({ tenantId });
    return result.data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
export const fetchProductById = async (productId: string, tenantId: string): Promise<Product | undefined> => {
  const getProductById = httpsCallable(functions, 'getProductById');
  try {
    const result = await getProductById({ productId, tenantId });
    return result.data as Product | undefined;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
export const addProduct = async (productData: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated' | 'tenantId'>, tenantId: string): Promise<Product> => {
  const createProduct = httpsCallable(functions, 'createProduct');
  try {
    const result = await createProduct({ ...productData, tenantId });
    return result.data as Product;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'dateAdded' | 'lastUpdated' | 'tenantId'>>, tenantId: string): Promise<Product> => {
  const callUpdateProduct = httpsCallable(functions, 'updateProduct');
  try {
    // Pass tenantId in the main data object for the backend function
    const result = await callUpdateProduct({ id: productId, ...productData, tenantId });
    return result.data as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
export const deleteProduct = async (productId: string, tenantId: string): Promise<{ success: boolean; id: string }> => {
  const callDeleteProduct = httpsCallable(functions, 'deleteProduct');
  try {
    // Pass tenantId in the main data object for the backend function
    await callDeleteProduct({ productId, tenantId });
    return { success: true, id: productId };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// TODO: Figure out how to get tenantId. Pass it as an argument for now.
// For now, using updateProduct to adjust stock level.
// A dedicated function might be better for more complex stock management.
export const adjustStockLevel = async (productId: string, newStockLevel: number, tenantId: string): Promise<Product> => {
  const callUpdateProduct = httpsCallable(functions, 'updateProduct');
  try {
    const result = await callUpdateProduct({
      id: productId,
      stockQty: newStockLevel,
      tenantId, // Pass tenantId here
    });
    return result.data as Product;
  } catch (error) {
    console.error('Error adjusting stock level:', error);
    throw error;
  }
};
