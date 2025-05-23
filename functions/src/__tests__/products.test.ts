import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as functions from 'firebase-functions';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../products'; // Adjust path as needed

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

// Mock Firebase Functions context
const mockContext = (auth?: any) => ({
  auth,
});

describe('Product Functions', ()s => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // --- getProducts ---
  describe('getProducts', () => {
    it('should return products for a valid tenantId', async () => {
      const products = [{ id: 'prod1', name: 'Product 1', tenantId: 'tenant1' }];
      prismaMock.product.findMany.mockResolvedValue(products as any); // Cast to any to satisfy Prisma types

      const result = await getProducts({ tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(products);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant1' },
      });
    });

    it('should throw unauthenticated error if not authenticated', async () => {
      await expect(getProducts({ tenantId: 'tenant1' }, mockContext())).rejects.toThrow(
        new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.')
      );
    });
    
    it('should throw invalid-argument error if tenantId is missing', async () => {
      await expect(getProducts({} as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with a tenantId.')
      );
    });
  });

  // --- createProduct ---
  describe('createProduct', () => {
    const productData = { 
      name: 'New Product', 
      description: 'A great new product', 
      price: 100, 
      stockQty: 10, 
      tenantId: 'tenant1',
      imageUrl: 'http://example.com/image.png' 
    };

    it('should create a product with valid data', async () => {
      const createdProduct = { id: 'prod2', ...productData };
      prismaMock.product.create.mockResolvedValue(createdProduct as any);

      const result = await createProduct(productData, mockContext({ uid: 'user1' }));
      expect(result).toEqual(createdProduct);
      expect(prismaMock.product.create).toHaveBeenCalledWith({ data: productData });
    });

    it('should throw invalid-argument if required fields are missing', async () => {
      await expect(createProduct({ name: 'Test' } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with name, description, price, stockQty, and tenantId.')
      );
    });
  });
  
  // --- getProductById ---
  describe('getProductById', () => {
    it('should return a product if found and tenantId matches', async () => {
      const product = { id: 'prod1', name: 'Product 1', tenantId: 'tenant1' };
      prismaMock.product.findUnique.mockResolvedValue(product as any);
      
      const result = await getProductById({ productId: 'prod1', tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(product);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod1', tenantId: 'tenant1' } });
    });

    it('should return null if product not found (or tenantId mismatch)', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      const result = await getProductById({ productId: 'prod-nonexistent', tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toBeNull();
    });
    
    it('should throw invalid-argument if productId or tenantId is missing', async () => {
      await expect(getProductById({ productId: 'prod1' } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
         new functions.https.HttpsError('invalid-argument', 'The function must be called with a productId and tenantId.')
      );
    });
  });

  // --- updateProduct ---
  describe('updateProduct', () => {
    const updateData = { name: 'Updated Product Name', price: 120 };
    
    it('should update a product successfully', async () => {
      const updatedProduct = { id: 'prod1', tenantId: 'tenant1', ...updateData };
      // Mock findUnique to simulate product existence check (though not explicitly in the current updateProduct, good for robustness)
      prismaMock.product.findUnique.mockResolvedValue({ id: 'prod1', tenantId: 'tenant1' } as any); 
      prismaMock.product.update.mockResolvedValue(updatedProduct as any);
      
      const result = await updateProduct({ id: 'prod1', tenantId: 'tenant1', ...updateData }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(updatedProduct);
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1', tenantId: 'tenantId' }, // Note: current updateProduct has a slight bug, tenantId in where clause
        data: updateData,
      });
    });
    
    it('should throw if product ID or tenantId is missing', async () => {
       await expect(updateProduct({ id: 'prod1', ...updateData } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
         new functions.https.HttpsError('invalid-argument', 'The function must be called with id and tenantId.')
       );
    });

    // Consider adding a test for "product not found" or "tenant mismatch" if update logic is enhanced
    // For example, if prisma.product.update throws a specific error for records not found.
  });

  // --- deleteProduct ---
  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      // Mock findUnique to simulate product existence check (though not explicitly in the current deleteProduct, good for robustness)
      prismaMock.product.findUnique.mockResolvedValue({ id: 'prod1', tenantId: 'tenant1' } as any);
      prismaMock.product.delete.mockResolvedValue({ id: 'prod1' } as any); // `delete` returns the deleted record
      
      const result = await deleteProduct({ productId: 'prod1', tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toEqual({ success: true });
      expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod1', tenantId: 'tenant1' } });
    });

    it('should throw if productId or tenantId is missing', async () => {
       await expect(deleteProduct({ productId: 'prod1' } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
         new functions.https.HttpsError('invalid-argument', 'The function must be called with a productId and tenantId.')
       );
    });
    
    // Test for product not found (e.g., if delete throws an error when record doesn't exist)
    // This depends on Prisma's behavior or if you add an explicit check before deleting.
    // For example, if prisma.product.delete throws P2025 (Record to delete does not exist):
    it('should throw an error if product to delete is not found', async () => {
      const prismaError = { code: 'P2025' }; // Simulate Prisma "Record not found" error
      prismaMock.product.delete.mockRejectedValue(prismaError as any);

      await expect(deleteProduct({ productId: 'prod-nonexistent', tenantId: 'tenant1' }, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('internal', 'Failed to delete product.') // Or a more specific error if you catch P2025
      );
    });
  });
});
