import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WaterfallChart({ 
  title, 
  data = [], 
  height = 350
}) {
  const colors = {
    positive: "#10b981",
    negative: "#ef4444",
    total: "#0ea5e9"
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
          <p className="font-bold text-navy-800 mb-1">{label}</p>
          <p className={`font-bold text-lg ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString('en-US')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 border-navy-300 bg-white backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-black text-navy-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.7} />
            <XAxis 
              dataKey="category" 
              stroke="#475569"
              fontSize={12}
              fontWeight="600"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#475569"
              fontSize={12}
              fontWeight="600"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Math.abs(value / 1000)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === 'total' ? colors.total : 
                       entry.value >= 0 ? colors.positive : colors.negative}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}