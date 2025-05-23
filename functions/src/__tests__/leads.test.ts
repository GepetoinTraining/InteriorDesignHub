import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, LeadStatus, UserRole } from '@prisma/client';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getLeads, createLead, getLeadById, updateLead, deleteLead, getLeadConversions } from '../leads'; // Adjust path as needed

// Mock Prisma Client
const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  LeadStatus: { // Mock the enum
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUALIFIED: 'QUALIFIED',
    PROPOSAL_SENT: 'PROPOSAL_SENT',
    NEGOTIATION: 'NEGOTIATION',
    CONVERTED: 'CONVERTED',
    LOST: 'LOST',
    ON_HOLD: 'ON_HOLD',
    ARCHIVED: 'ARCHIVED',
  },
  UserRole: { // Mock UserRole if needed for security checks
    ADMIN: 'ADMIN',
    USER: 'USER',
    DESIGNER: 'DESIGNER',
  }
}));

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  // Add other admin services if used, e.g., auth()
}));


// Mock Firebase Functions context
const mockContext = (auth?: any) => ({
  auth,
});

describe('Lead Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getLeads ---
  describe('getLeads', () => {
    it('should return leads for a valid tenantId', async () => {
      const leads = [{ id: 'lead1', name: 'Lead 1', tenantId: 'tenant1' }];
      prismaMock.lead.findMany.mockResolvedValue(leads as any);

      const result = await getLeads({ tenantId: 'tenant1' }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(leads);
      expect(prismaMock.lead.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant1' },
      });
    });
     it('should throw unauthenticated if no auth context', async () => {
      await expect(getLeads({ tenantId: 'tenant1' }, mockContext(undefined))).rejects.toThrow(
        new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.')
      );
    });
  });

  // --- createLead ---
  describe('createLead', () => {
    const leadData = {
      name: 'New Lead',
      email: 'new@example.com',
      tenantId: 'tenant1',
      status: LeadStatus.NEW,
    };

    it('should create a lead with valid data', async () => {
      const createdLead = { id: 'lead2', ...leadData };
      prismaMock.lead.create.mockResolvedValue(createdLead as any);

      const result = await createLead(leadData, mockContext({ uid: 'user1' }));
      expect(result).toEqual(createdLead);
      expect(prismaMock.lead.create).toHaveBeenCalledWith({ data: leadData });
    });
    
    it('should throw invalid-argument if required fields (name, email, tenantId) are missing', async () => {
      await expect(createLead({ name: 'Test' } as any, mockContext({ uid: 'user1' }))).rejects.toThrow(
        new functions.https.HttpsError('invalid-argument', 'The function must be called with name, email, and tenantId.')
      );
    });
  });
  
  // --- getLeadById ---
  describe('getLeadById', () => {
    it('should return lead if found for tenant', async () => {
        const lead = {id: 'lead1', name: 'Test Lead', tenantId: 'tenant1'};
        prismaMock.lead.findUnique.mockResolvedValue(lead as any);
        const result = await getLeadById({leadId: 'lead1', tenantId: 'tenant1'}, mockContext({uid: 'user1'}));
        expect(result).toEqual(lead);
    });
    it('should return null if lead not found', async () => {
        prismaMock.lead.findUnique.mockResolvedValue(null);
        const result = await getLeadById({leadId: 'nonexistent', tenantId: 'tenant1'}, mockContext({uid: 'user1'}));
        expect(result).toBeNull();
    });
  });

  // --- updateLead ---
  describe('updateLead', () => {
    const updateData = { name: 'Updated Lead Name', status: LeadStatus.CONTACTED };
    const leadId = 'lead1';
    const tenantId = 'tenant1';

    it('should update a lead successfully', async () => {
      const existingLead = { id: leadId, name: 'Old Name', email: 'test@example.com', tenantId: tenantId, status: LeadStatus.NEW };
      const updatedLeadData = { ...existingLead, ...updateData };
      
      prismaMock.lead.findUnique.mockResolvedValue(existingLead as any);
      prismaMock.lead.update.mockResolvedValue(updatedLeadData as any);

      const result = await updateLead({ leadId, tenantId, ...updateData }, mockContext({ uid: 'user1' }));
      expect(result).toEqual(updatedLeadData);
      expect(prismaMock.lead.update).toHaveBeenCalledWith({
        where: { id: leadId },
        data: updateData,
      });
    });

    it('should create LeadConversion when status changes to CONVERTED', async () => {
      const existingLead = { id: leadId, name: 'Lead to Convert', email: 'convert@example.com', tenantId: tenantId, status: LeadStatus.QUALIFIED, phone: '123' };
      const updateToConvertedData = { status: LeadStatus.CONVERTED };
      const convertedLeadData = { ...existingLead, ...updateToConvertedData };
      const contactData = { id: 'contact1', email: 'convert@example.com', tenantId: tenantId, name: 'Lead to Convert', phone: '123'};

      prismaMock.lead.findUnique.mockResolvedValue(existingLead as any);
      prismaMock.lead.update.mockResolvedValue(convertedLeadData as any);
      prismaMock.contact.findFirst.mockResolvedValue(null); // No existing contact
      prismaMock.contact.create.mockResolvedValue(contactData as any);
      prismaMock.leadConversion.create.mockResolvedValue({} as any); // Mock successful creation

      await updateLead({ leadId, tenantId, ...updateToConvertedData }, mockContext({ uid: 'user1' }));

      expect(prismaMock.contact.create).toHaveBeenCalledWith({
        data: {
          tenantId: tenantId,
          name: convertedLeadData.name,
          email: convertedLeadData.email,
          phone: convertedLeadData.phone,
        },
      });
      expect(prismaMock.leadConversion.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          leadId: leadId,
          contactId: contactData.id,
          tenantId: tenantId,
        }),
      }));
    });
    
    it('should link to existing Contact if found during CONVERTED update', async () => {
      const existingLead = { id: leadId, name: 'Lead to Convert', email: 'existingcontact@example.com', tenantId: tenantId, status: LeadStatus.QUALIFIED, phone: '123' };
      const updateToConvertedData = { status: LeadStatus.CONVERTED };
      const convertedLeadData = { ...existingLead, ...updateToConvertedData };
      const existingContact = { id: 'contact-existing', email: 'existingcontact@example.com', tenantId: tenantId, name: 'Existing Contact', phone: '000'};

      prismaMock.lead.findUnique.mockResolvedValue(existingLead as any);
      prismaMock.lead.update.mockResolvedValue(convertedLeadData as any);
      prismaMock.contact.findFirst.mockResolvedValue(existingContact as any); // Existing contact found
      // prismaMock.contact.create should NOT be called
      prismaMock.leadConversion.create.mockResolvedValue({} as any);

      await updateLead({ leadId, tenantId, ...updateToConvertedData }, mockContext({ uid: 'user1' }));

      expect(prismaMock.contact.create).not.toHaveBeenCalled();
      expect(prismaMock.leadConversion.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          leadId: leadId,
          contactId: existingContact.id, // Should use existing contact's ID
          tenantId: tenantId,
        }),
      }));
    });

    it('should throw not-found if lead does not exist for update', async () => {
        prismaMock.lead.findUnique.mockResolvedValue(null);
        await expect(updateLead({leadId: 'nonexistent', tenantId, ...updateData}, mockContext({uid: 'user1'}))).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Lead with ID nonexistent not found or does not belong to the tenant.`)
        );
    });
  });

  // --- deleteLead ---
  describe('deleteLead', () => {
    const leadId = 'lead1';
    const tenantId = 'tenant1';

    it('should delete a lead and its conversions successfully', async () => {
      prismaMock.lead.findUnique.mockResolvedValue({ id: leadId, tenantId: tenantId } as any); // Simulate lead exists
      prismaMock.leadConversion.deleteMany.mockResolvedValue({ count: 1 } as any); // Simulate deletion of conversions
      prismaMock.lead.delete.mockResolvedValue({ id: leadId } as any);

      const result = await deleteLead({ leadId, tenantId }, mockContext({ uid: 'user1' }));
      expect(result).toEqual({ success: true, leadId: leadId });
      expect(prismaMock.leadConversion.deleteMany).toHaveBeenCalledWith({
        where: { leadId: leadId, tenantId: tenantId },
      });
      expect(prismaMock.lead.delete).toHaveBeenCalledWith({
        where: { id: leadId },
      });
    });
    
    it('should throw not-found if lead does not exist for delete', async () => {
        prismaMock.lead.findUnique.mockResolvedValue(null);
        await expect(deleteLead({leadId: 'nonexistent', tenantId}, mockContext({uid: 'user1'}))).rejects.toThrow(
            new functions.https.HttpsError('not-found', `Lead with ID nonexistent not found or does not belong to the tenant.`)
        );
    });
  });
  
  // --- getLeadConversions ---
  describe('getLeadConversions', () => {
    const tenantId = 'tenant-abc';
    const callerContext = mockContext({ uid: 'adminUser', token: { tenantId: tenantId, role: UserRole.ADMIN } });

    it('should fetch lead conversions for an authorized admin', async () => {
        const mockConversions = [{id: 'conv1', leadId: 'leadX', contactId: 'contactY', tenantId: tenantId}];
        prismaMock.leadConversion.findMany.mockResolvedValue(mockConversions as any);

        const result = await getLeadConversions({ tenantId: tenantId }, callerContext);
        expect(result).toEqual(mockConversions);
        expect(prismaMock.leadConversion.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { tenantId: tenantId },
            orderBy: { convertedAt: 'desc' },
            take: 100,
        }));
    });

    it('should deny access if caller tenantId does not match requested tenantId', async () => {
        const otherTenantContext = mockContext({ uid: 'user1', token: { tenantId: 'other-tenant', role: UserRole.ADMIN } });
        await expect(getLeadConversions({ tenantId: tenantId }, otherTenantContext)).rejects.toThrow(
            new functions.https.HttpsError('permission-denied', `Caller does not have permission to fetch lead conversions for tenant ${tenantId}.`)
        );
    });
    
    it('should apply filters when provided', async () => {
        const filters = { leadId: 'leadX', dateFrom: '2023-01-01' };
        prismaMock.leadConversion.findMany.mockResolvedValue([]); // Result doesn't matter for this test part
        
        await getLeadConversions({ tenantId: tenantId, filters: filters }, callerContext);
        
        expect(prismaMock.leadConversion.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { 
                tenantId: tenantId, 
                leadId: 'leadX',
                convertedAt: { gte: new Date('2023-01-01T00:00:00.000Z') } // Jest matches date objects
            },
        }));
    });
  });
});
