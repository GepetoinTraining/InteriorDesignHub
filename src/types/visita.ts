import { User } from './user'; // Assuming a base User type exists
import { Lead } from './lead'; // Assuming a base Lead type exists
import { ClientProfile } from './client'; // Assuming ClientProfile might be part of a general client type

export enum VisitaStatus {
  PLANNED = "PLANNED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RESCHEDULED = "RESCHEDULED",
}

// Interface for the data structure of a Visita, including potential nested data from includes
export interface Visita {
  id: string;
  dateTime: string | Date; // ISO string or Date object
  durationMinutes: number;
  subject: string;
  notes?: string;
  status: VisitaStatus;
  
  assignedToUserId: string;
  assignedTo?: Partial<User>; // User who is assigned the visit (e.g., VENDEDOR)

  leadId?: string | null;
  lead?: Partial<Lead> | null; // Associated lead

  clientProfileId?: string | null;
  clientProfile?: Partial<ClientProfile & { user?: Partial<User> }> | null; // Associated client profile

  tenantId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// For creating a new Visita, some fields might be optional or not required
export interface CreateVisitaData {
  dateTime: string; // ISO string
  durationMinutes: number;
  subject: string;
  notes?: string;
  status?: VisitaStatus; // Optional, defaults to PLANNED on backend
  assignedToUserId: string;
  leadId?: string;
  clientProfileId?: string;
  // tenantId is typically added by the backend or derived from the authenticated user
}

// For updating an existing Visita
export interface UpdateVisitaData {
  dateTime?: string; // ISO string
  durationMinutes?: number;
  subject?: string;
  notes?: string;
  status?: VisitaStatus;
  assignedToUserId?: string; // Admins might reassign
  leadId?: string | null;
  clientProfileId?: string | null;
}

// For listing Visitas, filters might be used
export interface ListVisitasFilters {
  assignedToUserId?: string;
  dateRangeStart?: string; // ISO string
  dateRangeEnd?: string;   // ISO string
  status?: VisitaStatus;
  // tenantId is typically implicit from the authenticated user's context
}
