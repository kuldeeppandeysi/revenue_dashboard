import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Download
} from "lucide-react";


import MetricCard from "../components/metrics/MetricCard";
import RevenueTrendChart from '../components/charts/RevenueTrendChart';


// --- DATA IMPORTS ---
import kpis from '@/components/data/revenue/kpis.jsx';
import monthlyChangesData from '@/components/data/revenue/monthlyChanges.jsx';
import churnData from '@/components/data/revenue/churn_data.jsx';


const USD_TO_INR_RATE = 84.5;


export default function RevenueAnalytics({ currency = 'INR' }) {
 const [loading, setLoading] = useState(true);


 useEffect(() => {
   // Simulate loading
   const timer = setTimeout(() => setLoading(false), 500);
   return () => clearTimeout(timer);
 }, []);


 const displayKpis = useMemo(() => {
   if (currency === 'INR') {
     return kpis;
   }
   const converted = { ...kpis };
   const currencyKeys = [
     'live_mrr', 'live_mrr_target',
     'live_arr', 'live_arr_target',
     'new_business_mrr', 'new_business_mrr_target',
     'expansion_mrr', 'expansion_mrr_target',
     'decrease_mrr', 'decrease_mrr_target',
     'churn_mrr', 'churn_mrr_target',
     'arpa', 'arpa_target'
   ];
   currencyKeys.forEach(key => {
       if (converted[key] !== undefined && converted[key] !== null) {
           converted[key] = converted[key] / USD_TO_INR_RATE;
       }
   });
   return converted;
 }, [currency]);


 const displayMonthlyChanges = useMemo(() => {
   // Assuming monthlyChangesData is in INR by default, and we convert to USD if currency is not INR
   // This implies that if currency is USD, the input data (INR) needs to be converted.
   // If there were other currencies, a more robust conversion system would be needed.
   // For this change, we assume `INR` is the base currency for `monthlyChangesData`
   // and `USD` is the only other possible currency for conversion using the `USD_TO_INR_RATE`.
   if (currency === 'INR') {
     return monthlyChangesData;
   }
   return monthlyChangesData.map(item => ({
     ...item,
     newBusiness: item.newBusiness / USD_TO_INR_RATE,
     expansion: item.expansion / USD_TO_INR_RATE,
     decrease: item.decrease / USD_TO_INR_RATE,
     churn: item.churn / USD_TO_INR_RATE,
   }));
 }, [currency]);

 const displayChurnData = useMemo(() => {
   // Transform churn data to match the expected format for RevenueTrendChart
   return churnData.map(item => ({
     month: item.Month,
     churnBrandCount: item["Brand count"]
   }));
 }, []);

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
         <p className="text-navy-700 font-semibold text-lg"></p>
       </div>
      
       <div className="flex gap-3">
         <Button className="gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl border-2 border-navy-800">
           <Download className="w-4 h-4" />
           Export Analysis
         </Button>
       </div>
     </div>


     {/* Revenue Overview Cards */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <MetricCard title="Live MRR" value={displayKpis.live_mrr} target={displayKpis.live_mrr_target} change={displayKpis.live_mrr_change} format="currency" currency={currency} loading={loading} />
       <MetricCard title="Live ARR"  value={displayKpis.live_arr} target={displayKpis.live_arr_target} change={displayKpis.live_arr_change} format="currency" currency={currency} loading={loading} />
       <MetricCard title="Live Customers" value={displayKpis.live_clients} target={displayKpis.live_clients_target} change={displayKpis.live_clients_change} format="number" loading={loading} />
     </div>


     {/* Client Metrics */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <MetricCard title="New Business MRR" value={displayKpis.new_business_mrr} target={displayKpis.new_business_mrr_target} change={displayKpis.new_business_mrr_change} format="currency" currency={currency} loading={loading} />
       <MetricCard title="Expansion MRR" value={displayKpis.expansion_mrr} target={displayKpis.expansion_mrr_target} change={displayKpis.expansion_mrr_change} format="currency" currency={currency} loading={loading} />
       <MetricCard title="Decrease MRR" value={displayKpis.decrease_mrr} target={displayKpis.decrease_mrr_target} change={displayKpis.decrease_mrr_change} format="currency" currency={currency} loading={loading} />
     </div>


     {/* Additional Metrics */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <MetricCard title="Churn MRR" value={displayKpis.churn_mrr} target={displayKpis.churn_mrr_target} change={displayKpis.churn_mrr_change} format="currency" currency={currency} loading={loading} isInverse={true} />
       <MetricCard
           title="Monthly ARPA"
           tooltipText="Average Revenue Per Account"
           value={displayKpis.arpa}
           target={displayKpis.arpa_target}
           change={displayKpis.arpa_change}
           format="currency"
           currency={currency}
           loading={loading}
       />
       <MetricCard title="Gross Margin %" value={displayKpis.gm_percent} target={displayKpis.gm_percent_target} change={displayKpis.gm_percent_change} format="percentage" loading={loading} />
       <MetricCard title="EBITDA %" value={displayKpis.ebitda_percent} target={displayKpis.ebitda_percent_target} change={displayKpis.ebitda_percent_change} format="percentage" loading={loading} />
     </div>


     <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <RevenueTrendChart
         title="New Business ARR"
         data={displayMonthlyChanges}
         dataKey="newBusiness"
         color="#10b981"
         currency={currency}
       />
       <RevenueTrendChart
         title="Expansion ARR"
         data={displayMonthlyChanges}
         dataKey="expansion"
         color="#3b82f6"
         currency={currency}
       />
       <RevenueTrendChart
         title="Decrease ARR"
         data={displayMonthlyChanges}
         dataKey="decrease"
         color="#f97316"
         currency={currency}
       />
       <RevenueTrendChart
         title="Churn ARR"
         data={displayMonthlyChanges}
         dataKey="churn"
         color="#ef4444"
         currency={currency}
       />
       <RevenueTrendChart
         title="Churn Brand Count"
         data={displayChurnData}
         dataKey="churnBrandCount"
         color="#dc2626"
         currency={null}
         isCount={true}
       />
     </section>
   </div>
 );
}
