
import { User } from '../contexts/AuthContext';
import { Lead, LeadStatus, KanbanColumnData, KanbanColumnDefinition, CommunicationLogEntry, LeadTask } from '../types/lead';

let MOCK_LEADS: Lead[] = [
  { 
    id: 'lead-1', 
    name: 'Sarah Johnson', 
    company: 'Tech Solutions Ltd.', 
    value: 5000, 
    assignedTo: 'Alex P.', 
    status: 'new', 
    dueDate: '3 days', 
    nextAction: 'Initial Call', 
    email: 'sarah.j@example.com', 
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    communicationHistory: [
      { id: 'comm-1', date: new Date(2024, 4, 20, 10, 0).toISOString(), type: 'Call', subject: 'Initial intro call', notes: 'Discussed project requirements. Sent follow-up email.' },
      { id: 'comm-2', date: new Date(2024, 4, 22, 14, 30).toISOString(), type: 'Email', subject: 'Follow-up & Brochure', notes: 'Sent company brochure and service details.' },
    ],
    tasks: [
      { id: 'task-1', description: 'Prepare initial quote for Sarah', dueDate: new Date(2024, 4, 28).toISOString(), status: 'pending' },
      { id: 'task-2', description: 'Schedule a demo call', dueDate: new Date(2024, 5, 2).toISOString(), status: 'pending' },
    ],
    notes: "Sarah is very interested in our premium package. Budget seems flexible. Key decision maker."
  },
  { id: 'lead-2', name: 'Michael Brown', company: 'Innovate Corp.', value: 7500, assignedTo: 'Emily R.', status: 'contacted', lastContacted: 'Yesterday', nextAction: 'Send Brochure', email: 'michael.b@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-3', name: 'Jessica Lee', company: 'Marketing Pros', value: 3200, assignedTo: 'David K.', status: 'pre-quote', dueDate: 'Tomorrow', nextAction: 'Prepare Quote', email: 'jessica.l@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-4', name: 'Robert Clark', company: 'Future Gadgets', value: 10000, assignedTo: 'Alex P.', status: 'quote-sent', lastContacted: '2 days ago', nextAction: 'Follow-up', email: 'robert.c@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-5', name: 'Amanda White', company: 'Creative LLC', value: 4800, assignedTo: 'Emily R.', status: 'negotiation', dueDate: '1 week', nextAction: 'Discuss Terms', email: 'amanda.w@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-6', name: 'Kevin Green', company: 'GreenScape Solutions', value: 6100, assignedTo: 'David K.', status: 'closed-won', lastContacted: '3 days ago', nextAction: 'Onboarding', email: 'kevin.g@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-7', name: 'Laura Adams', company: 'Adams Interiors', value: 8900, assignedTo: 'Alex P.', status: 'purchasing', dueDate: 'Next Month', nextAction: 'Order Materials', email: 'laura.a@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/7.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-8', name: 'Brian Harris', company: 'Harris Constructions', value: 2500, assignedTo: 'Emily R.', status: 'production', lastContacted: '1 week ago', nextAction: 'Site Visit', email: 'brian.h@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/8.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-9', name: 'Melissa Taylor', company: 'Taylor Designs', value: 5700, assignedTo: 'David K.', status: 'fulfillment', dueDate: '2 weeks', nextAction: 'Coordinate Delivery', email: 'melissa.t@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/9.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-10', name: 'Chris Evans', company: 'Evans Group', value: 12000, assignedTo: 'Alex P.', status: 'ready-install', lastContacted: 'Today', nextAction: 'Schedule Installation', email: 'chris.e@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-11', name: 'Olivia Martin', company: 'Martin & Co.', value: 9500, assignedTo: 'Emily R.', status: 'installing', dueDate: 'In Progress', nextAction: 'Supervise Install', email: 'olivia.m@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/11.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-12', name: 'James Wilson', company: 'Wilson Homes', value: 6800, assignedTo: 'David K.', status: 'post-sales', lastContacted: 'Completed', nextAction: 'Client Feedback', email: 'james.w@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/12.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-13', name: 'Sophia Davis', company: 'Davis Luxury', value: 11000, assignedTo: 'Alex P.', status: 'new', dueDate: '5 days', nextAction: 'Initial Contact', email: 'sophia.d@example.com', avatarUrl: 'https://randomuser.me/api/portraits/women/13.jpg', communicationHistory: [], tasks: [], notes: '' },
  { id: 'lead-14', name: 'Daniel Miller', company: 'Miller Corp', value: 4000, assignedTo: 'Emily R.', status: 'closed-lost', lastContacted: '2 weeks ago', notes: 'Budget constraints', email: 'daniel.m@example.com', avatarUrl: 'https://randomuser.me/api/portraits/men/14.jpg', communicationHistory: [], tasks: [] },
];

const ALL_COLUMN_DEFINITIONS: KanbanColumnDefinition[] = [
  { id: 'newLeads', title: 'New Leads', statuses: ['new'] },
  { id: 'firstContacted', title: 'First Contacted', statuses: ['contacted'] },
  { id: 'preQuote', title: 'Pre-Quote', statuses: ['pre-quote'] },
  { id: 'quoteSent', title: 'Quote Sent', statuses: ['quote-sent'] },
  { id: 'negotiation', title: 'Negotiation', statuses: ['negotiation'] },
  { id: 'closedWon', title: 'Closed Won', statuses: ['closed-won'] },
  { id: 'closedLost', title: 'Closed Lost', statuses: ['closed-lost'] },
  { id: 'purchasingProduction', title: 'Purchasing/Production', statuses: ['purchasing', 'production'] },
  { id: 'fulfillment', title: 'Fulfillment', statuses: ['fulfillment'] },
  { id: 'readyToInstall', title: 'Ready to Install', statuses: ['ready-install'] },
  { id: 'installing', title: 'Installing', statuses: ['installing'] },
  { id: 'postSales', title: 'Post Sales', statuses: ['post-sales'] },
];

const API_DELAY = 300;

const getColumnsForRole = (userRole: User['role']): KanbanColumnDefinition[] => {
  switch (userRole) {
    case 'salesperson':
      return ALL_COLUMN_DEFINITIONS.filter(col => 
        ['newLeads', 'firstContacted', 'preQuote', 'quoteSent', 'negotiation', 'closedWon', 'closedLost'].includes(col.id)
      );
    case 'professional':
      return ALL_COLUMN_DEFINITIONS.filter(col => 
        ['preQuote', 'purchasingProduction', 'fulfillment', 'readyToInstall', 'installing', 'postSales'].includes(col.id)
      );
    case 'admin':
      return ALL_COLUMN_DEFINITIONS;
    default:
      return [];
  }
};

export const fetchKanbanData = (userRole: User['role']): Promise<KanbanColumnData[]> => {
  return new Promise((resolve) => {
    const roleSpecificColumns = getColumnsForRole(userRole);
    const kanbanData: KanbanColumnData[] = roleSpecificColumns.map(colDef => {
      const leadsForColumn = MOCK_LEADS.filter(lead => colDef.statuses.includes(lead.status));
      return { ...colDef, leads: leadsForColumn };
    });
    setTimeout(() => resolve(kanbanData), API_DELAY);
  });
};

// --- New function to fetch LeadConversions ---
import { httpsCallable, getFunctions, HttpsCallableResult } from 'firebase/functions';
import { LeadConversion, LeadConversionFilters } from '../types/lead'; // Assuming these types will be in lead.ts

const functions = getFunctions(); // Get Firebase Functions instance

/**
 * Fetches lead conversions for a given tenant, with optional filters.
 * Calls the `getLeadConversions` Firebase callable function.
 */
export const fetchLeadConversions = async (
  tenantId: string,
  filters?: LeadConversionFilters // Assuming LeadConversionFilters type is defined
): Promise<LeadConversion[]> => {
  if (!tenantId) {
    console.error("fetchLeadConversions called without tenantId.");
    return []; // Or throw error
  }

  const getLeadConversionsCallable = httpsCallable(functions, 'getLeadConversions');
  try {
    const payload: { tenantId: string; filters?: LeadConversionFilters } = { tenantId };
    if (filters) {
      payload.filters = filters;
    }
    const result: HttpsCallableResult<LeadConversion[]> = await getLeadConversionsCallable(payload);
    return result.data || []; // Ensure an array is returned
  } catch (error) {
    console.error('Error fetching lead conversions:', error);
    throw error;
  }
};

export const fetchLeadById = (id: string): Promise<Lead | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lead = MOCK_LEADS.find(l => l.id === id);
      resolve(lead ? { ...lead } : undefined);
    }, API_DELAY);
  });
};

export const addCommunicationLog = (
  leadId: string,
  entryData: { type: string; subject: string; notes?: string; participants?: string[] }
): Promise<CommunicationLogEntry> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found'));
        return;
      }
      const newEntry: CommunicationLogEntry = {
        id: `comm-${Date.now()}`,
        date: new Date().toISOString(),
        ...entryData,
      };
      MOCK_LEADS[leadIndex].communicationHistory.unshift(newEntry); // Add to beginning
      resolve(newEntry);
    }, API_DELAY);
  });
};

export const addLeadTask = (
  leadId: string,
  taskData: { description: string; dueDate?: string }
): Promise<LeadTask> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found'));
        return;
      }
      const newTask: LeadTask = {
        id: `task-${Date.now()}`,
        status: 'pending',
        ...taskData,
      };
      MOCK_LEADS[leadIndex].tasks.push(newTask);
      resolve(newTask);
    }, API_DELAY);
  });
};

export const updateLeadTaskStatus = (
  leadId: string,
  taskId: string,
  isCompleted: boolean
): Promise<LeadTask | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found'));
        return;
      }
      const taskIndex = MOCK_LEADS[leadIndex].tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        reject(new Error('Task not found'));
        return;
      }
      MOCK_LEADS[leadIndex].tasks[taskIndex].status = isCompleted ? 'completed' : 'pending';
      resolve(MOCK_LEADS[leadIndex].tasks[taskIndex]);
    }, API_DELAY);
  });
};

export const updateLeadNotes = (
  leadId: string,
  newNotes: string
): Promise<Lead | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found'));
        return;
      }
      MOCK_LEADS[leadIndex].notes = newNotes;
      resolve(MOCK_LEADS[leadIndex]);
    }, API_DELAY);
  });
};

export const updateLead = (
  leadId: string, 
  updatedData: Partial<Omit<Lead, 'id' | 'communicationHistory' | 'tasks' | 'convertedDate'>>
): Promise<Lead> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found for update.'));
        return;
      }
      MOCK_LEADS[leadIndex] = { 
        ...MOCK_LEADS[leadIndex], 
        ...updatedData,
        lastContacted: new Date().toISOString() // Update lastContacted on any edit
      };
      resolve({ ...MOCK_LEADS[leadIndex] });
    }, API_DELAY);
  });
};

export const convertToClient = (leadId: string): Promise<Lead> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const leadIndex = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (leadIndex === -1) {
        reject(new Error('Lead not found for conversion.'));
        return;
      }
      if (MOCK_LEADS[leadIndex].status === 'closed-won' || MOCK_LEADS[leadIndex].status === 'closed-lost') {
        // Potentially allow re-opening or just return current state
        // For now, let's prevent re-conversion if already closed
        // reject(new Error('Lead is already closed.')); 
        // Or simply resolve with current state to avoid breaking UI flow.
        // Let's update status and convertedDate even if already closed, for simplicity.
      }
      MOCK_LEADS[leadIndex].status = 'closed-won';
      MOCK_LEADS[leadIndex].convertedDate = new Date().toISOString();
      MOCK_LEADS[leadIndex].lastContacted = new Date().toISOString();
      
      // Placeholder: In a real app, you'd also create a client record here
      // using clientService.addClient or similar.
      console.log(`Lead ${leadId} converted to client. A new client record should be created.`);
      
      resolve({ ...MOCK_LEADS[leadIndex] });
    }, API_DELAY);
  });
};
