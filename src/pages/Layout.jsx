

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Database, 
  Settings, 
  Bell,
  Search,
  Menu,
  X,
  HeartPulse,
  Box,
  MapPin,
  Code,
  UploadCloud,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { User } from "@/api/entities";
import sidebarKpis from "@/components/data/sidebar/kpis.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Executive Dashboard",
    url: createPageUrl("ExecutiveDashboard"),
    icon: LayoutDashboard,
    roles: ["admin", "user"]
  },
  {
    title: "Regional Intelligence",
    url: createPageUrl("RegionalDashboard"),
    icon: MapPin,
    roles: ["admin", "user"]
  },
  {
    title: "Revenue Analytics",
    url: createPageUrl("RevenueAnalytics"),
    icon: TrendingUp,
    roles: ["admin", "user"]
  },
  // {
  //   title: "Product Analytics",
  //   url: createPageUrl("ProductAnalytics"),
  //   icon: Box,
  //   roles: ["admin", "user"]
  // },
  // {
  //   title: "Customer Health",
  //   url: createPageUrl("CustomerHealth"),
  //   icon: HeartPulse,
  //   roles: ["admin", "user"]
  // },
  // {
  //   title: "Alerts & Insights",
  //   url: createPageUrl("AlertsInsights"),
  //   icon: AlertTriangle,
  //   roles: ["admin", "user"]
  // },
  {
    title: "Data Uploader",
    url: createPageUrl("DataUploader"),
    icon: UploadCloud,
    roles: ["admin"]
  },
  {
    title: "Data Integration",
    url: createPageUrl("DataIntegration"),
    icon: Database,
    roles: ["admin"]
  },
  {
    title: "Developer Docs",
    url: createPageUrl("DeveloperDocumentation"),
    icon: Code,
    roles: ["admin"]
  }
];

const USD_TO_INR_RATE = 84.5;

const CurrencyToggle = ({ currency, setCurrency }) => (
    <div className="flex items-center gap-1 bg-navy-200 p-1 rounded-lg w-full">
        <button 
            onClick={() => setCurrency('INR')}
            className={`flex-1 px-3 py-1 rounded-md text-sm font-bold transition-all duration-200 ${currency === 'INR' ? 'bg-white text-navy-800 shadow-sm' : 'bg-transparent text-navy-600'}`}
        >
            ₹ INR
        </button>
        <button 
            onClick={() => setCurrency('USD')}
            className={`flex-1 px-3 py-1 rounded-md text-sm font-bold transition-all duration-200 ${currency === 'USD' ? 'bg-white text-navy-800 shadow-sm' : 'bg-transparent text-navy-600'}`}
        >
            $ USD
        </button>
    </div>
);

export default function Layout({ children, currentPageName, currency, setCurrency }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout, user: authUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNavigation = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'user')
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-navy-600 font-medium">Loading SingleInterface MIS...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --navy-50: #f8fafc;
          --navy-100: #f1f5f9;
          --navy-200: #e2e8f0;
          --navy-300: #cbd5e1;
          --navy-400: #94a3b8;
          --navy-500: #64748b;
          --navy-600: #475569;
          --navy-700: #334155;
          --navy-800: #1e293b;
          --navy-900: #0f172a;
          
          --light-blue-50: #f0f9ff;
          --light-blue-100: #e0f2fe;
          --light-blue-200: #bae6fd;
          --light-blue-300: #7dd3fc;
          --light-blue-400: #38bdf8;
          --light-blue-500: #0ea5e9;
          --light-blue-600: #0284c7;
          --light-blue-700: #0369a1;
          --light-blue-800: #075985;
          --light-blue-900: #0c4a6e;
        }
        
        /* Brand Colors */
        .bg-navy-50 { background-color: #f8fafc; }
        .bg-navy-100 { background-color: #f1f5f9; }
        .bg-navy-200 { background-color: #e2e8f0; }
        .bg-navy-600 { background-color: #475569; }
        .bg-navy-700 { background-color: #334155; }
        .bg-navy-800 { background-color: #1e293b; }
        .bg-navy-900 { background-color: #0f172a; }
        .bg-light-blue-50 { background-color: #f0f9ff; }
        .bg-light-blue-100 { background-color: #e0f2fe; }
        .bg-light-blue-200 { background-color: #bae6fd; }
        .bg-light-blue-300 { background-color: #7dd3fc; }
        .bg-light-blue-400 { background-color: #38bdf8; }
        .bg-light-blue-500 { background-color: #0ea5e9; }
        .bg-light-blue-600 { background-color: #0284c7; }
        
        .text-navy-50 { color: #f8fafc; }
        .text-navy-100 { color: #f1f5f9; }
        .text-navy-400 { color: #94a3b8; }
        .text-navy-500 { color: #64748b; }
        .text-navy-600 { color: #475569; }
        .text-navy-700 { color: #334155; }
        .text-navy-800 { color: #1e293b; }
        .text-navy-900 { color: #0f172a; }
        .text-light-blue-600 { color: #0284c7; }
        .text-light-blue-700 { color: #0369a1; }
        .text-light-blue-800 { color: #075985; }
        .text-light-blue-900 { color: #0c4a6e; }
        
        .border-navy-200 { border-color: #e2e8f0; }
        .border-navy-300 { border-color: #cbd5e1; }
        .border-light-blue-200 { border-color: #bae6fd; }
        .border-light-blue-300 { border-color: #7dd3fc; }
        .border-light-blue-400 { border-color: #38bdf8; }
        
        .hover\\:bg-navy-100:hover { background-color: #f1f5f9; }
        .hover\\:bg-light-blue-50:hover { background-color: #f0f9ff; }
        .hover\\:border-light-blue-300:hover { border-color: #7dd3fc; }
        .hover\\:text-light-blue-700:hover { color: #0369a1; }
        
        /* Grid pattern background */
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-navy-50 to-white grid-pattern">
        <Sidebar className="border-r border-navy-300 backdrop-blur-xl bg-white shadow-xl">
          <SidebarHeader className="border-b border-navy-200 p-6 bg-white">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f74c6f0b0_silogo2x.png" 
                alt="SingleInterface" 
                className="h-8 w-auto"
              />
            </div>
            
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input 
                placeholder="Search metrics, accounts..."
                className="pl-10 bg-navy-50 border-navy-300 text-navy-800 placeholder:text-navy-500 text-sm focus:border-light-blue-400 focus:ring-light-blue-400 font-medium"
              />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3 bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-navy-600 uppercase tracking-wider px-3 py-3">
                Analytics & Intelligence
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-light-blue-50 hover:text-light-blue-700 transition-all duration-300 rounded-xl mb-1 group font-medium ${
                          location.pathname === item.url 
                            ? 'bg-light-blue-50 text-light-blue-700 shadow-sm border-l-4 border-light-blue-500' 
                            : 'text-navy-700 hover:border-l-4 hover:border-light-blue-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 relative">
                          <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="font-semibold tracking-tight">{item.title}</span>
                          {location.pathname === item.url && (
                            <div className="absolute right-3 w-2 h-2 bg-light-blue-500 rounded-full" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-navy-600 uppercase tracking-wider px-3 py-3">
                Global Settings
              </SidebarGroupLabel>
              <SidebarGroupContent>
                 <div className="px-4 py-2 space-y-4">
                   <CurrencyToggle currency={currency} setCurrency={setCurrency} />
                 </div>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-navy-600 uppercase tracking-wider px-3 py-3">
                Key Performance Indicators
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-2 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-navy-50 rounded-xl border border-navy-200 hover:shadow-md transition-all duration-300">
                      <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-1">MRR</div>
                      <div className="font-black text-navy-800 text-lg">
                        {currency === 'INR' 
                          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(sidebarKpis.mrr_inr)
                          : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(sidebarKpis.mrr_inr / USD_TO_INR_RATE)
                        }
                      </div>
                      <div className="text-light-blue-600 text-xs font-bold">+{sidebarKpis.mrr_change_percent}%</div>
                    </div>
                    <div className="p-3 bg-navy-50 rounded-xl border border-navy-200 hover:shadow-md transition-all duration-300">
                      <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-1">NRR</div>
                      <div className="font-black text-navy-800 text-lg">{sidebarKpis.nrr_percent}%</div>
                      <div className="text-light-blue-600 text-xs font-bold">+{sidebarKpis.nrr_change_percent}%</div>
                    </div>
                  </div>
                  {/* <div className="p-3 bg-light-blue-50 rounded-xl border border-light-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">Health Score</span>
                      <Badge className="bg-light-blue-600 text-white text-xs font-bold px-2 py-1">
                        Excellent
                      </Badge>
                    </div>
                  </div> */}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-navy-200 p-4 bg-white space-y-4">
            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-light-blue-500 to-light-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-800 text-sm truncate">
                  {authUser || 'Admin User'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs font-bold bg-navy-800 text-white">
                    Administrator
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white backdrop-blur-xl border-b border-navy-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-light-blue-50 p-2 rounded-xl transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-light-blue-50">
                  <Bell className="w-5 h-5 text-navy-600" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

