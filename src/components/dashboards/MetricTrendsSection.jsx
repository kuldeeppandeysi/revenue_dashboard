import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricTrendChart from '../charts/MetricTrendChart';
import HeadcountChart from '../charts/HeadcountChart';
import { getQuarter, getYear } from 'date-fns';

// Sample static data for Metric Trends
const metricData = Array.from({ length: 17 }, (_, i) => {
    const month = (i + 2) % 12 + 1;
    const year = 2024 + Math.floor((i + 2) / 12);
    const date = new Date(year, month, 0); 
    return {
        period: date.toISOString().split('T')[0],
        monthLabel: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        date: date,
        live_mrr: 2180000 * Math.pow(1.03, i),
        contracted_mrr: 2250000 * Math.pow(1.028, i),
        live_clients: Math.round(270 * Math.pow(1.025, i)),
        contracted_clients: Math.round(280 * Math.pow(1.023, i)),
        nrr: 115 + i * 0.4 + (Math.sin(i / 3) * 2),
        rule_of_80: 62 + i * 0.8 + (Math.cos(i / 2) * 3),
        gm_percent: 78 + i * 0.2 + (Math.sin(i / 4) * 1.5),
        ebitda_percent: 20 + i * 0.5 + (Math.cos(i / 3) * 2),
        headcount_tech: Math.round(150 * Math.pow(1.02, i)),
        headcount_sales: Math.round(100 * Math.pow(1.025, i)),
        headcount_ops: Math.round(80 * Math.pow(1.022, i)),
        headcount_gna: Math.round(50 * Math.pow(1.018, i)),
        total_headcount: Math.round(150 * Math.pow(1.02, i) + 100 * Math.pow(1.025, i) + 80 * Math.pow(1.022, i) + 50 * Math.pow(1.018, i)),
    };
});

// Helper function to process data based on granularity
const aggregateData = (data, granularity) => {
  if (granularity === 'monthly') {
    return data.map(d => ({...d, label: d.monthLabel}));
  }

  const groupedData = data.reduce((acc, curr) => {
    const date = curr.date;
    let key;
    if (granularity === 'quarterly') {
      const quarter = getQuarter(date);
      const year = getYear(date).toString().slice(-2);
      key = `Q${quarter} '${year}`;
    } else { // yearly
      key = getYear(date).toString();
    }
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});

  return Object.entries(groupedData).map(([key, values]) => {
    // For all metrics, we take the value from the last month of the period
    const lastValue = values[values.length - 1];
    return {
      ...lastValue,
      label: key,
    };
  });
};

export default function MetricTrendsSection({ includeHeadcount = true }) {
    const [activeTab, setActiveTab] = useState('live_arr');
    const [granularity, setGranularity] = useState('monthly');

    const chartData = useMemo(() => aggregateData(metricData, granularity), [granularity]);

    const formatCurrency = (value) => {
      if (value === null || value === undefined) return "";
      return value > 1000000 ? `${(value/1000000).toFixed(1)}M` : value > 1000 ? `${(value/1000).toFixed(0)}K` : value.toFixed(0);
    }
    const formatNumber = (value) => value !== null && value !== undefined ? value.toLocaleString() : "";
    const formatPercentage = (value) => value !== null && value !== undefined ? `${value.toFixed(1)}%` : "";

    const chartConfig = {
        live_arr: { title: 'Live ARR', dataKey: 'live_arr', type: 'line', format: formatCurrency },
        contracted_arr: { title: 'Contracted ARR', dataKey: 'contracted_arr', type: 'line', format: formatCurrency, color: '#f97316' },
        live_clients: { title: '# of Live Clients', dataKey: 'live_clients', type: 'bar', format: formatNumber },
        contracted_clients: { title: '# of Contracted Clients', dataKey: 'contracted_clients', type: 'bar', format: formatNumber, color: '#f97316' },
        nrr: { title: 'NRR', dataKey: 'nrr', type: 'line', format: formatPercentage, color: '#10b981' },
        rule_of_80: { title: 'Rule of 80', dataKey: 'rule_of_80', type: 'bar', format: formatPercentage, color: '#8b5cf6' },
        gm_percent: { title: 'GM %', dataKey: 'gm_percent', type: 'line', format: formatPercentage, color: '#ef4444' },
        ebitda_percent: { title: 'EBITDA %', dataKey: 'ebitda_percent', type: 'line', format: formatPercentage, color: '#6366f1' },
        ...(includeHeadcount && { total_headcount: { title: 'Total Headcount', dataKey: 'total_headcount', type: 'custom', format: formatNumber, color: '#64748b' } }),
    };

    const processedChartData = chartData.map(d => ({
        ...d,
        live_arr: d.live_mrr * 12,
        contracted_arr: d.contracted_mrr * 12,
    }));
    
    return (
        <Card className="border-2 border-navy-300 bg-white/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-black text-navy-900">Metric Trends</CardTitle>
                <div className="flex items-center gap-2 bg-navy-100 p-1 rounded-lg">
                    <Button size="sm" variant={granularity === 'monthly' ? 'default' : 'ghost'} onClick={() => setGranularity('monthly')} className="data-[variant=default]:bg-navy-800 data-[variant=default]:text-white">Monthly</Button>
                    <Button size="sm" variant={granularity === 'quarterly' ? 'default' : 'ghost'} onClick={() => setGranularity('quarterly')} className="data-[variant=default]:bg-navy-800 data-[variant=default]:text-white">Quarterly</Button>
                    <Button size="sm" variant={granularity === 'annually' ? 'default' : 'ghost'} onClick={() => setGranularity('annually')} className="data-[variant=default]:bg-navy-800 data-[variant=default]:text-white">Annually</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full bg-navy-100 p-1 rounded-lg">
                        {Object.entries(chartConfig).map(([key, config]) => (
                             <TabsTrigger key={key} value={key} className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=inactive]:text-navy-600 rounded-md">
                                {config.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <TabsContent key={key} value={key} className="mt-6">
                            {config.type === 'custom' && config.dataKey === 'total_headcount' ? (
                                <HeadcountChart 
                                    title={config.title}
                                    data={processedChartData}
                                    isStacked={false} // Ensure it's not stacked
                                />
                            ) : (
                                <MetricTrendChart 
                                    title={config.title}
                                    data={processedChartData}
                                    dataKey={config.dataKey}
                                    xAxisDataKey="label"
                                    chartType={config.type}
                                    color={config.color}
                                    formatValue={config.format}
                                />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
};