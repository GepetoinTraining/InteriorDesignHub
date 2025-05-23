import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { Activity, ActivityFilters } from '../types/activity';

const functions = getFunctions();

/**
 * Logs an activity.
 * This is a wrapper around the `logActivity` callable function.
 * Note: The backend function `logActivity` should handle determining the userId
 * from context.auth.uid if called from the client.
 * If you need to log an activity on behalf of another user (e.g., system action),
 * that logic and permission check must be handled securely in the backend.
 */
export const logClientActivity = async (
  action: string,
  metadata: Record<string, any>,
  tenantId: string
): Promise<Activity> => {
  const logActivityCallable = httpsCallable(functions, 'logActivity');
  try {
    // `userId` will be inferred by the backend from the authenticated caller
    const result: HttpsCallableResult<Activity> = await logActivityCallable({
      action,
      metadata,
      tenantId,
    });
    return result.data;
  } catch (error) {
    console.error('Error logging client activity:', error);
    throw error;
  }
};


/**
 * Fetches activities for a given tenant, with optional filters.
 * Calls the `getActivities` Firebase callable function.
 */
export const fetchActivities = async (
  tenantId: string,
  filters?: ActivityFilters
): Promise<Activity[]> => {
  if (!tenantId) {
    console.error("fetchActivities called without tenantId.");
    return []; // Or throw error
  }

  const getActivitiesCallable = httpsCallable(functions, 'getActivities');
  try {
    const payload: { tenantId: string; filters?: ActivityFilters } = { tenantId };
    if (filters) {
      payload.filters = filters;
    }
    const result: HttpsCallableResult<Activity[]> = await getActivitiesCallable(payload);
    return result.data || []; // Ensure an array is returned
  } catch (error) {
    console.error('Error fetching activities:', error);
    // Depending on the error, you might want to throw it or return an empty array.
    // For example, permission errors might be re-thrown.
    throw error;
  }
};
