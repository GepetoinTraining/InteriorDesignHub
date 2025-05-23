

import React from 'react';
import Icon from './Icon';
import Button from './Button';
import Badge from './Badge'; // Assuming Badge.tsx exists and accepts variants

type StatusVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom';

interface TaskCardProps {
  title: string;
  project?: string;
  status: string;
  dueDate?: string;
  assignee?: string; // Changed from "Client" to be more generic
  progress?: number; // Percentage 0-100
  onViewDetails?: () => void;
  className?: string;
  statusVariant?: StatusVariant;
  statusCustomClasses?: string; // For custom badge styling if variant is 'custom'
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  project,
  status,
  dueDate,
  assignee,
  progress,
  onViewDetails,
  className = '',
  statusVariant = 'primary',
  statusCustomClasses = '',
}) => {
  const progressWidth = progress !== undefined ? Math.max(0, Math.min(progress, 100)) : 0;

  const getBadgeVariant = () => {
    if (statusVariant !== 'custom') return statusVariant;
    // If 'custom', we rely on statusCustomClasses, so Badge won't use its internal variant mapping
    return undefined; 
  };
  
  const badgeClasses = statusVariant === 'custom' ? statusCustomClasses : '';


  return (
    <div
      className={`w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group ${className}`}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails?.(); }}
      aria-label={`View details for task: ${title}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[var(--color-primary)] transition-colors">
              {title}
            </h3>
            {project && <p className="text-xs text-slate-500">{project}</p>}
          </div>
          <div className="flex-shrink-0 ml-2">
            <Badge 
              variant={getBadgeVariant()} 
              size="small"
              className={badgeClasses} // Pass custom classes if variant is 'custom'
            >
              {status}
            </Badge>
          </div>
        </div>

        {dueDate && (
          <div className="flex items-center text-sm text-slate-600 mb-2">
            <Icon iconName="event" className="text-base mr-2 text-slate-500" />
            <span>{dueDate}</span>
          </div>
        )}

        {assignee && (
          <div className="flex items-center text-sm text-slate-600 mb-4">
            <Icon iconName="person_outline" className="text-base mr-2 text-slate-500" />
            <span>{assignee}</span>
          </div>
        )}

        {progress !== undefined && (
          <>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{ width: `${progressWidth}%`, backgroundColor: 'var(--color-primary)' }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 text-right">{progressWidth}% Complete</p>
          </>
        )}
      </div>

      {onViewDetails && (
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
          <Button
            // Fix: Changed Button variant from "text" to "outlined" as "text" is not a valid variant.
            // The custom classNames applied to this button will largely dictate its appearance,
            // making "outlined" a suitable base that aligns with theme colors if borders were visible.
            variant="outlined" 
            onClick={(e) => {
                e.stopPropagation(); // Prevent card's onClick if button has its own
                onViewDetails();
            }}
            className="w-full !text-[var(--color-primary)] hover:!text-[var(--color-primary-dark)] !p-0 !justify-start sm:!justify-center !border-none hover:!bg-transparent" // Added !border-none and hover:!bg-transparent to make it more text-like
            aria-label={`View more details for ${title}`}
          >
            View Details
            <Icon iconName="arrow_forward" className="text-sm ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
