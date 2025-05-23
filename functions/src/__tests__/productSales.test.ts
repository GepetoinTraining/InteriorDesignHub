import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, UserRole, Prisma } from '@prisma/client'; // Assuming UserRole for security checks
import * as functions from 'firebase-functions';
import { recordProductSale, getProductSales } from '../productSales'; // Adjust path

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  UserRole: { // Mock the enum for security checks
    ADMIN: 'ADMIN',
    USER: 'USER',
    // Add other roles if they grant access to getProductSales
  },
  Prisma: { // For Prisma.PrismaClientKnownRequestError simulation
    PrismaClientKnownRequestError: jest.fn(),
  }
}));

// Mock Firebase Functions context
const mockContext = (auth?: any, token?: any) => ({
  auth: auth ? { ...auth, token } : undefined,
});

describe('ProductSale Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- recordProductSale ---
  describe('recordProductSale', () => {
    const tenantId = 'tenantSale';
    const productId = 'prodABC';
    const quantity = 2;
    const saleAmount = 199.98;
    const callerUid = 'userRecorder123';
    const validContext = mockContext({ uid: callerUid }, { tenantId: tenantId });

    const saleData = { productId, tenantId, quantity, saleAmount };

    it('should record a product sale for an authenticated user of the tenant', async () => {
      const expectedSaleRecord = { 
        id: 'sale1', 
        ...saleData, 
        recordedById: callerUid, 
        saleDate: new Date() 
      };
      prismaMock.productSale.create.mockResolvedValue(expectedSaleRecord as any);

      const result = await recordProductSale(saleData, validContext);
      expect(result).toEqual(expectedSaleRecord);
      expect(prismaMock.productSale.create).toHaveBeenCalledWith({
        data: {
          productId,
          tenantId,
          quantity,
          saleAmount,
          recordedById: callerUid,
        },
      });
    });

    it('should throw permission-denied if caller tenantId claim does not match data tenantId', async () => {
      const otherTenantContext = mockContext({ uid: callerUid }, { tenantId: 'otherTenant' });
      // Mock user findUnique for the fallback check, assuming it also shows a mismatch or no user
      prismaMock.user.findUnique.mockResolvedValue({ tenantId: 'otherTenant' } as any);

      await expect(recordProductSale(saleData, otherTenantContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller does not belong to tenant ${tenantId}. Cannot record sale.`)
      );
    });
    
    it('should use Prisma user tenantId if claims tenantId is missing but user belongs to tenant', async () => {
      const contextWithoutTenantClaim = mockContext({ uid: callerUid }); // No tenantId in claim
      prismaMock.user.findUnique.mockResolvedValue({ tenantId: tenantId } as any); // Prisma says user belongs
      prismaMock.productSale.create.mockResolvedValue({ id: 'sale1' } as any); // Assume creation succeeds

      await recordProductSale(saleData, contextWithoutTenantClaim);
      expect(prismaMock.productSale.create).toHaveBeenCalled(); // Should proceed
    });

    it('should throw unauthenticated if no auth context', async () => {
      await expect(recordProductSale(saleData, mockContext(undefined))).rejects.toThrow(
        new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.')
      );
    });

    it('should throw invalid-argument for missing or invalid fields', async () => {
      await expect(recordProductSale({ ...saleData, productId: undefined } as any, validContext)).rejects.toThrow('Valid \'productId\' is required.');
      await expect(recordProductSale({ ...saleData, quantity: 0 } as any, validContext)).rejects.toThrow('Valid \'quantity\' (positive integer) is required.');
      await expect(recordProductSale({ ...saleData, saleAmount: -10 } as any, validContext)).rejects.toThrow('Valid \'saleAmount\' (non-negative number) is required.');
    });
    
    it('should throw not-found if productId does not exist (foreign key constraint)', async () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError(
            'Foreign key constraint failed', 
            { code: 'P2003', clientVersion: 'mock', meta: { field_name: 'ProductSale_productId_fkey' } }
        );
        prismaMock.productSale.create.mockRejectedValue(prismaError);

        await expect(recordProductSale(saleData, validContext)).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Product with ID ${productId} not found.`)
        );
    });
  });

  // --- getProductSales ---
  describe('getProductSales', () => {
    const tenantId = 'tenantGetSales';
    const callerUid = 'salesUser1';
    // Assuming any user of the tenant can fetch sales, or ADMIN for broader tests
    const validUserContext = mockContext({ uid: callerUid }, { tenantId: tenantId, role: UserRole.USER }); 
    const adminContext = mockContext({ uid: 'adminUser' }, { tenantId: tenantId, role: UserRole.ADMIN }); 

    const salesList = [
      { id: 'sale1', productId: 'prodA', quantity: 1, saleAmount: 50, tenantId: tenantId },
      { id: 'sale2', productId: 'prodB', quantity: 2, saleAmount: 100, tenantId: tenantId },
    ];

    it('should return product sales for an authorized user of the tenant', async () => {
      prismaMock.productSale.findMany.mockResolvedValue(salesList as any);
      
      const result = await getProductSales({ tenantId }, validUserContext);
      expect(result).toEqual(salesList);
      expect(prismaMock.productSale.findMany).toHaveBeenCalledWith({
        where: { tenantId: tenantId },
        orderBy: { saleDate: 'desc' },
        include: { product: { select: { name: true, sku: true }}},
        take: 100,
      });
    });

    it('should throw permission-denied if caller is not part of the tenant (claim check)', async () => {
      const otherTenantContext = mockContext({ uid: 'otherUser' }, { tenantId: 'otherTenant' });
      prismaMock.user.findUnique.mockResolvedValue({ tenantId: 'otherTenant'} as any); // Prisma fallback check

      await expect(getProductSales({ tenantId }, otherTenantContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller does not have permission to fetch product sales for tenant ${tenantId}.`)
      );
    });
    
    it('should allow access if caller is part of tenant (Prisma fallback check)', async () => {
      const contextWithoutTenantClaim = mockContext({ uid: callerUid }); // No tenantId in claim
      prismaMock.user.findUnique.mockResolvedValue({ tenantId: tenantId, role: UserRole.USER } as any); // Prisma says user belongs
      prismaMock.productSale.findMany.mockResolvedValue(salesList as any);

      const result = await getProductSales({ tenantId }, contextWithoutTenantClaim);
      expect(result).toEqual(salesList);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({where: {id: callerUid}, select: {role: true, tenantId: true}});
    });

    it('should apply filters when provided', async () => {
      const filters = { productId: 'prodA' };
      prismaMock.productSale.findMany.mockResolvedValue([]); // Result doesn't matter for this part
      
      await getProductSales({ tenantId, filters }, adminContext); // Use admin context for simplicity if role checks are strict
      
      expect(prismaMock.productSale.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { tenantId: tenantId, productId: 'prodA' },
      }));
    });
    
    it('should throw unauthenticated if no auth context', async () => {
        await expect(getProductSales({tenantId}, mockContext(undefined))).rejects.toThrow(
            new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.')
        );
    });
  });
});
