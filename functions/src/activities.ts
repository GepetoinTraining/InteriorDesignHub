import * as functions from "firebase-functions";
import { PrismaClient, Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client"; // Assuming UserRole is defined in Prisma schema

const prisma = new PrismaClient();

/**
 * Logs an activity.
 * If called directly from the frontend, userId should be derived from context.auth.uid.
 * If called internally by another backend function, userId is passed in `data`.
 */
export const logActivity = functions.https.onCall(async (data, context) => {
  const { action, metadata, tenantId } = data;
  let userId = data.userId; // User ID performing the action

  // If context.auth is available (called from client), use its uid for userId
  // and verify tenantId against claims if possible.
  if (context.auth) {
    userId = context.auth.uid;
    const callerTenantId = context.auth.token?.tenantId;
    if (callerTenantId && callerTenantId !== tenantId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        `Caller (tenant: ${callerTenantId}) cannot log activity for tenant ${tenantId}.`
      );
    }
  } else if (!userId) {
    // If no auth context (backend call) and no userId passed, it's an error.
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userId is required when not called from an authenticated client."
    );
  }


  if (!action || typeof action !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'action' (string) is required.");
  }
  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid 'tenantId' (string) is required.");
  }
  // Metadata can be any JSON, so direct validation is complex here, but ensure it's at least provided.
  if (metadata === undefined) { // Check for undefined explicitly, as null might be valid JSON.
      throw new functions.https.HttpsError("invalid-argument", "'metadata' is required.");
  }
  
  try {
    const activity = await prisma.activity.create({
      data: {
        userId,
        action,
        metadata: metadata as Prisma.JsonObject, // Cast to Prisma.JsonObject
        tenantId,
      },
    });
    return activity;
  } catch (error) {
    console.error("Error logging activity:", error);
    // Check if error is due to invalid JSON in metadata
    if (error instanceof Prisma.PrismaClientValidationError) {
        throw new functions.https.HttpsError("invalid-argument", "Metadata contains invalid JSON or structure.");
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to log activity."
    );
  }
});

/**
 * Fetches activities for a tenant, with optional filters.
 * Security: Only users who are ADMIN for the tenantId can call this.
 */
export const getActivities = functions.https.onCall(async (data, context) => {
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

  // Security Check: Verify caller is an ADMIN of the requestedTenantId.
  // This can be done via custom claims or by querying the User table.
  const callerTenantIdFromClaims = context.auth.token?.tenantId;
  const callerRoleFromClaims = context.auth.token?.role as UserRole;

  if (callerTenantIdFromClaims !== requestedTenantId || callerRoleFromClaims !== UserRole.ADMIN) {
     // Fallback: query Prisma if claims are not sufficient or for double-checking
     const callerUser = await prisma.user.findUnique({
        where: { id: callerUid },
        select: { role: true, tenantId: true }
     });
     if (!callerUser || callerUser.tenantId !== requestedTenantId || callerUser.role !== UserRole.ADMIN) {
        throw new functions.https.HttpsError(
            "permission-denied",
            `Caller does not have ADMIN permission to fetch activities for tenant ${requestedTenantId}.`
        );
     }
  }
  
  const whereClause: Prisma.ActivityWhereInput = {
    tenantId: requestedTenantId,
  };

  if (filters.userId && typeof filters.userId === 'string') {
    whereClause.userId = filters.userId;
  }
  if (filters.dateFrom && typeof filters.dateFrom === 'string') {
    whereClause.timestamp = { ...whereClause.timestamp, gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo && typeof filters.dateTo === 'string') {
    whereClause.timestamp = { ...whereClause.timestamp, lte: new Date(filters.dateTo) };
  }

  try {
    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc', // Most recent activities first
      },
      take: 100, // Limit results for performance, consider pagination for real app
    });
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch activities."
    );
  }
});
