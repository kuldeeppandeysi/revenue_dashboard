import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Account, SupportTicket, Opportunity, Alert, Playbook } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MetricCard from "../components/metrics/MetricCard";
import TrendChart from "../components/charts/TrendChart";
import PlaybookViewer from "../components/csm/PlaybookViewer";
import { format } from "date-fns";
import { User, Activity, LifeBuoy, DollarSign, Zap, Phone, Mail, AlertTriangle } from "lucide-react";

export default function Account360() {
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accountId = params.get("id");
    if (accountId) {
      fetchData(accountId);
    }
  }, [location.search]);

  const fetchData = async (accountId) => {
    setLoading(true);
    try {
      const [
        accountData,
        ticketsData,
        opportunitiesData,
        alertsData,
        playbooksData
      ] = await Promise.all([
        Account.get(accountId),
        SupportTicket.filter({ account_name: (await Account.get(accountId)).name }),
        Opportunity.filter({ account_name: (await Account.get(accountId)).name }),
        Alert.filter({ account_id: accountId }),
        Playbook.list()
      ]);
      setAccount(accountData);
      setTickets(ticketsData);
      setOpportunities(opportunitiesData);
      setAlerts(alertsData);
      setPlaybooks(playbooksData);
    } catch (err) {
      console.error("Failed to load account data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenPlaybook = (playbookId) => {
    const playbook = playbooks.find(p => p.id === playbookId);
    setSelectedPlaybook(playbook);
    setIsPlaybookOpen(true);
  };

  const usageData = [
    { period: 'Jan', value: 450 }, { period: 'Feb', value: 480 },
    { period: 'Mar', value: 520 }, { period: 'Apr', value: 510 },
    { period: 'May', value: 550 }, { period: 'Jun', value: 580 },
  ];

  if (loading) return <div className="p-6">Loading account details...</div>;
  if (!account) return <div className="p-6">Account not found.</div>;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{account.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{account.segment}</Badge>
                <Badge variant="outline">{account.plan_tier}</Badge>
                <span className="text-sm text-slate-500">CSM: {account.csm_owner}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Phone className="w-4 h-4 mr-2" /> Call</Button>
              <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Email</Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Health Score" value={account.health_score} status={account.health_score > 70 ? 'good' : 'warning'} />
        <MetricCard title="MRR" value={account.mrr} format="currency" />
        <MetricCard title="Seat Utilization" value={(account.active_seats / account.seats) * 100} format="percentage" />
        <MetricCard title="Renewal Date" value={format(new Date(account.contract_renewal_date), "MMM d, yyyy")} format="string" />
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertTriangle /> Active Alerts & Playbooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                </div>
                {alert.playbook_id && (
                  <Button size="sm" onClick={() => handleOpenPlaybook(alert.playbook_id)}>
                    <Zap className="w-4 h-4 mr-2" />
                    View Playbook
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage"><Activity className="w-4 h-4 mr-2" />Usage</TabsTrigger>
          <TabsTrigger value="support"><LifeBuoy className="w-4 h-4 mr-2" />Support</TabsTrigger>
          <TabsTrigger value="finance"><DollarSign className="w-4 h-4 mr-2" />Finance</TabsTrigger>
        </TabsList>
        <TabsContent value="usage" className="mt-6">
          <TrendChart title="User Activity Trend (last 6 months)" data={usageData} dataKey="value" />
        </TabsContent>
        <TabsContent value="support" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Recent Support Tickets</CardTitle></CardHeader>
            <CardContent>
              {tickets.map(ticket => (
                <div key={ticket.id} className="mb-2 p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{ticket.subject}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <Badge variant={ticket.status === 'Resolved' ? 'default' : 'outline'}>{ticket.status}</Badge>
                    <span>Priority: {ticket.priority}</span>
                    <span>Created: {format(new Date(ticket.created_at), 'PPP')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="finance" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Opportunities</CardTitle></CardHeader>
            <CardContent>
              {opportunities.map(opp => (
                <div key={opp.id} className="mb-2 p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{opp.opportunity_name}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <Badge>{opp.stage}</Badge>
                    <span>Amount: ${opp.amount.toLocaleString()}</span>
                    <span>Close Date: {format(new Date(opp.expected_close_date), 'PPP')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PlaybookViewer open={isPlaybookOpen} setOpen={setIsPlaybookOpen} playbook={selectedPlaybook} />
    </div>
  );
}