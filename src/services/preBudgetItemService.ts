import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { PreBudgetItem } from '../types/prebudget'; // Assuming PreBudgetItem will be defined here
import { Product } from '../types/product'; // For ProductModelType

// Data for adding an item
export interface AddPreBudgetItemData {
  preBudgetId: string;
  productId?: string;
  customDescription?: string;
  quantity: number;
  customInputsJson?: any; 
  notes?: string;
  unitPrice?: number;
  totalPrice?: number;
  // tenantId is added by the backend
}

// Data for updating an item
export interface UpdatePreBudgetItemData {
  itemId: string;
  preBudgetId: string; // Required for context/security on backend
  productId?: string;
  customDescription?: string;
  quantity?: number;
  customInputsJson?: any;
  notes?: string;
  unitPrice?: number;
  totalPrice?: number;
}

// Data for removing an item
export interface RemovePreBudgetItemData {
  itemId: string;
  preBudgetId: string; // Required for context/security on backend
}

const functions = getFunctions();

/**
 * Adds an item to a PreBudget.
 */
export const addPreBudgetItem = async (data: AddPreBudgetItemData): Promise<PreBudgetItem> => {
  const callable = httpsCallable(functions, 'addPreBudgetItem');
  const result = await callable(data) as HttpsCallableResult<PreBudgetItem>;
  return result.data;
};

/**
 * Updates an existing item in a PreBudget.
 */
export const updatePreBudgetItem = async (data: UpdatePreBudgetItemData): Promise<PreBudgetItem> => {
  const callable = httpsCallable(functions, 'updatePreBudgetItem');
  const result = await callable(data) as HttpsCallableResult<PreBudgetItem>;
  return result.data;
};

/**
 * Removes an item from a PreBudget.
 */
export const removePreBudgetItem = async (data: RemovePreBudgetItemData): Promise<{ success: boolean; message?: string }> => {
  const callable = httpsCallable(functions, 'removePreBudgetItem');
  const result = await callable(data) as HttpsCallableResult<{ success: boolean; message?: string }>;
  return result.data;
};
