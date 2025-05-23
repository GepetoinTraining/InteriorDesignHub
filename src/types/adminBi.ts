
export interface BiMetricValue {
  value: string | number;
  trend?: number; // Percentage change
  trendDirection?: 'up' | 'down' | 'neutral';
  period?: string; // e.g., "vs last month"
}

export interface BiMetric {
  id: string;
  title: string;
  metric: BiMetricValue;
  icon?: string; // Material icon name
  iconColor?: string; // e.g., 'text-green-500'
}

export interface ChartDataItem {
  name: string; // For X-axis label (e.g., month, category)
  value: number; // For Y-axis value
  // Optional additional values for multi-series charts or tooltips
  value2?: number; 
  fill?: string; // For bar/pie segment colors
}

export interface AdminBiDashboardData {
  keyMetrics: BiMetric[];
  revenueOverTime: ChartDataItem[];
  projectStatusDistribution: ChartDataItem[];
  clientAcquisitionChannels: ChartDataItem[];
}
