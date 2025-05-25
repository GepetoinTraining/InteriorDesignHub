import { InvoiceStatus, Role } from "@prisma/client"; // Assuming Prisma types can be shared or redefined

export { InvoiceStatus }; // Exporting enum for use in frontend

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  // Optional: Include client user details if needed, fetched separately or joined
  // client?: { id: string; name: string; email: string }; 
  items: InvoiceItem[];
  totalAmount: number;
  issueDate: string; // ISO date string
  dueDate: string;   // ISO date string
  status: InvoiceStatus;
  xmlContent?: string | null;
  sefazReference?: string | null;
  tenantId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  clientId: string;
  items: InvoiceItem[];
  totalAmount: number;
  dueDate: string; // ISO date string
  status: InvoiceStatus; // Use the enum here
  tenantId: string;
  xmlContent?: string;
  sefazReference?: string;
}

export interface UpdateInvoiceData {
  invoiceNumber?: string;
  clientId?: string;
  items?: InvoiceItem[];
  totalAmount?: number;
  dueDate?: string; // ISO date string
  status?: InvoiceStatus;
  xmlContent?: string;
  sefazReference?: string;
}

export interface ListInvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  tenantId: string; // tenantId is mandatory
  page?: number;
  pageSize?: number;
  // Add other potential filters like date ranges, etc.
}

export interface PaginatedInvoices {
  invoices: Invoice[];
  totalInvoices: number;
  totalPages: number;
}

// Re-defining Role enum if not directly importable or to avoid direct backend dependency
// If you have a shared types package, that would be ideal.
export enum UserRole {
  ADMIN = "ADMIN",
  VENDEDOR = "VENDEDOR",
  COMPRADOR = "COMPRADOR",
  FINANCEIRO = "FINANCEIRO",
  CLIENTE_FINAL = "CLIENTE_FINAL",
  USER = "USER",
}

export interface SendInvoiceToSefazResponse {
  message: string;
  sefazReference?: string; // Present on success, might be error message on failure if handled that way
  invoiceId: string;
  status: InvoiceStatus; // The new status of the invoice
}
