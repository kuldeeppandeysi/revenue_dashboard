
import React, { useState, useEffect } from "react";
import { Feature, Account, ProductEvent } from "@/api/entities";
import MetricCard from "../components/metrics/MetricCard";
import FeatureAdoptionHeatmap from "../components/product/FeatureAdoptionHeatmap";
import TrendChart from "../components/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import kpis from '../components/data/product/kpis.jsx';

export default function ProductAnalytics() {
  const [features, setFeatures] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuresData, accountsData] = await Promise.all([
          Feature.list(),
          Account.list(),
        ]);
        setFeatures(featuresData);
        setAccounts(accountsData);
      } catch (err) {
        console.error("Failed to load product analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stickinessData = [
    { period: 'Jan', value: 25 },
    { period: 'Feb', value: 28 },
    { period: 'Mar', value: 27 },
    { period: 'Apr', value: 31 },
    { period: 'May', value: 30 },
    { period: 'Jun', value: 33 },
  ];

  const ttvData = [
    { period: 'Jan', value: 12 },
    { period: 'Feb', value: 11 },
    { period: 'Mar', value: 9 },
    { period: 'Apr', value: 8 },
    { period: 'May', value: 7.5 },
    { period: 'Jun', value: 7 },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Product Usage Intelligence</h1>
          <p className="text-navy-700 font-semibold text-lg">Analyze feature adoption, user engagement, and retention.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-2 border-navy-300 text-navy-700 hover:bg-navy-50 font-bold rounded-xl">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl border-2 border-navy-800">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Monthly Active Users (MAU)" value={kpis.mau} target={kpis.mau_target} change={kpis.mau_change} format="number" status="good" loading={loading} />
        <MetricCard title="Stickiness (DAU/MAU)" value={kpis.stickiness} target={kpis.stickiness_target} change={kpis.stickiness_change} format="percentage" status="excellent" loading={loading} />
        <MetricCard title="Activation Rate" value={kpis.activation_rate} target={kpis.activation_rate_target} change={kpis.activation_rate_change} format="percentage" status="good" loading={loading} />
        <MetricCard title="Avg. Time to Value (TTV)" value={kpis.ttv} target={kpis.ttv_target} change={kpis.ttv_change} period="days" status="excellent" loading={loading} />
      </div>

      <div className="space-y-6">
        <FeatureAdoptionHeatmap features={features} accounts={accounts} />

        <div className="grid lg:grid-cols-2 gap-6">
          <TrendChart
            title="Stickiness Trend (DAU/MAU)"
            data={stickinessData}
            dataKey="value"
            formatTooltip={(v) => `${v.toFixed(1)}%`}
          />
          <TrendChart
            title="Time to Value (TTV) Trend"
            data={ttvData}
            dataKey="value"
            formatTooltip={(v) => `${v.toFixed(1)} days`}
            color="#8b5cf6"
          />
        </div>
      </div>
    </div>
  );
}
