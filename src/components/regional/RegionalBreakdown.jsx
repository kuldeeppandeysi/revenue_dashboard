import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function RegionalBreakdown({ 
  title = "Regional Performance", 
  data = [], 
  metric = "mrr_usd", 
  onDrillDown,
  showTrend = true 
}) {
  const formatValue = (value, format = "currency") => {
    if (format === "currency") {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    if (format === "percentage") {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const getTrendIcon = (change) => {
    if (!change) return null;
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-emerald-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const regionColors = {
    "IN": "border-l-4 border-emerald-500 bg-emerald-50/30",
    "SEA": "border-l-4 border-light-blue-500 bg-light-blue-50/30"
  };

  return (
    <Card className="border-navy-200 bg-gradient-to-br from-white to-navy-50/30 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-navy-800 font-black">
          <div className="w-8 h-8 bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.region_code || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer ${
              regionColors[item.region_code] || "border-l-4 border-slate-300 bg-slate-50/30"
            }`}
            onClick={() => onDrillDown?.(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-navy-800">
                    {item.region_name || item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-navy-600">
                      {item.account_count} accounts
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-black text-navy-800 text-xl">
                  {formatValue(item[metric])}
                </div>
                {showTrend && item.mom_change && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    {getTrendIcon(item.mom_change)}
                    <span className={`text-sm font-bold ${
                      item.mom_change >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.mom_change > 0 ? '+' : ''}{item.mom_change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {onDrillDown && (
              <div className="mt-3 pt-3 border-t border-navy-200/50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-light-blue-600 hover:text-light-blue-700 hover:bg-light-blue-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}