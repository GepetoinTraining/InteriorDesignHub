import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { 
  Visita, 
  CreateVisitaData, 
  UpdateVisitaData, 
  ListVisitasFilters 
} from '../types/visita';

const functions = getFunctions();

/**
 * Creates a new Visita record.
 * @param data - The data for the new Visita.
 * @returns The created Visita object.
 */
export const createVisita = async (data: CreateVisitaData): Promise<Visita> => {
  const callable = httpsCallable(functions, 'createVisita');
  const result = await callable(data) as HttpsCallableResult<Visita>;
  return result.data;
};

/**
 * Fetches a specific Visita record by its ID.
 * @param id - The ID of the Visita to fetch.
 * @returns The Visita object or null if not found.
 */
export const getVisita = async (id: string): Promise<Visita | null> => {
  const callable = httpsCallable(functions, 'getVisita');
  const result = await callable({ id }) as HttpsCallableResult<Visita | null>;
  return result.data;
};

/**
 * Lists all Visita records based on the provided filters.
 * @param filters - Optional filters for listing Visitas.
 * @returns An array of Visita objects.
 */
export const listVisitas = async (filters: ListVisitasFilters = {}): Promise<Visita[]> => {
  const callable = httpsCallable(functions, 'listVisitas');
  // The backend function expects tenantId, which should be added by the function itself
  // based on the authenticated user, or explicitly if an ADMIN is calling for another tenant (not implemented here).
  // For now, the backend `listVisitas` function will use the caller's tenantId.
  const result = await callable(filters) as HttpsCallableResult<Visita[]>;
  return result.data || []; // Ensure it returns an array even if data is null/undefined
};

/**
 * Updates an existing Visita record.
 * @param id - The ID of the Visita to update.
 * @param data - The data to update the Visita with.
 * @returns The updated Visita object.
 */
export const updateVisita = async (id: string, data: UpdateVisitaData): Promise<Visita> => {
  const callable = httpsCallable(functions, 'updateVisita');
  const result = await callable({ id, ...data }) as HttpsCallableResult<Visita>;
  return result.data;
};

/**
 * Deletes a Visita record by its ID.
 * @param id - The ID of the Visita to delete.
 * @returns An object indicating success or failure.
 */
export const deleteVisita = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const callable = httpsCallable(functions, 'deleteVisita');
  const result = await callable({ id }) as HttpsCallableResult<{ success: boolean; message?: string }>;
  return result.data;
};
