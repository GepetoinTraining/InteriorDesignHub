
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as leadService from '../services/leadService';
import { KanbanColumnData } from '../types/lead';
import KanbanColumn from '../components/kanban/KanbanColumn';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

const KanbanBoardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [kanbanData, setKanbanData] = useState<KanbanColumnData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError("User not authenticated.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await leadService.fetchKanbanData(currentUser.role);
        setKanbanData(data);
      } catch (err) {
        console.error("Failed to fetch Kanban data", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Leads Pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load leads</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
         <Button onClick={() => window.location.reload()} variant="primary"> {/* Simplistic retry */}
            Try Again
        </Button>
      </div>
    );
  }
  
  if (kanbanData.length === 0 && !isLoading) {
     return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="search_off" className="text-slate-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">No Leads Pipeline</p>
        <p className="text-slate-600 text-sm">
          There are no lead stages configured for your role ({currentUser?.role}), or no leads to display.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 leading-tight">Leads Pipeline</h2>
          <p className="text-gray-500 text-sm">Track your leads from initial contact to post-sales.</p>
        </div>
        <Button 
          onClick={() => alert('Add New Lead functionality coming soon!')}
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Icon iconName="add" className="mr-2 text-base" />
          Add New Lead
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto pb-4 kanban-board"> {/* Added kanban-board class for horizontal scroll styles */}
        <div className="flex gap-4 h-full min-w-max"> {/* min-w-max ensures horizontal scroll works as expected */}
          {kanbanData.map(column => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoardPage;
