import * as functions from "firebase-functions";
import { PrismaClient, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeads = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const tenantId = data.tenantId;
  if (!tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    const leads = await prisma.lead.findMany({
      where: {
        tenantId: tenantId,
      },
    });
    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch leads."
    );
  }
});

/**
 * Fetches lead conversions for a tenant, with optional filters.
 * Security: Ensure only authorized users (e.g., admins or relevant roles of the tenant) can call this.
 */
export const getLeadConversions = functions.https.onCall(async (data, context) => {
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
  // Further role-based access can be added (e.g., only ADMIN or SALES_MANAGER).
  const callerTenantIdFromClaims = context.auth.token?.tenantId;
  // const callerRoleFromClaims = context.auth.token?.role as UserRole; // If specific roles are needed

  let hasPermission = false;
  if (callerTenantIdFromClaims === requestedTenantId) {
    // Users can fetch conversions for their own tenant.
    // Add role check if needed: e.g. if (callerRoleFromClaims === UserRole.ADMIN)
    hasPermission = true; 
  }
  
  if (!hasPermission) { // Fallback to Prisma check if claims are not definitive
     const callerUser = await prisma.user.findUnique({
        where: { id: callerUid },
        select: { role: true, tenantId: true }
     });
     if (callerUser && callerUser.tenantId === requestedTenantId) {
        // Add role check from Prisma if needed
        hasPermission = true;
     }
  }

  if (!hasPermission) {
    throw new functions.https.HttpsError(
        "permission-denied",
        `Caller does not have permission to fetch lead conversions for tenant ${requestedTenantId}.`
    );
  }
  
  const whereClause: Prisma.LeadConversionWhereInput = {
    tenantId: requestedTenantId,
  };

  if (filters.leadId && typeof filters.leadId === 'string') {
    whereClause.leadId = filters.leadId;
  }
  if (filters.contactId && typeof filters.contactId === 'string') {
    whereClause.contactId = filters.contactId;
  }
  if (filters.dateFrom && typeof filters.dateFrom === 'string') {
    whereClause.convertedAt = { ...whereClause.convertedAt, gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo && typeof filters.dateTo === 'string') {
    whereClause.convertedAt = { ...whereClause.convertedAt, lte: new Date(filters.dateTo) };
  }

  try {
    const leadConversions = await prisma.leadConversion.findMany({
      where: whereClause,
      orderBy: {
        convertedAt: 'desc', // Most recent conversions first
      },
      include: { // Optionally include related lead and contact details
        lead: { select: { name: true, email: true } },
        contact: { select: { name: true, email: true } },
      },
      take: 100, // Limit results
    });
    return leadConversions;
  } catch (error) {
    console.error("Error fetching lead conversions:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch lead conversions."
    );
  }
});

export const getLeadById = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { leadId, tenantId } = data;
  if (!leadId || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a leadId and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId,
        tenantId: tenantId,
      },
    });
    return lead; // Returns null if not found, which is desired.
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch lead by ID."
    );
  }
});

export const createLead = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { name, email, phone, status, assignedUserId, tenantId, source, notes } = data;
  if (!name || !email || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with name, email, and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.
  // TODO: Validate status against LeadStatus enum

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        status: status || LeadStatus.NEW, // Default to NEW if not provided
        assignedUserId,
        tenantId,
        source,
        notes,
      },
    });
    return lead;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create lead."
    );
  }
});

export const updateLead = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { leadId, tenantId, ...updateData } = data;
  if (!leadId || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with leadId and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.
  // TODO: Validate status against LeadStatus enum if present in updateData

  try {
    // First, check if the lead exists and belongs to the tenant
    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
        tenantId: tenantId,
      },
    });

    if (!existingLead) {
      throw new functions.https.HttpsError(
        "not-found",
        `Lead with ID ${leadId} not found or does not belong to the tenant.`
      );
    }

    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId,
        // No need to check tenantId here again as we did it above
      },
      data: updateData,
    });

    // If status is updated to CONVERTED, create a LeadConversion entry
    if (updateData.status && updateData.status === LeadStatus.CONVERTED && existingLead.status !== LeadStatus.CONVERTED) {
      // Check if a contact with the same email already exists for this tenant
      let contact = await prisma.contact.findFirst({
        where: {
          email: updatedLead.email,
          tenantId: tenantId,
        },
      });

      // If no contact exists, create one
      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            tenantId: tenantId,
            name: updatedLead.name,
            email: updatedLead.email,
            phone: updatedLead.phone,
            // You might want to add other relevant fields from the lead
          },
        });
      }
      
      // Create LeadConversion record
      await prisma.leadConversion.create({
        data: {
          leadId: updatedLead.id,
          contactId: contact.id,
          convertedAt: new Date(),
          tenantId: tenantId,
          // convertedBy: context.auth.uid, // TODO: Store the user who converted the lead
        },
      });
      // Optionally, you might want to associate the contact with the lead or update the lead further
    }

    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update lead."
    );
  }
});

export const deleteLead = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { leadId, tenantId } = data;
  if (!leadId || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a leadId and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    // First, check if the lead exists and belongs to the tenant
    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
        tenantId: tenantId,
      },
    });

    if (!existingLead) {
      throw new functions.https.HttpsError(
        "not-found",
        `Lead with ID ${leadId} not found or does not belong to the tenant.`
      );
    }

    // Delete related LeadConversion records first to avoid foreign key constraint errors
    await prisma.leadConversion.deleteMany({
      where: {
        leadId: leadId,
        tenantId: tenantId, // Ensure tenantId match for security/consistency
      },
    });
    
    await prisma.lead.delete({
      where: {
        id: leadId,
        // No need to check tenantId here again as we did it above
      },
    });
    return { success: true, leadId: leadId };
  } catch (error) {
    console.error("Error deleting lead:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete lead."
    );
  }
});
