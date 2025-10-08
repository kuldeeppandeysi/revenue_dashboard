
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricCard({ 
  title, 
  value, 
  target, 
  change, 
  period = "MoM",
  status,
  loading = false,
  format = "number",
  currency = "USD", // New prop
  categoryIcon: CategoryIcon, // New prop for icon
  isInverse = false // New prop: true for metrics where increase is bad (like churn)
}) {
  const formatValue = (val) => {
    if (loading || val === null || val === undefined) return "—";
    
    // If the value is a string (like "Integration In Progress"), return it as-is
    if (typeof val === 'string') return val;
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: currency,
          notation: 'compact',
          maximumFractionDigits: 1,
          minimumFractionDigits: 1
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1,
          minimumFractionDigits: 1
        }).format(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    if (change === null || change === undefined) return null;
    
    // For inverse metrics (like churn), flip the logic
    const isPositiveTrend = isInverse ? change <= 0 : change >= 0;
    
    return isPositiveTrend ? 
      <TrendingUp className="w-4 h-4 text-emerald-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-navy-200 bg-white group">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {CategoryIcon && <CategoryIcon className="w-4 h-4 text-navy-500" />}
            <div className="text-sm font-bold text-navy-600 uppercase tracking-wider">
              {title}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-end justify-between gap-4">
            <div className={`font-black text-navy-900 leading-none tracking-tighter ${
              typeof value === 'string' ? 'text-lg' : 'text-4xl'
            }`}>
              {loading ? (
                <div className="animate-pulse bg-navy-200 h-9 w-24 rounded-lg" />
              ) : (
                formatValue(value)
              )}
            </div>
            
            {change !== null && change !== undefined && !loading && (
              <div className="flex items-center gap-1.5 pb-1">
                {getTrendIcon()}
                <span className={`text-base font-bold ${
                  isInverse ? 
                    (change <= 0 ? 'text-emerald-700' : 'text-red-700') :
                    (change >= 0 ? 'text-emerald-700' : 'text-red-700')
                }`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-navy-500 font-bold">{period}</span>
              </div>
            )}
          </div>
          {target !== undefined && target !== null && !loading && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-navy-500 font-bold">
              <Target className="w-3 h-3" />
              <span>Target: {formatValue(target)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
