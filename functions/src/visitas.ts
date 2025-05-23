import * as functions from "firebase-functions";
import { PrismaClient, UserRole, VisitaStatus } from "@prisma/client";
import { HttpsError } from "firebase-functions/v1/https";

const prisma = new PrismaClient();

interface CreateVisitaData {
  dateTime: string; // ISO string
  durationMinutes: number;
  subject: string;
  notes?: string;
  status?: VisitaStatus;
  assignedToUserId: string;
  leadId?: string;
  clientProfileId?: string;
  tenantId: string;
}

export const createVisita = functions.https.onCall(async (data: CreateVisitaData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { 
    dateTime, 
    durationMinutes, 
    subject, 
    notes, 
    status, 
    assignedToUserId, 
    leadId, 
    clientProfileId, 
    tenantId 
  } = data;

  // Validate required fields
  if (!dateTime || !durationMinutes || !subject || !assignedToUserId || !tenantId) {
    throw new HttpsError("invalid-argument", "Missing required fields: dateTime, durationMinutes, subject, assignedToUserId, tenantId.");
  }
  try {
    new Date(dateTime); // Validate ISO string
  } catch (e) {
    throw new HttpsError("invalid-argument", "Invalid dateTime format. Must be an ISO string.");
  }
  if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
    throw new HttpsError("invalid-argument", "durationMinutes must be a positive number.");
  }
   if (leadId && clientProfileId) {
    throw new HttpsError("invalid-argument", "Cannot associate a Visita with both a Lead and a ClientProfile simultaneously.");
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
    if (caller.tenantId !== tenantId) {
        throw new HttpsError("permission-denied", "Caller cannot create visits for this tenant.");
    }

    // RBAC
    if (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR) {
      throw new HttpsError("permission-denied", "Caller does not have permission to create visits.");
    }
    if (caller.role === UserRole.VENDEDOR && caller.id !== assignedToUserId) {
      throw new HttpsError("permission-denied", "VENDEDOR can only create visits for themselves.");
    }

    // Ensure assignedToUser exists, is a VENDEDOR, and belongs to the same tenant
    const assignedToUser = await prisma.user.findUnique({
      where: { id: assignedToUserId },
      select: { role: true, tenantId: true },
    });
    if (!assignedToUser) {
      throw new HttpsError("not-found", `Assigned user with ID ${assignedToUserId} not found.`);
    }
    if (assignedToUser.role !== UserRole.VENDEDOR) {
      throw new HttpsError("invalid-argument", `User ${assignedToUserId} is not a VENDEDOR.`);
    }
    if (assignedToUser.tenantId !== tenantId) {
      throw new HttpsError("permission-denied", `Assigned user ${assignedToUserId} does not belong to tenant ${tenantId}.`);
    }
    
    // Validate leadId if provided
    if (leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead || lead.tenantId !== tenantId) {
            throw new HttpsError("not-found", `Lead with ID ${leadId} not found in this tenant.`);
        }
    }

    // Validate clientProfileId if provided
    if (clientProfileId) {
        const clientProfile = await prisma.clientProfile.findUnique({ 
            where: { id: clientProfileId },
            include: { user: { select: { tenantId: true } } } 
        });
        if (!clientProfile || clientProfile.user.tenantId !== tenantId) {
            throw new HttpsError("not-found", `ClientProfile with ID ${clientProfileId} not found in this tenant.`);
        }
    }


    // Create the Visita
    const newVisita = await prisma.visita.create({
      data: {
        dateTime: new Date(dateTime),
        durationMinutes,
        subject,
        notes,
        status: status || VisitaStatus.PLANNED,
        assignedToUserId,
        leadId,
        clientProfileId,
        tenantId,
      },
    });

    return newVisita;
  } catch (error) {
    console.error("Error creating Visita:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to create Visita.");
  }
});

interface GetVisitaData {
  id: string;
}

export const getVisita = functions.https.onCall(async (data: GetVisitaData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the Visita.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    const visita = await prisma.visita.findUnique({
      where: { id },
    });

    if (!visita) {
      throw new HttpsError("not-found", `Visita with ID ${id} not found.`);
    }

    // Tenant Isolation
    if (visita.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "You do not have permission to view this Visita record.");
    }

    // RBAC: If caller is VENDEDOR, ensure they are the assignedToUserId for the Visita or an ADMIN.
    if (caller.role === UserRole.VENDEDOR && visita.assignedToUserId !== callerUid) {
      throw new HttpsError("permission-denied", "VENDEDOR can only view visits assigned to them.");
    }
    // ADMINs can view any visit within their tenant (already checked by tenant isolation)

    return visita;
  } catch (error) {
    console.error("Error getting Visita:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to get Visita.");
  }
});

interface ListVisitasData {
  tenantId: string;
  assignedToUserId?: string;
  dateRangeStart?: string; // ISO string
  dateRangeEnd?: string;   // ISO string
}

export const listVisitas = functions.https.onCall(async (data: ListVisitasData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { tenantId, assignedToUserId, dateRangeStart, dateRangeEnd } = data;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'tenantId'.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || caller.tenantId !== tenantId) {
      throw new HttpsError("permission-denied", "Caller does not have permission to list Visitas for this tenant.");
    }

    const whereFilters: any = { tenantId };

    if (caller.role === UserRole.VENDEDOR) {
      // VENDEDOR can only see their own visits, or if an ADMIN is querying for a specific VENDEDOR, that's allowed.
      // If assignedToUserId is provided and it's not the caller, it's an error (unless caller is ADMIN, handled below).
      if (assignedToUserId && assignedToUserId !== callerUid) {
         throw new HttpsError("permission-denied", "VENDEDOR can only list their own visits or be listed by an ADMIN.");
      }
      whereFilters.assignedToUserId = callerUid; // Default to own visits if no specific user is requested by ADMIN
    } else if (caller.role === UserRole.ADMIN && assignedToUserId) {
      // ADMIN can specify an assignedToUserId
      whereFilters.assignedToUserId = assignedToUserId;
    }
    // If ADMIN and no assignedToUserId, list all for tenant.

    if (dateRangeStart) {
      try {
        whereFilters.dateTime = { ...whereFilters.dateTime, gte: new Date(dateRangeStart) };
      } catch (e) {
        throw new HttpsError("invalid-argument", "Invalid dateRangeStart format.");
      }
    }
    if (dateRangeEnd) {
      try {
        whereFilters.dateTime = { ...whereFilters.dateTime, lte: new Date(dateRangeEnd) };
      } catch (e) {
        throw new HttpsError("invalid-argument", "Invalid dateRangeEnd format.");
      }
    }

    const visitas = await prisma.visita.findMany({
      where: whereFilters,
      orderBy: { dateTime: "asc" },
      include: { // Include related data that might be useful on the frontend
        assignedTo: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true } },
        clientProfile: { select: { id: true, companyName: true, user: {select: {name: true}} } },
      }
    });

    return visitas;
  } catch (error) {
    console.error("Error listing Visitas:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to list Visitas.");
  }
});

interface UpdateVisitaData {
  id: string;
  dateTime?: string;
  durationMinutes?: number;
  subject?: string;
  notes?: string;
  status?: VisitaStatus;
  assignedToUserId?: string;
  leadId?: string | null; // Allow null to unset
  clientProfileId?: string | null; // Allow null to unset
}

export const updateVisita = functions.https.onCall(async (data: UpdateVisitaData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id, ...updateData } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the Visita.");
  }
  if (Object.keys(updateData).length === 0) {
    throw new HttpsError("invalid-argument", "No update data provided.");
  }
  if (updateData.dateTime) {
    try {
      new Date(updateData.dateTime); // Validate ISO string
    } catch (e) {
      throw new HttpsError("invalid-argument", "Invalid dateTime format. Must be an ISO string.");
    }
  }
  if (updateData.durationMinutes && (typeof updateData.durationMinutes !== 'number' || updateData.durationMinutes <= 0)) {
    throw new HttpsError("invalid-argument", "durationMinutes must be a positive number if provided.");
  }
  if (updateData.leadId && updateData.clientProfileId) {
    throw new HttpsError("invalid-argument", "Cannot associate a Visita with both a Lead and a ClientProfile simultaneously.");
  }


  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    const existingVisita = await prisma.visita.findUnique({
      where: { id },
    });

    if (!existingVisita) {
      throw new HttpsError("not-found", `Visita with ID ${id} not found.`);
    }

    // Tenant Isolation
    if (existingVisita.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "You do not have permission to update this Visita record.");
    }

    // RBAC:
    // ADMIN can update anything.
    // VENDEDOR can only update visits assigned to them.
    if (caller.role === UserRole.VENDEDOR && existingVisita.assignedToUserId !== callerUid) {
      throw new HttpsError("permission-denied", "VENDEDOR can only update visits assigned to them.");
    }
    // VENDEDOR cannot change assignedToUserId unless it's to themselves (which is redundant but not blocked here).
    // If assignedToUserId is part of updateData and caller is VENDEDOR, it must be their own ID.
    if (caller.role === UserRole.VENDEDOR && updateData.assignedToUserId && updateData.assignedToUserId !== callerUid) {
        throw new HttpsError("permission-denied", "VENDEDOR cannot reassign visits to other users.");
    }


    // If assignedToUserId is being changed (only by ADMIN), validate the new assignee
    if (updateData.assignedToUserId && updateData.assignedToUserId !== existingVisita.assignedToUserId) {
      if (caller.role !== UserRole.ADMIN) {
        throw new HttpsError("permission-denied", "Only ADMIN can reassign visits to a different user.");
      }
      const newAssignedToUser = await prisma.user.findUnique({
        where: { id: updateData.assignedToUserId },
        select: { role: true, tenantId: true },
      });
      if (!newAssignedToUser) {
        throw new HttpsError("not-found", `New assigned user with ID ${updateData.assignedToUserId} not found.`);
      }
      if (newAssignedToUser.role !== UserRole.VENDEDOR) {
        throw new HttpsError("invalid-argument", `User ${updateData.assignedToUserId} is not a VENDEDOR.`);
      }
      if (newAssignedToUser.tenantId !== caller.tenantId) { // Ensure new assignee is in the same tenant
        throw new HttpsError("permission-denied", `New assigned user ${updateData.assignedToUserId} does not belong to this tenant.`);
      }
    }
    
    // Validate leadId if provided
    if (updateData.leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: updateData.leadId } });
        if (!lead || lead.tenantId !== caller.tenantId) {
            throw new HttpsError("not-found", `Lead with ID ${updateData.leadId} not found in this tenant.`);
        }
    }

    // Validate clientProfileId if provided
    if (updateData.clientProfileId) {
        const clientProfile = await prisma.clientProfile.findUnique({ 
            where: { id: updateData.clientProfileId },
            include: { user: { select: { tenantId: true } } } 
        });
        if (!clientProfile || clientProfile.user.tenantId !== caller.tenantId) {
            throw new HttpsError("not-found", `ClientProfile with ID ${updateData.clientProfileId} not found in this tenant.`);
        }
    }

    const dataToUpdate: any = { ...updateData };
    if(dataToUpdate.dateTime) dataToUpdate.dateTime = new Date(dataToUpdate.dateTime);


    const updatedVisita = await prisma.visita.update({
      where: { id },
      data: dataToUpdate,
    });

    return updatedVisita;
  } catch (error) {
    console.error("Error updating Visita:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to update Visita.");
  }
});

interface DeleteVisitaData {
  id: string;
}

export const deleteVisita = functions.https.onCall(async (data: DeleteVisitaData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { id } = data;

  if (!id || typeof id !== 'string') {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'id' for the Visita.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    const existingVisita = await prisma.visita.findUnique({
      where: { id },
    });

    if (!existingVisita) {
      throw new HttpsError("not-found", `Visita with ID ${id} not found.`);
    }

    // Tenant Isolation
    if (existingVisita.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "You do not have permission to delete this Visita record.");
    }

    // RBAC:
    // ADMIN can delete any visit in their tenant.
    // VENDEDOR can only delete visits assigned to them.
    if (caller.role === UserRole.VENDEDOR && existingVisita.assignedToUserId !== callerUid) {
      throw new HttpsError("permission-denied", "VENDEDOR can only delete visits assigned to them.");
    }

    await prisma.visita.delete({
      where: { id },
    });

    return { success: true, message: `Visita with ID ${id} deleted successfully.` };
  } catch (error) {
    console.error("Error deleting Visita:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to delete Visita.");
  }
});
