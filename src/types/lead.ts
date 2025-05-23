
export type LeadStatus = 
  'new' | 
  'contacted' | 
  'pre-quote' | 
  'quote-sent' | 
  'negotiation' | 
  'closed-won' | 
  'closed-lost' | 
  'purchasing' | 
  'production' | 
  'fulfillment' | 
  'ready-install' | 
  'installing' | 
  'post-sales';

export interface CommunicationLogEntry {
  id: string;
  date: string; // ISO date string
  type: 'Email' | 'Call' | 'Meeting' | 'Message' | string; // Allow string for custom types
  subject: string;
  notes?: string;
  participants?: string[]; // Names or IDs
}

export interface LeadTask {
  id: string;
  description: string;
  dueDate?: string; // ISO date string or human-readable, now optional
  status: 'pending' | 'completed';
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  value: number;
  assignedTo?: string; // User ID or name - Made optional
  status: LeadStatus;
  dueDate?: string; // ISO date string or human-readable
  lastContacted?: string; // ISO date string or human-readable
  nextAction?: string;
  notes?: string;
  avatarUrl?: string; // Optional: URL to an avatar image for the lead
  communicationHistory: CommunicationLogEntry[];
  tasks: LeadTask[];
  convertedDate?: string; // Added for "Convert to Client"
}

export interface KanbanColumnDefinition {
  id: string; // e.g., 'newLeads', 'productionPipeline'
  title: string;
  statuses: LeadStatus[]; // Which lead statuses belong in this column
}

export interface KanbanColumnData extends KanbanColumnDefinition {
  leads: Lead[];
}

// --- Added for LeadConversion ---
export interface LeadConversion {
  id: string; // ID of the LeadConversion record itself
  leadId: string;
  contactId: string; // ID of the Contact created/linked during conversion
  convertedAt: string; // ISO Date string
  tenantId: string;
  // Optional: Include parts of the Lead or Contact for display purposes
  // lead?: Partial<Lead>; 
  // contact?: { id: string, name: string, email: string }; // Define a Contact type if needed elsewhere
  // convertedBy?: string; // User ID of who performed the conversion
}

export interface LeadConversionFilters {
  leadId?: string;
  contactId?: string;
  dateFrom?: string; // ISO Date string
  dateTo?: string;   // ISO Date string
  // convertedByUserId?: string;
}
