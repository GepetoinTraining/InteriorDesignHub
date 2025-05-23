import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import * as functions from 'firebase-functions';
import { logActivity, getActivities } from '../activities'; // Adjust path

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  UserRole: { // Mock the enum for security checks in getActivities
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
  // Mock Prisma namespace for Prisma.JsonObject type hint if needed, though it's often just an alias for `any` in tests
  Prisma: {
    JsonObject: jest.fn(), // This is a placeholder, actual type is more complex
  }
}));

// Mock Firebase Functions context
const mockContext = (auth?: any, token?: any) => ({
  auth: auth ? { ...auth, token } : undefined,
});

describe('Activity Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- logActivity ---
  describe('logActivity', () => {
    const tenantId = 'tenantLog';
    const action = 'USER_LOGIN';
    const metadata = { ip: '127.0.0.1', userAgent: 'TestAgent' };
    const userIdFromContext = 'userFromContext123';
    const userIdFromData = 'userFromData456';

    it('should log an activity when called by an authenticated client', async () => {
      const activityData = { userId: userIdFromContext, action, metadata, tenantId };
      prismaMock.activity.create.mockResolvedValue({ id: 'act1', ...activityData, timestamp: new Date() } as any);
      const context = mockContext({ uid: userIdFromContext }, { tenantId: tenantId });

      const result = await logActivity({ action, metadata, tenantId }, context);
      
      expect(result.userId).toBe(userIdFromContext);
      expect(prismaMock.activity.create).toHaveBeenCalledWith({
        data: {
          userId: userIdFromContext,
          action,
          metadata: metadata as unknown as Prisma.JsonObject, // Cast for mock
          tenantId,
        },
      });
    });

    it('should log an activity when called by backend (userId in data)', async () => {
      const activityData = { userId: userIdFromData, action, metadata, tenantId };
      prismaMock.activity.create.mockResolvedValue({ id: 'act2', ...activityData, timestamp: new Date() } as any);
      const context = mockContext(undefined); // No auth context (backend call)

      const result = await logActivity({ userId: userIdFromData, action, metadata, tenantId }, context);
      
      expect(result.userId).toBe(userIdFromData);
      expect(prismaMock.activity.create).toHaveBeenCalledWith({
        data: {
          userId: userIdFromData,
          action,
          metadata: metadata as unknown as Prisma.JsonObject,
          tenantId,
        },
      });
    });

    it('should throw permission-denied if client tenantId claim does not match data tenantId', async () => {
      const context = mockContext({ uid: userIdFromContext }, { tenantId: 'differentTenant' });
      await expect(logActivity({ action, metadata, tenantId }, context)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller (tenant: differentTenant) cannot log activity for tenant ${tenantId}.`)
      );
    });

    it('should throw invalid-argument if userId is missing for backend call', async () => {
      const context = mockContext(undefined);
      await expect(logActivity({ action, metadata, tenantId }, context)).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'userId is required when not called from an authenticated client.')
      );
    });
    
    it('should throw invalid-argument if action or tenantId is missing', async () => {
      const context = mockContext({ uid: userIdFromContext }, { tenantId: tenantId });
      await expect(logActivity({ metadata, tenantId } as any, context)).rejects.toThrow(
          new functions.https.HttpsError("invalid-argument", "Valid 'action' (string) is required.")
      );
      await expect(logActivity({ action, metadata } as any, context)).rejects.toThrow(
          new functions.https.HttpsError("invalid-argument", "Valid 'tenantId' (string) is required.")
      );
    });
  });

  // --- getActivities ---
  describe('getActivities', () => {
    const tenantId = 'tenantActivityFetch';
    const adminUid = 'adminFetcher';
    const nonAdminUid = 'userFetcher';
    
    const adminContext = mockContext({ uid: adminUid }, { tenantId: tenantId, role: UserRole.ADMIN });
    const userContextSameTenant = mockContext({ uid: nonAdminUid }, { tenantId: tenantId, role: UserRole.USER });
    const adminContextOtherTenant = mockContext({ uid: 'otherAdmin' }, { tenantId: 'otherTenant', role: UserRole.ADMIN });

    const activitiesList = [
      { id: 'act1', action: 'TEST_ACTION_1', userId: 'user1', tenantId: tenantId, timestamp: new Date() },
      { id: 'act2', action: 'TEST_ACTION_2', userId: 'user2', tenantId: tenantId, timestamp: new Date() },
    ];

    it('should allow ADMIN of the tenant to fetch activities', async () => {
      prismaMock.activity.findMany.mockResolvedValue(activitiesList as any);
      
      const result = await getActivities({ tenantId }, adminContext);
      expect(result).toEqual(activitiesList);
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith({
        where: { tenantId: tenantId },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should prevent non-ADMIN from fetching activities (checking claims)', async () => {
      // This test relies on the primary claim check.
      await expect(getActivities({ tenantId }, userContextSameTenant)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller does not have ADMIN permission to fetch activities for tenant ${tenantId}.`)
      );
    });
    
    it('should prevent ADMIN of another tenant from fetching activities (checking claims)', async () => {
       await expect(getActivities({ tenantId }, adminContextOtherTenant)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller does not have ADMIN permission to fetch activities for tenant ${tenantId}.`)
      );
    });

    it('should prevent non-ADMIN from fetching activities (checking Prisma fallback)', async () => {
      // Simulate claims check passing (e.g. claims were missing role), but Prisma check fails
      const userContextWithoutRoleClaim = mockContext({ uid: nonAdminUid }, { tenantId: tenantId }); // No role in claim
      prismaMock.user.findUnique.mockResolvedValue({ role: UserRole.USER, tenantId: tenantId } as any); // Prisma says USER

      await expect(getActivities({ tenantId }, userContextWithoutRoleClaim)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', `Caller does not have ADMIN permission to fetch activities for tenant ${tenantId}.`)
      );
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: nonAdminUid }, select: { role: true, tenantId: true }});
    });
    
    it('should apply filters when provided by an ADMIN', async () => {
        const filters = { userId: 'userX', dateFrom: '2023-05-01' };
        prismaMock.activity.findMany.mockResolvedValue([]);
        
        await getActivities({ tenantId, filters }, adminContext);
        
        expect(prismaMock.activity.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { 
                tenantId: tenantId, 
                userId: 'userX',
                timestamp: { gte: new Date('2023-05-01T00:00:00.000Z') }
            },
        }));
    });
    
    it('should throw unauthenticated if no auth context', async () => {
        await expect(getActivities({tenantId}, mockContext(undefined))).rejects.toThrow(
            new functions.https.HttpsError('unauthenticated', 'The function must be called by an authenticated user.')
        );
    });
  });
});
