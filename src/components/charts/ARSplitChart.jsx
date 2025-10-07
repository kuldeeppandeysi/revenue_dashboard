import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ARSplitChart({ data }) {
    const chartData = [
        { name: 'Current', value: data.current },
        { name: '30 Days', value: data['30d'] },
        { name: '60 Days', value: data['60d'] },
        { name: '90+ Days', value: data['90d_plus'] },
    ];

    const formatCurrency = (value) => value > 1000 ? `${(value / 1000).toFixed(0)}K` : value;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-navy-200">
                    <p className="font-bold text-navy-800">{label}</p>
                    <p className="text-sm text-navy-700">
                        Amount: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-2 border-navy-200 bg-white shadow-lg h-full">
            <CardHeader>
                <CardTitle className="text-lg font-black text-navy-900">A/R by Period</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}