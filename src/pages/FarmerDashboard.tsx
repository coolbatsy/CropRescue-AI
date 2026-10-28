import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wheat,
  TrendingUp,
  Users,
  PlusCircle,
  Calculator,
  Split,
  Calendar,
  AlertCircle,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { StatCard } from '../components/StatCard';
import { PriceChart } from '../components/PriceChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SAMPLE_MARKET_PRICES } from '../data/sampleMarketPrices';
import { convertToQuintals } from '../services/calculationService';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      const data = await apiRequest<{ listings: any[] }>('/api/listings?ownerOnly=true');
      setListings(data.listings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your harvest listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Compute live statistics from database records
  const totalQuantityQuintals = listings.reduce((sum, item) => {
    return sum + convertToQuintals(item.quantity, item.unit);
  }, 0);

  const activeListingsCount = listings.filter((l) => l.status === 'active').length;

  // Calculate upcoming selling deadlines (within 14 days)
  const now = new Date().getTime();
  const upcomingDeadlines = listings.filter((l) => {
    if (l.status !== 'active') return false;
    const deadlineTime = new Date(l.selling_deadline).getTime();
    const daysRemaining = (deadlineTime - now) / (1000 * 60 * 60 * 24);
    return daysRemaining >= 0 && daysRemaining <= 21;
  });

  const bestEstimatedNetProceeds = listings.reduce((acc, l) => {
    const qty = convertToQuintals(l.quantity, l.unit);
    const price = l.asking_price || 2200;
    const est = qty * price * 0.94; // approx net after standard deductions
    return Math.max(acc, est);
  }, 0);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading your farmer dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.farmerWelcome}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {language === 'hi' ? `नमस्ते, ${user?.fullName}` : `Welcome, ${user?.fullName}`}
          </h1>
          <p className="text-xs text-[#647067] mt-1">
            {language === 'hi'
              ? 'अपनी फसलों की स्थिति देखें, खरीदारों से मिलान करें और बिक्री का सर्वोत्तम निर्णय लें।'
              : 'Review harvest lots, compare compatible buyer net prices, and evaluate selling trade-offs.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/farmer/add-harvest"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addNewHarvestBtn}</span>
          </Link>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F7F9F4] border border-gray-200 text-[#17251C] hover:bg-gray-100 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            <Calculator className="w-4 h-4 text-[#166534]" />
            <span className="hidden sm:inline">{t.profitCalculator}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.totalHarvestLogged}
          value={`${totalQuantityQuintals.toFixed(0)} qtl`}
          subtitle={language === 'hi' ? 'सक्रिय फसलों का कुल वजन' : 'Total volume across all active lots'}
          icon={Wheat}
          badge={`${listings.length} lots`}
          badgeColor="green"
        />

        <StatCard
          title={t.activeListingsCount}
          value={activeListingsCount}
          subtitle={language === 'hi' ? 'बाजार में खुली लिस्टिंग' : 'Currently open to buyers'}
          icon={Calendar}
          badge="Live"
          badgeColor="blue"
        />

        <StatCard
          title={t.compatibleBuyersCount}
          value={activeListingsCount > 0 ? 8 : 0}
          subtitle={language === 'hi' ? 'सक्रिय सांकेतिक खरीदार पूल' : 'Active candidate buyer pool'}
          icon={Users}
          badge="Sample Pool"
          badgeColor="amber"
        />

        <StatCard
          title={t.bestNetProceeds}
          value={bestEstimatedNetProceeds > 0 ? `₹${Math.round(bestEstimatedNetProceeds).toLocaleString('en-IN')}` : '₹0'}
          subtitle={language === 'hi' ? 'कटौती उपरांत सर्वोत्तम अनुमान' : 'Estimated after transport & handling'}
          icon={TrendingUp}
          badge="Net Realization"
          badgeColor="green"
        />
      </div>

      {/* Upcoming selling deadlines alert */}
      {upcomingDeadlines.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">
              {language === 'hi' ? 'बिक्री की अंतिम तिथि निकट है!' : 'Upcoming Selling Deadlines!'}
            </span>
            <p className="leading-relaxed">
              {language === 'hi'
                ? `${upcomingDeadlines.length} फसल(ओं) की बिक्री अंतिम तिथि अगले 21 दिनों में है। नमी और वजन नुकसान से बचने के लिए अभी खरीदार मिलान या बिक्री विश्लेषण करें।`
                : `${upcomingDeadlines.length} harvest lot(s) have deadlines within 21 days. Evaluate selling options to avoid progressive spoilage or market penalties.`}
            </p>
          </div>
          <Link
            to="/farmer/harvests"
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold shrink-0 hover:bg-amber-700 transition-colors"
          >
            {language === 'hi' ? 'फसलें देखें' : 'View Lots'}
          </Link>
        </div>
      )}

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/farmer/add-harvest"
          className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#166534] shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#166534] group-hover:bg-[#166534] group-hover:text-white flex items-center justify-center transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17251C]">{t.addHarvest}</h4>
            <span className="text-[10px] text-gray-500">Record harvest details</span>
          </div>
        </Link>

        <Link
          to="/farmer/buyers"
          className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#166534] shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17251C]">{t.findBuyers}</h4>
            <span className="text-[10px] text-gray-500">Compare net proceeds</span>
          </div>
        </Link>

        <Link
          to="/farmer/selling-analysis"
          className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#166534] shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white flex items-center justify-center transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17251C]">{t.sellingAnalysis}</h4>
            <span className="text-[10px] text-gray-500">Sell now vs wait/store</span>
          </div>
        </Link>

        <Link
          to="/farmer/lot-optimizer"
          className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#166534] shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white flex items-center justify-center transition-colors">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17251C]">{t.lotOptimizer}</h4>
            <span className="text-[10px] text-gray-500">Single vs split allocation</span>
          </div>
        </Link>
      </div>

      {/* Main Content Grid: Harvests + Market Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Harvests */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#17251C]">{t.harvestListingsTitle}</h3>
              <p className="text-xs text-[#647067]">
                {language === 'hi' ? 'आपकी हालिया पंजीकृत फसलें' : 'Your recently recorded crop lots'}
              </p>
            </div>
            <Link
              to="/farmer/harvests"
              className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1"
            >
              <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <EmptyState
              title={t.noHarvestsYet}
              description={t.noHarvestsSub}
              actionText={t.addNewHarvestBtn}
              onAction={() => navigate('/farmer/add-harvest')}
            />
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 4).map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#F7F9F4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#166534] flex items-center justify-center font-bold text-sm shrink-0">
                      🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#17251C]">
                          {lot.crop} {lot.variety ? `(${lot.variety})` : ''}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {lot.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#647067] mt-0.5 flex items-center gap-2">
                        <span>{lot.quantity} {lot.unit}</span>
                        <span>•</span>
                        <span>{lot.grade}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {lot.district}, {lot.state}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => navigate('/farmer/buyers', { state: { selectedLot: lot } })}
                      className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      {t.viewMatchesBtn}
                    </button>
                    <button
                      onClick={() => navigate('/farmer/selling-analysis', { state: { selectedLot: lot } })}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors"
                    >
                      {t.analyzeBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Illustrative Market Trend Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#17251C]">{t.marketIntel}</h3>
              <Link
                to="/market-intelligence"
                className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1"
              >
                <span>{language === 'hi' ? 'विस्तार से देखें' : 'Deep Dive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-[#647067] mb-4">
              {language === 'hi' ? 'मध्य प्रदेश में गेहूं का 6-मासिक सांकेतिक मॉडल भाव' : '6-month sample modal price trend for Wheat (MP)'}
            </p>
            <PriceChart
              data={SAMPLE_MARKET_PRICES.wheat[0]?.history || []}
              cropName="Wheat"
              stateName="Madhya Pradesh"
              height={220}
            />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#F7F9F4] border border-gray-100 text-[11px] text-[#647067] flex items-center justify-between">
            <span>{language === 'hi' ? 'नवीनतम मॉडल भाव:' : 'Latest Modal Price:'}</span>
            <span className="font-bold text-[#166534] text-xs">₹2,470/quintal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
