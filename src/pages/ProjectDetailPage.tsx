

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as projectService from '../services/projectService';
import { Project, Milestone, ActivityLogItem, ProjectStatus, ProposalItem, CommunicationLogEntry, PaymentLogEntry, DocumentItem } from '../types/project';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge'; 

type ActiveProjectDetailTab = 'overview' | 'budget' | 'communication' | 'payments' | 'documents';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveProjectDetailTab>('overview');

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await projectService.fetchProjectById(projectId);
        if (data) {
          setProject(data);
        } else {
          setError(`Project with ID ${projectId} not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch project details", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) return 'N/A';
    const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options || defaultOptions);
    } catch(e) {
      return "Invalid Date";
    }
  };
  
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

  const getMilestoneStatusIcon = (status: Milestone['status']): string => {
    switch (status) {
      case 'Completed': return 'check_circle';
      case 'In Progress': return 'hourglass_top';
      case 'Pending': return 'pending';
      case 'Overdue': return 'error';
      default: return 'help_outline';
    }
  };

  const getMilestoneStatusColor = (status: Milestone['status']): string => {
    switch (status) {
      case 'Completed': return 'text-green-500';
      case 'In Progress': return 'text-blue-500';
      case 'Pending': return 'text-slate-500';
      case 'Overdue': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };
  
  const budgetProgress = useMemo(() => {
    if (!project || !project.budget || !project.spentAmount || project.budget === 0) return 0;
    return Math.min(Math.max((project.spentAmount / project.budget) * 100, 0), 100);
  }, [project]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Project Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Error Loading Project</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={() => navigate('/projects')} variant="secondary">
          Back to Projects List
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="folder_off" className="text-slate-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold">Project Not Found</p>
      </div>
    );
  }

  const TabContentWrapper: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6 border-b border-slate-200 pb-3">
        {title}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto flex-1 p-0 sm:p-2 md:p-4">
      <header className="mb-6 sm:mb-8 p-4 sm:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Client: {project.clientName} (Project ID: {project.id})
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" className="!h-9 !px-3 !text-xs sm:!h-10 sm:!px-4 sm:!text-sm">Edit Project</Button>
            <Button variant="primary" className="!h-9 !px-3 !text-xs sm:!h-10 sm:!px-4 sm:!text-sm">Contact Client</Button>
          </div>
        </div>
      </header>

      <nav className="mb-6 sm:mb-8 p-4 sm:p-0">
        <div className="border-b border-slate-200">
          <div className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
            {(['overview', 'budget', 'communication', 'payments', 'documents'] as ActiveProjectDetailTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 capitalize text-sm sm:text-base whitespace-nowrap font-medium transition-colors duration-150
                  ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                {tab.replace('_', ' & ')}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Project Details</h2>
                <Badge variant={getStatusBadgeVariant(project.status)} size="standard">{project.status}</Badge>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 text-sm">
                <div><dt className="font-medium text-slate-500">Project Manager</dt><dd className="text-slate-800 mt-0.5">{project.projectManagerName || 'N/A'}</dd></div>
                <div><dt className="font-medium text-slate-500">Start Date</dt><dd className="text-slate-800 mt-0.5">{formatDate(project.startDate)}</dd></div>
                <div><dt className="font-medium text-slate-500">Est. Completion</dt><dd className="text-slate-800 mt-0.5">{formatDate(project.endDate)}</dd></div>
                <div><dt className="font-medium text-slate-500">Project Value</dt><dd className="text-slate-800 mt-0.5">${project.budget.toLocaleString()}</dd></div>
                 {project.description && (
                    <div className="md:col-span-2"><dt className="font-medium text-slate-500">Description</dt><dd className="text-slate-700 mt-0.5 whitespace-pre-wrap">{project.description}</dd></div>
                 )}
              </dl>
            </section>

            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Project Milestones</h2>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                  {project.milestones?.filter(m => m.status === 'Completed').length || 0} of {project.milestones?.length || 0} completed
                </span>
              </div>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-5 relative pl-5 sm:pl-0">
                  <div className="absolute left-2.5 sm:left-5 top-3 bottom-3 w-0.5 bg-slate-200 hidden sm:block rounded-full"></div>
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className={`flex items-start relative ${index !== project.milestones!.length - 1 ? 'pb-5 border-b border-slate-100 last:border-b-0' : ''}`}>
                      <div className={`absolute sm:relative left-0 sm:left-auto flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md -translate-x-1/2 sm:translate-x-0 ${getMilestoneStatusColor(milestone.status).replace('text-', 'bg-')}`}>
                        <Icon iconName={getMilestoneStatusIcon(milestone.status)} className="text-lg" />
                      </div>
                      <div className="ml-3 sm:ml-6 w-full">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800">{milestone.title}</h3>
                        <p className={`text-xs sm:text-sm ${getMilestoneStatusColor(milestone.status)}`}>
                          {milestone.status} {milestone.date ? `- ${formatDate(milestone.date)}` : ''}
                        </p>
                        {milestone.description && <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-500">No milestones defined for this project.</p>}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">Budget Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm text-slate-600"><span >Total Budget:</span><span className="font-medium text-slate-800">${project.budget.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs sm:text-sm text-slate-600"><span>Amount Spent:</span><span className="font-medium text-red-600">${(project.spentAmount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-xs sm:text-sm text-slate-600"><span>Remaining Budget:</span><span className="font-medium text-green-600">${(project.budget - (project.spentAmount || 0)).toLocaleString()}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 sm:h-3 my-1">
                  <div className="bg-[var(--color-primary)] h-2.5 sm:h-3 rounded-full" style={{ width: `${budgetProgress}%` }}></div>
                </div>
                <Link to="#" className="mt-3 inline-flex items-center text-xs sm:text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium group">
                  View Detailed Budget <Icon iconName="arrow_forward" className="text-sm ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </section>

            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">Communication Hub</h2>
              <div className="space-y-4">
                <div><p className="text-xs text-slate-500 uppercase">Client Contact</p><p className="text-sm text-slate-800 mt-0.5">{project.clientName}</p><a href={`mailto:${project.clientId}@example.com`} className="text-sm text-[var(--color-primary)] hover:underline">{project.clientId}@example.com</a></div>
                <div><p className="text-xs text-slate-500 uppercase">Project Manager</p><p className="text-sm text-slate-800 mt-0.5">{project.projectManagerName || 'N/A'}</p></div>
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="primary" className="flex-1 !h-9 !text-xs"><Icon iconName="email" className="mr-1.5 text-base" />Send Email</Button>
                  <Button variant="secondary" className="flex-1 !h-9 !text-xs"><Icon iconName="chat_bubble_outline" className="mr-1.5 text-base" />Log Communication</Button>
                </div>
              </div>
            </section>

            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
              {project.activityLog && project.activityLog.length > 0 ? (
                <ul className="space-y-4">
                  {project.activityLog.slice(0, 3).map(activity => ( // Show top 3 initially
                    <li key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Icon iconName={activity.iconName || 'info'} className="text-[var(--color-primary)] text-base" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-slate-800"><span className="font-medium">{activity.type}:</span> {activity.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(activity.timestamp, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })} {activity.user && `by ${activity.user}`}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No recent activity.</p>}
               {project.activityLog && project.activityLog.length > 3 && (
                 <Link to="#" className="mt-4 inline-flex items-center text-xs sm:text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium group">
                    View All Activity <Icon iconName="arrow_forward" className="text-sm ml-1 group-hover:translate-x-0.5 transition-transform" />
                 </Link>
               )}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <TabContentWrapper title="Budget & Proposal">
          {project.proposalItems && project.proposalItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-500">Item</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-500 hidden md:table-cell">Description</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-500">Qty</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-500">Unit Price</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {project.proposalItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-slate-700">{item.itemName}</td>
                      <td className="px-4 py-2 text-slate-600 hidden md:table-cell">{item.description || '-'}</td>
                      <td className="px-4 py-2 text-slate-600 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-slate-600 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-right">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t border-slate-200 max-w-xs ml-auto space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal:</span> <span className="text-slate-800 font-medium">${(project.proposalTotal || 0).toFixed(2)}</span></div>
                {project.proposalDiscount && <div className="flex justify-between"><span className="text-slate-600">Discount:</span> <span className="text-red-600 font-medium">-${project.proposalDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-slate-600">Tax:</span> <span className="text-slate-800 font-medium">${(project.proposalTax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold"><span className="text-slate-700">Grand Total:</span> <span className="text-slate-900">${(project.proposalGrandTotal || 0).toFixed(2)}</span></div>
              </div>
            </div>
          ) : <p className="text-sm text-slate-500">No proposal items available for this project.</p>}
        </TabContentWrapper>
      )}

      {activeTab === 'communication' && (
         <TabContentWrapper title="Communication Log">
          {project.communicationLog && project.communicationLog.length > 0 ? (
            <ul className="space-y-4">
              {project.communicationLog.map(log => (
                <li key={log.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>{formatDate(log.date, { year: 'numeric', month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    <span>Type: {log.type}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{log.subject}</p>
                  {log.notes && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{log.notes}</p>}
                  {log.participants && <p className="text-xs text-slate-500 mt-1">Participants: {log.participants.join(', ')}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">No communication logged for this project.</p>}
        </TabContentWrapper>
      )}

      {activeTab === 'payments' && (
        <TabContentWrapper title="Payment History">
          {project.paymentLog && project.paymentLog.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium text-slate-500">Date</th>
                        <th className="px-4 py-2 text-right font-medium text-slate-500">Amount</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-500">Method</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-500">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-slate-500 hidden sm:table-cell">Reference</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                    {project.paymentLog.map(payment => (
                        <tr key={payment.id}>
                        <td className="px-4 py-2 text-slate-600">{formatDate(payment.date)}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-right">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-2 text-slate-600">{payment.method}</td>
                        <td className="px-4 py-2 text-slate-600">
                             <Badge 
                                variant={payment.status === 'Cleared' ? 'success' : payment.status === 'Pending' ? 'warning' : 'error'} 
                                size="small"
                            >
                                {payment.status}
                            </Badge>
                        </td>
                        <td className="px-4 py-2 text-slate-500 hidden sm:table-cell">{payment.reference || '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="mt-4 pt-2 border-t border-slate-200 text-sm text-right">
                    <span className="text-slate-600">Total Paid: </span>
                    <span className="font-bold text-slate-800">${(project.totalPaidAmount || 0).toFixed(2)}</span>
                </div>
            </div>
          ) : <p className="text-sm text-slate-500">No payments recorded for this project.</p>}
        </TabContentWrapper>
      )}

      {activeTab === 'documents' && (
        <TabContentWrapper title="Project Documents">
          {project.documents && project.documents.length > 0 ? (
            <ul className="space-y-3">
              {project.documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Fix: Adjusted document type check for PDF-like documents */}
                    <Icon iconName={doc.type === 'Image' ? 'image' : ['Proposal', 'Contract', 'Invoice', 'Floor Plan'].includes(doc.type as string) ? 'picture_as_pdf' : 'description'} className="text-xl text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-500">
                        {doc.type} {doc.fileSize ? `(${doc.fileSize})` : ''} - Uploaded {formatDate(doc.uploadedDate)} {doc.uploader && `by ${doc.uploader}`}
                      </p>
                    </div>
                  </div>
                  {/* Fix: Removed unsupported 'size' prop from Button component */}
                  <Button variant="outlined" className="!h-8 !px-2.5 !text-xs" onClick={() => window.open(doc.url, '_blank')}>
                    <Icon iconName="download" className="text-sm mr-1" /> Download
                  </Button>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">No documents uploaded for this project.</p>}
        </TabContentWrapper>
      )}
    </div>
  );
};

export default ProjectDetailPage;
