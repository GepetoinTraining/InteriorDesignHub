import * as functions from "firebase-functions";
import { PrismaClient, UserRole } from "@prisma/client";
import {HttpsError} from "firebase-functions/v1/https";

const prisma = new PrismaClient();

interface CreateClienteMasterData {
  name: string;
  adminNotes?: string;
  tenantId: string;
}

export const createClienteMaster = functions.https.onCall(async (data: CreateClienteMasterData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }

  const callerUid = context.auth.uid;
  const { name, adminNotes, tenantId } = data;

  if (!name || typeof name !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'name' for the ClienteMaster.");
  }
  if (!tenantId || typeof tenantId !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'tenantId'.");
  }

  try {
    // Fetch caller's user data to verify role and tenant
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller) {
      throw new HttpsError("not-found", "Caller user profile not found.");
    }

    // RBAC: Ensure caller is ADMIN or VENDEDOR and belongs to the target tenant
    if (caller.tenantId !== tenantId || (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR)) {
      throw new HttpsError("permission-denied", "Caller does not have permission to create a ClienteMaster for this tenant.");
    }

    // Create the ClienteMaster
    const newClienteMaster = await prisma.clienteMaster.create({
      data: {
        name,
        adminNotes,
        tenantId,
      },
    });

    return newClienteMaster;
  } catch (error) {
    console.error("Error creating ClienteMaster:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to create ClienteMaster.");
  }
});

interface GetClienteMasterData {
  id: string;
}

export const getClienteMaster = functions.https.onCall(async (data: GetClienteMasterData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the ClienteMaster.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { tenantId: true }, // Only need tenantId for this check
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    const clienteMaster = await prisma.clienteMaster.findUnique({
      where: { id },
    });

    if (!clienteMaster) {
      throw new HttpsError("not-found", `ClienteMaster with ID ${id} not found.`);
    }

    // Security: Ensure the fetched record belongs to the caller's tenant
    if (clienteMaster.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "You do not have permission to view this ClienteMaster record.");
    }

    return clienteMaster;
  } catch (error) {
    console.error("Error getting ClienteMaster:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to get ClienteMaster.");
  }
});

interface ListClienteMastersByTenantData {
  tenantId: string;
}

export const listClienteMastersByTenant = functions.https.onCall(async (data: ListClienteMastersByTenantData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { tenantId } = data;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'tenantId'.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { tenantId: true },
    });

    if (!caller || caller.tenantId !== tenantId) {
      throw new HttpsError("permission-denied", "Caller does not have permission to list ClienteMaster records for this tenant.");
    }

    const clienteMasters = await prisma.clienteMaster.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    return clienteMasters;
  } catch (error) {
    console.error("Error listing ClienteMasters by tenant:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to list ClienteMasters by tenant.");
  }
});

interface UpdateClienteMasterData {
  id: string;
  name?: string;
  adminNotes?: string;
}

export const updateClienteMaster = functions.https.onCall(async (data: UpdateClienteMasterData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id, name, adminNotes } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the ClienteMaster.");
  }
  if (!name && adminNotes === undefined) {
    throw new HttpsError("invalid-argument", "Either 'name' or 'adminNotes' must be provided for update.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    // RBAC: Ensure caller is ADMIN or VENDEDOR
    if (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR) {
      throw new HttpsError("permission-denied", "Caller does not have permission to update ClienteMaster records.");
    }

    // Fetch the existing ClienteMaster to verify tenant ownership
    const existingClienteMaster = await prisma.clienteMaster.findUnique({
      where: { id },
    });

    if (!existingClienteMaster) {
      throw new HttpsError("not-found", `ClienteMaster with ID ${id} not found.`);
    }

    if (existingClienteMaster.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "Caller does not have permission to update this ClienteMaster record.");
    }

    const updateData: { name?: string; adminNotes?: string } = {};
    if (name) {
      updateData.name = name;
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updatedClienteMaster = await prisma.clienteMaster.update({
      where: { id },
      data: updateData,
    });

    return updatedClienteMaster;
  } catch (error) {
    console.error("Error updating ClienteMaster:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to update ClienteMaster.");
  }
});

interface DeleteClienteMasterData {
  id: string;
}

export const deleteClienteMaster = functions.https.onCall(async (data: DeleteClienteMasterData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the ClienteMaster.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    // RBAC: Ensure caller is ADMIN
    if (caller.role !== UserRole.ADMIN) {
      throw new HttpsError("permission-denied", "Caller does not have permission to delete ClienteMaster records.");
    }

    // Fetch the existing ClienteMaster to verify tenant ownership
    const existingClienteMaster = await prisma.clienteMaster.findUnique({
      where: { id },
    });

    if (!existingClienteMaster) {
      throw new HttpsError("not-found", `ClienteMaster with ID ${id} not found.`);
    }

    if (existingClienteMaster.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "Caller does not have permission to delete this ClienteMaster record.");
    }

    // Prisma schema handles setting User.clienteMasterId to null on delete
    await prisma.clienteMaster.delete({
      where: { id },
    });

    return { success: true, message: `ClienteMaster with ID ${id} deleted successfully.` };
  } catch (error) {
    console.error("Error deleting ClienteMaster:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to delete ClienteMaster.");
  }
});
