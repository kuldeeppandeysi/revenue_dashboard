
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
  isInverse = false, // New prop: true for metrics where increase is bad (like churn)
  color, // color for value
  className = '' // custom class for card
}) {
  const formatValue = (val) => {
    if (loading || val === null || val === undefined) return "—";
    // If the value is a string (like "Integration In Progress"), return it as-is
    if (typeof val === 'string') return val;

    // Custom formatting for large currency values
    if (format === "currency") {
      let absVal = Math.abs(val);
      let symbol = currency === 'INR' ? '₹' : '$';
      let formatted;
      if (absVal >= 1e9) {
        formatted = `${symbol}${(val / 1e9).toFixed(1)}B`;
      } else if (absVal >= 1e6) {
        formatted = `${symbol}${(val / 1e6).toFixed(1)}M`;
      } else if (absVal >= 1e3) {
        formatted = `${symbol}${(val / 1e3).toFixed(1)}K`;
      } else {
        formatted = `${symbol}${val.toLocaleString()}`;
      }
      return formatted;
    }
    if (format === "percentage") {
      return `${val.toFixed(1)}%`;
    }
    if (format === "number") {
      if (Math.abs(val) >= 1e6) {
        return `${(val / 1e6).toFixed(1)}M`;
      } else if (Math.abs(val) >= 1e3) {
        return `${(val / 1e3).toFixed(1)}K`;
      } else {
        return val.toLocaleString();
      }
    }
    return val.toString();
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
      className={className}
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
            <div className={`font-black leading-none tracking-tighter ${
              typeof value === 'string' ? 'text-lg' : 'text-4xl'
            }`} style={color ? { color } : { color: '#0a2540' }}>
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
