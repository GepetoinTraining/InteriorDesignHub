
import { InstallationChecklist, ChecklistItem, InstallationPhoto } from '../types/installation';

let MOCK_CHECKLISTS: InstallationChecklist[] = [
  {
    id: 'install-1',
    projectId: 'proj-1',
    projectName: 'Modern Kitchen Renovation',
    tasks: [
      { id: 'task-1-1', text: 'Confirm delivery of all materials to site', completed: true },
      { id: 'task-1-2', text: 'Inspect materials for damage', completed: true },
      { id: 'task-1-3', text: 'Prepare installation area (flooring protection, clear space)', completed: false },
      { id: 'task-1-4', text: 'Install base cabinets', completed: false },
      { id: 'task-1-5', text: 'Install wall cabinets', completed: false },
      { id: 'task-1-6', text: 'Measure and template for countertops', completed: false },
      { id: 'task-1-7', text: 'Countertop installation', completed: false },
      { id: 'task-1-8', text: 'Appliance installation', completed: false },
      { id: 'task-1-9', text: 'Final inspection and client sign-off', completed: false },
    ],
    notes: 'Client requested an additional outlet near the island. Discussed with electrician, change order pending. Countertop material confirmed: Calacatta Gold Quartz.',
    photos: [
      { id: 'photo-1-1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6D5yLJCNiZfNnmZaHqEGnD1ESgblylumzFkYLTX769m5UJ-zOMVK9ZHM0BkqOLRFnJYC0a5iPi_uHE1Up5U7KGApafcvaQhabYhXNOqVQXXnZk2QMIFrNcwl8nlVK9AjQp7RJoTdhJBb_PqIliOpPlT1RykvVvZJHRe7FuBi-5wQDCzTJQsbAlXyBq71uOugACVA-WFuQZ5WW6wgyWDwYYD5aG75I5I7Vrrx917ofYW8tJ7xc-tSNOFIgiBDhGfmQBa7uzHCpga5f', caption: 'Materials delivered and stacked' },
      { id: 'photo-1-2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfs-S1HzMnbOPobyo1r2ya-O9h-qkTreEWlECqEKMFAtZ0pTI27edigl-oAeRwh0DDcZNVl61tZCd4_5ZkDbyBv8LQsEuRWjUuTGAO0BIewijkx8G_80T1WMaHbJiBe8g1fDyjYZvi9UCfhiLbc_GI7g56HqyyJz_JUvgfqu5YLqXBaSAXxw-Ahnhxtp11IZGhuES1qDqGtAG7dK5QmrmY6ZxF2wXeyLpKp1hWdYF-drEQG4LiwvEyDwUcBo2TlJyjhyR-ekpFcAvj', caption: 'Initial cabinet placement' },
      { id: 'photo-1-3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS-fCITQ3Qg_Ce0tnDA9ZrHk7YzJ3p0dVHQUstnh-Bs92nntBeOQMvYbFnBPdyy4Iz824jr-i2xs-U2qllp9Xrhb5DkmHs7IpyyZzAHmSnz14rPcSN-v68fwN8jT-HqDAOzyPWAYh-NT2c-o_yc8uLMDbUOzWikLmarQgVnEc_ezob2iO7u2mShT8FbuFEdGll25FD6QdmjeaKwk6EkY-JRzLWg_ijXr38VDpP2TS9ewkBzkY3SMTm9ARI2vu2pzPI483bVknAqIFN', caption: 'Appliance boxes on site' },
    ],
    isComplete: false,
    lastUpdated: new Date().toISOString(),
  },
  // Add more mock checklists if needed
];

const API_DELAY = 300;

export const fetchInstallationChecklist = (id: string): Promise<InstallationChecklist | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const checklist = MOCK_CHECKLISTS.find(c => c.id === id);
      resolve(checklist ? { ...checklist } : undefined);
    }, API_DELAY);
  });
};

export const updateChecklistItemStatus = (checklistId: string, itemId: string, completed: boolean): Promise<ChecklistItem | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const checklistIndex = MOCK_CHECKLISTS.findIndex(c => c.id === checklistId);
      if (checklistIndex === -1) {
        reject(new Error('Checklist not found'));
        return;
      }
      const taskIndex = MOCK_CHECKLISTS[checklistIndex].tasks.findIndex(t => t.id === itemId);
      if (taskIndex === -1) {
        reject(new Error('Task item not found'));
        return;
      }
      MOCK_CHECKLISTS[checklistIndex].tasks[taskIndex].completed = completed;
      MOCK_CHECKLISTS[checklistIndex].lastUpdated = new Date().toISOString();
      resolve({ ...MOCK_CHECKLISTS[checklistIndex].tasks[taskIndex] });
    }, API_DELAY);
  });
};

export const updateInstallationNotes = (checklistId: string, notes: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const checklistIndex = MOCK_CHECKLISTS.findIndex(c => c.id === checklistId);
      if (checklistIndex === -1) {
        reject(new Error('Checklist not found'));
        return;
      }
      MOCK_CHECKLISTS[checklistIndex].notes = notes;
      MOCK_CHECKLISTS[checklistIndex].lastUpdated = new Date().toISOString();
      resolve(notes);
    }, API_DELAY);
  });
};

export const addInstallationPhoto = (checklistId: string, photoUrl: string, caption?: string): Promise<InstallationPhoto> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const checklistIndex = MOCK_CHECKLISTS.findIndex(c => c.id === checklistId);
      if (checklistIndex === -1) {
        reject(new Error('Checklist not found'));
        return;
      }
      const newPhoto: InstallationPhoto = {
        id: `photo-${checklistId}-${Date.now()}`,
        url: photoUrl,
        caption: caption,
      };
      MOCK_CHECKLISTS[checklistIndex].photos.push(newPhoto);
      MOCK_CHECKLISTS[checklistIndex].lastUpdated = new Date().toISOString();
      resolve(newPhoto);
    }, API_DELAY);
  });
};

export const deleteInstallationPhoto = (checklistId: string, photoId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const checklistIndex = MOCK_CHECKLISTS.findIndex(c => c.id === checklistId);
      if (checklistIndex === -1) {
        reject(new Error('Checklist not found'));
        return;
      }
      const initialLength = MOCK_CHECKLISTS[checklistIndex].photos.length;
      MOCK_CHECKLISTS[checklistIndex].photos = MOCK_CHECKLISTS[checklistIndex].photos.filter(p => p.id !== photoId);
      MOCK_CHECKLISTS[checklistIndex].lastUpdated = new Date().toISOString();
      resolve(MOCK_CHECKLISTS[checklistIndex].photos.length < initialLength);
    }, API_DELAY);
  });
};

export const markInstallationComplete = (checklistId: string, isComplete: boolean): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const checklistIndex = MOCK_CHECKLISTS.findIndex(c => c.id === checklistId);
            if (checklistIndex === -1) {
                reject(new Error('Checklist not found'));
                return;
            }
            MOCK_CHECKLISTS[checklistIndex].isComplete = isComplete;
            MOCK_CHECKLISTS[checklistIndex].lastUpdated = new Date().toISOString();
            resolve(MOCK_CHECKLISTS[checklistIndex].isComplete);
        }, API_DELAY);
    });
};
