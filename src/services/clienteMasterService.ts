import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { ClienteMaster } from '../types/clienteMaster'; // Assuming type definition exists or will be created

const functions = getFunctions();

// Type for createClienteMaster data (adjust as per your backend function's expectation)
interface CreateClienteMasterData {
  name: string;
  adminNotes?: string;
  tenantId: string;
}

// Type for updateClienteMaster data (adjust as per your backend function's expectation)
interface UpdateClienteMasterData {
  name?: string;
  adminNotes?: string;
}

/**
 * Creates a new ClienteMaster record.
 */
export const createClienteMaster = async (data: CreateClienteMasterData): Promise<ClienteMaster> => {
  const callable = httpsCallable(functions, 'createClienteMaster');
  const result = await callable(data) as HttpsCallableResult<ClienteMaster>;
  return result.data;
};

/**
 * Fetches a specific ClienteMaster record by its ID.
 */
export const getClienteMaster = async (id: string): Promise<ClienteMaster | null> => {
  const callable = httpsCallable(functions, 'getClienteMaster');
  const result = await callable({ id }) as HttpsCallableResult<ClienteMaster | null>;
  return result.data;
};

/**
 * Lists all ClienteMaster records for a given tenant.
 */
export const listClienteMastersByTenant = async (tenantId: string): Promise<ClienteMaster[]> => {
  const callable = httpsCallable(functions, 'listClienteMastersByTenant');
  const result = await callable({ tenantId }) as HttpsCallableResult<ClienteMaster[]>;
  return result.data || []; // Ensure it returns an array even if data is null/undefined
};

/**
 * Updates an existing ClienteMaster record.
 */
export const updateClienteMaster = async (id: string, data: UpdateClienteMasterData): Promise<ClienteMaster> => {
  const callable = httpsCallable(functions, 'updateClienteMaster');
  const result = await callable({ id, ...data }) as HttpsCallableResult<ClienteMaster>;
  return result.data;
};

/**
 * Deletes a ClienteMaster record by its ID.
 */
export const deleteClienteMaster = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const callable = httpsCallable(functions, 'deleteClienteMaster');
  const result = await callable({ id }) as HttpsCallableResult<{ success: boolean; message?: string }>;
  return result.data;
};

// Note: Ensure your `ClienteMaster` type in `src/types/clienteMaster.ts` matches the object structure
// returned by your Firebase Functions (especially for fields like `createdAt`, `updatedAt` if they are transformed to strings or specific date objects).
// For example:
// export interface ClienteMaster {
//   id: string;
//   name: string;
//   adminNotes?: string;
//   tenantId: string;
//   createdAt: string; // Or Date
//   updatedAt: string; // Or Date
//   // Add clientCount or other relevant fields if your backend provides them
//   clientCount?: number; 
// }
