import Layout from "./Layout.jsx";

import ExecutiveDashboard from "./ExecutiveDashboard";

import RevenueAnalytics from "./RevenueAnalytics";

import AlertsInsights from "./AlertsInsights";

import DataIntegration from "./DataIntegration";

import ProductAnalytics from "./ProductAnalytics";

import CustomerHealth from "./CustomerHealth";

import Account360 from "./Account360";

import RegionalDashboard from "./RegionalDashboard";

import HtmlExport from "./HtmlExport";

import DeveloperDocumentation from "./DeveloperDocumentation";

import DataUploader from "./DataUploader";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    ExecutiveDashboard: ExecutiveDashboard,
    
    RevenueAnalytics: RevenueAnalytics,
    
    AlertsInsights: AlertsInsights,
    
    DataIntegration: DataIntegration,
    
    ProductAnalytics: ProductAnalytics,
    
    CustomerHealth: CustomerHealth,
    
    Account360: Account360,
    
    RegionalDashboard: RegionalDashboard,
    
    HtmlExport: HtmlExport,
    
    DeveloperDocumentation: DeveloperDocumentation,
    
    DataUploader: DataUploader,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<ExecutiveDashboard />} />
                
                
                <Route path="/ExecutiveDashboard" element={<ExecutiveDashboard />} />
                
                <Route path="/RevenueAnalytics" element={<RevenueAnalytics />} />
                
                <Route path="/AlertsInsights" element={<AlertsInsights />} />
                
                <Route path="/DataIntegration" element={<DataIntegration />} />
                
                <Route path="/ProductAnalytics" element={<ProductAnalytics />} />
                
                <Route path="/CustomerHealth" element={<CustomerHealth />} />
                
                <Route path="/Account360" element={<Account360 />} />
                
                <Route path="/RegionalDashboard" element={<RegionalDashboard />} />
                
                <Route path="/HtmlExport" element={<HtmlExport />} />
                
                <Route path="/DeveloperDocumentation" element={<DeveloperDocumentation />} />
                
                <Route path="/DataUploader" element={<DataUploader />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}