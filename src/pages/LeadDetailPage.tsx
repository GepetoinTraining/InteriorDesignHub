
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as leadService from '../services/leadService';
import { Lead, CommunicationLogEntry, LeadTask, LeadStatus } from '../types/lead';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

type ActiveTab = 'overview' | 'communication' | 'tasks' | 'notes';

const leadStatuses: LeadStatus[] = [
  'new', 'contacted', 'pre-quote', 'quote-sent', 
  'negotiation', 'closed-won', 'closed-lost', 'purchasing', 
  'production', 'fulfillment', 'ready-install', 'installing', 'post-sales'
];

const LeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedLeadData, setEditedLeadData] = useState<Partial<Lead>>({});
  
  // Convert to client state
  const [isConverting, setIsConverting] = useState(false);

  // Form states for tabs
  const [newCommType, setNewCommType] = useState<'Email' | 'Call' | 'Meeting' | 'Message'>('Call');
  const [newCommSubject, setNewCommSubject] = useState('');
  const [newCommNotes, setNewCommNotes] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  
  const [isSubmittingComm, setIsSubmittingComm] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  useEffect(() => {
    if (!leadId) {
      setError("No lead ID provided.");
      setLead(null); 
      setCurrentNotes(''); 
      setIsLoading(false);
      return;
    }
    const fetchLeadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await leadService.fetchLeadById(leadId);
        if (data) {
          setLead(data);
          setCurrentNotes(data.notes || '');
          setEditedLeadData(data); // Initialize edit form data
        } else {
          setError(`Lead with ID ${leadId} not found.`);
          setLead(null); 
          setCurrentNotes('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setLead(null); 
        setCurrentNotes('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeadData();
  }, [leadId]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!lead || !leadId) return;
    setIsLoading(true); // Use main loading indicator for simplicity or a specific one
    setFormMessage(null);
    try {
      // Ensure value is a number if provided
      const dataToUpdate = { ...editedLeadData };
      if (dataToUpdate.value && typeof dataToUpdate.value === 'string') {
        dataToUpdate.value = parseFloat(dataToUpdate.value);
      }

      const updatedLead = await leadService.updateLead(leadId, dataToUpdate as Partial<Omit<Lead, 'id' | 'communicationHistory' | 'tasks'>>);
      setLead(updatedLead);
      setEditedLeadData(updatedLead);
      setIsEditing(false);
      setFormMessage({ type: 'success', text: 'Lead details updated successfully.' });
    } catch (err) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update lead.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFormMessage(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    if (lead) setEditedLeadData(lead); // Reset changes
    setIsEditing(false);
  };

  const handleConvertToClient = async () => {
    if (!lead || !leadId) return;
    setIsConverting(true);
    setFormMessage(null);
    try {
      const updatedLead = await leadService.convertToClient(leadId);
      setLead(updatedLead); // Update local state with new status and convertedDate
      setFormMessage({ type: 'success', text: `${lead.name} successfully converted to client.` });
    } catch (err) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to convert lead to client.' });
    } finally {
      setIsConverting(false);
      setTimeout(() => setFormMessage(null), 3000);
    }
  };


  const handleLogCommunication = async (e: FormEvent) => {
    e.preventDefault();
    if (!lead || !newCommSubject.trim()) {
      setFormMessage({ type: 'error', text: 'Subject is required for communication log.'});
      return;
    }
    setIsSubmittingComm(true);
    setFormMessage(null);
    try {
      const newEntry = await leadService.addCommunicationLog(lead.id, {
        type: newCommType,
        subject: newCommSubject,
        notes: newCommNotes,
      });
      setLead(prev => prev ? { ...prev, communicationHistory: [newEntry, ...prev.communicationHistory] } : null);
      setNewCommSubject('');
      setNewCommNotes('');
      setNewCommType('Call');
      setFormMessage({ type: 'success', text: 'Communication logged successfully.'});
    } catch (err) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to log communication.' });
    } finally {
      setIsSubmittingComm(false);
      setTimeout(() => setFormMessage(null), 3000);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!lead || !newTaskDescription.trim()) {
       setFormMessage({ type: 'error', text: 'Task description is required.'});
      return;
    }
    setIsSubmittingTask(true);
    setFormMessage(null);
    try {
      const newTask = await leadService.addLeadTask(lead.id, {
        description: newTaskDescription,
        dueDate: newTaskDueDate || undefined,
      });
      setLead(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setFormMessage({ type: 'success', text: 'Task added successfully.'});
    } catch (err) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add task.' });
    } finally {
      setIsSubmittingTask(false);
      setTimeout(() => setFormMessage(null), 3000);
    }
  };
  
  const handleToggleTaskStatus = async (taskId: string, isCompleted: boolean) => {
    if (!lead) return;
    try {
      const updatedTask = await leadService.updateLeadTaskStatus(lead.id, taskId, isCompleted);
      if (updatedTask) {
        setLead(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(task => task.id === taskId ? updatedTask : task)
        } : null);
      }
    } catch (err) {
       setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update task status.' });
       setTimeout(() => setFormMessage(null), 3000);
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSavingNotes(true);
    setFormMessage(null);
    try {
      const updatedLead = await leadService.updateLeadNotes(lead.id, currentNotes);
      if (updatedLead) {
        setLead(updatedLead);
        setFormMessage({ type: 'success', text: 'Notes saved successfully.'});
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save notes.' });
    } finally {
      setIsSavingNotes(false);
      setTimeout(() => setFormMessage(null), 3000);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        if (!dateString.includes('-') && !dateString.includes('/')) return dateString;
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return dateString; 
    }
  };
  
  const formatTaskDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    try {
        if (!dateString.includes('-') && !dateString.includes('/')) return dateString;
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };


  if (isLoading && !lead) return <div className="flex-1 text-center p-10">Loading lead details...</div>;
  if (error) return <div className="flex-1 text-center p-10 text-red-500">Error: {error}</div>;
  if (!lead) return <div className="flex-1 text-center p-10">Lead not found.</div>;

  const TabContentWrapper: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <section className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </section>
  );


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/leads" className="flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium">
          <Icon iconName="arrow_back_ios" className="text-base mr-1" />
          Back to Leads Kanban
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
          <img
            src={lead.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=random&color=fff`}
            alt={lead.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm mb-4 sm:mb-0 sm:mr-6"
          />
          <div className="text-center sm:text-left flex-grow">
            {isEditing ? (
              <Input 
                name="name" 
                id="leadName"
                value={editedLeadData.name || ''} 
                onChange={handleEditInputChange} 
                className="text-2xl sm:text-3xl font-bold !p-1 mb-1"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{lead.name}</h1>
            )}
            {isEditing ? (
              <Input 
                name="company" 
                id="leadCompany"
                value={editedLeadData.company || ''} 
                onChange={handleEditInputChange} 
                placeholder="Company Name"
                className="text-md !p-1 mb-1"
              />
            ) : (
              lead.company && <p className="text-slate-600 text-md">{lead.company}</p>
            )}
            <Badge variant={lead.status === 'closed-won' ? 'success' : lead.status === 'closed-lost' ? 'error' : 'primary'} className="mt-2">
              {lead.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {lead.convertedDate && <p className="text-xs text-slate-500 mt-1">Converted: {formatDate(lead.convertedDate)}</p>}
          </div>
          {!isEditing && (
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button 
                variant="secondary" 
                className="!h-9 !px-3 !text-xs" 
                onClick={handleConvertToClient}
                isLoading={isConverting}
                disabled={isConverting || lead.status === 'closed-won' || lead.status === 'closed-lost'}
              >
                {lead.status === 'closed-won' ? 'Converted' : 'Convert to Client'}
              </Button>
              <Button variant="outlined" className="!h-9 !px-3 !text-xs" onClick={() => setIsEditing(true)}>Edit Lead</Button>
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-md font-semibold text-slate-700">Edit Lead Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input id="email" name="email" type="email" value={editedLeadData.email || ''} onChange={handleEditInputChange} />
                </div>
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <Input id="phone" name="phone" type="tel" value={editedLeadData.phone || ''} onChange={handleEditInputChange} />
                </div>
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1">Value ($)</label>
                  <Input id="value" name="value" type="number" value={editedLeadData.value?.toString() || ''} onChange={handleEditInputChange} />
                </div>
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                  <Input id="assignedTo" name="assignedTo" value={editedLeadData.assignedTo || ''} onChange={handleEditInputChange} />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select id="status" name="status" value={editedLeadData.status || ''} onChange={handleEditInputChange} className="form-select block w-full rounded-md border-slate-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-sm h-10">
                    {leadStatuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">Due Date / Follow-up</label>
                  <Input id="dueDate" name="dueDate" value={editedLeadData.dueDate || ''} onChange={handleEditInputChange} />
                </div>
                {/* Fix: Removed label prop, using standard label element */}
                <div>
                  <label htmlFor="nextAction" className="block text-sm font-medium text-slate-700 mb-1">Next Action</label>
                  <Input id="nextAction" name="nextAction" value={editedLeadData.nextAction || ''} onChange={handleEditInputChange} />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" onClick={handleCancelEdit} className="!h-9 !text-xs">Cancel</Button>
              <Button onClick={handleSaveChanges} isLoading={isLoading} className="!h-9 !text-xs">Save Changes</Button>
            </div>
          </div>
        )}


        {formMessage && (
            <div className={`p-3 rounded-md mb-4 text-sm ${ formMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200' }`} role="alert">
            {formMessage.text}
            </div>
        )}

        <nav className="mb-6">
          <div className="border-b border-slate-200">
            <div className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
              {(['overview', 'communication', 'tasks', 'notes'] as ActiveTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 capitalize text-sm sm:text-base whitespace-nowrap font-medium transition-colors duration-150
                    ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {activeTab === 'overview' && (
          <TabContentWrapper title="Lead Overview">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><dt className="font-medium text-slate-500">Value:</dt><dd className="text-slate-800 mt-0.5">${lead.value.toLocaleString()}</dd></div>
              <div><dt className="font-medium text-slate-500">Assigned To:</dt><dd className="text-slate-800 mt-0.5">{lead.assignedTo || 'N/A'}</dd></div>
              <div><dt className="font-medium text-slate-500">Email:</dt><dd className="text-slate-800 mt-0.5 hover:text-[var(--color-primary)]"><a href={`mailto:${lead.email}`}>{lead.email || 'N/A'}</a></dd></div>
              <div><dt className="font-medium text-slate-500">Phone:</dt><dd className="text-slate-800 mt-0.5">{lead.phone || 'N/A'}</dd></div>
              <div><dt className="font-medium text-slate-500">Due Date / Follow-up:</dt><dd className="text-slate-800 mt-0.5">{lead.dueDate || 'N/A'}</dd></div>
              <div><dt className="font-medium text-slate-500">Last Contacted:</dt><dd className="text-slate-800 mt-0.5">{formatDate(lead.lastContacted) || 'N/A'}</dd></div>
              <div className="md:col-span-2"><dt className="font-medium text-slate-500">Next Action:</dt><dd className="text-slate-800 mt-0.5">{lead.nextAction || 'N/A'}</dd></div>
            </dl>
          </TabContentWrapper>
        )}

        {activeTab === 'communication' && (
          <TabContentWrapper title="Communication History">
            <form onSubmit={handleLogCommunication} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h4 className="text-md font-semibold text-slate-700">Log New Communication</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={newCommType} onChange={e => setNewCommType(e.target.value as any)} className="form-select block w-full rounded-md border-slate-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-sm h-10">
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Message">Message</option>
                </select>
                <Input type="text" placeholder="Subject *" value={newCommSubject} onChange={e => setNewCommSubject(e.target.value)} className="!h-10 text-sm" required />
              </div>
              <textarea value={newCommNotes} onChange={e => setNewCommNotes(e.target.value)} placeholder="Notes (optional)..." rows={3} className="form-textarea block w-full rounded-md border-slate-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-sm p-2"></textarea>
              <Button type="submit" isLoading={isSubmittingComm} disabled={isSubmittingComm || !newCommSubject.trim()} className="!h-9 !text-xs">Log Communication</Button>
            </form>
            {lead.communicationHistory.length > 0 ? (
              <ul className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {lead.communicationHistory.map(log => (
                  <li key={log.id} className="p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                      <span>{formatDate(log.date)}</span>
                      <span>Type: {log.type}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{log.subject}</p>
                    {log.notes && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{log.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No communication logged yet.</p>}
          </TabContentWrapper>
        )}

        {activeTab === 'tasks' && (
           <TabContentWrapper title="Associated Tasks">
            <form onSubmit={handleAddTask} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h4 className="text-md font-semibold text-slate-700">Add New Task</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Input type="text" placeholder="Task Description *" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} className="sm:col-span-2 !h-10 text-sm" required />
                 <Input type="date" placeholder="Due Date (optional)" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className="!h-10 text-sm" />
                 <Button type="submit" isLoading={isSubmittingTask} disabled={isSubmittingTask || !newTaskDescription.trim()} className="!h-10 !text-xs self-end">Add Task</Button>
              </div>
            </form>
            {lead.tasks.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {lead.tasks.map(task => (
                  <li key={task.id} className={`p-3 rounded-md border flex items-center gap-3 ${task.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={(e) => handleToggleTaskStatus(task.id, e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      id={`task-${task.id}`}
                    />
                    <label htmlFor={`task-${task.id}`} className={`flex-grow text-sm ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {task.description}
                      {task.dueDate && <span className="block text-xs text-slate-400">{formatTaskDueDate(task.dueDate)}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No tasks associated with this lead.</p>}
          </TabContentWrapper>
        )}

        {activeTab === 'notes' && (
          <TabContentWrapper title="Notes">
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              rows={8}
              className="form-textarea block w-full rounded-md border-slate-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-sm p-3"
              placeholder="Add general notes about this lead..."
            />
            <Button onClick={handleSaveNotes} isLoading={isSavingNotes} disabled={isSavingNotes} className="mt-4 !h-9 !text-xs">Save Notes</Button>
          </TabContentWrapper>
        )}
      </div>
    </div>
  );
};

export default LeadDetailPage;
