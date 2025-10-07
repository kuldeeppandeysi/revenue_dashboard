
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  PieChart,
  BarChart3,
  Download
} from "lucide-react";

import MetricCard from "../components/metrics/MetricCard";
import TrendChart from "../components/charts/TrendChart";
import WaterfallChart from "../components/charts/WaterfallChart";

// --- DATA IMPORTS ---
import kpis from '@/components/data/revenue/kpis.jsx';
import cohortData from '@/components/data/revenue/cohorts.jsx';
import segmentData from '@/components/data/revenue/segments.jsx';
import geoData from '@/components/data/revenue/geo.jsx';
import waterfallData from '@/components/data/revenue/waterfall.jsx';
import cohortRetentionData from '@/components/data/revenue/cohortRetention.jsx';

// --- CURRENCY CONVERSION ---
const USD_TO_INR_RATE = 84.5;


export default function RevenueAnalytics({ currency = 'USD' }) { // Changed default currency
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Convert KPIs based on currency
  const displayKpis = useMemo(() => {
    if (currency === 'INR') {
        return kpis;
    }
    const converted = { ...kpis };
    const currencyKeys = [
      'live_mrr', 'live_arr', 'contracted_mrr', 'contracted_arr',
      'new_business_mrr', 'expansion_mrr', 'net_mrr_churn', 'arpa',
      'live_mrr_target', 'live_arr_target', 'contracted_mrr_target', 'contracted_arr_target',
      'new_business_mrr_target', 'expansion_mrr_target', 'net_mrr_churn_target', 'arpa_target'
    ];
    currencyKeys.forEach(key => {
        if (converted[key] !== undefined && converted[key] !== null) {
            converted[key] = converted[key] / USD_TO_INR_RATE;
        }
    });
    return converted;
  }, [currency]);

  // Convert segment data based on currency
  const displaySegmentData = useMemo(() => {
    if (currency === 'INR') {
        return segmentData;
    }
    return segmentData.map(segment => ({
        ...segment,
        mrr: segment.mrr / USD_TO_INR_RATE,
        arpa: segment.arpa / USD_TO_INR_RATE
    }));
  }, [currency]);

  // Convert geo data based on currency
  const displayGeoData = useMemo(() => {
    if (currency === 'INR') {
        return geoData;
    }
    return geoData.map(geo => ({
        ...geo,
        mrr: geo.mrr / USD_TO_INR_RATE
    }));
  }, [currency]);
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Revenue Analytics</h1>
          <p className="text-navy-700 font-semibold text-lg">Deep dive into revenue patterns, cohorts, and growth drivers</p>
        </div>
        
        <div className="flex gap-3">
          <Button className="gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl border-2 border-navy-800">
            <Download className="w-4 h-4" />
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards - Live vs Contracted */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Live MRR" value={displayKpis.live_mrr} target={displayKpis.live_mrr_target} change={displayKpis.live_mrr_change} format="currency" currency={currency} loading={loading} />
        <MetricCard title="Contracted MRR" value={displayKpis.contracted_mrr} target={displayKpis.contracted_mrr_target} change={displayKpis.contracted_mrr_change} format="currency" currency={currency} loading={loading} />
        <MetricCard title="Live ARR"  value={displayKpis.live_arr} target={displayKpis.live_arr_target} change={displayKpis.live_arr_change} format="currency" currency={currency} loading={loading} />
        <MetricCard title="Contracted ARR" value={displayKpis.contracted_arr} target={displayKpis.contracted_arr_target} change={displayKpis.contracted_arr_change} format="currency" currency={currency} loading={loading} />
      </div>

      {/* Client Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Live Clients" value={displayKpis.live_clients} target={displayKpis.live_clients_target} change={displayKpis.live_clients_change} format="number" loading={loading} />
        <MetricCard title="Contracted Clients" value={displayKpis.contracted_clients} target={displayKpis.contracted_clients_target} change={displayKpis.contracted_clients_change} format="number" loading={loading} />
        <MetricCard title="New Business MRR" value={displayKpis.new_business_mrr} target={displayKpis.new_business_mrr_target} change={displayKpis.new_business_mrr_change} format="currency" currency={currency} loading={loading} />
        <MetricCard title="Expansion MRR" value={displayKpis.expansion_mrr} target={displayKpis.expansion_mrr_target} change={displayKpis.expansion_mrr_change} format="currency" currency={currency} loading={loading} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Net MRR Churn" value={displayKpis.net_mrr_churn} target={displayKpis.net_mrr_churn_target} change={displayKpis.net_mrr_churn_change} format="currency" currency={currency} loading={loading} />
        <MetricCard title="Rule of 80" value={displayKpis.rule_of_80} target={displayKpis.rule_of_80_target} change={displayKpis.rule_of_80_change} format="number" loading={loading} />
        <MetricCard title="Gross Margin %" value={displayKpis.gm_percent} target={displayKpis.gm_percent_target} change={displayKpis.gm_percent_change} format="percentage" loading={loading} />
        <MetricCard title="EBITDA %" value={displayKpis.ebitda_percent} target={displayKpis.ebitda_percent_target} change={displayKpis.ebitda_percent_change} format="percentage" loading={loading} />
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-navy-300 rounded-xl p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white data-[state=inactive]:text-navy-700 font-bold rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white data-[state=inactive]:text-navy-700 font-bold rounded-lg">
            Segments
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white data-[state=inactive]:text-navy-700 font-bold rounded-lg">
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white data-[state=inactive]:text-navy-700 font-bold rounded-lg">
            Geography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <WaterfallChart
              title="MRR Waterfall - Last 6 Months"
              data={waterfallData}
            />
            
            <TrendChart
              title="MRR Growth by Component"
              data={cohortData}
              xAxisKey="month"
              dataKey="newMRR"
              formatTooltip={formatCurrency}
              type="area"
              color="#059669"
            />
          </div>
          
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenue Metrics Deep Dive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{displayKpis.nrr}%</div>
                  <div className="text-sm text-slate-600 font-medium">Net Revenue Retention</div>
                  <Badge className={`mt-2 ${displayKpis.nrr_change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {displayKpis.nrr_change > 0 ? '+' : ''}{displayKpis.nrr_change}% MoM
                  </Badge>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(displayKpis.arpa)}</div>
                  <div className="text-sm text-slate-600 font-medium">ARPA</div>
                   <Badge className={`mt-2 ${displayKpis.arpa_change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {displayKpis.arpa_change > 0 ? '+' : ''}{displayKpis.arpa_change}% MoM
                  </Badge>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{displayKpis.logo_churn_rate}%</div>
                  <div className="text-sm text-slate-600 font-medium">Logo Churn Rate</div>
                  <Badge className={`mt-2 ${displayKpis.logo_churn_rate_change > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {displayKpis.logo_churn_rate_change > 0 ? '+' : ''}{displayKpis.logo_churn_rate_change}% MoM
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6 mt-6">
          <div className="grid gap-6">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Revenue by Customer Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displaySegmentData.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{segment.segment}</h3>
                          <p className="text-sm text-slate-600">{segment.accounts} accounts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatCurrency(segment.mrr)}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">ARPA: {formatCurrency(segment.arpa)}</span>
                          <Badge className={segment.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {segment.change > 0 ? '+' : ''}{segment.change}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6 mt-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 font-semibold">Cohort Month</th>
                      <th className="text-center p-3 font-semibold">Month 0</th>
                      <th className="text-center p-3 font-semibold">Month 1</th>
                      <th className="text-center p-3 font-semibold">Month 3</th>
                      <th className="text-center p-3 font-semibold">Month 6</th>
                      <th className="text-center p-3 font-semibold">Month 12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortRetentionData.map((row) => (
                      <tr key={row.month} className="border-b border-slate-100">
                        <td className="p-3 font-medium">{row.month}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{row.m0}%</span>
                        </td>
                        {[row.m1, row.m3, row.m6, row.m12].map((val, i) => (
                           <td key={i} className="p-3 text-center">
                            {val !== null ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${val >= 95 ? 'bg-emerald-100 text-emerald-800' : val >= 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {val.toFixed(1)}%
                              </span>
                            ) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6 mt-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Revenue by Geography</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayGeoData.map((geo) => (
                  <div key={geo.geo} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{geo.geo}</h3>
                        <p className="text-sm text-slate-600">{geo.share}% of total revenue</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatCurrency(geo.mrr)}</div>
                      <Badge className="bg-green-100 text-green-800">
                        +{geo.change}% YoY
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
