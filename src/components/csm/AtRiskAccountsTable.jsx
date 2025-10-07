import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function AtRiskAccountsTable({ accounts = [] }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'health_score', direction: 'ascending' });

  const sortedAccounts = React.useMemo(() => {
    let sortableAccounts = [...accounts];
    if (sortConfig !== null) {
      sortableAccounts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAccounts;
  }, [accounts, sortConfig]);
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') return <ChevronUp className="w-4 h-4 ml-1" />;
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const getHealthBadge = (score) => {
    if (score >= 70) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 50) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  };
  
  const riskReasonText = {
    'usage_cliff': 'Usage Cliff',
    'feature_regression': 'Feature Regression',
    'support_heat': 'Support Heat',
    'under_utilization': 'Under Utilization',
    'billing_risk': 'Billing Risk'
  };

  return (
    <Card className="border-2 border-navy-300 bg-white backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-black text-navy-900">Customer Health Cockpit</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-navy-200">
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer font-bold text-navy-700">
                Account {getSortIcon('name')}
              </TableHead>
              <TableHead onClick={() => requestSort('health_score')} className="cursor-pointer text-center font-bold text-navy-700">
                Health {getSortIcon('health_score')}
              </TableHead>
              <TableHead className="font-bold text-navy-700">Risk Reasons</TableHead>
              <TableHead onClick={() => requestSort('mrr')} className="cursor-pointer text-right font-bold text-navy-700">
                MRR {getSortIcon('mrr')}
              </TableHead>
              <TableHead className="font-bold text-navy-700">Owner</TableHead>
              <TableHead className="text-right font-bold text-navy-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAccounts.map(account => (
              <motion.tr 
                key={account.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="hover:bg-navy-50 border-b border-navy-100"
              >
                <TableCell>
                  <div className="font-bold text-navy-900">{account.name}</div>
                  <div className="text-xs text-navy-600 font-medium">{account.segment}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getHealthBadge(account.health_score)} font-bold text-lg border-2 px-3 py-1`}>
                    {account.health_score}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {account.risk_reasons?.map(reason => (
                      <Badge key={reason} variant="outline" className="text-xs border-2 border-amber-300 bg-amber-50 text-amber-900 font-bold">
                        {riskReasonText[reason] || reason}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-navy-900">
                  ${account.mrr.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium text-navy-700">{account.csm_owner}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(createPageUrl(`Account360?id=${account.id}`))}
                    className="border-2 border-navy-300 text-navy-700 hover:bg-navy-50 font-bold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}