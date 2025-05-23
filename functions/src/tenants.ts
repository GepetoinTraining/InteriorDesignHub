import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const prisma = new PrismaClient();

/**
 * Fetches tenant details for a given tenantId.
 * - Ensures the calling user belongs to this tenant (via custom claims).
 */
export const getTenantDetails = functions.https.onCall(async (data, context) => {
  // Ensure the calling user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }
  const callerUid = context.auth.uid;
  const tenantIdFromRequest = data.tenantId; // Tenant ID for which details are requested

  if (!tenantIdFromRequest || typeof tenantIdFromRequest !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "Valid tenantId is required in the request.");
  }

  // Security Check: Ensure the calling user belongs to this tenant.
  // This is typically done by checking custom claims set during login/role update.
  const callerTenantIdFromClaims = context.auth.token?.tenantId;

  if (callerTenantIdFromClaims !== tenantIdFromRequest) {
    // Additionally, you might want to allow users with a 'SUPER_ADMIN' role to fetch any tenant's details.
    // const callerRoleFromClaims = context.auth.token?.role;
    // if (callerRoleFromClaims !== 'SUPER_ADMIN') { // Assuming 'SUPER_ADMIN' is a global role
      throw new functions.https.HttpsError(
        "permission-denied",
        `Caller (tenant: ${callerTenantIdFromClaims}) does not have permission to fetch details for tenant ${tenantIdFromRequest}.`
      );
    // }
  }
  
  // As an alternative or additional check, you could query Prisma for the user's tenant.
  // However, relying on claims is generally more efficient for this type of check.
  // const userRecord = await prisma.user.findUnique({ where: { id: callerUid }, select: { tenantId: true } });
  // if (!userRecord || userRecord.tenantId !== tenantIdFromRequest) {
  //   throw new functions.https.HttpsError(
  //     "permission-denied",
  //     "Caller does not belong to the specified tenant (checked via Prisma)."
  //   );
  // }


  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantIdFromRequest,
      },
      select: { // Select only necessary and safe fields
        id: true,
        name: true,
        slug: true, // if you have slugs
        themeColor: true,
        logoUrl: true,
        // Add other fields as necessary
      },
    });

    if (!tenant) {
      throw new functions.https.HttpsError(
        "not-found",
        `Tenant with ID ${tenantIdFromRequest} not found.`
      );
    }

    return tenant;
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch tenant details."
    );
  }
});
