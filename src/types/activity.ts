// Based on your Prisma schema for Activity
// Ensure this aligns with what your backend functions expect and return.

export interface Activity {
  id: string; // Assuming cuid or uuid
  userId: string; // ID of the user who performed the action
  // user?: User; // Optional: if you plan to populate user details on the frontend
  action: string; // e.g., "USER_LOGIN", "PRODUCT_CREATED", "LEAD_STATUS_CHANGED"
  metadata: Record<string, any> | null; // Flexible JSON object for additional details
  timestamp: string; // ISO Date string when the activity occurred
  tenantId: string;
  // tenant?: Tenant; // Optional: if you plan to populate tenant details
}

// For fetching activities, filters might be used
export interface ActivityFilters {
  userId?: string;
  dateFrom?: string; // ISO Date string
  dateTo?: string;   // ISO Date string
  // actionType?: string; // If you want to filter by specific actions
}
