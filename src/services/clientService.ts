
import { Client } from '../types/client';

let MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Alice Wonderland',
    email: 'alice.wonder@example.com',
    phone: '555-0101',
    companyName: 'Wonderland Designs',
    status: 'Active',
    lastContacted: new Date(2024, 4, 15).toISOString(),
    totalProjects: 3,
    totalSpent: 12500,
    avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg',
  },
  {
    id: 'client-2',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    phone: '555-0102',
    companyName: 'BuildIt Right Inc.',
    status: 'Active',
    lastContacted: new Date(2024, 3, 20).toISOString(),
    totalProjects: 5,
    totalSpent: 75000,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'client-3',
    name: 'Catherine Zeta',
    email: 'c.zeta@example.com',
    phone: '555-0103',
    status: 'Prospect',
    lastContacted: new Date(2024, 5, 1).toISOString(),
    totalProjects: 0,
    totalSpent: 0,
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 'client-4',
    name: 'David Copperfield',
    email: 'd.copperfield@magic.com',
    phone: '555-0104',
    companyName: 'Illusions Ltd.',
    status: 'Inactive',
    lastContacted: new Date(2023, 10, 5).toISOString(),
    totalProjects: 1,
    totalSpent: 5000,
    avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
  },
  {
    id: 'client-5',
    name: 'Eleanor Rigby',
    email: 'eleanor.r@example.com',
    phone: '555-0105',
    status: 'Active',
    lastContacted: new Date(2024, 4, 28).toISOString(),
    totalProjects: 2,
    totalSpent: 8200,
    avatarUrl: 'https://randomuser.me/api/portraits/women/71.jpg',
  },
];

const API_DELAY = 300;

export const fetchClients = (): Promise<Client[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_CLIENTS]), API_DELAY);
  });
};

export const fetchClientById = (id: string): Promise<Client | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const client = MOCK_CLIENTS.find(c => c.id === id);
      resolve(client ? { ...client } : undefined);
    }, API_DELAY);
  });
};

export const addClient = (clientData: Omit<Client, 'id'>): Promise<Client> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };
      MOCK_CLIENTS.unshift(newClient);
      resolve({ ...newClient });
    }, API_DELAY);
  });
};

export const updateClient = (clientId: string, clientData: Partial<Omit<Client, 'id'>>): Promise<Client> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
      if (clientIndex !== -1) {
        MOCK_CLIENTS[clientIndex] = {
          ...MOCK_CLIENTS[clientIndex],
          ...clientData,
          lastContacted: new Date().toISOString(), // Update last contacted on any update
        };
        resolve({ ...MOCK_CLIENTS[clientIndex] });
      } else {
        reject(new Error('Client not found for update.'));
      }
    }, API_DELAY);
  });
};

export const deleteClient = (clientId: string): Promise<{ success: boolean; id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = MOCK_CLIENTS.length;
      MOCK_CLIENTS = MOCK_CLIENTS.filter(c => c.id !== clientId);
      if (MOCK_CLIENTS.length < initialLength) {
        resolve({ success: true, id: clientId });
      } else {
        reject(new Error('Client not found for deletion.'));
      }
    }, API_DELAY);
  });
};
