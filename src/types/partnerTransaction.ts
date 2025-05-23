
export interface PartnerTransaction {
  id: string;
  partnerTenantId: string; // The ID of the other tenant involved
  partnerTenantName: string;
  projectId?: string; // Link to an end-client project
  projectName?: string;
  itemDescription: string; // e.g., "Sofa for Project X", "Design services for Client Y Phase 1"
  amount: number;
  dueDate: string; // ISO date
  status: 'Pending Payment' | 'Paid' | 'Overdue' | 'Disputed' | 'Awaiting Payment'; // Status of payment between current tenant and partner
  fundingStatus?: 'Awaiting Client Payment' | 'Funds Received From Client' | 'N/A'; // Status of client payment that covers this payable
  type: 'payable' | 'receivable'; // Perspective of the current tenant
  relatedOrderId?: string; // If applicable
  transactionDate?: string; // When it was created/logged
  paymentDate?: string; // When it was paid/received
  sourceClientPaymentId?: string; // Optional ID of the client payment that funds this transaction
}
