import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { PrismaClient, UserRole } from "@prisma/client";

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const prisma = new PrismaClient();

/**
 * Securely fetch user data.
 */
export const getUserData = functions.https.onCall(async (data, context) => {
  const userId = data.userId;

  if (!userId || typeof userId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid userId required.');
  }

  if (context.auth && context.auth.uid !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'You can only fetch your own data.');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        tenant: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new functions.https.HttpsError('not-found', `User ${userId} not found.`);
    }

    return user;
  } catch (error) {
    console.error('getUserData error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch user data.');
  }
});

/**
 * Update a user's role with proper tenant/admin verification.
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerUid = context.auth.uid;
  const { targetUserId, newRole, tenantId } = data;

  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid targetUserId required.');
  }

  if (!newRole || !Object.values(UserRole).includes(newRole as UserRole)) {
    const validRoles = Object.values(UserRole).join(", ");
    throw new functions.https.HttpsError('invalid-argument', `Valid newRole required: ${validRoles}`);
  }

  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid tenantId required.');
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || caller.tenantId !== tenantId || caller.role !== UserRole.ADMIN) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized for this tenant.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as UserRole },
    });

    await admin.auth().setCustomUserClaims(targetUserId, {
      role: newRole,
      tenantId: tenantId,
    });

    return { 
      success: true,
      message: `User ${targetUserId} role updated to ${newRole}`,
      updatedUser: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
      },
    };
  } catch (error) {
    console.error('updateUserRole error:', error);
    if ((error as any).code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', `User ${targetUserId} not found in Firebase Auth.`);
    }
    throw new functions.https.HttpsError('internal', 'Failed to update user role.');
  }
});

/**
 * Fetch all users for a specific tenant, with admin check.
 */
export const getUsersByTenant = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerUid = context.auth.uid;
  const tenantId = data.tenantId;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid tenantId required.');
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || caller.tenantId !== tenantId || caller.role !== UserRole.ADMIN) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to fetch users for this tenant.');
    }

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
      orderBy: { name: 'asc' },
    });

    return users;
  } catch (error) {
    console.error('getUsersByTenant error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch users by tenant.');
  }
});
