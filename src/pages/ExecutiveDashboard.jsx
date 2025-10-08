
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import MetricCard from '../components/metrics/MetricCard';
import MetricTrendChart from '../components/charts/MetricTrendChart';
import HeadcountChart from '../components/charts/HeadcountChart';
import CombinedArrChart from '../components/charts/CombinedArrChart';
import { getQuarter, getYear, parseISO, format } from 'date-fns'; // Added 'format'
import { DollarSign, Users, Heart, Zap, Percent, BarChart, Briefcase, AlertTriangle } from 'lucide-react';

// --- DATA IMPORTS ---
import liveKpisData from '@/components/data/executive/live.jsx';
import monthlyTrendData from '@/components/data/executive/trends.jsx';
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
    { group: 'Revenue', title: "Contracted MRR", key: "contracted_mrr", format: "currency", icon: DollarSign },
    { group: 'Revenue', title: "Contracted ARR", key: "contracted_arr", format: "currency", icon: DollarSign },
    { group: 'Clients', title: "# Live Customers", key: "live_clients", format: "number", icon: Users },
    { group: 'Clients', title: "# of Contracted Clients", key: "contracted_clients", format: "number", icon: Users },
    { group: 'Health', title: "Customer Health", key: "chs", format: "percentage", icon: Heart },
    { group: 'Health', title: "Accounts at Risk", key: "accounts_at_risk", format: "percentage", icon: AlertTriangle },
    { group: 'Performance', title: "NRR", key: "nrr", format: "percentage", icon: Zap },
    { group: 'Performance', title: "Rule of 80", key: "rule_of_80", format: "percentage", icon: Zap },
    { group: 'Performance', title: "MAU", key: "mau", format: "number", icon: BarChart },
    { group: 'Profitability', title: "GM %", key: "gm_percent", format: "percentage", icon: Percent },
    { group: 'Profitability', title: "EBITDA %", key: "ebitda_percent", format: "percentage", icon: Percent },
    { group: 'People', title: "Headcount", key: "headcount", format: "number", icon: Briefcase },
];

const trendChartDefinitions = [
    { key: "live_clients", title: "# Live Customers", format: (v) => v.toLocaleString(), color: "#10b981" }, // Green
    { key: "nrr", title: "NRR", format: (v) => `${v.toFixed(1)}%`, color: "#22c55e", target: 101, domain: [90, 130] }, // Bright Green
    { key: "rule_of_80", title: "Rule of 80", format: (v) => v.toFixed(1), color: "#8b5cf6", target: 77, domain: [40, 100] }, // Purple
    { key: "gm_percent", title: "GM %", format: (v) => `${v.toFixed(1)}%`, color: "#14b8a6", target: 67.1, domain: [60, 90] }, // Teal
    { key: "ebitda_percent", title: "EBITDA %", format: (v) => `${v.toFixed(1)}%`, color: "#ef4444", target: 13.2, domain: [-20, 20] }, // Red
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
        const currencyKeys = ['live_mrr', 'live_arr', 'contracted_mrr', 'contracted_arr'];
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
        'contracted_arr', 
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
          key = `Q${getQuarter(date)} ${getYear(date)}`;
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
    const currencyKeys = ['live_arr', 'contracted_arr', 'target_arr'];
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cards.map(def => (
                <MetricCard 
                    key={def.key}
                    title={def.title}
                    value={displayKpis[def.key]}
                    target={displayKpis[`${def.key}_target`]}
                    change={kpis[`${def.key}_change`]}
                    format={def.format}
                    categoryIcon={def.icon}
                    currency={currency}
                    loading={loading}
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
                  <GranularityButton granularity={granularity} setGranularity={setGranularity} value="annual">Annual</GranularityButton>
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
      
      <section>
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
      </section>
    </div>
  );
}
