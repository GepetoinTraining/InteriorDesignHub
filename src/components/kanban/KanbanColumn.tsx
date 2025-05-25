
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { KanbanColumnData } from '../../types/lead';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: KanbanColumnData;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <div className="kanban-column bg-gray-100 rounded-lg p-4 shadow-sm flex flex-col h-full w-[300px] sm:w-[320px] flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{column.title}</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
          {column.leads.length}
        </span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar"> {/* Added custom-scrollbar here */}
        {column.leads.length > 0 ? (
          column.leads.map(lead => (
            <KanbanCard key={lead.id} lead={lead} />
          ))
        ) : (
          <div className="text-center text-xs text-gray-400 py-10">
            {t('kanbanColumn.noLeadsMessage')}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
