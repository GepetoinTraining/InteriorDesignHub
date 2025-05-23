
import { Project, ProjectStatus, Milestone, ActivityLogItem, ProposalItem, CommunicationLogEntry, PaymentLogEntry, DocumentItem } from '../types/project';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Modern Living Room Redesign',
    clientName: 'Sarah Johnson',
    clientId: 'client-1', // Example client ID
    status: 'In Progress',
    budget: 15000,
    spentAmount: 7500, // Example spent amount
    commission: 1500,
    lastUpdated: new Date(2024, 4, 28).toISOString(),
    description: 'Complete redesign of a spacious living room focusing on modern aesthetics and comfort. Includes custom furniture, lighting, and decor selection.',
    startDate: new Date(2024, 2, 1).toISOString(),
    endDate: new Date(2024, 7, 30).toISOString(),
    projectManagerName: 'Emily Carter',
    milestones: [
      { id: 'm1-1', title: 'Initial Consultation & Briefing', status: 'Completed', date: new Date(2024, 2, 5).toISOString(), description: 'Discussed project scope and client requirements.' },
      { id: 'm1-2', title: 'Design Concept & Approval', status: 'Completed', date: new Date(2024, 2, 20).toISOString(), description: 'Client approved final design concept.' },
      { id: 'm1-3', title: 'Procurement & Ordering', status: 'In Progress', date: new Date(2024, 4, 30).toISOString(), description: 'Ordering all furniture and materials.' },
      { id: 'm1-4', title: 'Installation & Styling', status: 'Pending', date: new Date(2024, 6, 15).toISOString() },
      { id: 'm1-5', title: 'Final Handover', status: 'Pending', date: new Date(2024, 7, 30).toISOString() },
    ],
    activityLog: [
      { id: 'a1-1', type: 'Status Update', description: 'Project status changed to In Progress.', timestamp: new Date(2024, 2, 1).toISOString(), user: 'System', iconName: 'update' },
      { id: 'a1-2', type: 'Client Comment', description: 'Client requested minor changes to sofa selection.', timestamp: new Date(2024, 2, 22).toISOString(), user: 'Sarah Johnson', iconName: 'comment' },
      { id: 'a1-3', type: 'Document Upload', description: 'Uploaded revised floor plan v2.', timestamp: new Date(2024, 2, 25).toISOString(), user: 'Emily Carter', iconName: 'attach_file' },
      { id: 'a1-4', type: 'Meeting', description: 'Site visit with electrician scheduled.', timestamp: new Date(2024, 4, 29).toISOString(), user: 'Emily Carter', iconName: 'event'},
    ],
    proposalItems: [
      { id: 'pi1-1', itemName: 'Custom Sectional Sofa', quantity: 1, unitPrice: 3500, totalPrice: 3500, description: 'L-shaped, performance fabric' },
      { id: 'pi1-2', itemName: 'Oak Coffee Table', quantity: 1, unitPrice: 600, totalPrice: 600, description: 'Solid oak, minimalist design' },
      { id: 'pi1-3', itemName: 'Wool Area Rug (8x10)', quantity: 1, unitPrice: 800, totalPrice: 800 },
      { id: 'pi1-4', itemName: 'Designer Lighting Package', quantity: 1, unitPrice: 1200, totalPrice: 1200, description: 'Includes chandelier and floor lamps' },
      { id: 'pi1-5', itemName: 'Design & Consultation Fee', quantity: 1, unitPrice: 2000, totalPrice: 2000 },
    ],
    proposalTotal: 8100,
    proposalDiscount: 100,
    proposalTax: (8100 - 100) * 0.07, // 7% tax on (total - discount)
    proposalGrandTotal: (8100 - 100) * 1.07,
    communicationLog: [
      { id: 'cl1-1', date: new Date(2024, 2, 5).toISOString(), type: 'Meeting', subject: 'Initial Project Kick-off', participants: ['Emily Carter', 'Sarah Johnson'] },
      { id: 'cl1-2', date: new Date(2024, 2, 22).toISOString(), type: 'Email', subject: 'Feedback on Sofa Options', participants: ['Sarah Johnson', 'Emily Carter'] },
      { id: 'cl1-3', date: new Date(2024, 3, 10).toISOString(), type: 'Call', subject: 'Update on Material Sourcing', participants: ['Emily Carter', 'Sarah Johnson'] },
    ],
    paymentLog: [
      { id: 'pl1-1', date: new Date(2024, 2, 25).toISOString(), amount: 4000, method: 'Bank Transfer', status: 'Cleared', reference: 'Initial Deposit' },
      { id: 'pl1-2', date: new Date(2024, 4, 15).toISOString(), amount: 3000, method: 'Credit Card', status: 'Pending', reference: 'Milestone Payment 1' },
    ],
    totalPaidAmount: 4000,
    documents: [
      { id: 'doc1-1', name: 'Initial Proposal_v1.pdf', type: 'Proposal', uploadedDate: new Date(2024, 2, 6).toISOString(), uploader: 'Emily Carter', url: '#', fileSize: '1.2 MB' },
      { id: 'doc1-2', name: 'Signed Contract.pdf', type: 'Contract', uploadedDate: new Date(2024, 2, 10).toISOString(), uploader: 'Sarah Johnson', url: '#', fileSize: '850 KB' },
      { id: 'doc1-3', name: 'LivingRoom_FloorPlan_v2.pdf', type: 'Floor Plan', uploadedDate: new Date(2024, 2, 25).toISOString(), uploader: 'Emily Carter', url: '#', fileSize: '2.1 MB' },
      { id: 'doc1-4', name: 'Moodboard_Final.jpg', type: 'Image', uploadedDate: new Date(2024, 2, 18).toISOString(), uploader: 'Emily Carter', url: '#', fileSize: '5.5 MB' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Downtown Kitchen Remodel',
    clientName: 'Michael Davis',
    clientId: 'client-2',
    status: 'Completed',
    budget: 22000,
    spentAmount: 21500,
    commission: 2200,
    lastUpdated: new Date(2024, 3, 15).toISOString(),
    description: 'Full kitchen gut and remodel with custom cabinetry and high-end appliances.',
    startDate: new Date(2023, 11, 10).toISOString(),
    endDate: new Date(2024, 3, 10).toISOString(),
    projectManagerName: 'Alex Chen',
     milestones: [
      { id: 'm2-1', title: 'Demolition', status: 'Completed', date: new Date(2023, 11, 15).toISOString() },
      { id: 'm2-2', title: 'Cabinetry Install', status: 'Completed', date: new Date(2024, 1, 20).toISOString() },
      { id: 'm2-3', title: 'Appliance Delivery & Install', status: 'Completed', date: new Date(2024, 2, 10).toISOString() },
      { id: 'm2-4', title: 'Final Touches & Cleanup', status: 'Completed', date: new Date(2024, 3, 5).toISOString() },
    ],
    activityLog: [
      { id: 'a2-1', type: 'Status Update', description: 'Project marked as Completed.', timestamp: new Date(2024, 3, 10).toISOString(), user: 'Alex Chen', iconName:'flag'},
    ],
    proposalItems: [
        { id: 'pi2-1', itemName: 'Custom Kitchen Cabinets', quantity: 1, unitPrice: 12000, totalPrice: 12000, description: 'Shaker style, painted white' },
        { id: 'pi2-2', itemName: 'Quartz Countertops', quantity: 1, unitPrice: 5000, totalPrice: 5000, description: 'Calacatta Gold pattern' },
        { id: 'pi2-3', itemName: 'Appliance Package', quantity: 1, unitPrice: 4000, totalPrice: 4000, description: 'Fridge, Oven, Dishwasher' },
    ],
    proposalTotal: 21000,
    proposalTax: 21000 * 0.07,
    proposalGrandTotal: 21000 * 1.07,
  },
  {
    id: 'proj-3',
    name: 'Startup Office Renovation',
    clientName: 'Emily White (Innovate Solutions)',
    clientId: 'client-3',
    status: 'New',
    budget: 35000,
    spentAmount: 0,
    commission: 3000,
    lastUpdated: new Date(2024, 5, 1).toISOString(),
    description: 'Design and outfit a new office space for a growing tech startup.',
    startDate: new Date(2024, 5, 10).toISOString(),
    projectManagerName: 'Olivia Green',
    milestones: [
        { id: 'm3-1', title: 'Kick-off Meeting', status: 'Pending', date: new Date(2024, 5, 12).toISOString()},
    ],
    activityLog: [
        { id: 'a3-1', type: 'Status Update', description: 'New project created.', timestamp: new Date(2024, 5, 1).toISOString(), user: 'System', iconName:'add_circle'},
    ]
  },
  {
    id: 'proj-4',
    name: 'Luxury Bathroom Upgrade',
    clientName: 'David Lee',
    clientId: 'client-4',
    status: 'On Hold',
    budget: 8500,
    spentAmount: 1200, // Some initial design work done
    commission: 850,
    lastUpdated: new Date(2024, 2, 5).toISOString(),
    description: 'Upgrade master bathroom with luxury fixtures and spa-like features. Project currently on hold per client request.',
    startDate: new Date(2024, 1, 1).toISOString(),
    projectManagerName: 'Emily Carter',
  },
  {
    id: 'proj-5',
    name: 'Outdoor Patio & Landscape Design',
    clientName: 'Olivia Green',
    clientId: 'client-5',
    status: 'Completed',
    budget: 12000,
    spentAmount: 11800,
    commission: 1200,
    lastUpdated: new Date(2023, 8, 20).toISOString(),
    description: 'Design a functional and beautiful outdoor living space including patio, seating, and landscaping.',
    startDate: new Date(2023, 5, 1).toISOString(),
    endDate: new Date(2023, 8, 15).toISOString(),
    projectManagerName: 'Alex Chen',
  },
  {
    id: 'proj-6',
    name: 'Boutique Hotel Lobby',
    clientName: 'The Grand Hotel Group',
    // No clientId for this example
    status: 'In Progress',
    budget: 75000,
    spentAmount: 35000,
    commission: 7500,
    lastUpdated: new Date(2024, 4, 20).toISOString(),
    description: 'Full redesign of a boutique hotel lobby to create a welcoming and luxurious atmosphere.',
    startDate: new Date(2024, 0, 15).toISOString(),
    endDate: new Date(2024, 8, 30).toISOString(),
    projectManagerName: 'Olivia Green',
    milestones: [
        { id: 'm6-1', title: 'Concept Finalized', status: 'Completed', date: new Date(2024, 1, 28).toISOString() },
        { id: 'm6-2', title: 'Phase 1 Construction', status: 'In Progress', date: new Date(2024, 5, 30).toISOString() },
        { id: 'm6-3', title: 'Furniture Installation', status: 'Pending', date: new Date(2024, 7, 15).toISOString() },
    ],
    activityLog: [
        { id: 'a6-1', type: 'Status Update', description: 'Phase 1 Construction Started.', timestamp: new Date(2024, 3, 1).toISOString(), user: 'System', iconName:'construction' },
    ]
  },
];

const API_DELAY = 300; // Reduced delay for faster interaction

export const fetchProjects = (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_PROJECTS]), API_DELAY);
  });
};

export const fetchProjectById = (id: string): Promise<Project | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = MOCK_PROJECTS.find(p => p.id === id);
      resolve(project ? { ...project } : undefined);
    }, API_DELAY);
  });
};
