import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { PreBudget, NewPreBudgetData, UpdatePreBudgetData, PreBudgetStatus } from '../types/prebudget'; // Assuming PreBudgetStatus is in prebudget.ts

const functions = getFunctions();

// TODO: Determine how tenantId will be reliably sourced (e.g., auth context, global state).
// For now, it is passed as an argument to service functions.
// TODO: createdById should ideally come from the authenticated user's context on the client-side,
// but the backend function createPreBudget already uses context.auth.uid.
// The `createdById` parameter in `addPreBudget` here might be redundant if backend handles it,
// or it could be used for specific scenarios if frontend needs to specify a different creator (admin action).
// For now, we'll keep it but acknowledge the backend sets it from auth.

/**
 * Fetches all pre-budgets for a given tenant.
 */
export const fetchPreBudgets = async (tenantId: string): Promise<PreBudget[]> => {
  const getPreBudgetsCallable = httpsCallable(functions, 'getPreBudgets');
  try {
    const result: HttpsCallableResult<PreBudget[]> = await getPreBudgetsCallable({ tenantId });
    return result.data || []; // Ensure an array is returned even if data is null/undefined
  } catch (error) {
    console.error('Error fetching pre-budgets:', error);
    throw error; // Or handle more gracefully, e.g., return empty array and notify user
  }
};

/**
 * Fetches a single pre-budget by its ID and tenant ID.
 */
export const fetchPreBudgetById = async (preBudgetId: string, tenantId: string): Promise<PreBudget | null> => {
  const getPreBudgetByIdCallable = httpsCallable(functions, 'getPreBudgetById');
  try {
    const result: HttpsCallableResult<PreBudget | null> = await getPreBudgetByIdCallable({ preBudgetId, tenantId });
    return result.data;
  } catch (error) {
    console.error(`Error fetching pre-budget by ID (${preBudgetId}):`, error);
    throw error;
  }
};

/**
 * Adds a new pre-budget.
 * Note: createdById is set by the backend function based on the authenticated user.
 * The tenantId is crucial for associating the pre-budget correctly.
 */
export const addPreBudget = async (preBudgetData: NewPreBudgetData, tenantId: string): Promise<PreBudget> => {
  const createPreBudgetCallable = httpsCallable(functions, 'createPreBudget');
  try {
    // Spread preBudgetData and explicitly include tenantId.
    // The backend will use context.auth.uid for createdById.
    const payload = { ...preBudgetData, tenantId };
    const result: HttpsCallableResult<PreBudget> = await createPreBudgetCallable(payload);
    return result.data;
  } catch (error) {
    console.error('Error adding pre-budget:', error);
    throw error;
  }
};

/**
 * Updates an existing pre-budget.
 */
export const updatePreBudgetData = async (preBudgetId: string, dataToUpdate: UpdatePreBudgetData, tenantId: string): Promise<PreBudget> => {
  const updatePreBudgetCallable = httpsCallable(functions, 'updatePreBudget');
  try {
    const payload = { preBudgetId, tenantId, ...dataToUpdate };
    const result: HttpsCallableResult<PreBudget> = await updatePreBudgetCallable(payload);
    return result.data;
  } catch (error) {
    console.error(`Error updating pre-budget (${preBudgetId}):`, error);
    throw error;
  }
};

/**
 * Deletes a pre-budget.
 */
export const deletePreBudgetRecord = async (preBudgetId: string, tenantId: string): Promise<{ success: boolean; preBudgetId: string }> => {
  const deletePreBudgetCallable = httpsCallable(functions, 'deletePreBudget');
  try {
    const result: HttpsCallableResult<{ success: boolean; preBudgetId: string }> = await deletePreBudgetCallable({ preBudgetId, tenantId });
    return result.data;
  } catch (error) {
    console.error(`Error deleting pre-budget (${preBudgetId}):`, error);
    throw error;
  }
};

// Example utility function that might use updatePreBudgetData
export const changePreBudgetStatus = async (preBudgetId: string, status: PreBudgetStatus, tenantId: string): Promise<PreBudget> => {
  return updatePreBudgetData(preBudgetId, { status }, tenantId);
};
