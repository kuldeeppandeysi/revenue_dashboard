import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Clipboard } from "lucide-react";

const htmlCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Intelligence Dashboard - HTML Version</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --navy-50: #f8fafc; --navy-100: #f1f5f9; --navy-200: #e2e8f0; --navy-300: #cbd5e1; --navy-400: #94a3b8; --navy-500: #64748b; --navy-600: #475569; --navy-700: #334155; --navy-800: #1e293b; --navy-900: #0f172a;
      --light-blue-50: #f0f9ff; --light-blue-100: #e0f2fe; --light-blue-200: #bae6fd; --light-blue-300: #7dd3fc; --light-blue-400: #38bdf8; --light-blue-500: #0ea5e9; --light-blue-600: #0284c7; --light-blue-700: #0369a1; --light-blue-800: #075985; --light-blue-900: #0c4a6e;
    }
    body { background-color: var(--navy-50); font-family: sans-serif; }
    .active-tab { background-color: var(--navy-800) !important; color: white !important; }
    .inactive-tab { color: var(--navy-800); }
    .inactive-tab:hover { color: var(--navy-900); }
  </style>
</head>
<body>

  <div class="p-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div>
        <h1 class="text-4xl font-black text-[#1e293b] mb-3 tracking-tight">Executive Intelligence (HTML Version)</h1>
        <p class="text-[#475569] text-lg font-medium">AI-powered insights into your SaaS business performance</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <div class="bg-white border-2 border-[#cbd5e1] rounded-xl p-1 shadow-sm flex">
          <button data-range="1M" class="time-range-btn inactive-tab font-bold rounded-lg px-4 py-2 transition-all duration-200">1M</button>
          <button data-range="3M" class="time-range-btn inactive-tab font-bold rounded-lg px-4 py-2 transition-all duration-200">3M</button>
          <button data-range="12M" class="time-range-btn active-tab font-bold rounded-lg px-4 py-2 transition-all duration-200">12M</button>
          <button data-range="YTD" class="time-range-btn inactive-tab font-bold rounded-lg px-4 py-2 transition-all duration-200">YTD</button>
        </div>
        <button class="gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-xl shadow-lg px-4 py-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
          Export Board Pack
        </button>
      </div>
    </div>

    <!-- Metric Cards -->
    <div id="metric-cards-container" class="space-y-6"></div>

    <!-- Metric Trends Section -->
    <div class="border-2 border-[#cbd5e1] bg-white/50 backdrop-blur-sm shadow-lg rounded-lg">
      <div class="p-6">
        <h2 class="text-2xl font-black text-[#0f172a]">Metric Trends</h2>
      </div>
      <div class="p-6 pt-0">
        <div id="metric-trends-tabs" class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full bg-[#f1f5f9] p-1 rounded-lg">
          <!-- Trend chart tabs will be injected here -->
        </div>
        <div id="metric-trends-chart-container" class="mt-6">
          <canvas id="metricTrendChart"></canvas>
        </div>
      </div>
    </div>
    
     <!-- Charts and Analytics Section -->
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="border-2 border-[#cbd5e1] bg-white backdrop-blur-sm shadow-lg rounded-lg">
            <div class="p-6">
              <h3 class="flex items-center gap-3 text-lg font-black text-[#0f172a]">
                MRR Movement Analysis
              </h3>
            </div>
            <div class="p-6">
                <canvas id="waterfallChart" height="150"></canvas>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <!-- Insights can be added here later -->
        </div>
      </div>

  </div>

  <script src="./data.js"></script>
  <script src="./script.js"></script>
</body>
</html>
`;

const dataJsCode = `
// Simulated data for charts, mirroring the React implementation.
// Data is from March 2024 to July 2025.

const metricData = Array.from({ length: 17 }, (_, i) => {
    const month = (i + 2) % 12 + 1;
    const year = 2024 + Math.floor((i + 2) / 12);
    const date = new Date(year, month, 0); 
    return {
        period: date.toISOString().split('T')[0], // YYYY-MM-DD
        monthLabel: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        live_mrr: 2180000 * Math.pow(1.03, i),
        contracted_mrr: 2250000 * Math.pow(1.028, i),
        live_clients: Math.round(270 * Math.pow(1.025, i)),
        contracted_clients: Math.round(280 * Math.pow(1.023, i)),
        nrr: 115 + i * 0.4 + (Math.sin(i / 3) * 2),
        rule_of_80: 62 + i * 0.8 + (Math.cos(i / 2) * 3),
        gm_percent: 78 + i * 0.2 + (Math.sin(i / 4) * 1.5),
        ebitda_percent: 20 + i * 0.5 + (Math.cos(i / 3) * 2),
        total_headcount: Math.round(380 * Math.pow(1.021, i)),
    };
});

const waterfallData = [
    { category: "Starting MRR", value: 2200000, type: "total" },
    { category: "New Business", value: 180000, type: "positive" },
    { category: "Expansion", value: 120000, type: "positive" },
    { category: "Contraction", value: -45000, type: "negative" },
    { category: "Churn", value: -65000, type: "negative" },
    { category: "Ending MRR", value: 2390000, type: "total" }
];
`;

const scriptJsCode = `
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let timeRange = '12M';
    let activeTrendTab = 'live_arr';
    let trendChartInstance;
    let waterfallChartInstance;

    // --- DOM ELEMENTS ---
    const metricCardsContainer = document.getElementById('metric-cards-container');
    const timeRangeButtons = document.querySelectorAll('.time-range-btn');
    const trendTabsContainer = document.getElementById('metric-trends-tabs');

    // --- UTILITY FUNCTIONS ---
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "—";
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            notation: value > 1000000 ? 'compact' : 'standard',
            maximumFractionDigits: 1
        }).format(value);
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined) return "—";
        return new Intl.NumberFormat('en-US', {
            notation: value > 1000000 ? 'compact' : 'standard',
            maximumFractionDigits: 1
        }).format(value);
    };

    const formatPercentage = (value) => \`\${(value || 0).toFixed(1)}%\`;

    const getTrendIcon = (change) => {
        if (change === null || change === undefined) return '';
        const color = change >= 0 ? '#10b981' : '#ef4444';
        const path = change >= 0 ? 'M17 7L7 17l-4-4' : 'M17 17L7 7l4 4';
        return \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="\${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="\${path}"></path></svg>\`;
    };

    // --- COMPONENT-LIKE FUNCTIONS (returning HTML strings) ---
    function createMetricCardHTML(title, value, change, format, period = "MoM") {
        const formattedValue = format === 'currency' ? formatCurrency(value) : (format === 'percentage' ? formatPercentage(value) : formatNumber(value));
        return \`
            <div class="border-2 border-[#cbd5e1] bg-white backdrop-blur-sm group rounded-lg p-4 shadow">
                <div class="text-xs font-black text-[#475569] uppercase tracking-widest mb-4">\${title}</div>
                <div class="text-3xl font-black text-[#0f172a] leading-none tracking-tight mb-4">\${formattedValue}</div>
                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] w-fit">
                    \${getTrendIcon(change)}
                    <span class="text-sm font-bold \${change >= 0 ? 'text-emerald-700' : 'text-red-700'}">
                        \${change >= 0 ? '+' : ''}\${change.toFixed(1)}%
                    </span>
                    <span class="text-xs text-[#475569] font-bold">\${period}</span>
                </div>
            </div>\`;
    }

    // --- CHART RENDERING FUNCTIONS ---
    function renderWaterfallChart(data) {
        const ctx = document.getElementById('waterfallChart').getContext('2d');
        if (waterfallChartInstance) waterfallChartInstance.destroy();

        const chartData = {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.type === 'total' ? '#0ea5e9' : (d.value >= 0 ? '#10b981' : '#ef4444')),
                borderRadius: 4
            }]
        };

        waterfallChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { callback: (value) => \`$\${Math.abs(value / 1000)}K\` } }
                }
            }
        });
    }

    function renderTrendChart(chartConfig, data) {
        const ctx = document.getElementById('metricTrendChart').getContext('2d');
        if (trendChartInstance) trendChartInstance.destroy();
        
        const chartData = {
            labels: data.map(d => d.monthLabel),
            datasets: [{
                label: chartConfig.title,
                data: data.map(d => d[chartConfig.dataKey]),
                borderColor: chartConfig.color || '#0ea5e9',
                backgroundColor: chartConfig.color || '#0ea5e-9',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        };

        trendChartInstance = new Chart(ctx, {
            type: chartConfig.type,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { callback: (value) => chartConfig.format(value) } }
                }
            }
        });
    }

    // --- MAIN RENDER FUNCTION ---
    function renderDashboard() {
        // Render Metric Cards
        const cardsHTML = \`
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                \${createMetricCardHTML("Live MRR", 2390000, 8.2, 'currency')}
                \${createMetricCardHTML("Contracted MRR", 2650000, 5.8, 'currency')}
                \${createMetricCardHTML("Live ARR", 28680000, 12.5, 'currency')}
                \${createMetricCardHTML("Contracted ARR", 31800000, 8.9, 'currency')}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                \${createMetricCardHTML("Live Clients", 285, 3.2, 'number')}
                \${createMetricCardHTML("Contracted Clients", 312, 2.8, 'number')}
                \${createMetricCardHTML("Average Health Score", 84, -1.5, 'number')}
                \${createMetricCardHTML("NRR", 118, 2.1, 'percentage')}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                \${createMetricCardHTML("Rule of 80", 68.5, 5.2, 'percentage')}
                \${createMetricCardHTML("Gross Margin %", 82.3, 3.1, 'percentage')}
                \${createMetricCardHTML("EBITDA %", 28.7, 4.2, 'percentage')}
                \${createMetricCardHTML("Total Headcount", 287, 6.8, 'number')}
            </div>\`;
        metricCardsContainer.innerHTML = cardsHTML;

        // Render Waterfall Chart
        renderWaterfallChart(waterfallData);

        // Render Trend Chart Section
        const processDataForTimeRange = (data, range) => {
            const now = new Date('2025-08-01');
            let startDate = new Date(now);
            switch(range) {
                case '1M': startDate.setMonth(now.getMonth() - 1); break;
                case '3M': startDate.setMonth(now.getMonth() - 3); break;
                case '12M': startDate.setMonth(now.getMonth() - 12); break;
                case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); break;
                default: startDate.setMonth(now.getMonth() - 12);
            }
            return data.filter(d => new Date(d.period) >= startDate && new Date(d.period) <= now);
        };
        
        const chartData = processDataForTimeRange(metricData, timeRange);
        
        const chartConfigs = {
            live_arr: { title: 'Live ARR', dataKey: 'live_arr', type: 'line', format: formatCurrency, postProcess: v => v*12 },
            contracted_arr: { title: 'Contracted ARR', dataKey: 'contracted_arr', type: 'line', format: formatCurrency, postProcess: v => v*12 },
            live_clients: { title: '# Live Clients', dataKey: 'live_clients', type: 'bar', format: formatNumber },
            contracted_clients: { title: '# Contracted Clients', dataKey: 'contracted_clients', type: 'bar', format: formatNumber },
            nrr: { title: 'NRR', dataKey: 'nrr', type: 'line', format: formatPercentage },
            rule_of_80: { title: 'Rule of 80', dataKey: 'rule_of_80', type: 'bar', format: formatPercentage },
            gm_percent: { title: 'GM %', dataKey: 'gm_percent', type: 'line', format: formatPercentage },
            ebitda_percent: { title: 'EBITDA %', dataKey: 'ebitda_percent', type: 'line', format: formatPercentage },
            total_headcount: { title: 'Total Headcount', dataKey: 'total_headcount', type: 'bar', format: formatNumber }
        };
        
        // Post-process data for charts
        const processedChartData = chartData.map(d => ({
            ...d,
            live_arr: d.live_mrr * 12,
            contracted_arr: d.contracted_mrr * 12
        }));

        trendTabsContainer.innerHTML = Object.keys(chartConfigs).map(key => \`
            <button data-key="\${key}" class="trend-tab-btn text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=inactive]:text-[#475569] rounded-md py-2 px-1 \${activeTrendTab === key ? 'bg-white shadow-md' : 'text-[#475569]'}">
                \${chartConfigs[key].title}
            </button>
        \`).join('');
        
        document.querySelectorAll('.trend-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                activeTrendTab = e.currentTarget.dataset.key;
                renderDashboard();
            });
        });

        renderTrendChart(chartConfigs[activeTrendTab], processedChartData);
    }

    // --- EVENT LISTENERS ---
    timeRangeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeRange = button.dataset.range;
            timeRangeButtons.forEach(btn => btn.classList.remove('active-tab'));
            button.classList.add('active-tab');
            renderDashboard();
        });
    });

    // --- INITIAL RENDER ---
    renderDashboard();
});
`;

export default function HtmlExport() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text.trim());
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ title, filename, code, type }) => (
    <Card className="shadow-lg border-navy-200">
      <CardHeader className="flex flex-row items-center justify-between bg-navy-50/50">
        <div>
          <CardTitle className="text-navy-900">{title}</CardTitle>
          <CardDescription>Save this content as <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">{filename}</code></CardDescription>
        </div>
        <Button size="sm" onClick={() => copyToClipboard(code, type)} className="bg-navy-800 hover:bg-navy-700 text-white">
          {copied === type ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
          <span className="ml-2">{copied === type ? 'Copied!' : 'Copy Code'}</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="bg-navy-900/95 text-white p-4 rounded-b-md overflow-x-auto text-sm max-h-96">
          <code className="font-mono">{code.trim()}</code>
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-navy-50 via-white to-light-blue-50/20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-navy-800 mb-3 tracking-tight">HTML/JS Export</h1>
        <p className="text-lg text-navy-600 mb-8">
          The platform cannot create HTML/JS files directly. Please follow these steps for your fallback version:
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-8 bg-light-blue-50 border-l-4 border-light-blue-400 p-6 rounded-lg text-navy-700">
            <li>Create a new folder on your computer named <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">html_dashboard</code>.</li>
            <li>Copy the code from the 'HTML File' block and save it as <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">index.html</code> inside that folder.</li>
            <li>Copy the code from the 'JavaScript Data' block and save it as <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">data.js</code>.</li>
            <li>Copy the code from the 'Core JavaScript Logic' block and save it as <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">script.js</code>.</li>
            <li>Open the <code className="font-mono bg-navy-200 text-navy-800 px-1 py-0.5 rounded">index.html</code> file in your web browser.</li>
        </ol>
        
        <div className="space-y-6">
          <CodeBlock title="1. HTML File" filename="index.html" code={htmlCode} type="html" />
          <CodeBlock title="2. JavaScript Data" filename="data.js" code={dataJsCode} type="data" />
          <CodeBlock title="3. Core JavaScript Logic" filename="script.js" code={scriptJsCode} type="script" />
        </div>
      </div>
    </div>
  );
}