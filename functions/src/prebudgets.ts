import * as functions from "firebase-functions";
import { PrismaClient, PreBudgetStatus, Role, User } from "@prisma/client"; // Added Role and User
import { HttpsError } from "firebase-functions/v1/https"; // Added HttpsError for explicit error throwing

const prisma = new PrismaClient();

// Helper function to get user and verify tenant
const getAuthenticatedUserAndTenant = async (context: functions.https.CallableContext, tenantIdFromData?: string) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const user = await prisma.user.findUnique({ where: { id: context.auth.uid } });
  if (!user) {
    throw new HttpsError("not-found", "Authenticated user not found in database.");
  }
  if (tenantIdFromData && user.tenantId !== tenantIdFromData) {
    throw new HttpsError("permission-denied", "User does not belong to the specified tenant.");
  }
  return user;
};

/**
 * Fetches all pre-budgets for the user's tenant.
 */
export const getPreBudgets = functions.https.onCall(async (data, context) => {
  const user = await getAuthenticatedUserAndTenant(context); // Basic auth check
  const tenantIdToQuery = data.tenantId || user.tenantId; // Use provided tenantId or user's tenantId

  if (user.tenantId !== tenantIdToQuery && user.role !== Role.ADMIN) { // Non-admins cannot query other tenants
      throw new HttpsError("permission-denied", "Access denied to this tenant's pre-budgets.");
  }
  
  if (!tenantIdToQuery || typeof tenantIdToQuery !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid tenantId or by a user with a tenantId.");
  }

  try {
    const preBudgets = await prisma.preBudget.findMany({
      where: {
        tenantId: tenantIdToQuery,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { // Optionally include createdBy user details
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return preBudgets;
  } catch (error) {
    console.error("Error fetching pre-budgets:", error);
    throw new HttpsError("internal", "Failed to fetch pre-budgets.");
  }
});

/**
 * Fetches a single pre-budget by its ID, ensuring it belongs to the user's tenant.
 */
export const getPreBudgetById = functions.https.onCall(async (data, context) => {
  const user = await getAuthenticatedUserAndTenant(context);
  const { preBudgetId, tenantId: requestedTenantId } = data;
  const tenantIdToQuery = requestedTenantId || user.tenantId;

  if (user.tenantId !== tenantIdToQuery && user.role !== Role.ADMIN) {
    throw new HttpsError("permission-denied", "Access denied to this pre-budget.");
  }

  if (!preBudgetId || typeof preBudgetId !== 'string' || !tenantIdToQuery || typeof tenantIdToQuery !== 'string') {
    throw new HttpsError("invalid-argument", "Valid preBudgetId and tenantId are required.");
  }

  try {
    const preBudget = await prisma.preBudget.findUnique({
      where: {
        id: preBudgetId,
        tenantId: tenantIdToQuery,
      },
      include: {
        items: true, // Include items by default
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    // If user is VENDEDOR, ensure they created this pre-budget or are ADMIN
    if (preBudget && user.role === Role.VENDEDOR && preBudget.createdById !== user.id) {
        throw new HttpsError("permission-denied", "VENDEDOR can only view their own pre-budgets.");
    }
    return preBudget;
  } catch (error) {
    console.error("Error fetching pre-budget by ID:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to fetch pre-budget by ID.");
  }
});

/**
 * Creates a new pre-budget for the user's tenant.
 * The createdById is taken from the authenticated user's UID.
 */
export const createPreBudget = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  const user = await getAuthenticatedUserAndTenant(context, data.tenantId); // Ensures user belongs to data.tenantId if provided
  const createdById = user.id;

  const { 
    clientName, projectScope, estimatedCost, status = PreBudgetStatus.DRAFT, tenantId = user.tenantId,
    notes, subTotal, discountAmount, taxRate, taxAmount, grandTotal 
  } = data;

  // Validate required fields
  if (!clientName || typeof clientName !== 'string') {
    throw new HttpsError("invalid-argument", "Valid clientName is required.");
  }
  if (!projectScope || typeof projectScope !== 'string') { // projectScope can be optional or have default
    throw new HttpsError("invalid-argument", "Valid projectScope is required.");
  }
  if (typeof estimatedCost !== 'number' || estimatedCost < 0) { // This is initial estimate, grandTotal will be calculated
    throw new HttpsError("invalid-argument", "Valid estimatedCost is required and must be non-negative.");
  }
  if (!status || typeof status !== 'string' || !Object.values(PreBudgetStatus).includes(status as PreBudgetStatus)) {
    throw new HttpsError("invalid-argument", "Valid status is required.");
  }
  if (!tenantId || typeof tenantId !== 'string') { // Should be derived from user or validated
    throw new HttpsError("invalid-argument", "Valid tenantId is required and must match authenticated user's tenant.");
  }
  
  // Validate new financial fields (optional, so check if provided)
  if (subTotal !== undefined && (typeof subTotal !== 'number' || subTotal < 0)) {
    throw new HttpsError("invalid-argument", "subTotal must be a non-negative number.");
  }
  if (discountAmount !== undefined && (typeof discountAmount !== 'number' || discountAmount < 0)) {
    throw new HttpsError("invalid-argument", "discountAmount must be a non-negative number.");
  }
  if (taxRate !== undefined && (typeof taxRate !== 'number' || taxRate < 0 || taxRate > 1)) { // Assuming taxRate is decimal e.g. 0.07
    throw new HttpsError("invalid-argument", "taxRate must be a number between 0 and 1.");
  }
  if (taxAmount !== undefined && (typeof taxAmount !== 'number' || taxAmount < 0)) {
    throw new HttpsError("invalid-argument", "taxAmount must be a non-negative number.");
  }
  if (grandTotal !== undefined && (typeof grandTotal !== 'number' || grandTotal < 0)) {
    throw new HttpsError("invalid-argument", "grandTotal must be a non-negative number.");
  }
  if (notes !== undefined && typeof notes !== 'string') {
    throw new HttpsError("invalid-argument", "notes must be a string.");
  }


  try {
    const preBudgetData: any = {
      clientName,
      projectScope,
      estimatedCost,
      status: status as PreBudgetStatus,
      tenantId,
      createdById,
      notes,
      subTotal,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
    };
    // Remove undefined fields so Prisma uses defaults or skips them
    Object.keys(preBudgetData).forEach(key => preBudgetData[key] === undefined && delete preBudgetData[key]);

    const preBudget = await prisma.preBudget.create({ data: preBudgetData });
    return preBudget;
  } catch (error) {
    console.error("Error creating pre-budget:", error);
    throw new HttpsError("internal", "Failed to create pre-budget.");
  }
});

/**
 * Updates an existing pre-budget for the user's tenant.
 */
export const updatePreBudget = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const user = await getAuthenticatedUserAndTenant(context, data.tenantId);
  const { preBudgetId, tenantId = user.tenantId, ...updatePayload } = data;

  if (!preBudgetId || typeof preBudgetId !== 'string') {
    throw new HttpsError("invalid-argument", "Valid preBudgetId is required.");
  }
  if (user.tenantId !== tenantId && user.role !== Role.ADMIN) {
      throw new HttpsError("permission-denied", "Access denied to update this pre-budget.");
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new HttpsError("invalid-argument", "No data provided for update.");
  }
  
  // Validate new financial fields if present in updatePayload
  if (updatePayload.subTotal !== undefined && (typeof updatePayload.subTotal !== 'number' || updatePayload.subTotal < 0)) {
    throw new HttpsError("invalid-argument", "subTotal must be a non-negative number.");
  }
  // ... (add similar checks for discountAmount, taxRate, taxAmount, grandTotal, notes as in createPreBudget)
  if (updatePayload.taxRate !== undefined && (typeof updatePayload.taxRate !== 'number' || updatePayload.taxRate < 0 || updatePayload.taxRate > 1)) {
    throw new HttpsError("invalid-argument", "taxRate must be a number between 0 and 1.");
  }


  try {
    const existingPreBudget = await prisma.preBudget.findFirst({
      where: { id: preBudgetId, tenantId: tenantId },
    });

    if (!existingPreBudget) {
      throw new HttpsError("not-found", `Pre-budget with ID ${preBudgetId} not found or does not belong to your tenant.`);
    }

    // Permission check for VENDEDOR
    if (user.role === Role.VENDEDOR && existingPreBudget.createdById !== user.id) {
      throw new HttpsError("permission-denied", "VENDEDOR can only update their own pre-budgets.");
    }
    if (user.role === Role.VENDEDOR && existingPreBudget.status !== PreBudgetStatus.DRAFT) {
      throw new HttpsError("failed-precondition", "VENDEDOR can only update pre-budgets in DRAFT status.");
    }
    // Admins can update regardless of status, unless further business rules are added.

    // Prevent updating createdById or tenantId
    delete updatePayload.createdById;
    delete updatePayload.tenantId;
    
    // Ensure status, if provided, is valid
    if (updatePayload.status && !Object.values(PreBudgetStatus).includes(updatePayload.status as PreBudgetStatus)) {
        throw new HttpsError("invalid-argument", "Invalid status provided.");
    }


    const updatedPreBudget = await prisma.preBudget.update({
      where: { id: preBudgetId },
      data: updatePayload,
    });
    return updatedPreBudget;
  } catch (error) {
    console.error("Error updating pre-budget:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to update pre-budget.");
  }
});

/**
 * Deletes a pre-budget for the user's tenant.
 */
export const deletePreBudget = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const user = await getAuthenticatedUserAndTenant(context, data.tenantId);
  const { preBudgetId, tenantId = user.tenantId } = data;

  if (!preBudgetId || typeof preBudgetId !== 'string') {
    throw new HttpsError("invalid-argument", "Valid preBudgetId is required.");
  }
   if (user.tenantId !== tenantId && user.role !== Role.ADMIN) {
      throw new HttpsError("permission-denied", "Access denied to delete this pre-budget.");
  }

  try {
    const existingPreBudget = await prisma.preBudget.findFirst({
      where: { id: preBudgetId, tenantId: tenantId },
    });

    if (!existingPreBudget) {
      throw new HttpsError("not-found", `Pre-budget with ID ${preBudgetId} not found or does not belong to your tenant.`);
    }

    // Permission check for VENDEDOR
    if (user.role === Role.VENDEDOR && existingPreBudget.createdById !== user.id) {
      throw new HttpsError("permission-denied", "VENDEDOR can only delete their own pre-budgets.");
    }
    if (user.role === Role.VENDEDOR && existingPreBudget.status !== PreBudgetStatus.DRAFT) {
      throw new HttpsError("failed-precondition", "VENDEDOR can only delete pre-budgets in DRAFT status.");
    }
    // Admins can delete regardless of status (includes items due to cascade delete on PreBudgetItem model)

    // Cascading delete for PreBudgetItems is handled by Prisma schema (onDelete: Cascade)
    await prisma.preBudget.delete({
      where: { id: preBudgetId },
    });
    return { success: true, preBudgetId: preBudgetId };
  } catch (error) {
    console.error("Error deleting pre-budget:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to delete pre-budget.");
  }
});
