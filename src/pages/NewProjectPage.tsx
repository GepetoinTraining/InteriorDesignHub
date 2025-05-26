
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
// Mock service import - replace with actual projectService if it exists
// import * as projectService from '../services/projectService';

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState(''); // Or clientId if using a select dropdown
  const [budget, setBudget] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!projectName || !clientName) {
        setError("Project Name and Client Name are required.");
        setIsLoading(false);
        return;
    }

    const projectData = {
      name: projectName,
      clientName,
      budget: Number(budget) || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description,
      status: 'New', // Default status
      lastUpdated: new Date().toISOString(),
      // In a real app, other fields like projectManagerName, milestones, etc. would be set or initialized.
    };

    try {
      // Placeholder for actual service call
      console.log('Submitting new project:', projectData);
      // await projectService.addProject(projectData); // Uncomment when service is ready
      alert('Project created successfully (mock)!');
      // navigate('/projects'); // Navigate to projects list or new project detail page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.');
      console.error("Failed to create project", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create New Project</h1>
          <p className="text-slate-600 mt-1">Enter the details for the new project.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
            <Input id="projectName" type="text" value={projectName} onChange={e => setProjectName(e.target.value)} required disabled={isLoading} placeholder="e.g., Downtown Apartment Renovation" />
          </div>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
            <Input id="clientName" type="text" value={clientName} onChange={e => setClientName(e.target.value)} required disabled={isLoading} placeholder="e.g., John Doe or Acme Corp" />
            {/* Consider replacing with a client select dropdown */}
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">Estimated Budget ($)</label>
            <Input id="budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} disabled={isLoading} placeholder="e.g., 15000" step="100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Estimated End Date</label>
              <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isLoading} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
              placeholder="Brief overview of the project scope and goals..."
              className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-8">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              <Icon iconName="add_circle" className="mr-2 text-base" />
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectPage;
