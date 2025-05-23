import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { ProductSale, NewProductSaleData, ProductSaleFilters } from '../types/productSale';

const functions = getFunctions();

/**
 * Records a product sale.
 * Calls the `recordProductSale` Firebase callable function.
 * The `recordedById` will be set by the backend based on the authenticated user.
 */
export const recordSale = async (
  saleData: NewProductSaleData,
  tenantId: string
): Promise<ProductSale> => {
  if (!tenantId) {
    throw new Error("tenantId is required to record a sale.");
  }
  const recordProductSaleCallable = httpsCallable(functions, 'recordProductSale');
  try {
    const payload = { ...saleData, tenantId };
    const result: HttpsCallableResult<ProductSale> = await recordProductSaleCallable(payload);
    return result.data;
  } catch (error) {
    console.error('Error recording product sale:', error);
    throw error;
  }
};

/**
 * Fetches product sales for a given tenant, with optional filters.
 * Calls the `getProductSales` Firebase callable function.
 */
export const fetchSales = async (
  tenantId: string,
  filters?: ProductSaleFilters
): Promise<ProductSale[]> => {
  if (!tenantId) {
    console.error("fetchSales called without tenantId.");
    return []; // Or throw error
  }

  const getProductSalesCallable = httpsCallable(functions, 'getProductSales');
  try {
    const payload: { tenantId: string; filters?: ProductSaleFilters } = { tenantId };
    if (filters) {
      payload.filters = filters;
    }
    const result: HttpsCallableResult<ProductSale[]> = await getProductSalesCallable(payload);
    return result.data || []; // Ensure an array is returned
  } catch (error) {
    console.error('Error fetching product sales:', error);
    throw error;
  }
};
