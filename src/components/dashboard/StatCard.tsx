import React from 'react';
import Icon from '../ui/Icon';

interface StatCardProps {
  title: string;
  value: string;
  periodDescription: string;
  changePercentage?: number;
  children?: React.ReactNode; // For embedding charts or other content
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  periodDescription,
  changePercentage,
  children,
}) => {
  const hasChange = typeof changePercentage === 'number';
  const isPositiveChange = hasChange && changePercentage! > 0;
  const isNegativeChange = hasChange && changePercentage! < 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-5 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-slate-700 text-base font-medium leading-normal">{title}</p>
      <p className="text-slate-900 text-3xl font-bold leading-tight truncate">{value}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-slate-500 text-sm font-normal leading-normal">{periodDescription}</p>
        {hasChange && (
          <span
            className={`text-sm font-semibold leading-normal flex items-center ${
              isPositiveChange ? 'text-green-600' : isNegativeChange ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            <Icon 
                iconName={isPositiveChange ? 'arrow_upward' : isNegativeChange ? 'arrow_downward' : 'remove'} 
                className="text-base" 
            />
            {Math.abs(changePercentage!)}%
          </span>
        )}
      </div>
      {children && (
        <div className="flex min-h-[180px] flex-1 flex-col gap-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default StatCard;
