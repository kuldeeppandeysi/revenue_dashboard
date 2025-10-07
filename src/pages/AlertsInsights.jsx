import React, { useState, useEffect } from "react";
import { Alert } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Bell, 
  Settings,
  Search,
  Filter,
  CheckCircle,
  X,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

import InsightCard from "../components/insights/InsightCard";

export default function AlertsInsights() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsData = await Alert.list("-created_date", 50);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Alert ${alertId}: ${action}`);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
    const matchesSearch = alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "text-red-600 bg-red-50 border-red-200";
      case "High": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Medium": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Low": return "text-slate-600 bg-slate-50 border-slate-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "Critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "High": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Medium": return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "Low": return <Eye className="w-4 h-4 text-slate-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  // Generate AI insights
  const generateInsights = () => [
    {
      title: "Revenue Growth Acceleration",
      description: "MRR growth rate increased 15% in the last 30 days, primarily driven by Enterprise segment expansion.",
      impact: "+$240K projected quarterly impact",
      severity: "low",
      category: "Revenue",
      trend: "up",
      actionable: true
    },
    {
      title: "Customer Health Decline",
      description: "5 Enterprise accounts showing decreased feature usage and support ticket increases.",
      impact: "Risk: $180K ARR",
      severity: "high",
      category: "Retention",
      trend: "down",
      actionable: true
    },
    {
      title: "Product Adoption Success",
      description: "New workflow feature achieved 75% adoption rate among target segments within first month.",
      impact: "Strong product-market fit indicator",
      severity: "low",
      category: "Product",
      trend: "up",
      actionable: false
    },
    {
      title: "Sales Velocity Improvement",
      description: "Average deal closing time decreased by 18% in Q4, indicating improved sales process efficiency.",
      impact: "Pipeline acceleration",
      severity: "medium",
      category: "Sales",
      trend: "up",
      actionable: true
    }
  ];

  const insights = generateInsights();

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Alerts & Insights</h1>
          <p className="text-navy-700 font-semibold text-lg">Monitor critical business metrics and AI-powered insights</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-500" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-2 border-navy-300 text-navy-800 font-medium"
            />
          </div>
          <Button variant="outline" className="gap-2 border-2 border-navy-300 text-navy-700 hover:bg-navy-50 font-bold rounded-xl">
            <Settings className="w-4 h-4" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700">Critical Alerts</p>
                <p className="text-3xl font-black text-red-900">
                  {alerts.filter(a => a.severity === "Critical").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700">High Priority</p>
                <p className="text-3xl font-black text-amber-900">
                  {alerts.filter(a => a.severity === "High").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700">Medium Priority</p>
                <p className="text-3xl font-black text-blue-900">
                  {alerts.filter(a => a.severity === "Medium").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-300 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700">Resolved Today</p>
                <p className="text-3xl font-black text-emerald-900">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="bg-white border-2 border-navy-300 rounded-xl p-1">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">Active Alerts</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">AI Insights</TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex gap-3">
            <Button 
              variant={selectedSeverity === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity("all")}
              className={selectedSeverity === "all" ? "bg-navy-800 text-white" : ""}
            >
              All
            </Button>
            {["Critical", "High", "Medium", "Low"].map(severity => (
              <Button
                key={severity}
                variant={selectedSeverity === severity ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity(severity)}
                className={selectedSeverity === severity ? "bg-navy-800 text-white" : ""}
              >
                {severity}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 border rounded-xl transition-all duration-200 hover:shadow-md ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{alert.title}</h3>
                          <Badge variant="outline">{alert.category}</Badge>
                          <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-80 mb-3">
                          {alert.description}
                        </p>
                        {alert.metric_name && (
                          <div className="text-xs opacity-70">
                            Metric: {alert.metric_name} | 
                            Threshold: {alert.threshold_value} | 
                            Actual: {alert.actual_value}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, "investigate")}
                      >
                        Investigate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, "resolve")}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, "dismiss")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
                    <p className="text-slate-600">No active alerts match your current filters.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    title={insight.title}
                    description={insight.description}
                    impact={insight.impact}
                    severity={insight.severity}
                    category={insight.category}
                    trend={insight.trend}
                    actionable={insight.actionable}
                    onAction={() => console.log(`Action for insight: ${insight.title}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Revenue Alerts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">MRR Growth less than 5%</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">NRR less than 100%</span>
                        <Badge className="bg-red-100 text-red-800">Critical</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Churn Rate greater than 3%</span>
                        <Badge variant="outline">Medium</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Customer Health Alerts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Health Score less than 70</span>
                        <Badge className="bg-red-100 text-red-800">Critical</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">NPS less than 30</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Usage Drop greater than 50%</span>
                        <Badge variant="outline">Medium</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="gap-2 bg-navy-800 text-white">
                    <Settings className="w-4 h-4" />
                    Configure New Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}