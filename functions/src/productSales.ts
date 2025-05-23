import * as functions from "firebase-functions";
import { PrismaClient, Prisma, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Records a product sale.
 * Tenant ID is crucial and should be validated against the caller's context or passed after validation.
 */
export const recordProductSale = functions.https.onCall(async (data, context) => {
  // Ensure the calling user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const callerUid = context.auth.uid; // User who is recording the sale

  const { productId, tenantId, quantity, saleAmount } = data;

  if (!productId || typeof productId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'productId' is required.");
  }
  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'tenantId' is required.");
  }
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'quantity' (positive integer) is required.");
  }
  if (typeof saleAmount !== 'number' || saleAmount < 0) { // Allow 0 for free items, but not negative
    throw new functions.https.HttpsError("invalid-argument", "Valid 'saleAmount' (non-negative number) is required.");
  }

  // Security Check: Verify the calling user belongs to the specified tenant.
  const callerTenantIdFromClaims = context.auth.token?.tenantId;
  if (callerTenantIdFromClaims !== tenantId) {
    // Optional: Fallback to check Prisma User record if claims are not definitive
    const user = await prisma.user.findUnique({ where: { id: callerUid }, select: { tenantId: true }});
    if (!user || user.tenantId !== tenantId) {
        throw new functions.https.HttpsError(
            "permission-denied",
            `Caller does not belong to tenant ${tenantId}. Cannot record sale.`
        );
    }
  }
  
  // TODO: Consider a transaction if stock update is also handled here.
  // For now, just recording the sale.
  try {
    const productSale = await prisma.productSale.create({
      data: {
        productId,
        tenantId,
        quantity,
        saleAmount,
        recordedById: callerUid, // User who recorded the sale
        // saleDate is defaulted by Prisma to now()
      },
    });

    // Optional: Update product stock (could also be a separate function or trigger)
    // await prisma.product.update({
    //   where: { id: productId, tenantId: tenantId }, // Ensure product belongs to the tenant
    //   data: { stockQty: { decrement: quantity } },
    // });
    // Need to handle cases where stock might go negative if not allowed.

    return productSale;
  } catch (error) {
    console.error("Error recording product sale:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Example: Foreign key constraint failed (e.g. productId doesn't exist)
        if (error.code === 'P2003' && error.meta?.field_name === 'ProductSale_productId_fkey') {
             throw new functions.https.HttpsError("not-found", `Product with ID ${productId} not found.`);
        }
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to record product sale."
    );
  }
});

/**
 * Fetches product sales for a tenant, with optional filters.
 * Security: Ensure only authorized users (e.g., admins or relevant roles of the tenant) can call this.
 */
export const getProductSales = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const callerUid = context.auth.uid;
  const requestedTenantId = data.tenantId;
  const filters = data.filters || {};

  if (!requestedTenantId || typeof requestedTenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'tenantId' is required.");
  }

  // Security Check: Verify caller belongs to the requestedTenantId.
  // Further role-based access (e.g., only ADMIN or SALES_MANAGER) can be added.
  const callerTenantIdFromClaims = context.auth.token?.tenantId;
  const callerRoleFromClaims = context.auth.token?.role as UserRole; // Assuming role is in claims

  let hasPermission = false;
  if (callerTenantIdFromClaims === requestedTenantId) {
    // Users can fetch sales for their own tenant.
    // Add role check if needed: e.g. if (callerRoleFromClaims === UserRole.ADMIN || callerRoleFromClaims === UserRole.SALES_PERSON)
    hasPermission = true; 
  }
  
  if (!hasPermission) {
     const callerUser = await prisma.user.findUnique({
        where: { id: callerUid },
        select: { role: true, tenantId: true }
     });
     if (callerUser && callerUser.tenantId === requestedTenantId) {
        // Add role check from Prisma if claims were not sufficient
        // e.g. if (callerUser.role === UserRole.ADMIN || callerUser.role === UserRole.SALES_PERSON)
        hasPermission = true;
     }
  }

  if (!hasPermission) {
    throw new functions.https.HttpsError(
        "permission-denied",
        `Caller does not have permission to fetch product sales for tenant ${requestedTenantId}.`
    );
  }
  
  const whereClause: Prisma.ProductSaleWhereInput = {
    tenantId: requestedTenantId,
  };

  if (filters.productId && typeof filters.productId === 'string') {
    whereClause.productId = filters.productId;
  }
  // Add other filters like date range if necessary

  try {
    const productSales = await prisma.productSale.findMany({
      where: whereClause,
      orderBy: {
        saleDate: 'desc', // Most recent sales first
      },
      include: { // Optionally include related product details
        product: {
            select: { name: true, sku: true }
        }
      },
      take: 100, // Limit results
    });
    return productSales;
  } catch (error) {
    console.error("Error fetching product sales:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch product sales."
    );
  }
});
