import * as functions from "firebase-functions";
import { PrismaClient, PreBudgetStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetches all pre-budgets for the user's tenant.
 */
export const getPreBudgets = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const tenantId = data.tenantId;
  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid tenantId."
    );
  }

  // TODO: Add logic to ensure the authenticated user belongs to the specified tenant.
  // This might involve checking a UserTenant table or similar.
  // For now, we assume the caller has the right to access this tenant's data.

  try {
    const preBudgets = await prisma.preBudget.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: 'desc', // Optional: order by creation date
      }
    });
    return preBudgets;
  } catch (error) {
    console.error("Error fetching pre-budgets:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch pre-budgets."
    );
  }
});

/**
 * Fetches a single pre-budget by its ID, ensuring it belongs to the user's tenant.
 */
export const getPreBudgetById = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { preBudgetId, tenantId } = data;
  if (!preBudgetId || typeof preBudgetId !== 'string' || !tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid preBudgetId and tenantId."
    );
  }

  // TODO: Add logic to ensure the authenticated user belongs to the specified tenant.

  try {
    const preBudget = await prisma.preBudget.findUnique({
      where: {
        id: preBudgetId,
        tenantId: tenantId,
      },
    });
    return preBudget; // Returns null if not found, which is acceptable.
  } catch (error) {
    console.error("Error fetching pre-budget by ID:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch pre-budget by ID."
    );
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
  const createdById = context.auth.uid; // Use Firebase Auth UID

  const { clientName, projectScope, estimatedCost, status, tenantId } = data;

  // Validate required fields
  if (!clientName || typeof clientName !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid clientName is required.");
  }
  if (!projectScope || typeof projectScope !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid projectScope is required.");
  }
  if (typeof estimatedCost !== 'number' || estimatedCost < 0) {
    throw new functions.https.HttpsError("invalid-argument", "Valid estimatedCost is required and must be non-negative.");
  }
  if (!status || typeof status !== 'string' || !Object.values(PreBudgetStatus).includes(status as PreBudgetStatus)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid status is required.");
  }
  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid tenantId is required.");
  }

  // TODO: Add logic to ensure the authenticated user belongs to the specified tenant.

  try {
    const preBudget = await prisma.preBudget.create({
      data: {
        clientName,
        projectScope,
        estimatedCost,
        status: status as PreBudgetStatus,
        tenantId,
        createdById, // Automatically set from auth context
        // userId: createdById, // Assuming relation to User model is 'userId'
      },
    });
    return preBudget;
  } catch (error) {
    console.error("Error creating pre-budget:", error);
    // Check for specific Prisma errors if needed, e.g., foreign key violation if createdById is not valid
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create pre-budget."
    );
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

  const { preBudgetId, tenantId, ...updateData } = data;

  if (!preBudgetId || typeof preBudgetId !== 'string' || !tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid preBudgetId and tenantId."
    );
  }

  // Validate that updateData is not empty
  if (Object.keys(updateData).length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No data provided for update."
    );
  }
  
  // Optional: Validate specific fields in updateData if necessary
  if (updateData.status && (typeof updateData.status !== 'string' || !Object.values(PreBudgetStatus).includes(updateData.status as PreBudgetStatus))) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid status provided.");
  }
  if (updateData.estimatedCost && (typeof updateData.estimatedCost !== 'number' || updateData.estimatedCost < 0)) {
     throw new functions.https.HttpsError("invalid-argument", "Invalid estimatedCost provided.");
  }


  // TODO: Add logic to ensure the authenticated user belongs to the specified tenant 
  // and has permission to update (e.g., might be the creator or an admin).

  try {
    // First, verify the pre-budget exists and belongs to the tenant.
    const existingPreBudget = await prisma.preBudget.findFirst({
      where: {
        id: preBudgetId,
        tenantId: tenantId,
      },
    });

    if (!existingPreBudget) {
      throw new functions.https.HttpsError(
        "not-found",
        `Pre-budget with ID ${preBudgetId} not found or does not belong to the tenant.`
      );
    }

    // Prevent updating createdById or tenantId directly
    delete updateData.createdById;
    delete updateData.tenantId;


    const updatedPreBudget = await prisma.preBudget.update({
      where: {
        id: preBudgetId,
        // tenantId check is implicitly handled by the findFirst above, but good for safety
      },
      data: updateData,
    });
    return updatedPreBudget;
  } catch (error) {
    console.error("Error updating pre-budget:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update pre-budget."
    );
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

  const { preBudgetId, tenantId } = data;

  if (!preBudgetId || typeof preBudgetId !== 'string' || !tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid preBudgetId and tenantId."
    );
  }

  // TODO: Add logic to ensure the authenticated user belongs to the specified tenant
  // and has permission to delete (e.g., might be the creator or an admin).

  try {
    // First, verify the pre-budget exists and belongs to the tenant.
    const existingPreBudget = await prisma.preBudget.findFirst({
      where: {
        id: preBudgetId,
        tenantId: tenantId,
      },
    });

    if (!existingPreBudget) {
      throw new functions.https.HttpsError(
        "not-found",
        `Pre-budget with ID ${preBudgetId} not found or does not belong to the tenant.`
      );
    }

    // If the user is not the creator, you might want to restrict deletion
    // For example: if (existingPreBudget.createdById !== context.auth.uid) {
    //   throw new functions.https.HttpsError("permission-denied", "You do not have permission to delete this pre-budget.");
    // }

    await prisma.preBudget.delete({
      where: {
        id: preBudgetId,
      },
    });
    return { success: true, preBudgetId: preBudgetId };
  } catch (error) {
    console.error("Error deleting pre-budget:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete pre-budget."
    );
  }
});
