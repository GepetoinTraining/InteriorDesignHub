
export type ProjectStatus = 'In Progress' | 'Completed' | 'New' | 'On Hold' | 'Cancelled';

export interface Milestone {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Overdue';
  date?: string; // Can be an expected date or completion date
  description?: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'Meeting' | 'Document Upload' | 'Client Comment' | 'Status Update' | 'Email Sent' | 'Task Completed';
  description: string;
  timestamp: string; // ISO date string
  user?: string; // User who performed the action, e.g., "Emily Carter" or "System"
  iconName?: string; // Optional icon for the activity type
}

export interface ProposalItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

export interface CommunicationLogEntry {
  id: string;
  date: string; // ISO date string
  type: 'Email' | 'Call' | 'Meeting' | 'Message';
  subject: string;
  notes?: string;
  participants?: string[]; // Names or IDs
}

export interface PaymentLogEntry {
  id: string;
  date: string; // ISO date string
  amount: number;
  method: 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  status: 'Cleared' | 'Pending' | 'Failed';
  reference?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'Proposal' | 'Contract' | 'Invoice' | 'Floor Plan' | 'Image' | 'Other';
  uploadedDate: string; // ISO date string
  uploader?: string;
  url: string; // Download or view URL (can be placeholder)
  fileSize?: string; // e.g., "2.5 MB"
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientId?: string; // Optional: To link to a client record
  status: ProjectStatus;
  budget: number;
  commission?: number;
  lastUpdated: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  projectManagerName?: string;
  teamMembers?: string[];
  
  // Overview Tab data
  milestones?: Milestone[];
  activityLog?: ActivityLogItem[];
  spentAmount?: number; 
  
  // Budget & Proposal Tab data
  proposalItems?: ProposalItem[];
  proposalTotal?: number; // Sum of all proposalItems.totalPrice
  proposalDiscount?: number;
  proposalTax?: number; // Tax amount
  proposalGrandTotal?: number;

  // Communication Tab data
  communicationLog?: CommunicationLogEntry[];

  // Payments Tab data
  paymentLog?: PaymentLogEntry[];
  totalPaidAmount?: number; // Sum of all cleared payments

  // Documents Tab data
  documents?: DocumentItem[];
}
