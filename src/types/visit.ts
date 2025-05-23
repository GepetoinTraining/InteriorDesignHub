
export interface VisitEvent {
  id: string;
  title: string;
  date: string; // ISO string for the date, e.g., "2024-10-05"
  startTime: string; // e.g., "10:00 AM"
  endTime: string;   // e.g., "11:00 AM"
  description?: string;
  clientId?: string; // Optional: To link to a client
  projectId?: string; // Optional: To link to a project
  location?: string; // e.g., "Client's Home", "123 Oak Street"
}
