
import React from 'react';
import StatCard from '../components/ui/StatCard'; // Assuming StatCard is in ui, adjust if needed
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import ResponsiveLineChart from '../components/charts/ResponsiveLineChart';
import ResponsiveBarChart from '../components/charts/ResponsiveBarChart';

// Mock data for charts - replace with actual data fetching later
const accountsPayableTrendData = [
  { month: 'Jan', value: 100000 },
  { month: 'Feb', value: 110000 },
  { month: 'Mar', value: 95000 },
  { month: 'Apr', value: 115000 },
  { month: 'May', value: 105000 },
  { month: 'Jun', value: 125000 },
];

const accountsReceivableByClientData = [
  { client: 'Client A', value: 60000 },
  { client: 'Client B', value: 20000 },
  { client: 'Client C', value: 70000 },
  { client: 'Client D', value: 40000 },
  { client: 'Client E', value: 90000 },
];

const FinancialDashboardPage: React.FC = () => {
  const statCardsData = [
    { id: 'ap', title: 'Total Accounts Payable', value: '$125,000', trend: 5, trendDirection: 'up' as 'up' | 'down', period: 'vs last month', icon:'trending_up' },
    { id: 'ar', title: 'Total Accounts Receivable', value: '$150,000', trend: 2, trendDirection: 'down' as 'up' | 'down', period: 'vs last month', icon:'trending_down' },
    { id: 'cf', title: 'Cash Flow', value: '$25,000', trend: 10, trendDirection: 'up' as 'up' | 'down', period: 'vs last month', icon:'trending_up' },
    { id: 'oa', title: 'Overdue Amounts', value: '$5,000', period: '3 invoices overdue', customColor: 'text-red-500' },
  ];

  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-40 py-8 flex flex-1 justify-center bg-gray-50">
      <div className="layout-content-container flex flex-col w-full max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold leading-tight">Financial Dashboard</h1>
            <p className="text-gray-500 text-sm sm:text-base font-normal leading-normal">Overview of the company's financial health</p>
          </div>
          <Button 
            onClick={() => alert('Add Widget functionality coming soon!')} 
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Icon iconName="add" className="text-base" />
            Add Widget
          </Button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
          {statCardsData.map(card => (
            <div key={card.id} className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
              <p className="text-gray-700 text-sm font-medium leading-normal">{card.title}</p>
              <p className={`text-2xl sm:text-3xl font-bold leading-tight ${card.customColor || 'text-gray-800'}`}>{card.value}</p>
              {card.trend !== undefined && card.trendDirection ? (
                <div className={`flex items-center text-xs ${card.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'} mt-1`}>
                  <Icon iconName={card.icon || (card.trendDirection === 'up' ? 'arrow_upward' : 'arrow_downward')} className="text-sm" />
                  <span className="ml-1">{card.trend}% {card.period}</span>
                </div>
              ) : (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="ml-1">{card.period}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 mt-2">
          {/* Accounts Payable Trend Chart Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-base font-medium leading-normal">Accounts Payable Trend</p>
                <p className="text-gray-500 text-sm font-normal leading-normal">Last 6 Months</p>
              </div>
              <p className="text-[var(--color-primary)] text-2xl font-bold leading-tight">$125,000</p>
            </div>
            <div className="flex min-h-[200px] flex-1 flex-col gap-4 py-4">
              <ResponsiveLineChart 
                data={accountsPayableTrendData} 
                lineKey="value" 
                xAxisKey="month" 
                lineColor="var(--color-primary)"
              />
              <div className="flex justify-around">
                {accountsPayableTrendData.map(d => (
                    <p key={d.month} className="text-gray-500 text-xs font-medium leading-normal">{d.month}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Accounts Receivable by Client Chart Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-base font-medium leading-normal">Accounts Receivable by Client</p>
                <p className="text-gray-500 text-sm font-normal leading-normal">Current</p>
              </div>
              <p className="text-[var(--color-primary)] text-2xl font-bold leading-tight">$150,000</p>
            </div>
            <div className="flex min-h-[200px] flex-1 flex-col py-4">
               <ResponsiveBarChart 
                data={accountsReceivableByClientData} 
                barKey="value" 
                xAxisKey="client" 
                barColor="var(--color-primary)" 
              />
            </div>
             <div className="flex justify-around mt-[-10px]"> {/* Adjust margin for closer labels */}
                {accountsReceivableByClientData.map(d => (
                    <p key={d.client} className="text-gray-500 text-xs font-medium leading-normal text-center w-1/5 truncate px-1">{d.client}</p>
                ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardPage;
