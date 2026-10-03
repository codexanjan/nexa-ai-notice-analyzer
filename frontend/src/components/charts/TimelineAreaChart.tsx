import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineAreaChartProps {
  data: { date: string; count: number; critical_count: number }[];
}

export const TimelineAreaChart: React.FC<TimelineAreaChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B8FF3D" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#B8FF3D" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="criticalColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF4D67" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#FF4D67" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#7D8792"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#7D8792"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1016',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#B8FF3D"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#totalColor)"
            name="Total Notices"
          />
          <Area
            type="monotone"
            dataKey="critical_count"
            stroke="#FF4D67"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#criticalColor)"
            name="Critical Alerts"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
