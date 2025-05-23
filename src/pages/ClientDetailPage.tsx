
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as clientService from '../services/clientService';
import { Client } from '../types/client';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext'; // For potential avatar placeholder

const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError("No client ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchClientData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await clientService.fetchClientById(clientId);
        if (data) {
          setClient(data);
        } else {
          setError(`Client with ID ${clientId} not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch client details", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  
  const getStatusBadgeVariant = (status?: Client['status']): 'success' | 'warning' | 'error' | 'secondary' => {
    if (!status) return 'secondary';
    switch (status) {
      case 'Active': return 'success';
      case 'Prospect': return 'warning';
      case 'Inactive': return 'error';
      default: return 'secondary';
    }
  };

  const effectiveAvatarUrl = client?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client?.name || 'Client')}&background=random&color=fff&size=128`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Client Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Error Loading Client</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={() => navigate('/clients')} variant="secondary">
          Back to Clients List
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="person_search" className="text-slate-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold">Client Not Found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/clients" className="flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium">
          <Icon iconName="arrow_back_ios" className="text-base mr-1" />
          Back to Clients List
        </Link>
      </div>

      {/* Client Header */}
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <img
            src={effectiveAvatarUrl}
            alt={client.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-200 shadow-md mb-4 sm:mb-0 sm:mr-6"
          />
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{client.name}</h1>
            {client.companyName && <p className="text-slate-600 text-lg">{client.companyName}</p>}
            <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(client.status)} size="standard">
                    {client.status}
                </Badge>
            </div>
          </div>
          <Button 
            onClick={() => alert(`Edit client ${client.id}`)} // Placeholder for edit action
            variant="outlined"
            className="mt-4 sm:mt-0"
          >
            <Icon iconName="edit" className="mr-2 text-sm" /> Edit Client
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column / Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Info Card */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Contact Information</h2>
            <dl className="space-y-3 text-sm">
              {client.email && (
                <div className="flex">
                  <dt className="w-28 font-medium text-slate-500 flex-shrink-0">Email:</dt>
                  <dd className="text-slate-700 break-all"><a href={`mailto:${client.email}`} className="text-[var(--color-primary)] hover:underline">{client.email}</a></dd>
                </div>
              )}
              {client.phone && (
                <div className="flex">
                  <dt className="w-28 font-medium text-slate-500 flex-shrink-0">Phone:</dt>
                  <dd className="text-slate-700">{client.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Placeholder Sections */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Associated Projects</h2>
            <p className="text-slate-500 text-sm">Project list for this client will appear here. (Placeholder)</p>
            {/* Future: List projects */}
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Associated Leads</h2>
            <p className="text-slate-500 text-sm">Lead history for this client will appear here. (Placeholder)</p>
            {/* Future: List leads */}
          </div>
        </div>

        {/* Right Column / Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Key Metrics</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Total Projects:</dt>
                <dd className="text-slate-700 font-semibold text-lg">{client.totalProjects || 0}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Total Spent:</dt>
                <dd className="text-slate-700 font-semibold text-lg">${(client.totalSpent || 0).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Last Contacted:</dt>
                <dd className="text-slate-700">{formatDate(client.lastContacted)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Communication Log</h2>
            <p className="text-slate-500 text-sm">Interaction history will be shown here. (Placeholder)</p>
             {/* Future: List communications */}
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Notes</h2>
            <textarea
                className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                rows={4}
                placeholder="Add private notes about this client..."
            />
            <Button variant="secondary" className="mt-3 text-xs !h-8">Save Note</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
