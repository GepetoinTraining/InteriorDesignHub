import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponsiveBarChartProps {
  data: any[];
  barKey: string;
  xAxisKey: string;
  barColor?: string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

const ResponsiveBarChartComponent: React.FC<ResponsiveBarChartProps> = ({
  data,
  barKey,
  xAxisKey,
  barColor = "#82ca9d",
  yAxisWidth = 60,
  showLegend = false,
  showTooltip = true,
  showGrid = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 0, // Adjusted right margin
          left: -25, // Adjusted left margin
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />}
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} />
        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} width={yAxisWidth} />
        {showTooltip && <Tooltip wrapperStyle={{ fontSize: '12px' }} />}
        {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        <Bar dataKey={barKey} fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResponsiveBarChartComponent;