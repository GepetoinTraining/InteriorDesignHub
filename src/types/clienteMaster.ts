export interface ClienteMaster {
  id: string;
  name: string;
  adminNotes?: string;
  tenantId: string;
  createdAt: string | Date; // Functions might return string, but Date is better for usage
  updatedAt: string | Date;
  // clientCount?: number; // To be added later
}
