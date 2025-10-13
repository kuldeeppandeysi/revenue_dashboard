import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CombinedAccruedMrrChart({ data, currency = 'USD' }) {
  // Use data as-is since accrued_mrr_target is not available in the trends data
  const processedData = data;

  const formatValue = (v) => {
    if (!v && v !== 0) return ''; // Handle null, undefined, NaN, but allow 0
    const options = {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
    };
    return new Intl.NumberFormat('en-US', options).format(v);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
          <p className="font-bold text-navy-800 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map(entry => (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                  <span className="text-sm text-navy-700">{entry.name}</span>
                </div>
                <span className="font-bold text-navy-900">{formatValue(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={processedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
        <XAxis 
          dataKey="label" 
          stroke="#475569"
          fontSize={12}
          tickLine={true}
          axisLine={true}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#475569"
          fontSize={12}
          tickLine={true}
          axisLine={true}
          tickFormatter={formatValue}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          align="right" 
          height={40}
          iconType="circle"
          formatter={(value) => <span className="text-navy-600 font-medium">{value}</span>}
        />
        <Line 
          type="monotone" 
          dataKey="accrued_mrr" 
          name="Accrued MRR" 
          stroke="#10b981" 
          strokeWidth={3} 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
