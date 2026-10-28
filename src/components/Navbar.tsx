// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const dashboardPath = user?.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard';
  const closeMenu = () => setMobileMenuOpen(false);

  // Equalized button styling with smooth animated hover pill
  const getNavBtnClass = (isActive: boolean) =>
    `relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none cursor-pointer ${
      isActive
        ? 'bg-[#166534] text-white shadow-xs'
        : 'text-gray-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5'
    } active:scale-95`;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F9F4]/95 dark:bg-[#0c140e]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-[#233327]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Left: Brand Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 shrink-0 group active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#166534] to-[#14532D] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Sprout className="w-5 h-5 text-[#A3E635]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-tight text-[#14532D] dark:text-[#4ade80]">
                CropRescue<span className="text-[#22C55E]">.AI</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                Agri Decision Support
              </span>
            </div>
          </Link>

          {/* 2. Center: Proportional Navigation Capsule */}
          <nav className="hidden xl:flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800/40 p-1 rounded-xl border border-gray-200 dark:border-gray-700/60">
            <Link to="/" className={getNavBtnClass(location.pathname === '/')}>
              <span>🏠</span>
              <span>{t.navHome}</span>
            </Link>

            <a href="#how-it-works" className={getNavBtnClass(false)}>
              <span>⚙️</span>
              <span>{t.navHowItWorks}</span>
            </a>

            <a href="#features" className={getNavBtnClass(false)}>
              <span>✨</span>
              <span>{t.navFeatures}</span>
            </a>

            <Link
              to="/marketplace"
              className={getNavBtnClass(location.pathname === '/marketplace')}
            >
              <span>🛒</span>
              <span>{t.navMarketplace}</span>
            </Link>

            <Link
              to="/market-intelligence"
              className={getNavBtnClass(location.pathname === '/market-intelligence')}
            >
              <span>📈</span>
              <span>{t.navMarketIntel}</span>
            </Link>

            <Link
              to="/mandi-hub"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                location.pathname === '/mandi-hub'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/15'
              } active:scale-95`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>🌾 Mandi Hub</span>
            </Link>
          </nav>

          {/* 3. Right: Utility Controls & CTAs */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <LanguageSwitcher compact />
            <ThemeToggle compact />

            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#141f17] border border-gray-200 dark:border-[#233327] rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 hover:border-emerald-500 transition-colors max-w-[130px] truncate"
                >
                  <UserCircle className="w-4 h-4 text-[#166534] dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{user.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#166534] dark:hover:text-[#4ade80] transition-colors"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#141f17] border border-gray-200 dark:border-[#233327] text-gray-800 dark:text-gray-200 hover:border-emerald-600 rounded-lg shadow-2xs transition-all active:scale-95"
                >
                  {t.navRegister}
                </Link>
                <Link
                  to="/calculator"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95"
                >
                  <span>🧮 {t.profitCalculator}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex items-center gap-1.5 xl:hidden">
            <LanguageSwitcher compact />
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-[#141f17] border border-gray-200 dark:border-[#233327] active:scale-95 transition-transform cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 dark:border-[#233327] bg-white/98 dark:bg-[#141f17]/98 backdrop-blur-xl px-5 pt-3 pb-6 space-y-2.5 shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#1c2c20] hover:text-[#166534] transition-colors"
            >
              <span>🏠</span>
              <span>{t.navHome}</span>
            </Link>

            <Link
              to="/mandi-hub"
              onClick={closeMenu}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-[#4ade80] border border-emerald-200 dark:border-emerald-800/60"
            >
              <span className="flex items-center gap-2">
                <span>🌾</span>
                <span>Live Mandi Hub</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#166534] text-white font-bold">
                Live
              </span>
            </Link>

            <Link
              to="/marketplace"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#1c2c20] hover:text-[#166534] transition-colors"
            >
              <span>🛒</span>
              <span>{t.navMarketplace}</span>
            </Link>

            <Link
              to="/market-intelligence"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#1c2c20] hover:text-[#166534] transition-colors"
            >
              <span>📈</span>
              <span>{t.navMarketIntel}</span>
            </Link>

            <Link
              to="/calculator"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#1c2c20] text-[#166534] dark:text-[#4ade80] transition-colors"
            >
              <span>🧮</span>
              <span>{t.profitCalculator}</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-[#233327]">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#166534] text-white rounded-lg text-sm font-semibold shadow-xs"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>
                    {user.fullName} ({t.navDashboard})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#233327] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.navLogout}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-[#233327] text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center px-4 py-2 bg-[#166534] text-white rounded-lg text-sm font-semibold hover:bg-[#14532D]"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};