
import { PreBudget, PreBudgetItem } from '../types/budget';

// Mock database for pre-budgets
let MOCK_PREBUDGETS: PreBudget[] = [];
const API_DELAY = 300; // Simulate network delay

/**
 * Adds a new pre-budget to the mock database.
 * Assumes totals like subTotal, taxAmount, grandTotal are pre-calculated on the client.
 */
export const addPreBudget = (
  preBudgetData: Omit<PreBudget, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<PreBudget> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPreBudget: PreBudget = {
        ...preBudgetData,
        id: `pb-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_PREBUDGETS.unshift(newPreBudget); // Add to the beginning of the array
      console.log('New Pre-Budget Added:', newPreBudget);
      console.log('All Pre-Budgets:', MOCK_PREBUDGETS);
      resolve({ ...newPreBudget }); // Return a copy
    }, API_DELAY);
  });
};

/**
 * Fetches all pre-budgets (for potential listing page later).
 */
export const fetchPreBudgets = (): Promise<PreBudget[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_PREBUDGETS]);
    }, API_DELAY);
  });
};

/**
 * Fetches a pre-budget by its ID.
 */
export const fetchPreBudgetById = (id: string): Promise<PreBudget | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const preBudget = MOCK_PREBUDGETS.find(pb => pb.id === id);
      resolve(preBudget ? { ...preBudget } : undefined);
    }, API_DELAY);
  });
};

// Placeholder for updating a pre-budget
export const updatePreBudget = (
  id: string, 
  updatedData: Partial<Omit<PreBudget, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PreBudget | undefined> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = MOCK_PREBUDGETS.findIndex(pb => pb.id === id);
            if (index !== -1) {
                MOCK_PREBUDGETS[index] = {
                    ...MOCK_PREBUDGETS[index],
                    ...updatedData,
                    updatedAt: new Date().toISOString(),
                };
                resolve({ ...MOCK_PREBUDGETS[index] });
            } else {
                reject(new Error(`Pre-Budget with ID ${id} not found.`));
            }
        }, API_DELAY);
    });
};

// Placeholder for deleting a pre-budget
export const deletePreBudget = (id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = MOCK_PREBUDGETS.length;
            MOCK_PREBUDGETS = MOCK_PREBUDGETS.filter(pb => pb.id !== id);
            if (MOCK_PREBUDGETS.length < initialLength) {
                resolve({ success: true });
            } else {
                reject(new Error(`Pre-Budget with ID ${id} not found for deletion.`));
            }
        }, API_DELAY);
    });
};
