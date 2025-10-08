import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';


export default function RevenueTrendChart({ title, data, dataKey, color, currency = 'INR' }) {


 const formatCurrency = (value) => {
   if (value === null || value === undefined) return "—";
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: currency,
     notation: 'compact',
     maximumFractionDigits: 1
   }).format(value);
 };


 const CustomTooltip = ({ active, payload, label }) => {
   if (active && payload && payload.length) {
     return (
       <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
         <p className="font-bold text-navy-800 mb-1">{label}</p>
         <p className="font-bold text-lg" style={{ color }}>
           {formatCurrency(payload[0].value)}
         </p>
       </div>
     );
   }
   return null;
 };


 const gradientId = `color-${dataKey}`;


 return (
   <div className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
     <h3 className="text-lg font-bold text-navy-800 mb-4">{title}</h3>
     <ResponsiveContainer width="100%" height={300}>
       <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
         <defs>
             <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                 <stop offset="95%" stopColor={color} stopOpacity={0}/>
             </linearGradient>
         </defs>
         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
         <XAxis
           dataKey="month"
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
           tickFormatter={formatCurrency}
         />
         <Tooltip content={<CustomTooltip />} />
         <Area
           type="monotone"
           dataKey={dataKey}
           stroke={color}
           strokeWidth={3}
           fillOpacity={1}
           fill={`url(#${gradientId})`}
         />
       </AreaChart>
     </ResponsiveContainer>
   </div>
 );
}
