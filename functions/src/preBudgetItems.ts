import * as functions from "firebase-functions";
import { PrismaClient, UserRole, PreBudgetStatus } from "@prisma/client";
import { HttpsError } from "firebase-functions/v1/https";

const prisma = new PrismaClient();

interface AddPreBudgetItemData {
  preBudgetId: string;
  productId?: string;
  customDescription?: string;
  quantity: number;
  customInputsJson?: any; // Prisma expects JsonValue, allow any for input flexibility before validation
  notes?: string;
  unitPrice?: number;
  totalPrice?: number;
  // tenantId will be derived from the PreBudget or caller for security
}

export const addPreBudgetItem = functions.https.onCall(async (data: AddPreBudgetItemData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const {
    preBudgetId,
    productId,
    customDescription,
    quantity,
    customInputsJson,
    notes,
    unitPrice,
    totalPrice,
  } = data;

  // Validate required fields
  if (!preBudgetId || !quantity) {
    throw new HttpsError("invalid-argument", "Missing required fields: preBudgetId, quantity.");
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    throw new HttpsError("invalid-argument", "Quantity must be a positive number.");
  }
  if (!productId && !customDescription) {
    throw new HttpsError("invalid-argument", "Either productId or customDescription must be provided.");
  }

  try {
    // Fetch caller's user data to verify role and tenant
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true, id: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    // RBAC: Ensure caller is ADMIN or VENDEDOR
    if (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR) {
      throw new HttpsError("permission-denied", "Caller does not have permission to add items to PreBudgets.");
    }

    // Fetch the parent PreBudget
    const preBudget = await prisma.preBudget.findUnique({
      where: { id: preBudgetId },
    });

    if (!preBudget) {
      throw new HttpsError("not-found", `PreBudget with ID ${preBudgetId} not found.`);
    }

    // Tenant Isolation Check
    if (preBudget.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "Cannot add item to a PreBudget in a different tenant.");
    }
    
    // VENDEDOR can only modify PreBudgets they created
    if (caller.role === UserRole.VENDEDOR && preBudget.createdById !== caller.id) {
        throw new HttpsError("permission-denied", "VENDEDOR can only add items to PreBudgets they created.");
    }

    // Ensure PreBudget is in DRAFT status
    if (preBudget.status !== PreBudgetStatus.DRAFT) {
      throw new HttpsError("failed-precondition", `PreBudget must be in DRAFT status to add items. Current status: ${preBudget.status}`);
    }

    // If productId is provided, ensure it exists and belongs to the tenant
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product || product.tenantId !== caller.tenantId) {
        throw new HttpsError("not-found", `Product with ID ${productId} not found in this tenant.`);
      }
    }
    
    // Validate customInputsJson structure if needed (basic check for object type)
    if (customInputsJson && typeof customInputsJson !== 'object') {
        throw new HttpsError("invalid-argument", "customInputsJson must be a valid JSON object if provided.");
    }


    // Create the PreBudgetItem
    const newPreBudgetItem = await prisma.preBudgetItem.create({
      data: {
        preBudgetId,
        productId,
        customDescription,
        quantity,
        customInputsJson: customInputsJson || undefined, // Prisma expects JsonNull or a JsonValue
        notes,
        unitPrice,
        totalPrice,
        tenantId: preBudget.tenantId, // Ensure tenantId is set from the parent PreBudget
      },
    });

    return newPreBudgetItem;
  } catch (error) {
    console.error("Error adding PreBudgetItem:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to add item to PreBudget.");
  }
});

interface UpdatePreBudgetItemData {
  itemId: string;
  preBudgetId: string; // To ensure item belongs to the correct PreBudget
  productId?: string;
  customDescription?: string;
  quantity?: number;
  customInputsJson?: any;
  notes?: string;
  unitPrice?: number;
  totalPrice?: number;
}

export const updatePreBudgetItem = functions.https.onCall(async (data: UpdatePreBudgetItemData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const {
    itemId,
    preBudgetId, // Important for context and security
    ...updatePayload 
  } = data;

  if (!itemId || !preBudgetId) {
    throw new HttpsError("invalid-argument", "Missing required fields: itemId, preBudgetId.");
  }
  if (Object.keys(updatePayload).length === 0) {
    throw new HttpsError("invalid-argument", "No update data provided.");
  }
  if (updatePayload.quantity !== undefined && (typeof updatePayload.quantity !== 'number' || updatePayload.quantity <= 0)) {
    throw new HttpsError("invalid-argument", "Quantity must be a positive number if provided.");
  }
  if (updatePayload.productId && updatePayload.customDescription) {
    // Typically, you use one or the other. If both, clarify rules. For now, let's allow it but a frontend might restrict.
  }
  if (updatePayload.customInputsJson && typeof updatePayload.customInputsJson !== 'object') {
    throw new HttpsError("invalid-argument", "customInputsJson must be a valid JSON object if provided.");
  }


  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true, id: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    if (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR) {
      throw new HttpsError("permission-denied", "Caller does not have permission to update PreBudget items.");
    }

    const preBudgetItem = await prisma.preBudgetItem.findUnique({
      where: { id: itemId },
      include: { preBudget: true },
    });

    if (!preBudgetItem || preBudgetItem.preBudgetId !== preBudgetId) {
      throw new HttpsError("not-found", `PreBudgetItem with ID ${itemId} not found in PreBudget ${preBudgetId}.`);
    }

    if (preBudgetItem.tenantId !== caller.tenantId || preBudgetItem.preBudget.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "Cannot update item in a PreBudget from a different tenant.");
    }
    
    if (caller.role === UserRole.VENDEDOR && preBudgetItem.preBudget.createdById !== caller.id) {
        throw new HttpsError("permission-denied", "VENDEDOR can only update items in PreBudgets they created.");
    }

    if (preBudgetItem.preBudget.status !== PreBudgetStatus.DRAFT) {
      throw new HttpsError("failed-precondition", `PreBudget must be in DRAFT status to update items. Current status: ${preBudgetItem.preBudget.status}`);
    }
    
    if (updatePayload.productId) {
      const product = await prisma.product.findUnique({ where: { id: updatePayload.productId } });
      if (!product || product.tenantId !== caller.tenantId) {
        throw new HttpsError("not-found", `Product with ID ${updatePayload.productId} not found in this tenant.`);
      }
    }

    const { preBudgetId: _, ...cleanUpdatePayload } = updatePayload; // Exclude preBudgetId from direct update data

    const updatedItem = await prisma.preBudgetItem.update({
      where: { id: itemId },
      data: {
        ...cleanUpdatePayload,
        customInputsJson: updatePayload.customInputsJson || undefined, // Handle Prisma JsonNull
      },
    });

    return updatedItem;
  } catch (error) {
    console.error("Error updating PreBudgetItem:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to update item in PreBudget.");
  }
});

interface RemovePreBudgetItemData {
  itemId: string;
  preBudgetId: string; // To ensure item belongs to the correct PreBudget
}

export const removePreBudgetItem = functions.https.onCall(async (data: RemovePreBudgetItemData, context) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called by an authenticated user.");
  }
  const callerUid = context.auth.uid;
  const { itemId, preBudgetId } = data;

  if (!itemId || !preBudgetId) {
    throw new HttpsError("invalid-argument", "Missing required fields: itemId, preBudgetId.");
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: callerUid },
      select: { role: true, tenantId: true, id: true },
    });

    if (!caller || !caller.tenantId) {
      throw new HttpsError("not-found", "Caller user profile or tenantId not found.");
    }

    if (caller.role !== UserRole.ADMIN && caller.role !== UserRole.VENDEDOR) {
      throw new HttpsError("permission-denied", "Caller does not have permission to remove PreBudget items.");
    }

    const preBudgetItem = await prisma.preBudgetItem.findUnique({
      where: { id: itemId },
      include: { preBudget: true },
    });

    if (!preBudgetItem || preBudgetItem.preBudgetId !== preBudgetId) {
      throw new HttpsError("not-found", `PreBudgetItem with ID ${itemId} not found in PreBudget ${preBudgetId}.`);
    }

    if (preBudgetItem.tenantId !== caller.tenantId || preBudgetItem.preBudget.tenantId !== caller.tenantId) {
      throw new HttpsError("permission-denied", "Cannot remove item from a PreBudget in a different tenant.");
    }
    
    if (caller.role === UserRole.VENDEDOR && preBudgetItem.preBudget.createdById !== caller.id) {
        throw new HttpsError("permission-denied", "VENDEDOR can only remove items from PreBudgets they created.");
    }
    
    if (preBudgetItem.preBudget.status !== PreBudgetStatus.DRAFT) {
      throw new HttpsError("failed-precondition", `PreBudget must be in DRAFT status to remove items. Current status: ${preBudgetItem.preBudget.status}`);
    }

    await prisma.preBudgetItem.delete({
      where: { id: itemId },
    });

    return { success: true, message: `Item with ID ${itemId} removed successfully from PreBudget ${preBudgetId}.` };
  } catch (error) {
    console.error("Error removing PreBudgetItem:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to remove item from PreBudget.");
  }
});
