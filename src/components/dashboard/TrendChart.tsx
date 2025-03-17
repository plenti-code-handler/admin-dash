'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TimeFrameSelector from './TimeFrameSelector';

interface TrendChartProps {
  title: string;
  data: {
    date: string;
    value: number;
  }[];
  valuePrefix?: string;
  color?: string;
}

export default function TrendChart({ title, data, valuePrefix = '', color = '#3B82F6' }: TrendChartProps) {
  const [timeFrame, setTimeFrame] = useState('1M');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <TimeFrameSelector selected={timeFrame} onSelect={setTimeFrame} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${valuePrefix}${value}`, '']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}