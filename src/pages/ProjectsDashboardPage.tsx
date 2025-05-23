
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectService from '../services/projectService';
import { Project, ProjectStatus } from '../types/project';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';

type ActiveProjectView = 'list' | 'board' | 'calendar';

const ProjectsDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<ActiveProjectView>('list');
  const navigate = useNavigate();

  const fetchProjectsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const getStatusBadgeVariant = (status: ProjectStatus): 'success' | 'warning' | 'primary' | 'secondary' | 'error' => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'New': return 'primary';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: '2-digit', month: 'short', day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };


  const handleViewChange = (view: ActiveProjectView) => {
    setActiveView(view);
    if (view !== 'list') {
        alert(`${view.charAt(0).toUpperCase() + view.slice(1)} view coming soon!`);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };


  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load projects</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchProjectsData} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Projects</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage and track all your design projects.</p>
        </div>
        <Button 
            onClick={() => alert("New Project creation page/modal coming soon!")} // Placeholder
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Icon iconName="add" className="mr-2 text-base" />
          New Project
        </Button>
      </div>

      {/* Tabs for View Change */}
      <div className="mb-6">
        <div className="flex border-b border-slate-200 gap-3 sm:gap-6">
          {(['list', 'board', 'calendar'] as ActiveProjectView[]).map(view => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={`pb-3 pt-1 text-sm font-semibold tracking-wide transition-colors duration-150 capitalize
                ${activeView === view 
                  ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-b-slate-300'}`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search projects by name, client, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!pl-10 w-full"
        />
      </div>
      
      {isLoading && projects.length > 0 && (
         <div className="text-center py-4 text-slate-600">Updating project list...</div>
      )}

      {activeView === 'list' && (
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          {filteredProjects.length === 0 && !isLoading ? (
            <div className="text-center py-10 text-slate-500">
              <Icon iconName="folder_off" className="text-4xl mb-2" />
              <p>No projects found{searchTerm && ' matching your search'}.</p>
              {!searchTerm && (
                  <Button onClick={() => alert("New Project page coming soon!")} className="mt-4">
                      Create Your First Project
                  </Button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Budget</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Commission</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleProjectClick(project.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 truncate max-w-xs hover:text-[var(--color-primary)] transition-colors">{project.name}</div>
                        <div className="text-xs text-slate-500 md:hidden">{project.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell truncate max-w-xs">{project.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(project.status)} size="small">
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right hidden sm:table-cell">${project.budget.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right hidden lg:table-cell">${(project.commission || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{formatDate(project.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Placeholder for Board and Calendar views */}
      {activeView === 'board' && <div className="text-center py-10 text-slate-500">Board View Coming Soon!</div>}
      {activeView === 'calendar' && <div className="text-center py-10 text-slate-500">Calendar View Coming Soon!</div>}
    </div>
  );
};

export default ProjectsDashboardPage;
