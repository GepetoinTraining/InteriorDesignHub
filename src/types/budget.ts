

export interface PreBudgetItem {
  id: string; // Temporary client-side ID (e.g., UUID)
  productName: string;
  productType: PreBudgetProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // Calculated: quantity * unitPrice
}

export type PreBudgetProductType = 
  | 'Curtains' 
  | 'Blinds' 
  | 'Shades' 
  | 'Furniture' 
  | 'Decor' 
  | 'Lighting' 
  | 'Textiles' 
  | 'Accessories'
  | 'Flooring'
  | 'Wallpaper'
  | 'Paint'
  | 'Services' // For design fees, installation, etc.
  | 'Other';

export type PreBudgetStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Archived';

export interface PreBudget {
  id: string; // Generated on save (e.g., UUID)
  clientName: string;
  items: PreBudgetItem[];
  subTotal: number;
  discountAmount: number; // Can be 0
  taxRate: number; // Percentage, e.g., 0.05 for 5%
  taxAmount: number; // Calculated: (subTotal - discountAmount) * taxRate
  grandTotal: number; // Calculated: subTotal - discountAmount + taxAmount
  status: PreBudgetStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  notes?: string; // Optional notes for the pre-budget
  createdById?: string; // Optional: User ID of creator
}

// Types for BudgetsDashboardPage
export type BudgetStatusType = 'Draft' | 'Sent' | 'Approved';

export interface BudgetItemDetail {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BudgetDisplay {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: BudgetStatusType;
  supplierName: string;
  items: BudgetItemDetail[];
}