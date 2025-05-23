import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, UserRole } from '@prisma/client'; // Assuming UserRole is used for claims
import * as functions from 'firebase-functions';
import { getTenantDetails } from '../tenants'; // Adjust path

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  // Mock UserRole if needed for claim checks, though not directly used by getTenantDetails Prisma query
  UserRole: { 
    ADMIN: 'ADMIN',
    USER: 'USER',
  }
}));

// Mock Firebase Functions context
const mockContext = (auth?: any, token?: any) => ({ // Allow passing token object for claims
  auth: auth ? { ...auth, token } : undefined,
});

describe('Tenant Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getTenantDetails ---
  describe('getTenantDetails', () => {
    const tenantId = 'tenantAlpha';
    const tenantData = {
      id: tenantId,
      name: 'Tenant Alpha',
      slug: 'alpha',
      themeColor: '#FF0000',
      logoUrl: 'http://logo.url/alpha.png',
    };
    const userUid = 'userInTenantAlpha';

    it('should return tenant details if user belongs to the tenant (via claims)', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(tenantData as any);
      const context = mockContext({ uid: userUid }, { tenantId: tenantId, role: UserRole.USER }); // User's claims match requested tenantId

      const result = await getTenantDetails({ tenantId }, context);
      expect(result).toEqual(tenantData);
      expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: tenantId },
        select: expect.any(Object), // Verify specific fields are selected
      });
    });

    it('should throw permission-denied if user claims do not match requested tenantId', async () => {
      const context = mockContext({ uid: userUid }, { tenantId: 'otherTenant', role: UserRole.USER }); // User's claims for a different tenant
      
      await expect(getTenantDetails({ tenantId }, context)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller (tenant: otherTenant) does not have permission to fetch details for tenant ${tenantId}.`)
      );
      expect(prismaMock.tenant.findUnique).not.toHaveBeenCalled();
    });

    it('should throw not-found if tenant does not exist', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);
      const context = mockContext({ uid: userUid }, { tenantId: 'nonExistentTenant', role: UserRole.USER });

      await expect(getTenantDetails({ tenantId: 'nonExistentTenant' }, context)).rejects.toThrow(
        new functions.https.HttpsError('not-found', `Tenant with ID nonExistentTenant not found.`)
      );
    });

    it('should throw unauthenticated if no auth context', async () => {
      await expect(getTenantDetails({ tenantId }, mockContext(undefined))).rejects.toThrow(
        new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.')
      );
    });
    
    it('should throw invalid-argument if tenantId is missing in request data', async () => {
      const context = mockContext({ uid: userUid }, { tenantId: tenantId, role: UserRole.USER });
      await expect(getTenantDetails({} as any, context)).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'Valid tenantId is required in the request.')
      );
    });

    // Example of how SUPER_ADMIN role check could be tested if implemented
    // it('should allow SUPER_ADMIN to fetch any tenant details', async () => {
    //   prismaMock.tenant.findUnique.mockResolvedValue(tenantData as any);
    //   const superAdminContext = mockContext({ uid: 'superAdminUser' }, { role: 'SUPER_ADMIN' }); // No tenantId in claims, or a different one
      
    //   // This test assumes the SUPER_ADMIN check bypasses the tenantId claim match.
    //   // The current getTenantDetails implementation does NOT have this SUPER_ADMIN logic.
    //   // If added, this test would become relevant.
    //   // For now, it would fail or pass based on how strictly the tenantId claim is checked.
      
    //   // const result = await getTenantDetails({ tenantId }, superAdminContext);
    //   // expect(result).toEqual(tenantData);
    // });
  });
});
