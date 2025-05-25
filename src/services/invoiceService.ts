import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  ListInvoiceFilters,
  PaginatedInvoices,
  SendInvoiceToSefazResponse, // Added this import
} from "../types/invoice"; // Adjust path as necessary

const functions = getFunctions();

// Type for the response of the listInvoices Firebase function
interface ListInvoicesResponse {
  invoices: Invoice[];
  totalInvoices: number;
  totalPages: number;
}

// Type for the response of the generateInvoiceXml Firebase function
interface GenerateInvoiceXmlResponse {
  message: string;
  xmlContent?: string;
  invoiceId: string;
  status: string; // Should map to InvoiceStatus enum
}

export const invoiceService = {
  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    const createInvoiceFunction = httpsCallable<CreateInvoiceData, Invoice>(
      functions,
      "createInvoice"
    );
    try {
      const result = await createInvoiceFunction(data);
      return result.data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      // It's good practice to throw an error that can be caught by the UI
      // You might want to parse the error from Firebase to provide a more specific message
      throw new Error("Failed to create invoice. Please try again.");
    }
  },

  getInvoice: async (invoiceId: string): Promise<Invoice | null> => {
    const getInvoiceFunction = httpsCallable<{invoiceId: string}, Invoice>(
      functions,
      "getInvoice"
    );
    try {
      const result = await getInvoiceFunction({ invoiceId });
      return result.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      // Example of how you might handle a "not-found" error specifically
      // This depends on the error structure from your Firebase Function
      // if (error.code === 'not-found') {
      //   return null;
      // }
      throw new Error("Failed to fetch invoice details.");
    }
  },

  listInvoices: async (filters: ListInvoiceFilters): Promise<PaginatedInvoices> => {
    const listInvoicesFunction = httpsCallable<ListInvoiceFilters, ListInvoicesResponse>(
      functions,
      "listInvoices"
    );
    try {
      const result = await listInvoicesFunction(filters);
      return result.data;
    } catch (error) {
      console.error("Error listing invoices:", error);
      throw new Error("Failed to list invoices.");
    }
  },

  updateInvoice: async (invoiceId: string, updateData: UpdateInvoiceData): Promise<Invoice> => {
    const updateInvoiceFunction = httpsCallable<{invoiceId: string, updateData: UpdateInvoiceData}, Invoice>(
      functions,
      "updateInvoice"
    );
    try {
      const result = await updateInvoiceFunction({ invoiceId, updateData });
      return result.data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw new Error("Failed to update invoice.");
    }
  },

  deleteInvoice: async (invoiceId: string): Promise<{ message: string }> => {
    const deleteInvoiceFunction = httpsCallable<{invoiceId: string}, { message: string }>(
      functions,
      "deleteInvoice"
    );
    try {
      const result = await deleteInvoiceFunction({ invoiceId });
      return result.data;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw new Error("Failed to delete invoice.");
    }
  },

  generateInvoiceXml: async (invoiceId: string): Promise<GenerateInvoiceXmlResponse> => {
    const generateXmlFunction = httpsCallable<{invoiceId: string}, GenerateInvoiceXmlResponse>(
      functions,
      "generateInvoiceXml"
    );
    try {
      const result = await generateXmlFunction({ invoiceId });
      return result.data;
    } catch (error) {
      console.error("Error generating invoice XML:", error);
      // You might want to customize this error message based on the error from Firebase
      throw new Error("Failed to generate XML for invoice.");
    }
  },

  sendInvoiceToSefaz: async (invoiceId: string): Promise<SendInvoiceToSefazResponse> => {
    const sendToSefazFunction = httpsCallable<{invoiceId: string}, SendInvoiceToSefazResponse>(
      functions,
      "sendInvoiceToSefaz"
    );
    try {
      const result = await sendToSefazFunction({ invoiceId });
      return result.data;
    } catch (error: any) {
      console.error("Error sending invoice to SEFAZ:", error);
      // The Firebase function might throw an HttpsError, which has a 'message' property
      // and potentially a 'code' property.
      // Propagate a meaningful error message to the UI.
      throw new Error(error.message || "Failed to send invoice to SEFAZ. Please try again.");
    }
  },
};
