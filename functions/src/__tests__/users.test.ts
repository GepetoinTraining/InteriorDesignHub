import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, UserRole } from '@prisma/client';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // For mocking admin.auth()
import { getUserData, updateUserRole, getUsersByTenant } from '../users'; // Adjust path

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  UserRole: { // Mock the enum
    ADMIN: 'ADMIN',
    DESIGNER: 'DESIGNER',
    USER: 'USER',
  }
}));

// Mock Firebase Admin SDK
const setCustomUserClaimsMock = jest.fn().mockResolvedValue(undefined);
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({ // Mock the auth() service
    setCustomUserClaims: setCustomUserClaimsMock,
  }),
}));


// Mock Firebase Functions context
const mockContext = (auth?: any) => ({
  auth,
});

describe('User Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getUserData ---
  describe('getUserData', () => {
    const userId = 'userTest1';
    const userData = { 
      id: userId, 
      email: 'test@example.com', 
      name: 'Test User', 
      role: UserRole.USER, 
      tenantId: 'tenant1',
      tenant: { id: 'tenant1', name: 'Tenant Alpha' }
    };

    it('should return user data for a valid userId', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userData as any);
      const result = await getUserData({ userId }, mockContext({ uid: userId })); // User fetching their own data
      expect(result).toEqual(userData);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object), // Verify specific fields are selected
      });
    });

    it('should throw not-found if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(getUserData({ userId: 'nonexistent' }, mockContext({ uid: 'nonexistent' }))).rejects.toThrow(
        new functions.https.HttpsError('not-found', `User with ID nonexistent not found.`)
      );
    });
    
    it('should throw invalid-argument if userId is missing', async () => {
      await expect(getUserData({} as any, mockContext({ uid: 'anyUser' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid userId.')
      );
    });
    
    // Note: The permission check `context.auth.uid !== userId` is commented out in the main function.
    // If it were active, this test would be relevant:
    // it('should throw permission-denied if user tries to fetch another user data (if rule is active)', async () => {
    //   await expect(getUserData({ userId: 'anotherUser' }, mockContext({ uid: 'userTest1' }))).rejects.toThrow(
    //     new functions.https.HttpsError('permission-denied', "You do not have permission to fetch this user's data.")
    //   );
    // });
  });

  // --- updateUserRole ---
  describe('updateUserRole', () => {
    const targetUserId = 'targetUser1';
    const tenantId = 'tenantA';
    const adminUid = 'adminUser';
    const nonAdminUid = 'nonAdminUser';
    const newRole = UserRole.DESIGNER;

    const adminContext = mockContext({ uid: adminUid });
    const nonAdminContext = mockContext({ uid: nonAdminUid });

    it('should allow an ADMIN to update a user role and set custom claims', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: tenantId } as any); // Caller is ADMIN
      prismaMock.user.update.mockResolvedValue({ id: targetUserId, role: newRole, tenantId: tenantId, email: 't@e.com', name: 'T' } as any); // Target user update
      
      const result = await updateUserRole({ targetUserId, newRole, tenantId }, adminContext);
      
      expect(result.success).toBe(true);
      expect(result.updatedUser?.role).toBe(newRole);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: targetUserId, tenantId: tenantId },
        data: { role: newRole },
      });
      expect(setCustomUserClaimsMock).toHaveBeenCalledWith(targetUserId, {
        role: newRole,
        tenantId: tenantId,
      });
    });

    it('should prevent a non-ADMIN from updating a user role', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.USER, tenantId: tenantId } as any); // Caller is not ADMIN
      
      await expect(updateUserRole({ targetUserId, newRole, tenantId }, nonAdminContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', 'Caller does not have permission to update roles for this tenant.')
      );
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(setCustomUserClaimsMock).not.toHaveBeenCalled();
    });
    
    it('should prevent an ADMIN of another tenant from updating a user role', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: 'tenantB' } as any); // Caller is ADMIN of different tenant
      
      await expect(updateUserRole({ targetUserId, newRole, tenantId: 'tenantA' }, adminContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', 'Caller does not have permission to update roles for this tenant.')
      );
    });

    it('should throw not-found if target user does not exist in Prisma during update', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: tenantId } as any); // Caller is ADMIN
        prismaMock.user.update.mockResolvedValue(null as any); // Simulate user not found or tenant mismatch on update

        // Note: The actual function throws a generic 'not-found' if update returns null,
        // which might happen if where clause (id + tenantId) doesn't match.
        // A more specific test might require prismaMock.user.update.mockRejectedValueOnce
        // if Prisma throws specific error for "0 records updated".
        // For now, testing the "updatedUserInPrisma" null check.
        await expect(updateUserRole({ targetUserId: 'nonExistentUser', newRole, tenantId }, adminContext)).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Target user with ID nonExistentUser not found in tenant ${tenantId}.`)
        );
    });
    
    it('should throw not-found if setCustomUserClaims fails for a non-existent Firebase user', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: tenantId } as any);
        prismaMock.user.update.mockResolvedValue({ id: targetUserId, role: newRole, tenantId: tenantId } as any);
        setCustomUserClaimsMock.mockRejectedValueOnce({ code: 'auth/user-not-found' }); // Simulate Firebase user not found

        await expect(updateUserRole({ targetUserId, newRole, tenantId }, adminContext)).rejects.toThrow(
            new functions.https.HttpsError('not-found', `User with ID ${targetUserId} not found in Firebase Authentication. Cannot set custom claims.`)
        );
    });
  });

  // --- getUsersByTenant ---
  describe('getUsersByTenant', () => {
    const tenantId = 'tenantX';
    const adminUid = 'adminForTenantX';
    const nonAdminUid = 'userInTenantX';
    const otherTenantAdminUid = 'adminForTenantY';

    const adminContext = mockContext({ uid: adminUid });
    const nonAdminContext = mockContext({ uid: nonAdminUid });
    const otherTenantAdminContext = mockContext({ uid: otherTenantAdminUid });
    
    const usersList = [
        { id: 'user1', name: 'User One', role: UserRole.USER, tenantId: tenantId },
        { id: 'user2', name: 'User Two', role: UserRole.DESIGNER, tenantId: tenantId },
    ];

    it('should allow an ADMIN of the tenant to fetch users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: tenantId } as any); // Caller is ADMIN of tenantX
      prismaMock.user.findMany.mockResolvedValue(usersList as any);
      
      const result = await getUsersByTenant({ tenantId }, adminContext);
      expect(result).toEqual(usersList);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: tenantId },
        select: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should prevent a non-ADMIN of the tenant from fetching users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.USER, tenantId: tenantId } as any); // Caller is USER of tenantX
      
      await expect(getUsersByTenant({ tenantId }, nonAdminContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', 'Caller does not have permission to fetch users for this tenant.')
      );
    });

    it('should prevent an ADMIN of another tenant from fetching users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ role: UserRole.ADMIN, tenantId: 'tenantY' } as any); // Caller is ADMIN of tenantY
      
      await expect(getUsersByTenant({ tenantId: 'tenantX' }, otherTenantAdminContext)).rejects.toThrow(
        new functions.https.HttpsError('permission-denied', 'Caller does not have permission to fetch users for this tenant.')
      );
    });
    
    it('should throw invalid-argument if tenantId is missing', async () => {
      await expect(getUsersByTenant({} as any, adminContext)).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'Valid tenantId is required.')
      );
    });
  });
});
