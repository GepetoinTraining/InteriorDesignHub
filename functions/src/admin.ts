import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sets the isAdminRegistered flag in Firestore.
 * This function should ideally be secured, e.g., callable only once,
 * or by a user with specific pre-existing custom claims if the first user isn't auto-admin.
 * For this context, we assume it's called right after the first admin registration.
 */
export const setAdminRegisteredFlag = functions.https.onCall(async (data, context) => {
  // Basic check: Ensure the caller is authenticated (should be the newly registered admin)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }

  try {
    const adminSettingsRef = db.collection("app_config").doc("admin_settings");
    await adminSettingsRef.set({
      isAdminRegistered: true,
      // You could also store who registered, timestamp, etc.
      // registeredBy: context.auth.uid,
      // registeredAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // Use merge:true to avoid overwriting other settings if any

    console.log(`isAdminRegistered flag set to true by user: ${context.auth.uid}`);
    return { success: true, message: "Admin registered flag set." };
  } catch (error) {
    console.error("Error setting admin registered flag:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to set admin registered flag."
    );
  }
});

/**
 * Creates the first user (admin) in Prisma and sets their custom claims.
 * This function is intended to be called ONLY ONCE during initial setup,
 * typically right after the first Firebase Auth user (admin) is created.
 * It requires the Firebase UID, email, and desired tenant name.
 */
export const initializeAdminAndTenant = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication is required.");
    }
    // Ideally, you'd also check if this function has been run before to prevent misuse.
    // This could be done by checking a flag in Firestore or another mechanism.

    const { email, tenantName, userName } = data;
    const uid = context.auth.uid;

    if (!email || !tenantName || !userName) {
        throw new functions.https.HttpsError("invalid-argument", "Email, tenant name, and user name are required.");
    }

    const prisma = (await import('@prisma/client')). PrismaClient;
    const prismaClient = new prisma();
    
    try {
        // 1. Check if a tenant with this name already exists (optional, depends on desired behavior)
        const existingTenantByName = await prismaClient.tenant.findFirst({ where: { name: tenantName } });
        if (existingTenantByName) {
            throw new functions.https.HttpsError("already-exists", `A tenant with the name "${tenantName}" already exists.`);
        }

        // 2. Create the Tenant
        const tenant = await prismaClient.tenant.create({
            data: {
                name: tenantName,
                // Add other default tenant fields if any, e.g., slug
                slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
            },
        });

        // 3. Create the Admin User in Prisma, linking to the new Tenant
        const user = await prismaClient.user.create({
            data: {
                id: uid, // Use Firebase UID as Prisma User ID
                email: email,
                name: userName, 
                role: 'ADMIN', // Assign ADMIN role
                tenantId: tenant.id, // Link to the created tenant
            },
        });

        // 4. Set Custom Claims for the Admin User in Firebase Auth
        await admin.auth().setCustomUserClaims(uid, {
            role: 'ADMIN',
            tenantId: tenant.id,
        });

        // 5. Set isAdminRegistered flag
        const adminSettingsRef = db.collection("app_config").doc("admin_settings");
        await adminSettingsRef.set({ isAdminRegistered: true }, { merge: true });
        
        console.log(`Admin user ${uid} created with role ADMIN for new tenant ${tenant.id}. Custom claims set. isAdminRegistered flag set.`);
        
        return {
            success: true,
            message: "Admin user and tenant initialized successfully. Custom claims set.",
            userId: user.id,
            tenantId: tenant.id,
        };
    } catch (error: any) {
        console.error("Error initializing admin and tenant:", error);
        // Attempt to clean up if partial creation occurred (e.g., tenant created but user failed)
        // This is complex and depends on the exact failure point.
        // For simplicity, we're not doing a full rollback here.
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to initialize admin user and tenant.", error.message);
    } finally {
        await prismaClient.$disconnect();
    }
});
