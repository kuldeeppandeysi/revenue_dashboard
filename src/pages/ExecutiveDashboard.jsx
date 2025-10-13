// --- Collections Data Aggregation Helpers ---
import financeData from '@/components/data/executive/finance_data.jsx';
// --- Collections Data Aggregation Helpers ---
function getMonthlyCollectionsData(data) {
  return data.map(row => {
    // Convert Month to ISO date for sorting and filtering
    const [mon, year] = row["Month"].split('-');
    const monthNum = new Date(Date.parse(mon + " 1, 2020")).getMonth() + 1;
    const isoDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    return {
      ...row,
      date: isoDate,
      label: row["Month"],
    };
  });
}

function getQuarterlyCollectionsData(data) {
  const monthly = getMonthlyCollectionsData(data);
  const quarters = {};
  monthly.forEach(row => {
    const date = new Date(row.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    let qIdx, qYear, endMonth;
    if ([3,4,5].includes(month)) { qIdx = 1; qYear = year; endMonth = "Jun"; } // Q1: Apr-Jun
    else if ([6,7,8].includes(month)) { qIdx = 2; qYear = year; endMonth = "Sep"; } // Q2: Jul-Sep
    else if ([9,10,11].includes(month)) { qIdx = 3; qYear = year; endMonth = "Dec"; } // Q3: Oct-Dec
    else { qIdx = 4; qYear = month <= 2 ? year : year + 1; endMonth = "Mar"; } // Q4: Jan-Mar
    let label = `${endMonth}'${String(qYear).slice(-2)}`;
    if (!quarters[label]) quarters[label] = [];
    quarters[label].push(row);
  });
  return Object.entries(quarters).map(([label, arr]) => {
    return {
      label,
      Unbilled: arr.reduce((sum, r) => sum + (r["Unbilled"] || 0), 0),
      AR: arr.reduce((sum, r) => sum + (r["AR"] || 0), 0)
    };
  });
}

function getAnnualCollectionsData(data) {
  // Group by financial year (Apr-Mar)
  const monthly = getMonthlyCollectionsData(data);
  const years = {};
  monthly.forEach(row => {
    const date = new Date(row.date);
    let fy;
    if (date.getMonth() >= 3) {
      fy = `FY ${String(date.getFullYear()+1).slice(-2)}`;
    } else {
      fy = `FY ${String(date.getFullYear()).slice(-2)}`;
    }
    if (!years[fy]) years[fy] = [];
    years[fy].push(row);
  });
  return Object.entries(years).map(([label, arr]) => {
    return {
      label,
      Unbilled: arr.reduce((sum, r) => sum + (r["Unbilled"] || 0), 0),
      AR: arr.reduce((sum, r) => sum + (r["AR"] || 0), 0)
    };
  });
}


import { getQuarterlyAccruedData } from '@/utils/quarterly';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import MetricCard from '../components/metrics/MetricCard';
import MetricTrendChart from '../components/charts/MetricTrendChart';
import HeadcountChart from '../components/charts/HeadcountChart';
import CombinedArrChart from '../components/charts/CombinedArrChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getQuarter, getYear, parseISO, format } from 'date-fns'; // Added 'format'
import { DollarSign, Users, Heart, Zap, Percent, BarChart, Briefcase, AlertTriangle } from 'lucide-react';

// --- DATA IMPORTS ---
import liveKpisData from '@/components/data/executive/live.jsx';
import monthlyTrendData from '@/components/data/executive/trends.jsx';
import accruedTrendData from '@/components/data/executive/trends_accrued.jsx';

// Helper to compute annual (FY) accrued_mrr sums from monthly data
function getAnnualAccruedMRR(data) {
  // FY25: Apr 2024 - Mar 2025
  const fy25 = data.filter(row => {
    const d = new Date(row.date);
    return d >= new Date('2024-04-01') && d <= new Date('2025-03-31');
  });
  // FY26: Apr 2025 - Aug 2025
  const fy26 = data.filter(row => {
    const d = new Date(row.date);
    return d >= new Date('2025-04-01') && d <= new Date('2025-08-31');
  });
  return [
    {
      label: "FY25",
      accrued_mrr: fy25.reduce((sum, r) => sum + (r.accrued_mrr || 0), 0),
      accrued_mrr_target: fy25.length > 0 ? fy25.reduce((sum, r) => sum + (r.accrued_mrr_target || 0), 0) : null
    },
    {
      label: "Aug'25",
      accrued_mrr: fy26.reduce((sum, r) => sum + (r.accrued_mrr || 0), 0),
      accrued_mrr_target: fy26.length > 0 ? fy26.reduce((sum, r) => sum + (r.accrued_mrr_target || 0), 0) : null
    }
  ];
}
import quarterlyTrendData from '@/components/data/executive/quarterly_trends.jsx';
import annualTrendData from '@/components/data/executive/annual_trends.jsx';
// The Metric import is removed as it's not used when USE_DATABASE is false, and the instruction is to remove it.

// --- SAFETY SWITCH ---
// Set this to 'false' to revert to using the old static data files.
const USE_DATABASE = false;

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
  { group: 'Performance', title: "Rule of 80", key: "rule_of_80", format: "percentage", icon: Zap },
  { group: 'Performance', title: "MAU", key: "mau", format: "number", icon: BarChart },
  { group: 'Profitability', title: "GM %", key: "gm_percent", format: "percentage", icon: Percent },
  { group: 'Profitability', title: "EBITDA %", key: "ebitda_percent", format: "percentage", icon: Percent },
  { group: 'People', title: "Headcount", key: "headcount", format: "number", icon: Briefcase },
];

// const trendChartDefinitions = [
//     { key: "live_clients", title: "# Live Customers", format: (v) => v.toLocaleString(), color: "#10b981" }, // Green
//     { key: "nrr", title: "NRR", format: (v) => `${v.toFixed(1)}%`, color: "#22c55e", target: 0, domain: [90, 130] }, // Bright Green
//     { key: "rule_of_80", title: "Rule of 80", format: (v) => v.toFixed(1), color: "#8b5cf6", target: 80, domain: [40, 100] }, // Purple
//     { key: "gm_percent", title: "GM %", format: (v) => `${v.toFixed(1)}%`, color: "#14b8a6", target: 64.1, domain: [60, 90] }, // Teal
//     { key: "ebitda_percent", title: "EBITDA %", format: (v) => `${v.toFixed(1)}%`, color: "#ef4444", target: -17.4, domain: [-20, 20] }, // Red
// ];
 const trendChartDefinitions = [
  { key: "live_clients", title: "# Live Customers", format: (v) => v.toLocaleString(), color: "#10b981" }, // Green
  { key: "nrr", title: "NRR", format: (v) => `${v.toFixed(1)}%`, color: "#22c55e", targetKey: "target_nrr", domain: [80, 120] }, // Bright Green (uses monthly target_nrr)
  { key: "rule_of_80", title: "Rule of 80", format: (v) => v.toFixed(1), color: "#8b5cf6", target: 80, domain: [-120, 350] }, // Purple (still a static line unless you add target_rule_of_80)
  { key: "gm_percent", title: "GM %", format: (v) => `${v.toFixed(1)}%`, color: "#14b8a6", targetKey: "target_gm_percent", domain: [50, 80] }, // Teal
  { key: "ebitda_percent", title: "EBITDA %", format: (v) => `${v.toFixed(1)}%`, color: "#ef4444",targetKey: "target_ebitda_percent", domain: [-50, 40] }, // Red (wider domain to cover -47.1%)
];

const GranularityButton = ({granularity, setGranularity, value, children}) => (
    <button 
        onClick={() => setGranularity(value)}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${granularity === value ? 'bg-navy-800 text-white shadow-md' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}
    >
        {children}
    </button>
);

export default function ExecutiveDashboard({ currency = 'USD' }) {
  const [notes, setNotes] = useState("");
  const [granularity, setGranularity] = useState('monthly');
  const [kpis, setKpis] = useState({});
  const [trendData, setTrendData] = useState([]); // This state will only be populated when USE_DATABASE is true
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_DATABASE) {
      loadDataFromDatabase();
    } else {
      loadDataFromStaticFiles();
    }
  }, []);

  // When USE_DATABASE is false, this function only sets KPIs.
  // Aggregated trend data will directly use the imported static monthly/quarterly/annual data.
  const loadDataFromStaticFiles = () => {
    setKpis(liveKpisData);
    setLoading(false);
  };

  const loadDataFromDatabase = async () => {
    setLoading(true);
    try {
      // Fetch all metrics from the database, newest first
      // Temporarily disabled due to removed Metric import, will need re-evaluation if USE_DATABASE becomes true
      // const allMetrics = await Metric.list("-period", 200); 
      const allMetrics = []; // Placeholder if Metric import is removed and USE_DATABASE is true

      // --- Process KPIs for the Cards ---
      const newKpis = { ...liveKpisData }; // Start with static as fallback

      const findLatestMetric = (name, region = 'GLOBAL') => 
        allMetrics.find(m => m.metric_name === name && m.region_code === region);

      const mrrMetric = findLatestMetric("MRR");
      const ebitdaMetric = findLatestMetric("EBITDA %");
      const gmMetric = findLatestMetric("GM %");
      const headcountMetric = findLatestMetric("Headcount");
      
      if (mrrMetric) {
        newKpis.live_mrr = mrrMetric.value;
        newKpis.live_arr = mrrMetric.value * 12;
      }
      if (ebitdaMetric) newKpis.ebitda_percent = ebitdaMetric.value;
      if (gmMetric) newKpis.gm_percent = gmMetric.value;
      if (headcountMetric) newKpis.headcount = headcountMetric.value;

      setKpis(newKpis);

      // --- Process Data for Trend Charts ---
      const monthlyData = allMetrics.reduce((acc, metric) => {
          const period = metric.period.substring(0, 7); // "2024-07"
          if (!acc[period]) {
              acc[period] = {
                  date: metric.period,
                  monthLabel: parseISO(metric.period).toLocaleString('default', { month: 'short', year: '2-digit' }),
              };
          }

          // We only care about global trends for this dashboard for now
          if (metric.region_code === 'GLOBAL') {
              const keyMap = {
                  "MRR": "live_mrr", // For ARR calculation below
                  "EBITDA %": "ebitda_percent",
                  "GM %": "gm_percent",
                  "Headcount": "headcount",
                  "NRR": "nrr",
                  "Rule of 80": "rule_of_80",
                  "Live Clients": "live_clients"
              };
              const chartKey = keyMap[metric.metric_name];
              if (chartKey) {
                  acc[period][chartKey] = metric.value;
              }
          }
          return acc;
      }, {});
      
      // Convert MRR to ARR for chart data, and ensure it's sorted by date
      const processedTrendData = Object.values(monthlyData)
        .map(dbData => {
            if (dbData.live_mrr !== undefined) {
                dbData.live_arr = dbData.live_mrr * 12;
            }
            return dbData;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));


      // Fallback to static data for chart metrics not yet in DB,
      // and merge with database data, prioritizing database data.
      const combinedTrendData = monthlyTrendData.map(staticEntry => {
          const dbEntry = processedTrendData.find(d => d.date.substring(0,7) === staticEntry.date.substring(0,7));
          return {...staticEntry, ...dbEntry};
      });

      // Also append any new data from the DB that isn't in static files
      processedTrendData.forEach(dbEntry => {
        if (!combinedTrendData.some(staticEntry => staticEntry.date.substring(0,7) === dbEntry.date.substring(0,7))) {
            combinedTrendData.push(dbEntry);
        }
      });

      // Sort combined data to ensure correct order
      combinedTrendData.sort((a, b) => new Date(a.date) - new Date(b.date));

      setTrendData(combinedTrendData);

    } catch (error) {
      console.error("Error loading data from database, falling back to static data.", error);
      setKpis(liveKpisData);
      setTrendData(monthlyTrendData); // Fallback to static monthly data for dynamic aggregation
    } finally {
      setLoading(false);
    }
  };

  const displayKpis = useMemo(() => {
    const converted = currency === 'INR' ? { ...kpis } : { ...kpis };
    
    // Convert currency for USD
    if (currency === 'USD') {
        const currencyKeys = ['live_mrr', 'live_arr','accrued_mrr', 'accrued_mrr_value' ]; // Removed contracted keys
        currencyKeys.forEach(key => {
            // Convert main values
            if (converted[key] !== undefined && converted[key] !== null) {
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
        'contracted_clients',
    ];
    
    integrationInProgressKeys.forEach(key => {
        converted[key] = 'Integration In Progress';
    });
    
    // Remove target values for specific metrics
    const noTargetKeys = [
        'live_clients',
        'contracted_clients',
    ];
    
    noTargetKeys.forEach(key => {
        converted[`${key}_target`] = null;
    });
    
    return converted;
  }, [kpis, currency]);

  const aggregatedTrendData = useMemo(() => {
    if (USE_DATABASE) {
      // Original logic for dynamic aggregation from database-fetched monthly data (trendData state)
      if (!trendData || trendData.length === 0) return [];
      if (granularity === 'monthly') {
        return trendData.map(d => ({ ...d, label: d.monthLabel || format(parseISO(d.date), "MMM ''yy") }));
      }

      const groupedData = trendData.reduce((acc, curr) => {
        const date = parseISO(curr.date);
        let key;
        if (granularity === 'quarterly') {
          const quarter = getQuarter(date);
          const year = getYear(date);
          const endMonths = ["Mar", "Jun", "Sep", "Dec"];
          const endMonth = endMonths[quarter - 1];
          key = `${endMonth}'${String(year).slice(-2)}`;
        } else { // annual
          key = getYear(date).toString();
        }
        
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
      }, {});

      return Object.entries(groupedData).map(([key, values]) => {
        const lastValueInPeriod = values[values.length - 1]; // Base for point-in-time metrics
        const metricsToAverage = ['nrr', 'rule_of_80', 'gm_percent', 'ebitda_percent'];

        const averagedMetrics = metricsToAverage.reduce((acc, metricKey) => {
          const metricValues = values.map(v => v[metricKey]).filter(v => v !== undefined && v !== null);
          if (metricValues.length > 0) {
            acc[metricKey] = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;
          } else {
            // Fallback to the last value if no valid values for averaging are found in the period
            acc[metricKey] = lastValueInPeriod[metricKey];
          }
          return acc;
        }, {});

        return {
          ...lastValueInPeriod, // Keep other metrics (e.g., live_clients, headcount, live_arr) as their last recorded value
          label: key,
          ...averagedMetrics // Overwrite averaged metrics with their calculated averages
        };
      });
    } else {
      // New logic for static files, directly using imported pre-aggregated data
      if (granularity === 'quarterly') {
        return quarterlyTrendData;
      }
      if (granularity === 'annual') {
        return annualTrendData;
      }
      // Default to monthly for static files
      return monthlyTrendData.map(d => ({ ...d, label: d.monthLabel || format(parseISO(d.date), "MMM ''yy") }));
    }
  }, [granularity, trendData, USE_DATABASE]); // Added USE_DATABASE as a dependency

  const displayTrendData = useMemo(() => {
    if (currency === 'INR') {
        return aggregatedTrendData;
    }
    const currencyKeys = ['live_arr', 'target_arr']; // Removed contracted_arr
    return aggregatedTrendData.map(item => {
        const newItem = { ...item };
        currencyKeys.forEach(key => {
            if (newItem[key] !== undefined && newItem[key] !== null) { // Check if key exists before conversion
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

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <header>
        <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Executive Dashboard</h1>
        <p className="text-navy-700 text-lg font-medium">Business KPIs' dashboard is populated with latest data  - 31 Aug</p>
      </header>

      {/* -- KPI Card Groups -- */}
      <section className="space-y-6">
        {Object.entries(kpiGroups).map(([groupName, cards]) => (
          <div key={groupName}>
            <h2 className="text-xl font-bold text-navy-800 mb-4 tracking-tight">{groupName}</h2>
            <div className="flex flex-wrap gap-8 justify-start px-2">
              {cards.map(def => (
                <MetricCard 
                  key={def.key}
                  title={def.title}
                  value={displayKpis[def.key]}
                  target={def.key === 'accrued_mrr' ? displayKpis['accrued_mrr_value'] : (def.noTarget ? null : displayKpis[`${def.key}_target`])}
                  change={kpis[`${def.key}_change`]}
                  format={def.format}
                  categoryIcon={def.icon}
                  currency={currency}
                  loading={loading}
                  className={
                    ['live_mrr', 'live_arr'].includes(def.key)
                      ? 'scale-105 min-w-[300px]'
                      : ['accrued_mrr', 'accrued_mrr_value'].includes(def.key)
                      ? 'scale-90'
                      : ''
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* -- Sticky Filter Bar for Trends -- */}
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

      {/* -- Trend Charts Section -- */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-3 bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
            <h3 className="text-lg font-bold text-navy-800 mb-4">ARR Performance</h3>
            <CombinedArrChart data={displayTrendData} currency={currency} />
          </div>
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
            {(() => {
              const accruedData = granularity === 'quarterly' ? getQuarterlyAccruedData(accruedTrendData)
                : granularity === 'annual' ? getAnnualAccruedMRR(accruedTrendData)
                : accruedTrendData;

              const formatAccruedValue = (v) => {
                if (currency === 'USD') return `$${(v / USD_TO_INR_RATE / 1e6).toFixed(1)}M`;
                return `₹${(v / 1e6).toFixed(1)}M`;
              };

              // Custom tooltip for Accrued MRR
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

              return (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={accruedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey={granularity === 'quarterly' ? 'label' : granularity === 'annual' ? 'label' : 'monthLabel'}
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
                      domain={[0, 80_000_000]}
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
            {/* -- Collections Graph -- */}
              <div className="xl:col-span-3 bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg mt-8 flex flex-col">
                <div className="flex items-center justify-between mb-4 w-full">
                  <h3 className="text-lg font-bold text-navy-800">Revenue Provisions</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: '#6366f1', display: 'inline-block' }}></span>
                      <span className="text-sm font-medium text-navy-700">Unbilled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: '#10b981', display: 'inline-block' }}></span>
                      <span className="text-sm font-medium text-navy-700">AR</span>
                    </div>
                  </div>
                </div>
                {(() => {
                  // Prepare data
                  let chartData;
                  if (granularity === 'annual') {
                    const monthly = getMonthlyCollectionsData(financeData).map(row => ({
                      ...row,
                      TotalOutstanding: row["Total Outstanding"]
                    }));
                    // FY 25: Apr 2024 - Mar 2025
                    // FY 26: Apr 2025 - Aug 2025
                    const years = [
                      {
                        label: "FY 25",
                        months: [
                          "Apr-2024", "May-2024", "Jun-2024", "Jul-2024", "Aug-2024", "Sep-2024",
                          "Oct-2024", "Nov-2024", "Dec-2024", "Jan-2025", "Feb-2025", "Mar-2025"
                        ]
                      },
                      {
                        label: "FY 26",
                        months: ["Apr-2025", "May-2025", "Jun-2025", "Jul-2025", "Aug-2025"]
                      }
                    ];
                    chartData = years.map(y => {
                      // For FY 25, show Mar-2025 values; for FY 26, show Aug-2025 values
                      const endMonth = y.label === "FY 25" ? "Mar-2025" : "Aug-2025";
                      const endMonthRow = monthly.find(row => row.label === endMonth);
                      if (!endMonthRow) return { label: y.label, Unbilled: 0, AR: 0 };
                      
                      let Unbilled = endMonthRow.Unbilled || 0;
                      let AR = endMonthRow.AR || 0;
                      if (currency === 'USD') {
                        Unbilled = (Unbilled / USD_TO_INR_RATE) / 1e6;
                        AR = (AR / USD_TO_INR_RATE) / 1e6;
                      }
                      return {
                        label: y.label,
                        Unbilled,
                        AR
                      };
                    });
                  } else if (granularity === 'quarterly') {
                    const monthly = getMonthlyCollectionsData(financeData).map(row => ({
                      ...row,
                      TotalOutstanding: row["Total Outstanding"]
                    }));
                    const quarters = [
                      { label: "Jun'24", endMonth: "Jun-2024" },
                      { label: "Sep'24", endMonth: "Sep-2024" },
                      { label: "Dec'24", endMonth: "Dec-2024" },
                      { label: "Mar'25", endMonth: "Mar-2025" },
                      { label: "Jun'25", endMonth: "Jun-2025" }
                    ];
                    chartData = quarters.map(q => {
                      const endMonthRow = monthly.find(row => row.label === q.endMonth);
                      if (!endMonthRow) return { label: q.label, Unbilled: 0, AR: 0 };
                      
                      let Unbilled = endMonthRow.Unbilled || 0;
                      let AR = endMonthRow.AR || 0;
                      if (currency === 'USD') {
                        Unbilled = (Unbilled / USD_TO_INR_RATE) / 1e6;
                        AR = (AR / USD_TO_INR_RATE) / 1e6;
                      }
                      return {
                        label: q.label,
                        Unbilled,
                        AR
                      };
                    });
                  } else {
                    let monthly = getMonthlyCollectionsData(financeData).map(row => ({
                      ...row,
                      TotalOutstanding: row["Total Outstanding"]
                    }));
                    if (currency === 'USD') {
                      monthly = monthly.map(row => ({
                        ...row,
                        Unbilled: (row.Unbilled / USD_TO_INR_RATE) / 1e6,
                        AR: (row.AR / USD_TO_INR_RATE) / 1e6
                      }));
                    }
                    chartData = monthly;
                  }
                  // Calculate max for Y-axis
                  const maxY = Math.max(
                    ...chartData.map(d => Math.max(d.Unbilled || 0, d.AR || 0))
                  );
                  const yAxisDomain = currency === 'USD'
                    ? [0, Math.ceil(maxY * 1.1)]
                    : [0, Math.ceil(maxY * 1.1)];
                  // Custom tooltip for Revenue Provisions
                  const CustomRevenueTooltip = ({ active, payload, label }) => {
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
                                  {currency === 'USD' ? `$${entry.value.toFixed(2)}M` : `₹${entry.value.toLocaleString()}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  };

                  // Render chart with custom tooltip
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
                          tickFormatter={v => currency === 'USD' ? `$${v.toFixed(1)}M` : `₹${(v / 1e6).toFixed(1)}M`}
                          domain={yAxisDomain}
                        />
                        <Tooltip content={<CustomRevenueTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="Unbilled" 
                          name="Unbilled" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="AR" 
                          name="AR" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
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
                targetKey={def.targetKey}
                yAxisDomain={def.domain}
                xAxisDataKey={granularity === 'quarterly' || granularity === 'annual' ? 'label' : undefined}
              />
            </div>
          ))}
          <div className="bg-white p-6 rounded-xl border-2 border-navy-200 shadow-lg">
            <h3 className="text-lg font-bold text-navy-800 mb-4">Headcount Trend</h3>
            <HeadcountChart data={displayTrendData} />
          </div>
        </div>
      </section>
      
      {/* <section>
        <Card className="border-2 border-navy-200 bg-white/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-black text-navy-900">Executive Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ minHeight: "150px" }}
                    placeholder="Add your summary and notes for this period..."
                    className="w-full p-4 text-navy-700 bg-white rounded-lg border-2 border-navy-200"
                />
            </CardContent>
        </Card>
      </section> */}
    </div>
  );
}
