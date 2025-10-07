
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Upload, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";

export default function DataIntegration() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      // Simulate upload process
      setTimeout(() => {
        setUploading(false);
        console.log("File uploaded:", file.name);
      }, 3000);
    }
  };

  const connectorStatus = [
    { name: "HubSpot CRM", status: "connected", lastSync: "2 minutes ago", records: "15,234" },
    { name: "Freshdesk Support", status: "connected", lastSync: "5 minutes ago", records: "3,456" },
    { name: "SingleInterface DB", status: "connected", lastSync: "1 minute ago", records: "48,721" },
    { name: "Cloud Telephony", status: "error", lastSync: "2 hours ago", records: "1,234" },
    { name: "Stripe Billing", status: "configured", lastSync: "Never", records: "0" }
  ];

  const recentUploads = [
    { name: "customer_data_q4.csv", status: "processed", records: 1250, date: "2024-01-15" },
    { name: "revenue_metrics.xlsx", status: "processing", records: 0, date: "2024-01-15" },
    { name: "support_tickets.csv", status: "processed", records: 892, date: "2024-01-14" },
    { name: "user_events.json", status: "error", records: 0, date: "2024-01-14" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "connected": return "bg-emerald-100 text-emerald-800";
      case "configured": return "bg-blue-100 text-blue-800";
      case "error": return "bg-red-100 text-red-800";
      case "processing": return "bg-amber-100 text-amber-800";
      case "processed": return "bg-emerald-100 text-emerald-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
      case "processed":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "configured":
        return <Settings className="w-4 h-4 text-blue-600" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Data Integration</h1>
          <p className="text-navy-700 font-semibold text-lg">Manage data sources, connectors, and import workflows</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-2 border-navy-300 text-navy-700 hover:bg-navy-50 font-bold rounded-xl">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
          <Button className="gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl border-2 border-navy-800">
            <Plus className="w-4 h-4" />
            Add Connector
          </Button>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-emerald-300 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700">Active Connectors</p>
                <p className="text-3xl font-black text-emerald-900">3</p>
              </div>
              <Database className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700">Total Records</p>
                <p className="text-3xl font-black text-blue-900">68.6K</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700">Last Sync</p>
                <p className="text-3xl font-black text-amber-900">1m</p>
              </div>
              <RefreshCw className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700">Errors</p>
                <p className="text-3xl font-black text-red-900">1</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connectors" className="space-y-6">
        <TabsList className="bg-white border-2 border-navy-300 rounded-xl p-1">
          <TabsTrigger value="connectors" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">Data Connectors</TabsTrigger>
          <TabsTrigger value="uploads" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">File Uploads</TabsTrigger>
          <TabsTrigger value="schema" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">Data Schema</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-navy-800 data-[state=active]:text-white text-navy-700 font-bold rounded-lg">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connectors" className="space-y-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Connected Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectorStatus.map((connector, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{connector.name}</h3>
                        <p className="text-sm text-slate-600">
                          Last sync: {connector.lastSync} • {connector.records} records
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(connector.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(connector.status)}
                          {connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}
                        </div>
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Upload Data Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Drop files here</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Support for CSV, Excel, JSON formats
                    </p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload').click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Browse Files
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUploads.map((upload, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">{upload.name}</h4>
                        <p className="text-xs text-slate-600">
                          {upload.date} • {upload.records > 0 ? `${upload.records} records` : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(upload.status)}>
                          {getStatusIcon(upload.status)}
                          {upload.status}
                        </Badge>
                        {upload.status === "processed" && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Schema Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Core Entities</h3>
                    <div className="space-y-2">
                      {["Accounts", "Metrics", "Opportunities", "Support Tickets", "Alerts"].map(entity => (
                        <div key={entity} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="text-sm font-medium">{entity}</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Data Quality</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completeness</span>
                        <Badge className="bg-emerald-100 text-emerald-800">98.5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Accuracy</span>
                        <Badge className="bg-emerald-100 text-emerald-800">96.2%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Freshness</span>
                        <Badge className="bg-green-100 text-green-800">99.1%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Consistency</span>
                        <Badge className="bg-amber-100 text-amber-800">94.7%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Synchronization Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2024-01-15 14:32", source: "HubSpot", status: "success", message: "Synchronized 245 contact records" },
                  { time: "2024-01-15 14:30", source: "Freshdesk", status: "success", message: "Synchronized 18 support tickets" },
                  { time: "2024-01-15 14:25", source: "SingleInterface DB", status: "success", message: "Synchronized 1,234 event records" },
                  { time: "2024-01-15 12:15", source: "Cloud Telephony", status: "error", message: "Authentication failed - API key expired" },
                  { time: "2024-01-15 11:45", source: "CSV Upload", status: "success", message: "Processed customer_data_q4.csv - 1,250 records" }
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="text-xs text-slate-500 font-mono">{log.time}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{log.source}</span>
                      <span className="text-sm text-slate-600 ml-2">{log.message}</span>
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
