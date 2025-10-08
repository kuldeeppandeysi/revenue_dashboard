// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ReferenceLine
// } from 'recharts';

// export default function MetricTrendChart({
//   data,
//   dataKey,
//   xAxisDataKey = 'label',
//   color = '#0ea5e9',
//   formatValue = (val) => val,
//   target, // New prop for target line
//   yAxisDomain // New prop for y-axis domain
// }) {

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
//           <p className="font-bold text-navy-800 mb-1">{label}</p>
//           <p className="font-bold text-lg" style={{ color }}>
//             {formatValue(payload[0].value)}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const gradientId = `color-${dataKey}`;

//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//         <defs>
//             <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
//                 <stop offset="95%" stopColor={color} stopOpacity={0}/>
//             </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
//         <XAxis
//           dataKey={xAxisDataKey}
//           stroke="#475569"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//         />
//         <YAxis
//           stroke="#475569"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//           tickFormatter={formatValue}
//           domain={yAxisDomain || ['auto', 'auto']}
//         />
//         <Tooltip content={<CustomTooltip />} />
//         <Area
//           type="monotone"
//           dataKey={dataKey}
//           stroke={color}
//           strokeWidth={3}
//           fillOpacity={1} 
//           fill={`url(#${gradientId})`}
//         />
//         {target !== undefined && (
//             <ReferenceLine 
//                 y={target} 
//                 label={{ value: `Target: ${formatValue(target)}`, position: 'insideTopRight', fill: '#475569', fontSize: 12, dy: 10, dx: -10 }} 
//                 stroke="#475569" 
//                 strokeDasharray="4 4" 
//             />
//         )}
//       </AreaChart>
//     </ResponsiveContainer>
//   );
// }

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export default function MetricTrendChart({
  data,
  dataKey,
  targetKey,          // ✅ Added dynamic target key
  xAxisDataKey = 'monthLabel',
  color = '#0ea5e9',
  formatValue = (val) => val,
  target,             // ✅ Still support static target
  yAxisDomain,
}) {
  // --- Null-safe formatter
  const safeFormat = (v) =>
    v == null || isNaN(v) ? '–' : formatValue ? formatValue(v) : v;

  // --- Custom Tooltip (shows actual + target if available)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const actual = payload.find((p) => p.dataKey === dataKey);
      const targetData = targetKey
        ? payload.find((p) => p.dataKey === targetKey)
        : null;

      return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
          <p className="font-bold text-navy-800 mb-1">{label}</p>
          {actual && (
            <p className="text-lg font-semibold" style={{ color }}>
              Actual: {safeFormat(actual.value)}
            </p>
          )}
          {targetData && (
            <p className="text-sm text-gray-600">
              Target: {safeFormat(targetData.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // --- Gradient fill
  const gradientId = `gradient-${dataKey}`;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey={xAxisDataKey}
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#475569"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={safeFormat}
          domain={yAxisDomain || ['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* --- ACTUAL AREA --- */}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          name="Actual"
        />

        {/* --- TARGET AREA / LINE --- */}
        {targetKey && (
          <Area
            type="monotone"
            dataKey={targetKey}
            stroke="#94a3b8"
            strokeDasharray="5 5"
            strokeWidth={2}
            fillOpacity={0}
            name="Target"
          />
        )}

        {/* --- STATIC TARGET LINE (fallback for metrics like Rule of 80) --- */}
        {!targetKey && target !== undefined && (
          <ReferenceLine
            y={target}
            label={{
              value: `Target: ${safeFormat(target)}`,
              position: 'insideTopRight',
              fill: '#475569',
              fontSize: 12,
              dy: 10,
              dx: -10,
            }}
            stroke="#475569"
            strokeDasharray="4 4"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}