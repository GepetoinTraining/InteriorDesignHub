
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
