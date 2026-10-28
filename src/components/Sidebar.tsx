import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wheat,
  PlusCircle,
  Users,
  TrendingUp,
  Calculator,
  Split,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ShoppingBag,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isFarmer = user?.role === 'farmer';

  const farmerNav = [
    { to: '/farmer/dashboard', label: t.dashboardOverview, icon: LayoutDashboard, end: true },
    { to: '/farmer/harvests', label: t.myHarvests, icon: Wheat },
    { to: '/farmer/add-harvest', label: t.addHarvest, icon: PlusCircle },
    { to: '/farmer/buyers', label: t.findBuyers, icon: Users },
    { to: '/farmer/selling-analysis', label: t.sellingAnalysis, icon: TrendingUp },
    { to: '/calculator', label: t.profitCalculator, icon: Calculator },
    { to: '/farmer/lot-optimizer', label: t.lotOptimizer, icon: Split },
    { to: '/mandi-hub', label: 'Live Mandi Hub', icon: MapPin },
    { to: '/market-intelligence', label: t.marketIntel, icon: BarChart3 },
    { to: '/settings', label: t.settings, icon: SettingsIcon },
  ];

  const buyerNav = [
    { to: '/buyer/dashboard', label: t.dashboardOverview, icon: LayoutDashboard, end: true },
    { to: '/marketplace', label: t.browseHarvestsTitle.split(' ')[0] + ' ' + t.cropCol, icon: ShoppingBag },
    { to: '/buyer/my-interests', label: t.myInterestsTitle, icon: HeartHandshake },
    { to: '/mandi-hub', label: 'Live Mandi Hub', icon: MapPin },
    { to: '/market-intelligence', label: t.marketIntel, icon: BarChart3 },
    { to: '/settings', label: t.settings, icon: SettingsIcon },
  ];

  const links = isFarmer ? farmerNav : buyerNav;

  return (
    <aside className="w-64 bg-white border-r border-gray-200/80 shrink-0 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        {/* User Card */}
        <div className="p-3 mb-4 rounded-xl bg-[#F7F9F4] border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h5 className="text-xs font-bold text-[#17251C] truncate">{user?.fullName}</h5>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#166534] bg-emerald-100/60 px-1.5 py-0.5 rounded-sm">
              {isFarmer ? 'Farmer' : 'Buyer'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-xs font-semibold'
                      : 'text-[#647067] hover:text-[#17251C] hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t.navLogout}</span>
        </button>
      </div>
    </aside>
  );
};
