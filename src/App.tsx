import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { CursorTrail } from './components/CursorTrail';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { Harvests } from './pages/Harvests';
import { AddHarvest } from './pages/AddHarvest';
import { Buyers } from './pages/Buyers';
import { SellingAnalysis } from './pages/SellingAnalysis';
import { ProfitCalculator } from './pages/ProfitCalculator';
import { LotOptimizer } from './pages/LotOptimizer';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { MandiHub } from './pages/MandiHub';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { Marketplace } from './pages/Marketplace';
import { ListingDetails } from './pages/ListingDetails';
import { MyInterests } from './pages/MyInterests';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine if current route is an authenticated dashboard route where sidebar should appear
  const isDashboardRoute =
    location.pathname.startsWith('/farmer') ||
    location.pathname.startsWith('/buyer') ||
    location.pathname === '/settings' && Boolean(user);

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-[#F7F9F4] text-[#17251C]">
      <CursorTrail />
      <Navbar />

      <div className={`flex-1 w-full max-w-full ${isDashboardRoute && user ? 'flex' : 'block'}`}>
        {isDashboardRoute && user && <Sidebar />}
        <main className={`w-full min-w-0 ${isDashboardRoute && user ? 'flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto' : 'flex-1'}`}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/calculator" element={<div className="p-4 sm:p-6 lg:p-8"><ProfitCalculator /></div>} />
              <Route path="/marketplace" element={<div className="p-4 sm:p-6 lg:p-8"><Marketplace /></div>} />
              <Route path="/listings/:id" element={<div className="p-4 sm:p-6 lg:p-8"><ListingDetails /></div>} />
              <Route path="/market-intelligence" element={<div className="p-4 sm:p-6 lg:p-8"><MarketIntelligence /></div>} />
              <Route path="/mandi-hub" element={<div className="p-4 sm:p-6 lg:p-8"><MandiHub /></div>} />
              <Route path="/settings" element={<div className="p-4 sm:p-6 lg:p-8"><Settings /></div>} />

              {/* Farmer Protected Routes */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/harvests"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <Harvests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/add-harvest"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <AddHarvest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/buyers"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <Buyers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/selling-analysis"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <SellingAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/lot-optimizer"
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <LotOptimizer />
                  </ProtectedRoute>
                }
              />

              {/* Buyer Protected Routes */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRole="buyer">
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/my-interests"
                element={
                  <ProtectedRoute allowedRole="buyer">
                    <MyInterests />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </Router>
      </LanguageProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
