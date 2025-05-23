
import React from 'react';
import Icon from '../ui/Icon';

interface StatCardProps {
  title: string;
  value: string;
  periodDescription?: string; // Made optional for cards like "Overdue Amounts"
  changePercentage?: number;
  changeDirection?: 'up' | 'down'; // Explicit direction
  iconName?: string; // Explicit icon name
  customColor?: string; // For text color, e.g., text-red-500
  children?: React.ReactNode; // For embedding charts or other content
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  periodDescription,
  changePercentage,
  changeDirection,
  iconName,
  customColor, // Added for custom text color
  children,
}) => {
  const hasChange = typeof changePercentage === 'number';
  const isPositiveChange = hasChange && (changeDirection === 'up' || (!changeDirection && changePercentage! > 0));
  const isNegativeChange = hasChange && (changeDirection === 'down' || (!changeDirection && changePercentage! < 0));
  
  let trendColorClass = 'text-slate-500';
  if (isPositiveChange) trendColorClass = 'text-green-500';
  else if (isNegativeChange) trendColorClass = 'text-red-500';

  const displayIconName = iconName || 
                          (isPositiveChange ? 'arrow_upward' : 
                           isNegativeChange ? 'arrow_downward' : 
                           'remove'); // Default to 'remove' if no change or specific icon

  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 h-full">
      <p className="text-gray-700 text-sm font-medium leading-normal">{title}</p>
      <p className={`text-3xl font-bold leading-tight ${customColor || 'text-gray-800'}`}>{value}</p>
      
      {(periodDescription || hasChange) && (
        <div className="flex items-center text-xs mt-1">
          {hasChange ? (
            <span className={`flex items-center font-semibold ${trendColorClass}`}>
              <Icon 
                  iconName={displayIconName} 
                  className="text-sm" // Ensure icon size is consistent
              />
              <span className="ml-1">{Math.abs(changePercentage!)}%</span>
            </span>
          ) : null}
          {periodDescription && <span className={`ml-1 ${hasChange ? 'text-gray-500' : 'text-gray-500'}`}>{periodDescription}</span>}
        </div>
      )}

      {children && (
        <div className="flex-grow mt-3"> {/* Ensure children take up remaining space if needed */}
          {children}
        </div>
      )}
    </div>
  );
};

export default StatCard;
