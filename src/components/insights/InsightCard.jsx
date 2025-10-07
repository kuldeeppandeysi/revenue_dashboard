import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightCard({ 
  title, 
  description, 
  impact, 
  severity = "medium",
  category,
  actionable = true,
  onAction,
  trend = "neutral"
}) {
  const getSeverityColor = () => {
    switch (severity) {
      case "high": return "text-red-900 bg-red-50 border-red-300";
      case "medium": return "text-amber-900 bg-amber-50 border-amber-300";
      case "low": return "text-blue-900 bg-blue-50 border-blue-300";
      default: return "text-navy-800 bg-navy-50 border-navy-300";
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case "high": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "medium": return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case "low": return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${getSeverityColor()} border-2 transition-all duration-200 hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getSeverityIcon()}
              <h3 className="font-bold text-sm">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <Badge variant="secondary" className="text-xs font-bold border-2">
                {category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm mb-3 font-medium opacity-90">
            {description}
          </p>
          
          {impact && (
            <div className="mb-3 p-3 bg-white/70 rounded-lg border border-current/20">
              <p className="text-xs font-bold">Impact: {impact}</p>
            </div>
          )}
          
          {actionable && onAction && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAction}
              className="w-full justify-between hover:bg-white/70 font-bold"
            >
              Take Action
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}