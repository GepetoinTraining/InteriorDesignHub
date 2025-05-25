import * as functions from "firebase-functions";
import { PrismaClient, InvoiceStatus, Role, User } from "@prisma/client"; // Added User
import {HttpsError} from "firebase-functions/v1/https";
import { create } from "xmlbuilder2"; // Added xmlbuilder2

const prisma = new PrismaClient();

interface CreateInvoiceData {
  invoiceNumber: string;
  clientId: string;
  items: any; // Adjust this type based on how you structure 'items' JSON
  totalAmount: number;
  dueDate: string; // ISO date string
  status: InvoiceStatus;
  tenantId: string;
  xmlContent?: string;
  sefazReference?: string;
}

interface UpdateInvoiceData {
  invoiceNumber?: string;
  clientId?: string;
  items?: any;
  totalAmount?: number;
  dueDate?: string; // ISO date string
  status?: InvoiceStatus;
  xmlContent?: string;
  sefazReference?: string;
}

interface ListInvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  tenantId: string; // tenantId is mandatory for listing
  page?: number;
  pageSize?: number;
}

// Helper function to check user permissions
const ensureUserIsAuthenticatedAndAuthorized = async (context: functions.https.CallableContext, tenantIdToCheck: string, allowedRoles: Role[]) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  const user = await prisma.user.findUnique({
    where: { id: context.auth.uid },
  });
  if (!user) {
    throw new HttpsError("not-found", "User not found.");
  }
  if (user.tenantId !== tenantIdToCheck) {
    throw new HttpsError("permission-denied", "User does not belong to the specified tenant.");
  }
  if (!allowedRoles.includes(user.role)) {
    throw new HttpsError("permission-denied", `User role ${user.role} is not authorized for this action.`);
  }
  return user;
};

export const createInvoice = functions.https.onCall(async (data: CreateInvoiceData, context) => {
  await ensureUserIsAuthenticatedAndAuthorized(context, data.tenantId, [Role.ADMIN, Role.FINANCEIRO, Role.VENDEDOR]);

  try {
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
    });
    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not create invoice.");
  }
});

export const getInvoice = functions.https.onCall(async (data: {invoiceId: string}, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) {
      throw new HttpsError("not-found", "Invoice not found.");
    }
    // Authorization: Ensure user belongs to the invoice's tenant
    await ensureUserIsAuthenticatedAndAuthorized(context, invoice.tenantId, [Role.ADMIN, Role.FINANCEIRO, Role.VENDEDOR, Role.CLIENTE_FINAL]);
    return invoice;
  } catch (error) {
    console.error("Error getting invoice:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not get invoice.");
  }
});

export const listInvoices = functions.https.onCall(async (filters: ListInvoiceFilters, context) => {
  await ensureUserIsAuthenticatedAndAuthorized(context, filters.tenantId, [Role.ADMIN, Role.FINANCEIRO, Role.VENDEDOR, Role.CLIENTE_FINAL]);

  const { status, clientId, tenantId, page = 1, pageSize = 10 } = filters;
  const whereClause: any = { tenantId };

  if (status) {
    whereClause.status = status;
  }
  if (clientId) {
    whereClause.clientId = clientId;
  }
  
  // If the user is CLIENTE_FINAL, they should only see their own invoices.
  if (context.auth) {
      const user = await prisma.user.findUnique({ where: { id: context.auth.uid }});
      if (user && user.role === Role.CLIENTE_FINAL) {
          whereClause.clientId = user.id;
      }
  }


  try {
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    const totalInvoices = await prisma.invoice.count({ where: whereClause });
    return { invoices, totalInvoices, totalPages: Math.ceil(totalInvoices / pageSize) };
  } catch (error) {
    console.error("Error listing invoices:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not list invoices.");
  }
});

export const updateInvoice = functions.https.onCall(async (data: {invoiceId: string, updateData: UpdateInvoiceData}, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { invoiceId, updateData } = data;

  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existingInvoice) {
      throw new HttpsError("not-found", "Invoice not found to update.");
    }

    await ensureUserIsAuthenticatedAndAuthorized(context, existingInvoice.tenantId, [Role.ADMIN, Role.FINANCEIRO]);
    
    const { dueDate, ...restOfData } = updateData;
    const dataToUpdate: any = { ...restOfData };
    if (dueDate) {
      dataToUpdate.dueDate = new Date(dueDate);
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: dataToUpdate,
    });
    return invoice;
  } catch (error) {
    console.error("Error updating invoice:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not update invoice.");
  }
});

export const deleteInvoice = functions.https.onCall(async (data: {invoiceId: string}, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  const { invoiceId } = data;

  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existingInvoice) {
      throw new HttpsError("not-found", "Invoice not found to delete.");
    }
    await ensureUserIsAuthenticatedAndAuthorized(context, existingInvoice.tenantId, [Role.ADMIN, Role.FINANCEIRO]);

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    return { message: "Invoice deleted successfully." };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not delete invoice.");
  }
});

interface InvoiceItemDetail {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const generateInvoiceXml = functions.https.onCall(async (data: {invoiceId: string}, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { invoiceId } = data;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true, // Include client details
        // tenant: true, // To get tenant details if needed for XML
      },
    });

    if (!invoice) {
      throw new HttpsError("not-found", "Invoice not found.");
    }

    // Authorization: Ensure user is authenticated and authorized for the invoice's tenant
    await ensureUserIsAuthenticatedAndAuthorized(context, invoice.tenantId, [Role.ADMIN, Role.FINANCEIRO]);
    
    // Type guard for invoice.items
    const items = Array.isArray(invoice.items) ? invoice.items as InvoiceItemDetail[] : [];
    if (!Array.isArray(invoice.items)) {
        console.warn(`Invoice items for invoice ${invoiceId} is not an array:`, invoice.items);
        // Depending on requirements, you might throw an error or proceed with empty items
        // For now, proceeding with empty items if format is unexpected
    }


    // Construct XML
    // This is a simplified structure. Real NFe XML is much more complex.
    const root = create({ version: "1.0", encoding: "UTF-8" })
      .ele("NFe")
        .ele("infNFe")
          .ele("ide")
            .ele("nNF").txt(invoice.invoiceNumber).up()
            .ele("dhEmi").txt(invoice.issueDate.toISOString()).up()
            .ele("vNF").txt(invoice.totalAmount.toFixed(2)).up()
          .up()
          .ele("emit") // Emitter (Tenant/Company) - Mock data for now
            .ele("CNPJ").txt("00000000000191").up() // Placeholder
            .ele("xNome").txt(invoice.tenantId).up() // Using tenantId as a placeholder for company name
          .up()
          .ele("dest") // Destination (Client)
            .ele("CNPJ").txt(invoice.client.id.substring(0,14).padStart(14, '0')).up() // Placeholder client Tax ID from client.id
            .ele("xNome").txt(invoice.client.name).up()
          .up();

    items.forEach((item: InvoiceItemDetail, index: number) => {
      root.ele("det", { nItem: (index + 1).toString() })
        .ele("prod")
          .ele("cProd").txt(`PROD${index + 1}`).up() // Placeholder product code
          .ele("xProd").txt(item.description).up()
          .ele("qCom").txt(item.quantity.toString()).up()
          .ele("vUnCom").txt(item.unitPrice.toFixed(2)).up()
          .ele("vProd").txt(item.totalPrice.toFixed(2)).up()
        .up()
      .up();
    });
    
    const xmlString = root.end({ prettyPrint: true });

    // Update invoice in DB
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        xmlContent: xmlString,
        status: InvoiceStatus.XML_GENERATED,
      },
    });

    return { 
      message: "XML generated and invoice updated successfully.", 
      xmlContent: xmlString, // Optionally return XML content
      invoiceId: updatedInvoice.id,
      status: updatedInvoice.status,
    };

  } catch (error) {
    console.error(`Error generating XML for invoice ${invoiceId}:`, error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not generate XML for invoice.");
  }
});

export const sendInvoiceToSefaz = functions.https.onCall(async (data: {invoiceId: string}, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { invoiceId } = data;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new HttpsError("not-found", "Invoice not found.");
    }

    // Authorization
    await ensureUserIsAuthenticatedAndAuthorized(context, invoice.tenantId, [Role.ADMIN, Role.FINANCEIRO]);

    // Precondition check
    if (!invoice.xmlContent || invoice.status !== InvoiceStatus.XML_GENERATED) {
      throw new HttpsError("failed-precondition", "Invoice XML not generated or status is not XML_GENERATED.");
    }

    console.log(`Simulating sending invoice ${invoiceId} with XML content to SEFAZ.`);
    // console.log("XML Content:", invoice.xmlContent); // Avoid logging potentially large XML in production

    // Simulate network latency
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate SEFAZ success/failure
    const isSuccess = Math.random() < 0.8; // 80% success rate

    let updatedInvoice;
    if (isSuccess) {
      const mockProtocol = `mock_protocol_${Date.now()}`;
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SEFAZ_SENT,
          sefazReference: mockProtocol,
        },
      });
      return { 
        message: "Invoice sent to SEFAZ successfully (simulated).", 
        sefazReference: mockProtocol,
        invoiceId: updatedInvoice.id,
        status: updatedInvoice.status,
      };
    } else {
      const mockError = "mock_error_simulation_failed_try_again";
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SEFAZ_ERROR,
          sefazReference: mockError,
        },
      });
      // Throw an error that the client can catch
      throw new HttpsError("internal", `Simulated SEFAZ submission failed: ${mockError}`);
    }
  } catch (error) {
    console.error(`Error sending invoice ${invoiceId} to SEFAZ:`, error);
    if (error instanceof HttpsError) throw error; // Re-throw HttpsError
    throw new HttpsError("internal", "Could not send invoice to SEFAZ.");
  }
});
