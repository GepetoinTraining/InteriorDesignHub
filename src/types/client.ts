
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string; // For B2B clients
  status: 'Active' | 'Inactive' | 'Prospect';
  lastContacted?: string; // ISO date string
  totalProjects?: number;
  totalSpent?: number;
  avatarUrl?: string;
  // Add any other relevant client fields
}
