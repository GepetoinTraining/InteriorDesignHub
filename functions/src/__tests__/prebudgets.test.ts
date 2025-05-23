import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, PreBudgetStatus } from '@prisma/client';
import * as functions from 'firebase-functions';
import { getPreBudgets, createPreBudget, getPreBudgetById, updatePreBudget, deletePreBudget } from '../prebudgets'; // Adjust path

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  PreBudgetStatus: { // Mock the enum
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    ARCHIVED: 'ARCHIVED',
  }
}));

// Mock Firebase Functions context
const mockContext = (auth?: any) => ({
  auth,
});

describe('PreBudget Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getPreBudgets ---
  describe('getPreBudgets', () => {
    it('should return pre-budgets for a valid tenantId', async () => {
      const preBudgets = [{ id: 'pb1', clientName: 'Client A', tenantId: 'tenant1' }];
      prismaMock.preBudget.findMany.mockResolvedValue(preBudgets as any);

      const result = await getPreBudgets({ tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(preBudgets);
      expect(prismaMock.preBudget.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant1' },
        orderBy: { createdAt: 'desc' },
      });
    });
    
    it('should throw unauthenticated if no auth context', async () => {
      await expect(getPreBudgets({ tenantId: 'tenant1' }, mockContext(undefined))).rejects.toThrow(
        new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.')
      );
    });

    it('should throw invalid-argument if tenantId is missing or invalid', async () => {
      await expect(getPreBudgets({} as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid tenantId.')
      );
      await expect(getPreBudgets({ tenantId: 123 } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid tenantId.')
      );
    });
  });

  // --- createPreBudget ---
  describe('createPreBudget', () => {
    const preBudgetData = {
      clientName: 'New Client',
      projectScope: 'Project Scope Details',
      estimatedCost: 5000,
      status: PreBudgetStatus.DRAFT,
      tenantId: 'tenant1',
    };
    const createdById = 'userCreator1';

    it('should create a pre-budget with valid data', async () => {
      const createdPreBudget = { id: 'pb2', ...preBudgetData, createdById };
      prismaMock.preBudget.create.mockResolvedValue(createdPreBudget as any);

      const result = await createPreBudget(preBudgetData, mockContext({ uid: createdById }));
      expect(result).toEqual(createdPreBudget);
      expect(prismaMock.preBudget.create).toHaveBeenCalledWith({
        data: { ...preBudgetData, createdById },
      });
    });
    
    it('should throw invalid-argument for missing clientName', async () => {
      const data = { ...preBudgetData, clientName: undefined };
      await expect(createPreBudget(data as any, mockContext({ uid: createdById }))).rejects.toThrow(
          new functions.https.HttpsError('invalid-argument', 'Valid clientName is required.')
      );
    });
    
    it('should throw invalid-argument for invalid estimatedCost', async () => {
      const data = { ...preBudgetData, estimatedCost: -100 };
      await expect(createPreBudget(data as any, mockContext({ uid: createdById }))).rejects.toThrow(
          new functions.https.HttpsError('invalid-argument', 'Valid estimatedCost is required and must be non-negative.')
      );
    });
    
    it('should throw invalid-argument for invalid status', async () => {
      const data = { ...preBudgetData, status: "INVALID_STATUS" };
      await expect(createPreBudget(data as any, mockContext({ uid: createdById }))).rejects.toThrow(
          new functions.https.HttpsError('invalid-argument', 'Valid status is required.')
      );
    });
  });

  // --- getPreBudgetById ---
  describe('getPreBudgetById', () => {
    it('should return pre-budget if found for tenant', async () => {
        const preBudget = {id: 'pb1', clientName: 'Test Client', tenantId: 'tenant1'};
        prismaMock.preBudget.findUnique.mockResolvedValue(preBudget as any);
        const result = await getPreBudgetById({preBudgetId: 'pb1', tenantId: 'tenant1'}, mockContext({uid: 'user1'}));
        expect(result).toEqual(preBudget);
    });
    
    it('should return null if pre-budget not found for tenant', async () => {
        prismaMock.preBudget.findUnique.mockResolvedValue(null);
        const result = await getPreBudgetById({preBudgetId: 'nonexistent', tenantId: 'tenant1'}, mockContext({uid: 'user1'}));
        expect(result).toBeNull();
    });
  });

  // --- updatePreBudget ---
  describe('updatePreBudget', () => {
    const updateData = { clientName: 'Updated Client Name', status: PreBudgetStatus.SENT };
    const preBudgetId = 'pb1';
    const tenantId = 'tenant1';

    it('should update a pre-budget successfully', async () => {
      const existingPreBudget = { id: preBudgetId, clientName: 'Old Name', tenantId: tenantId, status: PreBudgetStatus.DRAFT };
      const updatedPreBudgetData = { ...existingPreBudget, ...updateData };
      
      prismaMock.preBudget.findFirst.mockResolvedValue(existingPreBudget as any);
      prismaMock.preBudget.update.mockResolvedValue(updatedPreBudgetData as any);

      const result = await updatePreBudget({ preBudgetId, tenantId, ...updateData }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(updatedPreBudgetData);
      expect(prismaMock.preBudget.update).toHaveBeenCalledWith({
        where: { id: preBudgetId },
        data: updateData,
      });
    });
    
    it('should throw not-found if pre-budget does not exist for update', async () => {
        prismaMock.preBudget.findFirst.mockResolvedValue(null);
        await expect(updatePreBudget({preBudgetId: 'nonexistent', tenantId, ...updateData}, mockContext({uid: 'user1'}))).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Pre-budget with ID nonexistent not found or does not belong to the tenant.`)
        );
    });

    it('should throw invalid-argument if no data provided for update', async () => {
        await expect(updatePreBudget({preBudgetId, tenantId}, mockContext({uid: 'user1'}))).rejects.toThrow(
            new functions.https.HttpsError('invalid-argument', 'No data provided for update.')
        );
    });
  });

  // --- deletePreBudget ---
  describe('deletePreBudget', () => {
    const preBudgetId = 'pb1';
    const tenantId = 'tenant1';

    it('should delete a pre-budget successfully', async () => {
      prismaMock.preBudget.findFirst.mockResolvedValue({ id: preBudgetId, tenantId: tenantId } as any);
      prismaMock.preBudget.delete.mockResolvedValue({ id: preBudgetId } as any);

      const result = await deletePreBudget({ preBudgetId, tenantId }, mockContext({ uid: 'user1' }));
      expect(result).toEqual({ success: true, preBudgetId: preBudgetId });
      expect(prismaMock.preBudget.delete).toHaveBeenCalledWith({ where: { id: preBudgetId } });
    });
    
    it('should throw not-found if pre-budget does not exist for delete', async () => {
        prismaMock.preBudget.findFirst.mockResolvedValue(null);
        await expect(deletePreBudget({preBudgetId: 'nonexistent', tenantId}, mockContext({uid: 'user1'}))).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Pre-budget with ID nonexistent not found or does not belong to the tenant.`)
        );
    });
  });
});
