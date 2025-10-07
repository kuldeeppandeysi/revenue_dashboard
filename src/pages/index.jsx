import Layout from "./Layout.jsx";
import React, { useState } from 'react';

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
    const [currency, setCurrency] = useState('USD');
    
    return (
        <Layout currentPageName={currentPage} currency={currency} setCurrency={setCurrency}>
            <Routes>            
                
                    <Route path="/" element={<ExecutiveDashboard currency={currency} />} />
                
                
                <Route path="/ExecutiveDashboard" element={<ExecutiveDashboard currency={currency} />} />
                
                <Route path="/RevenueAnalytics" element={<RevenueAnalytics currency={currency} />} />
                
                <Route path="/AlertsInsights" element={<AlertsInsights currency={currency} />} />
                
                <Route path="/DataIntegration" element={<DataIntegration currency={currency} />} />
                
                <Route path="/ProductAnalytics" element={<ProductAnalytics currency={currency} />} />
                
                <Route path="/CustomerHealth" element={<CustomerHealth currency={currency} />} />
                
                <Route path="/Account360" element={<Account360 currency={currency} />} />
                
                <Route path="/RegionalDashboard" element={<RegionalDashboard currency={currency} />} />
                
                <Route path="/HtmlExport" element={<HtmlExport currency={currency} />} />
                
                <Route path="/DeveloperDocumentation" element={<DeveloperDocumentation currency={currency} />} />
                
                <Route path="/DataUploader" element={<DataUploader currency={currency} />} />
                
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