import * as functions from "firebase-functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = functions.https.onCall(async (data, context) => {
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
    const products = await prisma.product.findMany({
      where: {
        tenantId: tenantId,
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch products."
    );
  }
});

export const getProductById = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { productId, tenantId } = data;
  if (!productId || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a productId and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        tenantId: tenantId,
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch product by ID."
    );
  }
});

export const createProduct = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { name, description, price, stockQty, imageUrl, tenantId } = data;
  if (!name || !description || !price || !stockQty || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with name, description, price, stockQty, and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stockQty,
        imageUrl,
        tenantId,
      },
    });
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create product."
    );
  }
});

export const updateProduct = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { id, name, description, price, stockQty, imageUrl, tenantId } = data;
  if (!id || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with id and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    const product = await prisma.product.update({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        name,
        description,
        price,
        stockQty,
        imageUrl,
      },
    });
    return product;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update product."
    );
  }
});

export const deleteProduct = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { productId, tenantId } = data;
  if (!productId || !tenantId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a productId and tenantId."
    );
  }

  // TODO: Add logic to ensure the user belongs to the tenant.

  try {
    await prisma.product.delete({
      where: {
        id: productId,
        tenantId: tenantId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete product."
    );
  }
});
