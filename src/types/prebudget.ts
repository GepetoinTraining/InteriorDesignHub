// Based on your Prisma schema for PreBudget
// Make sure this aligns with what your backend functions expect and return.

export enum PreBudgetStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export interface PreBudget {
  id: string; // Assuming cuid or uuid
  tenantId: string;
  clientName: string;
  projectScope: string;
  estimatedCost: number; // Consider using a decimal library for financial values if precision is critical
  status: PreBudgetStatus;
  createdById: string; // ID of the user who created this pre-budget
  // user?: User; // Optional: if you plan to populate user details
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string

  // Optional fields that might be part of your model
  // validUntil?: string | null; // ISO Date string
  // notes?: string | null;
  // rejectionReason?: string | null;
  // approvedById?: string | null; // User who approved it
  // approvedAt?: string | null; // ISO Date string
}

// For creating a new PreBudget, some fields are system-generated or optional.
export type NewPreBudgetData = Omit<PreBudget, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdById"> & {
  // tenantId and createdById will be added by the service or backend logic
  // clientName, projectScope, estimatedCost, status are required from the user
};

// For updating a PreBudget, most fields are optional.
// id, tenantId, and createdById should generally not be updatable directly by the user through this type.
export type UpdatePreBudgetData = Partial<Omit<PreBudget, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdById">>;
