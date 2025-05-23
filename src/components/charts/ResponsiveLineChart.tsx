import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponsiveLineChartProps {
  data: any[];
  lineKey: string;
  xAxisKey: string;
  lineColor?: string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

const ResponsiveLineChartComponent: React.FC<ResponsiveLineChartProps> = ({
  data,
  lineKey,
  xAxisKey,
  lineColor = "#8884d8",
  yAxisWidth = 60,
  showLegend = false,
  showTooltip = true,
  showGrid = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 0, // Adjusted right margin for better fit
          left: -25, // Adjusted left margin to pull YAxis closer
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />}
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} />
        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} width={yAxisWidth} />
        {showTooltip && <Tooltip wrapperStyle={{ fontSize: '12px' }} />}
        {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        <Line type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={2} activeDot={{ r: 6 }} dot={{r:3}} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ResponsiveLineChartComponent;