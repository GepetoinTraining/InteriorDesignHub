
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
// Mock project data structure - replace with actual Project type from types/project.ts if available
interface MockClientProject {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Pending Approval' | 'On Hold';
  timeline: string; // e.g., "Est. 6 weeks"
  budget: number;
  projectManager: { name: string; email: string; phone?: string; avatarUrl?: string };
  milestones: { id: string; name: string; status: 'Done' | 'In Progress' | 'Upcoming'; dueDate?: string }[];
  visuals: { id: string; type: 'image' | 'moodboard'; url: string; caption: string }[];
  documents: { id: string; name: string; type: 'Contract' | 'Invoice' | 'Floor Plan'; url: string; dateAdded: string }[];
}

const mockProjectData: MockClientProject = {
  id: 'proj-client-view-123',
  name: 'Luxury Apartment Redesign',
  description: 'A complete overhaul of a 2-bedroom luxury apartment, focusing on modern aesthetics, smart home integration, and premium finishes. The project includes a custom kitchen, spa-like bathrooms, and bespoke furniture throughout.',
  status: 'In Progress',
  timeline: 'Est. 8 Weeks (Remaining)',
  budget: 75000,
  projectManager: {
    name: 'Alex Chen (Lead Designer)',
    email: 'alex.chen@stitchdesign.co',
    phone: '555-0123',
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  milestones: [
    { id: 'm1', name: 'Concept & Design Finalized', status: 'Done', dueDate: '2024-06-15' },
    { id: 'm2', name: 'Procurement Phase', status: 'In Progress', dueDate: '2024-07-10' },
    { id: 'm3', name: 'Installation Begins', status: 'Upcoming', dueDate: '2024-08-01' },
    { id: 'm4', name: 'Final Touches & Handover', status: 'Upcoming', dueDate: '2024-08-20' },
  ],
  visuals: [
    { id: 'v1', type: 'moodboard', url: 'https://images.unsplash.com/photo-1540555238602-3F6e53e4512f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60', caption: 'Living Room Moodboard' },
    { id: 'v2', type: 'image', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60', caption: 'Kitchen Render Preview' },
    { id: 'v3', type: 'image', url: 'https://images.unsplash.com/photo-1580090548028-691da1866a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60', caption: 'Master Bedroom Concept' },
  ],
  documents: [
    { id: 'd1', name: 'Project Contract_Signed.pdf', type: 'Contract', url: '#download-contract', dateAdded: '2024-06-01' },
    { id: 'd2', name: 'Initial Invoice_Paid.pdf', type: 'Invoice', url: '#download-invoice1', dateAdded: '2024-06-05' },
    { id: 'd3', name: 'Apartment Floor Plan_v3.pdf', type: 'Floor Plan', url: '#download-floorplan', dateAdded: '2024-06-10' },
  ]
};


const ClientProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<MockClientProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, fetch project by projectId from a service
      setProject(mockProjectData);
      setIsLoading(false);
    }, 1000);
  }, [projectId]);
  
  const getStatusBadgeVariant = (status: MockClientProject['status']): 'success' | 'warning' | 'primary' | 'secondary' => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Pending Approval': return 'primary';
      case 'On Hold': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMilestoneIcon = (status: MockClientProject['milestones'][0]['status']) => {
    switch (status) {
        case 'Done': return 'check_circle_outline';
        case 'In Progress': return 'hourglass_empty';
        case 'Upcoming': return 'radio_button_unchecked';
        default: return 'help_outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Project Details...</p>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-10 text-slate-600">Project not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{project.name}</h1>
        <p className="text-slate-600">{project.description}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Status</p>
                <Badge variant={getStatusBadgeVariant(project.status)} size="standard">{project.status}</Badge>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Timeline</p>
                <p className="text-slate-700">{project.timeline}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Budget</p>
                <p className="text-slate-700 font-semibold">${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Key Milestones</h2>
            <ul className="space-y-4">
              {project.milestones.map(milestone => (
                <li key={milestone.id} className="flex items-start">
                  <Icon iconName={getMilestoneIcon(milestone.status)} className={`mr-3 mt-1 ${milestone.status === 'Done' ? 'text-green-500' : milestone.status === 'In Progress' ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-slate-800 font-medium">{milestone.name}</p>
                    {milestone.dueDate && <p className="text-xs text-slate-500">Due: {milestone.dueDate}</p>}
                  </div>
                  <Badge variant={milestone.status === 'Done' ? 'success' : milestone.status === 'In Progress' ? 'warning' : 'secondary'} size="small" className="ml-auto">
                    {milestone.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Visuals & Moodboards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.visuals.map(visual => (
                <div key={visual.id} className="group">
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <img src={visual.url} alt={visual.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-xs text-center text-slate-600 mt-2">{visual.caption}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Project Manager</h2>
            <div className="flex items-center space-x-4">
              <img src={project.projectManager.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.projectManager.name)}&background=random`} alt={project.projectManager.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="text-slate-800 font-semibold">{project.projectManager.name}</p>
                <a href={`mailto:${project.projectManager.email}`} className="text-sm text-[var(--color-primary)] hover:underline block">{project.projectManager.email}</a>
                {project.projectManager.phone && <p className="text-xs text-slate-500">{project.projectManager.phone}</p>}
              </div>
            </div>
            <Button variant="primary" fullWidth className="mt-6 !h-10">
              <Icon iconName="chat_bubble_outline" className="mr-2" /> Contact Manager
            </Button>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Documents</h2>
            <ul className="space-y-3">
              {project.documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type} - Added {doc.dateAdded}</p>
                    </div>
                    <Icon iconName="download" className="text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          
          <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
             <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
             <div className="space-y-3">
                <Button variant="secondary" fullWidth onClick={() => alert('Request change action')}>Request a Change</Button>
                <Button variant="secondary" fullWidth onClick={() => alert('View invoice history action')}>View Invoice History</Button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectDetailPage;
