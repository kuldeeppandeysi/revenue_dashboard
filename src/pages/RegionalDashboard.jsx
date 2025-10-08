
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MetricCard from '../components/metrics/MetricCard';
import MetricTrendChart from '../components/charts/MetricTrendChart';
import CombinedArrChart from '../components/charts/CombinedArrChart';
import HeadcountChart from '../components/charts/HeadcountChart';
import { getQuarter, getYear, parseISO } from 'date-fns';
import { DollarSign, Users, Heart, Zap, BarChart, Briefcase, AlertTriangle, Percent } from 'lucide-react';

// --- DATA IMPORTS ---
import regionalLiveKpis from '@/components/data/regional/live.jsx';
import monthlyTrendData from '@/components/data/regional/trends.jsx';
import quarterlyTrendData from '@/components/data/regional/trends_quarterly.jsx';
import annualTrendData from '@/components/data/regional/trends_annual.jsx';

// --- CURRENCY CONVERSION ---
const USD_TO_INR_RATE = 84.5;

const kpiCardDefinitions = [
    { group: 'Revenue', title: "Live MRR", key: "live_mrr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Live ARR", key: "live_arr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Contracted MRR", key: "contracted_mrr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Contracted ARR", key: "contracted_arr", format: "currency", icon: DollarSign },
    { group: 'Clients', title: "# Legal Entities", key: "live_clients", format: "number", icon: Users },
    { group: 'Clients', title: "# of Contracted Clients", key: "contracted_clients", format: "number", icon: Users },
    { group: 'Health', title: "Customer Health", key: "chs", format: "number", icon: Heart },
    { group: 'Health', title: "Accounts at Risk", key: "accounts_at_risk", format: "number", icon: AlertTriangle },
    { group: 'Performance', title: "NRR", key: "nrr", format: "percentage", icon: Zap },
    { group: 'Performance', title: "Rule of 80", key: "rule_of_80", format: "number", icon: Zap },
    { group: 'Performance', title: "MAU", key: "mau", format: "number", icon: BarChart },
    { group: 'Profitability', title: "GM %", key: "gm_percent", format: "percentage", icon: Percent },
    { group: 'Profitability', title: "EBITDA %", key: "ebitda_percent", format: "percentage", icon: Percent },
    { group: 'People', title: "Headcount", key: "headcount", format: "number", icon: Briefcase },
];

const trendChartDefinitions = [
    { key: "live_clients", title: "# Legal Entities", format: (v) => v.toLocaleString(), color: "#10b981" }, // Green
    { key: "nrr", title: "NRR", format: (v) => `${v.toFixed(1)}%`, color: "#22c55e", target: 100, domain: [90, 120] }, // Bright Green
    { key: "rule_of_80", title: "Rule of 80", format: (v) => v.toFixed(1), color: "#8b5cf6", target: 80, domain: [40, 100] }, // Purple
    { key: "gm_percent", title: "GM %", format: (v) => `${v.toFixed(1)}%`, color: "#14b8a6", target: 80, domain: [60, 90] }, // Teal
    { key: "ebitda_percent", title: "EBITDA %", format: (v) => `${v.toFixed(1)}%`, color: "#ef4444", target: 0, domain: [-20, 20] }, // Red
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
            const currencyKeys = ['live_mrr', 'live_arr', 'contracted_mrr', 'contracted_arr'];
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
            'contracted_arr', 
            'contracted_clients', 
            'chs', 
            'accounts_at_risk'
        ];
        
        integrationInProgressKeys.forEach(key => {
            converted[key] = 'Integration In Progress';
        });
        
        return converted;
    }, [selectedCountry, currency]);

    const aggregatedTrendData = useMemo(() => {
        let sourceData;
        if (granularity === 'quarterly') {
            sourceData = quarterlyTrendData;
        } else if (granularity === 'annual') {
            sourceData = annualTrendData;
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
        const currencyKeys = ['live_arr', 'contracted_arr', 'target_arr'];
        return aggregatedTrendData.map(item => {
            const newItem = { ...item };
            currencyKeys.forEach(key => {
                if (newItem[key] !== undefined) {
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
                        {/* <GranularityButton granularity={granularity} setGranularity={setGranularity} value="annual">Annual</GranularityButton> */}
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
                  {trendChartDefinitions.map(def => (
                    <div key={def.key} className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                      <h3 className="text-lg font-bold text-navy-800 mb-4">{def.title}</h3>
                      <MetricTrendChart 
                        data={displayTrendData}
                        dataKey={def.key}
                        formatValue={def.format}
                        color={def.color}
                        target={def.target}
                        yAxisDomain={def.domain}
                      />
                    </div>
                  ))}
                  <div className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
                    <h3 className="text-lg font-bold text-navy-800 mb-4">Headcount Trend</h3>
                    <HeadcountChart data={displayTrendData} />
                  </div>
                </div>
            </section>
            
            {/* Notes */}
            <Card className="border-2 border-navy-200 bg-white/50 backdrop-blur-sm shadow-lg">
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
            </Card>
        </div>
    );
}
