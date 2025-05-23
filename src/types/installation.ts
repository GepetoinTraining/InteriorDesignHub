
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface InstallationPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface InstallationChecklist {
  id: string;
  projectId: string; // To link back to a project
  projectName: string;
  tasks: ChecklistItem[];
  notes: string;
  photos: InstallationPhoto[];
  isComplete: boolean;
  lastUpdated: string; // ISO Date string
}
