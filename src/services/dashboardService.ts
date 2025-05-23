
import React from 'react';
import ResponsiveLineChart from '../components/charts/ResponsiveLineChart';
import ResponsiveBarChart from '../components/charts/ResponsiveBarChart';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  periodDescription: string;
  changePercentage?: number;
  chartComponent: React.ReactNode;
}

// Sample data for Recharts
const salesRevenueData = [
  { month: 'Jan', revenue: 4000 }, { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 }, { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 }, { month: 'Jun', revenue: 5500 },
  { month: 'Jul', revenue: 7000 },
];

const salesByCategoryData = [
  { category: 'Sofas', sales: 400 }, { category: 'Tables', sales: 300 },
  { category: 'Chairs', sales: 300 }, { category: 'Lighting', sales: 200 },
  { category: 'Decor', sales: 278 },
];

const leadsBySourceData = [
  { source: 'Website', leads: 30 }, { source: 'Referral', leads: 40 },
  { source: 'Social', leads: 20 }, { source: 'Other', leads: 10 },
];

const leadConversionRateData = [
  { quarter: 'Q1', rate: 20 }, { quarter: 'Q2', rate: 25 },
  { quarter: 'Q3', rate: 30 }, { quarter: 'Q4', rate: 28 },
];

const profitMarginData = [
    { month: 'Jan', margin: 20 }, { month: 'Feb', margin: 22 },
    { month: 'Mar', margin: 25 }, { month: 'Apr', margin: 23 },
    { month: 'May', margin: 28 }, { month: 'Jun', margin: 26 },
    { month: 'Jul', margin: 30 },
];

const expensesByDepartmentData = [
    { department: 'Sales', expenses: 12000 }, { department: 'Marketing', expenses: 8000 },
    { department: 'Prod', expenses: 15000 }, { department: 'Admin', expenses: 5000 },
];


const salesPerformanceMetrics: DashboardMetric[] = [
  {
    id: 'salesRevenue',
    title: "Sales Revenue Over Time",
    value: "$250,000",
    periodDescription: "Last 12 Months",
    changePercentage: 15,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveLineChart, { data: salesRevenueData, lineKey: "revenue", xAxisKey: "month", lineColor: "#c9dcec" })
  },
  {
    id: 'salesByCategory',
    title: "Sales by Product Category",
    value: "$120,000",
    periodDescription: "This Quarter",
    changePercentage: -5,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveBarChart, { data: salesByCategoryData, barKey: "sales", xAxisKey: "category", barColor: "#c9dcec" })
  }
];

const leadManagementMetrics: DashboardMetric[] = [
  {
    id: 'leadsBySource',
    title: "Leads by Source",
    value: "150",
    periodDescription: "This Month",
    changePercentage: 10,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveBarChart, { data: leadsBySourceData, barKey: "leads", xAxisKey: "source", barColor: "#c9dcec" })
  },
  {
    id: 'leadConversionRate',
    title: "Lead Conversion Rate",
    value: "25%",
    periodDescription: "This Quarter",
    changePercentage: 5,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveLineChart, { data: leadConversionRateData, lineKey: "rate", xAxisKey: "quarter", lineColor: "#c9dcec" })
  }
];

const financialOverviewMetrics: DashboardMetric[] = [
  {
    id: 'profitMargin',
    title: "Profit Margin",
    value: "30%",
    periodDescription: "Last 12 Months",
    changePercentage: 2,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveLineChart, { data: profitMarginData, lineKey: "margin", xAxisKey: "month", lineColor: "#c9dcec" })
  },
  {
    id: 'expensesByDepartment',
    title: "Expenses by Department",
    value: "$50,000",
    periodDescription: "This Month",
    changePercentage: -8,
    // Fix: Convert JSX to React.createElement for use in .ts file
    chartComponent: React.createElement(ResponsiveBarChart, { data: expensesByDepartmentData, barKey: "expenses", xAxisKey: "department", barColor: "#c9dcec" })
  }
];

// Simulate API call delay
const API_DELAY = 500;

export const getSalesPerformanceData = async (): Promise<DashboardMetric[]> => {
  return new Promise(resolve => setTimeout(() => resolve(salesPerformanceMetrics), API_DELAY));
};

export const getLeadManagementData = async (): Promise<DashboardMetric[]> => {
  return new Promise(resolve => setTimeout(() => resolve(leadManagementMetrics), API_DELAY));
};

export const getFinancialOverviewData = async (): Promise<DashboardMetric[]> => {
  return new Promise(resolve => setTimeout(() => resolve(financialOverviewMetrics), API_DELAY));
};