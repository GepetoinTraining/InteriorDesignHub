
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Lead } from '../../types/lead';
import Icon from '../ui/Icon';

interface KanbanCardProps {
  lead: Lead;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead }) => {
  const { t } = useTranslation(); // Initialize useTranslation

  const getStatusIcon = (status: Lead['status']) => {
    if (lead.dueDate?.toLowerCase().includes('overdue')) return 'warning_amber';
    if (lead.dueDate?.toLowerCase().includes('due')) return 'calendar_today';
    if (lead.nextAction) return 'schedule';
    return 'info_outline'; // Default icon
  };

  const getStatusColor = (status: Lead['status']) => {
    if (lead.dueDate?.toLowerCase().includes('overdue')) return 'text-orange-500';
    return 'text-gray-400';
  };
  
  const avatarInitial = lead.name.charAt(0).toUpperCase();

  return (
    <div 
      className="kanban-card bg-white p-3 rounded-md shadow border border-gray-200 hover:shadow-lg transition-shadow duration-150 ease-in-out"
      onClick={() => console.log(`Card clicked: ${lead.id}`)} // Placeholder for future detail view
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-semibold text-gray-800 truncate" title={lead.name}>{lead.name}</h4>
        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{t('kanbanCard.idPrefix')}{lead.id.slice(-5)}</span>
      </div>
      {lead.company && <p className="text-xs text-gray-500 mb-1 truncate" title={lead.company}>{lead.company}</p>}
      {lead.email && <p className="text-xs text-gray-500 mb-2 truncate" title={lead.email}>{lead.email}</p>}
      
      <div className="flex justify-between items-center text-xs mb-2">
        <span 
            className="font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
            aria-label={t('kanbanCard.leadValueAriaLabel', { value: lead.value.toLocaleString() })}
        >
            ${lead.value.toLocaleString()} {/* Currency formatting might need specific handling */}
        </span>
        {lead.assignedTo && (
            <div className="flex items-center text-gray-500" title={t('kanbanCard.assignedToTitle', { name: lead.assignedTo })}>
                 {lead.avatarUrl ? (
                    <img src={lead.avatarUrl} alt={lead.assignedTo} className="w-5 h-5 rounded-full mr-1 object-cover" />
                ) : (
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold mr-1">
                        {lead.assignedTo.charAt(0).toUpperCase()}
                    </span>
                )}
                <span className="truncate max-w-[80px]">{lead.assignedTo}</span>
            </div>
        )}
      </div>

      {(lead.dueDate || lead.nextAction) && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <Icon iconName={getStatusIcon(lead.status)} className={`text-sm ${getStatusColor(lead.status)}`} />
          <span className={`text-xs ${getStatusColor(lead.status)}`}>
            {lead.dueDate || lead.nextAction}
          </span>
        </div>
      )}
    </div>
  );
};

export default KanbanCard;
