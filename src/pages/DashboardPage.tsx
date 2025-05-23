

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import Icon from '../components/ui/Icon';
import { 
  getSalesPerformanceData, 
  getLeadManagementData, 
  getFinancialOverviewData,
  DashboardMetric 
} from '../services/dashboardService';
import Button from '../components/ui/Button'; 
import { useNotifier } from '../hooks/useNotifier'; // Updated import path

const DashboardPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const { currentUser } = useAuth();
  const [salesData, setSalesData] = useState<DashboardMetric[]>([]);
  const [leadData, setLeadData] = useState<DashboardMetric[]>([]);
  const [financialData, setFinancialData] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifier(); // Get addNotification function

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sales, leads, financials] = await Promise.all([
        getSalesPerformanceData(),
        getLeadManagementData(),
        getFinancialOverviewData()
      ]);
      setSalesData(sales);
      setLeadData(leads);
      setFinancialData(financials);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center"> {/* Adjust min-height if header height changes */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0b80ee] mb-4"></div>
        <p className="text-slate-700 text-xl font-semibold">Loading Dashboard Data...</p>
        <p className="text-slate-500 text-sm">Please wait a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Oops! Something went wrong.</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={fetchData} className="bg-[#0b80ee] text-white hover:bg-[#0069cc]">
          <Icon iconName="refresh" className="mr-2"/>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col max-w-screen-xl w-full">
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-3xl sm:text-4xl font-bold leading-tight">{t('dashboardTitle')}</h1>
            <p className="text-slate-500 text-sm sm:text-base font-normal leading-normal">
              {t('dashboardSubtitle', { userName: currentUser?.name || currentUser?.email || 'User' })}
            </p>
          </div>
          <button className="bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary-dark)] font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-2">
            <Icon iconName="add" />
            {t('addWidget')}
          </button>
        </div>

        {/* Temporary Test Buttons for Notifications */}
        <div className="mb-6 p-4 bg-slate-100 rounded-lg shadow">
          <h3 className="text-slate-700 font-semibold mb-2">{t('testNotificationsTemporary')}</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => addNotification('This is a success message!', 'success')} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">{t('showSuccess')}</Button>
            <Button onClick={() => addNotification('This is an error message!', 'error')} variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">{t('showError')}</Button>
            <Button onClick={() => addNotification('This is an info message.', 'info')} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">{t('showInfo')}</Button>
          </div>
        </div>

        {/* Sales Performance Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 mb-6">
          <h2 className="text-slate-800 text-xl font-semibold leading-tight mb-4">{t('salesPerformance')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {salesData.map(metric => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                periodDescription={metric.periodDescription}
                changePercentage={metric.changePercentage}
              >
                {metric.chartComponent}
              </StatCard>
            ))}
          </div>
        </section>

        {/* Lead Management Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 mb-6">
          <h2 className="text-slate-800 text-xl font-semibold leading-tight mb-4">{t('leadManagement')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leadData.map(metric => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                periodDescription={metric.periodDescription}
                changePercentage={metric.changePercentage}
              >
                {metric.chartComponent}
              </StatCard>
            ))}
          </div>
        </section>

        {/* Financial Overview Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
          <h2 className="text-slate-800 text-xl font-semibold leading-tight mb-4">{t('financialOverview')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {financialData.map(metric => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                periodDescription={metric.periodDescription}
                changePercentage={metric.changePercentage}
              >
                {metric.chartComponent}
              </StatCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;