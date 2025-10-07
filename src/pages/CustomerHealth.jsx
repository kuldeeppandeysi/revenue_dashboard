import React, { useState, useEffect } from "react";
import { Account } from "@/api/entities";
import MetricCard from "../components/metrics/MetricCard";
import AtRiskAccountsTable from "../components/csm/AtRiskAccountsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

export default function CustomerHealth() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const accountsData = await Account.list();
        setAccounts(accountsData);
      } catch (err) {
        console.error("Failed to load accounts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const atRiskAccounts = accounts.filter(a => a.health_score < 70);
  const atRiskMrr = atRiskAccounts.reduce((sum, acc) => sum + acc.mrr, 0);

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Customer Success Cockpit</h1>
          <p className="text-navy-700 font-semibold text-lg">Monitor and manage your portfolio of Enterprise accounts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-500" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-2 border-navy-300 text-navy-800 font-medium"
            />
          </div>
          <Button variant="outline" className="gap-2 border-2 border-navy-300 text-navy-700 hover:bg-navy-50 font-bold rounded-xl">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="gap-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl border-2 border-navy-800">
            <Download className="w-4 h-4" />
            Export List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Accounts" value={accounts.length} format="number" status="good" loading={loading} />
        <MetricCard title="Avg. Health Score" value={84} change={-1.5} format="number" status="good" loading={loading} />
        <MetricCard title="Accounts at Risk" value={atRiskAccounts.length} format="number" status="warning" loading={loading} />
        <MetricCard title="MRR at Risk" value={atRiskMrr} change={15} format="currency" status="critical" loading={loading} />
      </div>

      <AtRiskAccountsTable accounts={filteredAccounts} />
    </div>
  );
}