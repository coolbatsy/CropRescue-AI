import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, HeartHandshake, MapPin, Calendar, Clock, ArrowRight, AlertCircle, Filter, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [myInterests, setMyInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [listingsRes, interestsRes] = await Promise.all([
          apiRequest<{ listings: any[] }>('/api/listings'),
          apiRequest<{ interests: any[] }>('/api/my/interests'),
        ]);
        setListings(listingsRes.listings || []);
        setMyInterests(interestsRes.interests || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load buyer portal data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading buyer dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.buyerWelcome}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {language === 'hi' ? `नमस्ते, ${user?.fullName}` : `Welcome, ${user?.fullName}`}
          </h1>
          <p className="text-xs text-[#647067] mt-1">
            {language === 'hi'
              ? 'भारतीय किसानों से सीधे उच्च गुणवत्ता वाली फसलों की आपूर्ति खोजें और अपनी रुचि व्यक्त करें।'
              : 'Directly source farmgate harvests, evaluate transparent batch grades, and submit purchase interests.'}
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{language === 'hi' ? 'फसलें ब्राउज़ करें' : 'Browse All Harvests'}</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Buyer Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={language === 'hi' ? 'उपलब्ध फार्मगेट फसलें' : 'Available Farmgate Lots'}
          value={listings.length}
          subtitle={language === 'hi' ? 'सक्रिय सत्यापित किसान लिस्टिंग' : 'Active harvest batches across states'}
          icon={ShoppingBag}
          badge="Live Supply"
          badgeColor="green"
        />

        <StatCard
          title={t.myInterestsTitle}
          value={myInterests.length}
          subtitle={language === 'hi' ? 'दर्ज की गई खरीद रुचियां' : 'Purchase interests submitted by you'}
          icon={HeartHandshake}
          badge="In Negotiation"
          badgeColor="blue"
        />

        <StatCard
          title={language === 'hi' ? 'कवर किए गए राज्य' : 'States Covered'}
          value={new Set(listings.map((l) => l.state)).size || 1}
          subtitle={language === 'hi' ? 'विभिन्न कृषि उत्पादक क्षेत्र' : 'Agricultural production hubs'}
          icon={MapPin}
          badge="Pan-India"
          badgeColor="amber"
        />
      </div>

      {/* Recent Available Harvests */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17251C]">
              {language === 'hi' ? 'ताज़ा उपलब्ध फसलें' : 'Latest Farmgate Harvests'}
            </h3>
            <p className="text-xs text-[#647067]">
              {language === 'hi' ? 'किसानों द्वारा सीधे पंजीकृत की गई नवीनतम फसलें' : 'Direct farmer listings with transparent grade & location specifications'}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'मार्केटप्लेस देखें' : 'View Marketplace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.slice(0, 6).map((lot) => {
            const hasExpressed = myInterests.some((i) => i.listing_id === lot.id);
            return (
              <div
                key={lot.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#F7F9F4]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#17251C]">{lot.crop}</h4>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {lot.variety || 'Standard'} • {lot.farmer_name}
                      </span>
                    </div>
                    {lot.asking_price && (
                      <span className="text-xs font-extrabold text-[#166534]">
                        ₹{lot.asking_price}/qtl
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 my-2">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">{lot.quantity} {lot.unit}</span>
                      <span>({lot.grade})</span>
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{lot.district}, {lot.state}</span>
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>Deadline: {lot.selling_deadline}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {lot.interest_count || 0} buyers interested
                  </span>
                  <Link
                    to="/marketplace"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      hasExpressed
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-[#166534] text-white hover:bg-[#14532D]'
                    }`}
                  >
                    {hasExpressed ? t.alreadyExpressedInterest : t.expressInterestBtn}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
