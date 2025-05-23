
import { AdminBiDashboardData, BiMetric, ChartDataItem } from '../types/adminBi';

const MOCK_ADMIN_BI_DATA: AdminBiDashboardData = {
  keyMetrics: [
    { id: 'totalRevenue', title: 'Total Revenue (YTD)', metric: { value: '$1,250,000', trend: 12, trendDirection: 'up', period: 'vs last year' }, icon: 'monetization_on', iconColor: 'text-green-500' },
    { id: 'newClients', title: 'New Clients (This Month)', metric: { value: '23', trend: 5, trendDirection: 'up', period: 'vs last month' }, icon: 'person_add', iconColor: 'text-blue-500' },
    { id: 'activeProjects', title: 'Active Projects', metric: { value: '78', trend: -2, trendDirection: 'down', period: 'vs last month' }, icon: 'business_center', iconColor: 'text-yellow-500' },
    { id: 'avgProjectValue', title: 'Avg. Project Value', metric: { value: '$15,800', trend: 3, trendDirection: 'up', period: 'vs last quarter' }, icon: 'attach_money', iconColor: 'text-indigo-500' },
    { id: 'leadConversion', title: 'Lead Conversion Rate', metric: { value: '18%', trend: 1, trendDirection: 'up', period: 'vs last month' }, icon: 'trending_up', iconColor: 'text-pink-500' },
    { id: 'customerSatisfaction', title: 'Customer Satisfaction', metric: { value: '92%', trend: 0, trendDirection: 'neutral', period: 'overall' }, icon: 'sentiment_satisfied', iconColor: 'text-teal-500' },
  ],
  revenueOverTime: [
    { name: 'Jan', value: 80000 }, { name: 'Feb', value: 95000 },
    { name: 'Mar', value: 110000 }, { name: 'Apr', value: 105000 },
    { name: 'May', value: 120000 }, { name: 'Jun', value: 130000 },
    { name: 'Jul', value: 140000 }, { name: 'Aug', value: 135000 } 
  ],
  projectStatusDistribution: [
    { name: 'New', value: 10, fill: '#3b82f6' }, // blue-500
    { name: 'In Progress', value: 45, fill: '#f59e0b' }, // amber-500
    { name: 'On Hold', value: 5, fill: '#6b7280' }, // gray-500
    { name: 'Completed', value: 18, fill: '#10b981' }, // green-500
  ],
  clientAcquisitionChannels: [
    { name: 'Referrals', value: 45 },
    { name: 'Website', value: 25 },
    { name: 'Social Media', value: 15 },
    { name: 'Events', value: 10 },
    { name: 'Other', value: 5 },
  ],
};

const API_DELAY = 500;

export const fetchAdminBiData = (): Promise<AdminBiDashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_ADMIN_BI_DATA);
    }, API_DELAY);
  });
};
