import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryPieChartProps {
  data: { category: string; count: number; percentage: number }[];
}

const COLORS = [
  '#B8FF3D', '#FF4D67', '#FFC857', '#55B8FF', '#35E0A1',
  '#A78BFA', '#F472B6', '#38BDF8', '#FBBF24', '#34D399',
  '#FB7185', '#818CF8', '#C084FC', '#E879F9', '#4ADE80'
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = data.slice(0, 8); // Top 8 categories

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted font-mono">
        No category data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="count"
            nameKey="category"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1016',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any, item: any) => [
              `${value} notices (${item.payload.percentage}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[11px] text-gray-300 font-mono">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
