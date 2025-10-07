import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, Share2, Database, Layers } from "lucide-react";

const CodeBlock = ({ code }) => (
  <pre className="bg-navy-800 text-white p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <code>{code.trim()}</code>
  </pre>
);

export default function DeveloperDocumentation() {
  return (
    <div className="p-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-navy-900 mb-3 tracking-tight">Developer Documentation</h1>
          <p className="text-lg text-navy-600 font-medium">How to connect your backend data to the dashboard metric cards.</p>
        </header>

        <div className="space-y-12">

          <Card className="shadow-lg border-2 border-navy-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-light-blue-600"/>
                Understanding the Data Flow
              </CardTitle>
              <CardDescription>
                Data flows in one direction: from your backend, into the platform's database (as Entities), and then to the React frontend components.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-navy-800 rounded-lg text-white">
                    <strong className="block">1. Your Backend</strong>
                    <span className="text-xs text-navy-300">Populates the data</span>
                  </div>
                </div>
                <div className="text-navy-400 font-bold text-2xl">→</div>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-light-blue-100 rounded-lg text-light-blue-900 border-2 border-light-blue-200">
                    <strong className="block">2. Base44 Entities (Database)</strong>
                    <span className="text-xs">Stores the structured data</span>
                  </div>
                </div>
                <div className="text-navy-400 font-bold text-2xl">→</div>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-navy-200">
                     <strong className="block text-navy-900">3. React Dashboard Page</strong>
                    <span className="text-xs text-navy-600">Fetches data via SDK</span>
                  </div>
                </div>
                <div className="text-navy-400 font-bold text-2xl">→</div>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-navy-200">
                    <strong className="block text-navy-900">4. MetricCard Component</strong>
                    <span className="text-xs text-navy-600">Receives data via props</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-2 border-navy-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-6 h-6 text-light-blue-600"/>
                Step 1: The Data Model (Entities)
              </CardTitle>
              <CardDescription>
                Your backend's primary responsibility is to populate the <strong>Metric</strong> and <strong>Account</strong> entities. These entities define the "contract" for what data the frontend expects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-bold text-navy-800 mb-2">Metric Entity Fields:</h4>
                <p className="text-sm text-navy-600 mb-3">Your backend should push records with this structure into the `Metric` entity. Key fields for the dashboard cards are:</p>
                <CodeBlock code={`
{
  "metric_name": "MRR", // String: The unique name of the metric
  "period": "2024-07-31", // String (Date): The date for this data point
  "value": 2390000,     // Number: The primary value of the metric
  "target": 2500000,    // Number: The target value for comparison
  "mom_change_pct": 8.2 // Number: The Month-over-Month change percentage
}
                `} />
              </div>
              <div>
                <h4 className="font-bold text-navy-800 mb-2">Account Entity Fields:</h4>
                <p className="text-sm text-navy-600 mb-3">For metrics like "Accounts at Risk" or "Average Health Score," the data is derived from the `Account` entity.</p>
                <CodeBlock code={`
{
  "name": "Example Corp",      // String: Account name
  "health_score": 84,         // Number: Score from 0-100
  "lifecycle_stage": "Active" // String: e.g., "Active", "At Risk"
}
                `} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-navy-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Code className="w-6 h-6 text-light-blue-600"/>
                Step 2: How the Frontend Fetches Data
              </CardTitle>
              <CardDescription>
                Inside the `ExecutiveDashboard.jsx` page, the `useEffect` and `loadDashboardData` functions use the platform's SDK to fetch the data your backend has provided.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`
// In pages/ExecutiveDashboard.jsx

useEffect(() => {
  loadDashboardData();
}, [/* dependencies */]);

const loadDashboardData = async () => {
  setLoading(true);
  try {
    // The frontend fetches the latest 50 metric records
    const metricsData = await Metric.list("-period", 50);
    
    // It also fetches the latest 100 account records
    const accountsData = await Account.list("-created_date", 100);

    // This data is then stored in the component's state
    setMetrics(metricsData);
    setAccounts(accountsData);

  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    setLoading(false);
  }
};
              `} />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-navy-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-light-blue-600"/>
                Step 3: Populating the MetricCard Component
              </CardTitle>
              <CardDescription>
                The fetched data is passed into `MetricCard` components via "props". Below is the API for the component.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <h4 className="font-bold text-navy-800 mb-3">MetricCard Props API:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="p-3 text-left font-bold text-navy-700">Prop</th>
                          <th className="p-3 text-left font-bold text-navy-700">Type</th>
                          <th className="p-3 text-left font-bold text-navy-700">Description</th>
                          <th className="p-3 text-left font-bold text-navy-700">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-200">
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">title</td><td className="p-3">String</td><td className="p-3">The main title of the card.</td><td className="p-3 font-mono">"Live MRR"</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">value</td><td className="p-3">Number</td><td className="p-3">The primary metric value to display.</td><td className="p-3 font-mono">2390000</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">target</td><td className="p-3">Number</td><td className="p-3">(Optional) The target value for comparison.</td><td className="p-3 font-mono">2500000</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">change</td><td className="p-3">Number</td><td className="p-3">(Optional) The percentage change (e.g., MoM).</td><td className="p-3 font-mono">8.2</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">format</td><td className="p-3">String</td><td className="p-3">How to format the value: 'currency', 'percentage', or 'number'.</td><td className="p-3 font-mono">'currency'</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">status</td><td className="p-3">String</td><td className="p-3">Determines the card's color scheme: 'excellent', 'good', 'warning', 'critical'.</td><td className="p-3 font-mono">'good'</td></tr>
                        <tr className="hover:bg-navy-50"><td className="p-3 font-mono text-light-blue-700">loading</td><td className="p-3">Boolean</td><td className="p-3">Shows a loading skeleton if true.</td><td className="p-3 font-mono">false</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                 <div>
                    <h4 className="font-bold text-navy-800 mb-2">Example Usage in Code:</h4>
                    <CodeBlock code={`
// In pages/ExecutiveDashboard.jsx

// Helper function to find the specific metric from the fetched data
const getCurrentMetricValue = (metricName) => {
  const metric = metrics.find(m => m.metric_name === metricName);
  return metric ? metric.value : null;
};

// ... inside the return() statement ...
<MetricCard
  title="Live MRR"
  value={getCurrentMetricValue("MRR")}
  target={2500000} // This could also come from the metric data
  change={getMetricChange("MRR")}
  format="currency"
  status={getMetricStatus("MRR", getCurrentMetricValue("MRR"), 2500000)}
  loading={loading}
/>
`} />
                  </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}