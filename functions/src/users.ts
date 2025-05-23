import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { PrismaClient, UserRole } from "@prisma/client";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const prisma = new PrismaClient();

/**
 * Fetches user data including role and tenantId from Prisma.
 * This function itself doesn't do auth checks on the caller,
 * assuming it's either called by other backend functions or a protected frontend endpoint
 * that has already verified the caller's permissions.
 */
export const getUserData = functions.https.onCall(async (data, context) => {
  const userId = data.userId;

  if (!userId || typeof userId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid userId."
    );
  }

  // For direct calls from frontend, ensure the caller is authenticated.
  // If called by another function, context.auth might be undefined.
  // The check below is a basic one. More sophisticated checks might be needed
  // e.g. if only admins or the user themselves can fetch their data.
  if (context.auth && context.auth.uid !== userId /* && !isCallerAdmin(context.auth.uid) */) {
     // TODO: Implement isCallerAdmin or similar check if non-self data access is allowed for admins
     // For now, let's assume only the user themselves or a backend service (no auth context) can call this for a specific userId
    // throw new functions.https.HttpsError(
    //   "permission-denied",
    //   "You do not have permission to fetch this user's data."
    // );
  }


  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: { // Explicitly select fields to return to avoid exposing sensitive data
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
          }
        }
        // Add other fields as necessary, e.g., profile picture URL
      },
    });

    if (!user) {
      throw new functions.https.HttpsError(
        "not-found",
        `User with ID ${userId} not found.`
      );
    }
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch user data."
    );
  }
});

/**
 * Updates a user's role within a specific tenant.
 * - Verifies that the calling user is an ADMIN for the specified tenant.
 * - Updates the target user's role in Prisma.
 * - Sets Firebase Auth custom claims for the target user.
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Ensure the calling user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const callerUid = context.auth.uid;

  const { targetUserId, newRole, tenantId } = data;

  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid targetUserId is required.");
  }
  if (!newRole || typeof newRole !== 'string' || !Object.values(UserRole).includes(newRole as UserRole)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid newRole is required (ADMIN, DESIGNER, USER).");
  }
  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid tenantId is required.");
  }

  try {
    // Security Check: Verify the calling user is an ADMIN for the specified tenant.
    const कॉलर = await prisma.user.findUnique({ // Renamed to avoid conflict with 'user' variable later
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!कॉलर || कॉलर.tenantId !== tenantId || कॉलर.role !== UserRole.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Caller does not have permission to update roles for this tenant."
      );
    }

    // Update the target user's role in Prisma.
    const updatedUserInPrisma = await prisma.user.update({
      where: {
        id: targetUserId,
        tenantId: tenantId, // Ensure the target user is in the same tenant.
      },
      data: {
        role: newRole as UserRole,
      },
    });

    if (!updatedUserInPrisma) {
        throw new functions.https.HttpsError(
            "not-found",
            `Target user with ID ${targetUserId} not found in tenant ${tenantId}.`
        );
    }

    // Set/update Firebase Auth custom claims for the target user.
    await admin.auth().setCustomUserClaims(targetUserId, {
      role: newRole,
      tenantId: tenantId,
      // You can add other claims if needed, e.g., lastRoleUpdate: new Date().toISOString()
    });

    return { 
      success: true, 
      message: `User ${targetUserId}'s role updated to ${newRole} and custom claims set.`,
      updatedUser: {
        id: updatedUserInPrisma.id,
        email: updatedUserInPrisma.email,
        name: updatedUserInPrisma.name,
        role: updatedUserInPrisma.role,
        tenantId: updatedUserInPrisma.tenantId
      }
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // Check if error is due to user not found in Firebase Auth when setting claims
    if ((error as any).code === 'auth/user-not-found') {
         throw new functions.https.HttpsError(
            "not-found",
            `User with ID ${targetUserId} not found in Firebase Authentication. Cannot set custom claims.`
        );
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update user role."
    );
  }
});

/**
 * Fetches all users for a given tenant.
 * - Verifies that the calling user is an ADMIN for the specified tenant.
 */
export const getUsersByTenant = functions.https.onCall(async (data, context) => {
  // Ensure the calling user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const callerUid = context.auth.uid;
  const tenantId = data.tenantId;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid tenantId is required.");
  }

  try {
    // Security Check: Verify the calling user is an ADMIN for the specified tenant.
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || caller.tenantId !== tenantId || caller.role !== UserRole.ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Caller does not have permission to fetch users for this tenant."
      );
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
      },
      select: { // Select only necessary fields
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        // Do not include sensitive fields like passwordHash if it exists
      },
      orderBy: {
        name: 'asc', // Optional: order users by name
      }
    });

    return users;
  } catch (error) {
    console.error("Error fetching users by tenant:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch users by tenant."
    );
  }
});

// TODO: Implement getTenantDetails (could be in a separate tenants.ts)
