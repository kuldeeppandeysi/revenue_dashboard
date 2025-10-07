import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendChart({ 
  title, 
  data = [], 
  dataKey, 
  xAxisKey = "period",
  color = "#0ea5e9",
  type = "line",
  height = 300,
  showGrid = true,
  formatTooltip = (value) => value
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
          <p className="font-bold text-navy-800 mb-1">{label}</p>
          <p className="text-light-blue-700 font-bold text-lg">
            {formatTooltip(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === "area" ? AreaChart : LineChart;
  const ChartElement = type === "area" ? Area : Line;

  return (
    <Card className="border-2 border-navy-300 bg-white backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-black text-navy-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.7} />}
            <XAxis 
              dataKey={xAxisKey} 
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
              tickFormatter={formatTooltip}
            />
            <Tooltip content={<CustomTooltip />} />
            {type === "area" ? (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fill={color}
                fillOpacity={0.15}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={4}
                dot={{ fill: color, strokeWidth: 3, r: 5 }}
                activeDot={{ r: 7, stroke: color, strokeWidth: 3 }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}