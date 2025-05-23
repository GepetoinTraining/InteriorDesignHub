import { Product } from './product'; // Import Product for relation

// Based on your Prisma schema for PreBudget
// Make sure this aligns with what your backend functions expect and return.

export enum PreBudgetStatus {
  DRAFT = "DRAFT",
  SENT = "SENT", // Assuming SENT is a valid status, Prisma has SUBMITTED
  APPROVED = "APPROVED",
  REJECTED = "REJECTED", // Add if used
  ARCHIVED = "ARCHIVED", // Add if used
  // Prisma has: DRAFT, SUBMITTED, APPROVED. Align as necessary.
}

export interface PreBudgetItem {
  id: string;
  preBudgetId: string;
  productId?: string;
  product?: Product; 
  customDescription?: string;
  quantity: number;
  customInputsJson?: any; 
  notes?: string;
  unitPrice?: number;
  totalPrice?: number;
  tenantId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PreBudget {
  id: string; 
  tenantId: string;
  clientName: string;
  projectScope: string;
  estimatedCost: number; 
  status: PreBudgetStatus;
  createdById: string; 
  // user?: User; 
  createdAt: string | Date; 
  updatedAt: string | Date;
  items: PreBudgetItem[]; // Added items array

  // Optional fields that might be part of your model
  // validUntil?: string | null; 
  // notes?: string | null;
  // rejectionReason?: string | null;
  // approvedById?: string | null; 
  // approvedAt?: string | null; 
}

// For creating a new PreBudget, some fields are system-generated or optional.
export type NewPreBudgetData = Omit<PreBudget, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdById" | "items"> & {
  // items will be managed by separate functions
};

// For updating a PreBudget, most fields are optional.
// id, tenantId, createdById, and items should generally not be updatable directly by the user through this type.
export type UpdatePreBudgetData = Partial<Omit<PreBudget, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdById" | "items">>;
