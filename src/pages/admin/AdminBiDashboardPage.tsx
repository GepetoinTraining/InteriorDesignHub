
import React, { useState, useEffect } from 'react';
import { AdminBiDashboardData, BiMetric, ChartDataItem } from '../../types/adminBi';
import * as adminBiService from '../../services/adminBiService';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import ResponsiveLineChart from '../../components/charts/ResponsiveLineChart';
import ResponsiveBarChart from '../../components/charts/ResponsiveBarChart';
// Consider adding a PieChart component if needed, or using ResponsiveBarChart for distribution.

const AdminBiDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminBiDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminBiService.fetchAdminBiData();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load BI dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Business Intelligence Dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Error Loading Dashboard</p>
        <p className="text-slate-600 text-sm mb-6">{error || 'Could not retrieve dashboard data.'}</p>
        <Button onClick={() => window.location.reload()} variant="primary">Try Again</Button>
      </div>
    );
  }

  const { keyMetrics, revenueOverTime, projectStatusDistribution, clientAcquisitionChannels } = dashboardData;

  const renderMetricCard = (metric: BiMetric) => (
    <div key={metric.id} className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-slate-600">{metric.title}</p>
        {metric.icon && <Icon iconName={metric.icon} className={`text-2xl ${metric.iconColor || 'text-slate-400'}`} />}
      </div>
      <p className="text-3xl font-bold text-slate-800">{metric.metric.value}</p>
      {metric.metric.trend !== undefined && (
        <div className={`flex items-center text-xs mt-1 ${
          metric.metric.trendDirection === 'up' ? 'text-green-600' :
          metric.metric.trendDirection === 'down' ? 'text-red-600' : 'text-slate-500'
        }`}>
          <Icon iconName={metric.metric.trendDirection === 'up' ? 'arrow_upward' : metric.metric.trendDirection === 'down' ? 'arrow_downward' : 'remove'} className="text-sm" />
          <span className="ml-1">{Math.abs(metric.metric.trend)}% {metric.metric.period}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Business Intelligence</h1>
        <p className="text-slate-600 mt-1">Key performance indicators and insights for your business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {keyMetrics.map(renderMetricCard)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Over Time</h2>
          <div className="h-72 sm:h-80">
            <ResponsiveLineChart data={revenueOverTime} lineKey="value" xAxisKey="name" lineColor="var(--color-primary)" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Project Status Distribution</h2>
           <div className="h-72 sm:h-80">
            <ResponsiveBarChart data={projectStatusDistribution} barKey="value" xAxisKey="name" />
            {/* For individual bar colors, you'd typically map through data and render <Bar> components if Recharts supports it directly or use a custom solution.
                For simplicity, if ResponsiveBarChart doesn't take individual colors, we might need to enhance it or use a single theme color.
                Alternatively, Recharts' <Bar data={projectStatusDistribution}> can have its <Cell fill={entry.fill} /> for each entry.
                The current ResponsiveBarChart uses a single barColor prop. To achieve different colors, ResponsiveBarChart itself needs an update
                to accept an array of colors or map fills from the data. For now, it will use default or single specified color.
            */}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Client Acquisition Channels</h2>
          <div className="h-72 sm:h-80">
            <ResponsiveBarChart data={clientAcquisitionChannels} barKey="value" xAxisKey="name" barColor="var(--color-secondary-dark)" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBiDashboardPage;
