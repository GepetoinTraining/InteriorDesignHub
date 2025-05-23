
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as clientService from '../services/clientService';
import { Client } from '../types/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge'; // Assuming Badge component exists

const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchClientsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.fetchClients();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsData();
  }, []);

  const handleDelete = async (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete client "${clientName}"? This action cannot be undone.`)) {
      // Consider a more granular loading state if needed
      try {
        await clientService.deleteClient(clientId);
        setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        // Optionally show a success message
      } catch (err) {
        console.error(`Failed to delete client ${clientId}`, err);
        setError(err instanceof Error ? err.message : "Could not delete client.");
      }
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const getStatusBadgeVariant = (status: Client['status']): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'Active': return 'success';
      case 'Prospect': return 'warning';
      case 'Inactive': return 'error'; // Or 'secondary' for a less harsh look
      default: return 'secondary';
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load clients</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchClientsData} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Clients</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage your client relationships and projects.</p>
        </div>
        <Button onClick={() => navigate('/clients/new')} className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]">
          <Icon iconName="add" className="mr-2 text-base" />
          Add New Client
        </Button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by name, email, company, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!pl-10 w-full"
        />
      </div>
      
      {isLoading && clients.length > 0 && (
         <div className="text-center py-4 text-slate-600">Updating client list...</div>
      )}

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {filteredClients.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-slate-500">
            <Icon iconName="people_outline" className="text-4xl mb-2" />
            <p>No clients found{searchTerm && ' matching your search'}.</p>
            {!searchTerm && (
                <Button onClick={() => navigate('/clients/new')} className="mt-4">
                    Add Your First Client
                </Button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Projects</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Spent</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={client.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random&color=fff`} alt={client.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-[150px] sm:max-w-xs">{client.name}</div>
                          <div className="text-xs text-slate-500 md:hidden">{client.companyName || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell truncate max-w-xs">{client.companyName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell truncate max-w-xs">{client.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(client.status)} size="small">
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right hidden lg:table-cell">{client.totalProjects || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right hidden lg:table-cell">${(client.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outlined" onClick={() => navigate(`/clients/${client.id}`)} className="mr-2 !h-7 !px-2 !text-xs">
                        <Icon iconName="visibility" className="text-xs mr-1" /> View
                      </Button>
                      <Button variant="outlined" onClick={() => handleDelete(client.id, client.name)} className="!text-red-600 !border-red-600 hover:!bg-red-50 hover:!text-red-700 !h-7 !px-2 !text-xs">
                         <Icon iconName="delete" className="text-xs mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsListPage;
