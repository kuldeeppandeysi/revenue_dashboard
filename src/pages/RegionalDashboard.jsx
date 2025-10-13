
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MetricCard from '../components/metrics/MetricCard';
import MetricTrendChart from '../components/charts/MetricTrendChart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CombinedArrChart from '../components/charts/CombinedArrChart';
import CombinedAccruedMrrChart from '../components/charts/CombinedAccruedMrrChart';
import HeadcountChart from '../components/charts/HeadcountChart';
import { getQuarter, getYear, parseISO } from 'date-fns';
import { DollarSign, Users, Heart, Zap, BarChart, Briefcase, AlertTriangle, Percent } from 'lucide-react';

// --- DATA IMPORTS ---
import regionalLiveKpis from '@/components/data/regional/live.jsx';
import monthlyTrendData from '@/components/data/regional/trends.jsx';
import quarterlyTrendDataIndia from '@/components/data/regional/quarterly_trends.jsx';
import quarterlyTrendDataSEA from '@/components/data/regional/quarterly_trends_sea.jsx';
import annualTrendData from '@/components/data/regional/trends_annual.jsx';

// --- CURRENCY CONVERSION ---
const USD_TO_INR_RATE = 84.5;

const kpiCardDefinitions = [
    { group: 'Revenue', title: "Live MRR", key: "live_mrr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Live ARR", key: "live_arr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Accrued MRR YTD", key: "accrued_mrr", format: "currency", icon: DollarSign },
    // { group: 'Revenue', title: "Contracted MRR", key: "contracted_mrr", format: "currency", icon: DollarSign },
    // { group: 'Revenue', title: "Contracted ARR", key: "contracted_arr", format: "currency", icon: DollarSign },
    { group: 'Clients', title: "# Live Customers", key: "live_clients", format: "number", icon: Users },
    // { group: 'Clients', title: "# of Contracted Clients", key: "contracted_clients", format: "number", icon: Users },
    { group: 'Health', title: "Locations Health Score", key: "chs", format: "percentage", icon: Heart },
    { group: 'Health', title: "Accounts at Risk", key: "accounts_at_risk", format: "percentage", icon: AlertTriangle },
    { group: 'Performance', title: "NRR", key: "nrr", format: "percentage", icon: Zap },
    { group: 'Performance', title: "Rule of 80", key: "rule_of_80", format: "number", icon: Zap },
    { group: 'Performance', title: "MAU", key: "mau", format: "number", icon: BarChart },
    { group: 'Profitability', title: "GM %", key: "gm_percent", format: "percentage", icon: Percent },
    { group: 'Profitability', title: "EBITDA %", key: "ebitda_percent", format: "percentage", icon: Percent },
    { group: 'People', title: "Headcount", key: "headcount", format: "number", icon: Briefcase },
];

const trendChartDefinitions = [
    { key: "live_clients", title: "# Live Customers", format: (v) => v.toLocaleString(), color: "#10b981" }, // Green
    { key: "nrr", title: "NRR", format: (v) => `${v.toFixed(1)}%`, color: "#22c55e", target: null, domain: [80, 120] }, // Bright Green
    { key: "rule_of_80", title: "Rule of 80", format: (v) => v.toFixed(1), color: "#8b5cf6", target: 80, domain: [-120, 350] }, // Purple
    { key: "gm_percent", title: "GM %", format: (v) => `${v.toFixed(1)}%`, color: "#14b8a6", targetKey: "gm_percent_target", domain: [50, 90] }, // Teal with dynamic target
    { key: "ebitda_percent", title: "EBITDA %", format: (v) => `${v.toFixed(1)}%`, color: "#ef4444", targetKey: "ebitda_percent_target", domain: [-50, 40] }, // Red with dynamic target
];

const GranularityButton = ({granularity, setGranularity, value, children}) => (
    <button 
        onClick={() => setGranularity(value)}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${granularity === value ? 'bg-navy-800 text-white shadow-md' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
    >
        {children}
    </button>
);


export default function RegionalDashboard({ currency = 'INR' }) {
    const [granularity, setGranularity] = useState('monthly');
    const [selectedCountry, setSelectedCountry] = useState('IN');
    const [notes, setNotes] = useState('');
    
    const kpis = useMemo(() => {
        const selectedKpis = regionalLiveKpis.find(c => c.country === selectedCountry) || {};
        let converted = { ...selectedKpis };
        
        // Convert currency for USD
        if (currency === 'USD') {
            const currencyKeys = ['live_mrr', 'live_arr', 'accrued_mrr']; // Removed contracted keys, added accrued_mrr
            currencyKeys.forEach(key => {
                // Convert main values
                if (converted[key] !== undefined) {
                    converted[key] = converted[key] / USD_TO_INR_RATE;
                }
                // Convert target values
                const targetKey = `${key}_target`;
                if (converted[targetKey] !== undefined && converted[targetKey] !== null) {
                    converted[targetKey] = converted[targetKey] / USD_TO_INR_RATE;
                }
            });
        }
        
        // Set specific fields to show "Integration In Progress"
        const integrationInProgressKeys = [
            'contracted_mrr', 
            // 'contracted_arr',  // Commented out for removal from graphs
            'contracted_clients'
        ];
        
        integrationInProgressKeys.forEach(key => {
            converted[key] = 'Integration In Progress';
        });
        
        return converted;
    }, [selectedCountry, currency]);

    const aggregatedTrendData = useMemo(() => {
        let sourceData;
        if (granularity === 'quarterly') {
            // ...existing code...
            sourceData = selectedCountry === 'IN' ? quarterlyTrendDataIndia : quarterlyTrendDataSEA;
            // ...existing code...
            const monthlyQ2 = monthlyTrendData.filter(d => {
                return d.country === selectedCountry &&
                    (d.date === '2025-04-01' || d.date === '2025-05-01' || d.date === '2025-06-01');
            });
            const accruedMrrTargetSum = monthlyQ2.reduce((sum, d) => sum + (d.accrued_mrr_target || 0), 0);
            sourceData = sourceData.map(q => {
                if (q.label && (q.label.includes("Q2") || q.label.includes("Jun")) && q.country === selectedCountry) {
                    return { ...q, accrued_mrr_target: accruedMrrTargetSum };
                }
                return q;
            });
        } else if (granularity === 'annual') {
            // Only show FY25 and later
            sourceData = annualTrendData.filter(d => {
                // Accept FY25, 2025, or any label containing '25' or later
                if (d.country !== selectedCountry) return false;
                if (d.label) {
                    // Accept 'FY25', '2025', '2025-26', etc.
                    const match = d.label.match(/(FY)?(\d{2,4})/);
                    if (match) {
                        let year = match[2];
                        if (year.length === 2) year = '20' + year;
                        return parseInt(year) >= 2025;
                    }
                }
                if (d.year && parseInt(d.year) >= 2025) return true;
                return false;
            });
        } else { // monthly
            sourceData = monthlyTrendData.map(d => ({ 
                ...d, 
                label: parseISO(d.date).toLocaleString('default', { month: 'short', year: '2-digit' })
            }));
        }
        return sourceData.filter(d => d.country === selectedCountry);
    }, [granularity, selectedCountry]);
    
    const displayTrendData = useMemo(() => {
        if (currency === 'INR') {
            return aggregatedTrendData;
        }
        const currencyKeys = ['live_arr', 'target_arr', 'accrued_mrr', 'accrued_mrr_target']; // Added accrued MRR fields
        return aggregatedTrendData.map(item => {
            const newItem = { ...item };
            currencyKeys.forEach(key => {
                if (newItem[key] !== undefined && newItem[key] !== null) { // Check for both undefined and null
                    newItem[key] = newItem[key] / USD_TO_INR_RATE;
                }
            });
            return newItem;
        });
    }, [aggregatedTrendData, currency]);

    const kpiGroups = kpiCardDefinitions.reduce((groups, card) => {
        const group = card.group || 'General';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(card);
        return groups;
    }, {});
    
    const countries = [...new Set(regionalLiveKpis.map(item => item.country))];

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-navy-800 mb-3 tracking-tight">Regional Dashboard</h1>
                    <p className="text-navy-600 text-lg font-medium">Performance metrics for {selectedCountry === 'IN' ? 'India' : 'Southeast Asia'}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-[180px] bg-white border-2 border-navy-300 font-bold text-navy-800">
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(country => (
                                <SelectItem key={country} value={country}>{country === 'IN' ? 'India' : 'Southeast Asia'}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Card Groups */}
            <section className="space-y-6">
                {Object.entries(kpiGroups).map(([groupName, cards]) => (
                  <div key={groupName}>
                    <h2 className="text-xl font-bold text-navy-800 mb-4 tracking-tight">{groupName}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {cards.map(def => (
                        <MetricCard 
                            key={def.key}
                            title={def.title}
                            value={kpis[def.key]}
                            target={kpis[`${def.key}_target`]}
                            change={kpis[`${def.key}_change`]}
                            format={def.format}
                            categoryIcon={def.icon}
                            currency={currency}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </section>

             {/* Sticky Filter Bar for Trends */}
            <div className="sticky top-6 bg-white/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border-2 border-navy-200 z-10 flex items-center justify-between">
                <h2 className="text-2xl font-black text-navy-900">Metric Trends</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <GranularityButton granularity={granularity} setGranularity={setGranularity} value="monthly">Monthly</GranularityButton>
                        <GranularityButton granularity={granularity} setGranularity={setGranularity} value="quarterly">Quarterly</GranularityButton>
                        <GranularityButton granularity={granularity} setGranularity={setGranularity} value="annual">Yearly</GranularityButton>
                    </div>
                </div>
            </div>

            {/* Trend Charts Section */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-3 bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                    <h3 className="text-lg font-bold text-navy-800 mb-4">ARR Performance</h3>
                    <CombinedArrChart data={displayTrendData} currency={currency} />
                  </div>
                  {granularity !== 'annual' && (
                    <div className="xl:col-span-3 bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                      <h3 className="text-lg font-bold text-navy-800 mb-4 flex items-center justify-between">
                          Accrued MRR Performance
                          <span className="flex items-center gap-6">
                              <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{ background: '#6366f1', display: 'inline-block' }}></span>
                                  <span className="text-sm font-medium text-navy-700">Accrued MRR</span>
                              </span>
                              <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{ background: '#94a3b8', display: 'inline-block' }}></span>
                                  <span className="text-sm font-medium text-navy-700">Accrued MRR Target</span>
                              </span>
                          </span>
                      </h3>
                      {/* Custom chart for accrued_mrr and accrued_mrr_target */}
                      {(() => {
                          // Custom chart for both monthly and quarterly
                          const chartData = displayTrendData;
                          const formatAccruedValue = (v) => {
                              if (v === null || v === undefined) return '-';
                              const absVal = Math.abs(v);
                              const sign = v < 0 ? '-' : '';
                              if (currency === 'USD') return `${sign}$${(absVal / 1e6).toFixed(1)}M`;
                              return `${sign}₹${(absVal / 1e6).toFixed(1)}M`;
                          };
                          const CustomAccruedTooltip = ({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                  return (
                                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-navy-300">
                                          <p className="font-bold text-navy-800 mb-2">{label}</p>
                                          <div className="space-y-1">
                                              {payload.map(entry => (
                                                  <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                                                      <div className="flex items-center gap-2">
                                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                                                          <span className="text-sm text-navy-700">{entry.name || entry.dataKey}</span>
                                                      </div>
                                                      <span className="font-bold text-navy-900">
                                                          {formatAccruedValue(entry.value)}
                                                      </span>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  );
                              }
                              return null;
                          };
                          // Calculate min and max for Y-axis, allowing negative values
                          const minY = Math.min(...chartData.map(d => {
                              const vals = [d.accrued_mrr, d.accrued_mrr_target].filter(v => v !== undefined && v !== null);
                              return vals.length ? Math.min(...vals) : 0;
                          }));
                          const maxY = Math.max(...chartData.map(d => {
                              const vals = [d.accrued_mrr, d.accrued_mrr_target].filter(v => v !== undefined && v !== null);
                              return vals.length ? Math.max(...vals) : 0;
                          }));
                          // Add padding
                          const padding = (maxY - minY) * 0.1 || 10;
                          const yAxisDomain = [Math.floor(minY - padding), Math.ceil(maxY + padding)];
                          // Render chart
                          return (
                              <ResponsiveContainer width="100%" height={400}>
                                  <LineChart
                                      data={chartData}
                                      margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                                  >
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
                                          tickFormatter={formatAccruedValue}
                                          domain={yAxisDomain}
                                      />
                                      <Tooltip content={<CustomAccruedTooltip />} />
                                      <Line 
                                          type="monotone" 
                                          dataKey="accrued_mrr" 
                                          name="Accrued MRR" 
                                          stroke="#6366f1" 
                                          strokeWidth={3} 
                                          dot={false}
                                      />
                                      <Line 
                                          type="monotone" 
                                          dataKey="accrued_mrr_target" 
                                          name="Accrued MRR Target" 
                                          stroke="#94a3b8" 
                                          strokeDasharray="5 5"
                                          strokeWidth={2} 
                                          dot={false}
                                      />
                                  </LineChart>
                              </ResponsiveContainer>
                          );
                      })()}
                    </div>
                  )}
                                    {trendChartDefinitions
                                        .filter(def => !(granularity === 'annual' && def.key === 'rule_of_80'))
                                        .map(def => {
                                            // Dynamic Y-axis scaling for specific charts
                                            let yAxisDomain = def.domain;
                                            if (def.key === "gm_percent" && granularity === "monthly") {
                                                const values = displayTrendData.map(d => d[def.key]).filter(v => v !== undefined && v !== null);
                                                if (values.length > 0) {
                                                    const max = Math.max(...values);
                                                    yAxisDomain = [45, Math.ceil(max + (max - 45) * 0.1)];
                                                } else {
                                                    yAxisDomain = [45, 90];
                                                }
                                            } else if (["live_clients", "nrr", "ebitda_percent", "rule_of_80"].includes(def.key)) {
                                                const values = displayTrendData.map(d => d[def.key]).filter(v => v !== undefined && v !== null);
                                                if (values.length > 0) {
                                                    const min = Math.min(...values);
                                                    const max = Math.max(...values);
                                                    // Add some padding
                                                    const padding = (max - min) * 0.1 || 10;
                                                    yAxisDomain = [Math.floor(min - padding), Math.ceil(max + padding)];
                                                }
                                            }
                                            return (
                                                <div key={def.key} className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                                                    <h3 className="text-lg font-bold text-navy-800 mb-4">{def.title}</h3>
                                                    <MetricTrendChart 
                                                        data={displayTrendData}
                                                        dataKey={def.key}
                                                        targetKey={def.targetKey}
                                                        xAxisDataKey="label"
                                                        formatValue={def.format}
                                                        color={def.color}
                                                        target={def.target}
                                                        yAxisDomain={yAxisDomain}
                                                    />
                                                </div>
                                            );
                                        })}
                  <div className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                    <h3 className="text-lg font-bold text-navy-800 mb-4">Headcount Trend</h3>
                    {/* Dynamic Y-axis for HeadcountChart */}
                    {(() => {
                        const values = displayTrendData.map(d => d.headcount).filter(v => v !== undefined && v !== null);
                        let yAxisDomain = undefined;
                        if (values.length > 0) {
                            const min = Math.min(...values);
                            const max = Math.max(...values);
                            const padding = (max - min) * 0.1 || 10;
                            yAxisDomain = [Math.floor(min - padding), Math.ceil(max + padding)];
                        }
                        return <HeadcountChart data={displayTrendData} yAxisDomain={yAxisDomain} />;
                    })()}
                  </div>
                </div>
            </section>
            
            {/* Notes */}
            {/* <Card className="border-2 border-navy-200 bg-white/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-black text-navy-900">Country Commentary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ minHeight: "200px" }}
                        placeholder={`Add commentary for ${selectedCountry === 'IN' ? 'India' : 'Southeast Asia'}...`}
                        className="w-full p-4 text-navy-700 bg-white rounded-lg border-2 border-navy-200"
                    />
                </CardContent>
            </Card> */}
        </div>
    );
}
