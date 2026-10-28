import React, { useState, useEffect } from 'react';
import { HeartHandshake, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MyInterests: React.FC = () => {
  const { t, language } = useLanguage();

  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterests() {
      try {
        const data = await apiRequest<{ interests: any[] }>('/api/my/interests');
        setInterests(data.interests || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load your submitted interests.');
      } finally {
        setLoading(false);
      }
    }
    fetchInterests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
          {t.myInterestsTitle}
        </span>
        <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
          {language === 'hi' ? 'मेरी दर्ज की गई खरीद रुचियां' : 'My Expressed Harvest Interests'}
        </h1>
        <p className="text-xs text-[#647067] mt-1 max-w-xl">
          {t.myInterestsSubtitle}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your expressed interests..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : interests.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={language === 'hi' ? 'कोई खरीद रुचि दर्ज नहीं है' : 'No Expressed Interests Yet'}
          description={
            language === 'hi'
              ? 'आपने अभी तक किसी फसल लिस्टिंग में रुचि दर्ज नहीं की है। उपलब्ध फसलों को ब्राउज़ करें और खरीद रुचि दर्ज करें।'
              : 'You have not submitted purchase interest in any farmgate lots yet. Browse active harvest listings in the marketplace.'
          }
        />
      ) : (
        <div className="space-y-3">
          {interests.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-[#17251C]">
                    {item.crop} {item.variety ? `(${item.variety})` : ''}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Interest Recorded
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                  <span>Batch: {item.quantity} {item.unit}</span>
                  <span>•</span>
                  <span>Grade: {item.grade}</span>
                  <span>•</span>
                  <span>Farmer: {item.farmer_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {item.district}, {item.state}
                  </span>
                </div>

                {item.message && (
                  <p className="text-xs text-gray-500 italic mt-2 bg-[#F7F9F4] p-2.5 rounded-xl border border-gray-100">
                    "{item.message}"
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'प्रस्तावित भाव' : 'Proposed Price'}
                </span>
                <span className="text-lg font-black text-[#166534]">
                  ₹{item.proposed_price ? item.proposed_price.toLocaleString('en-IN') : 'N/A'}/qtl
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Submitted: {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
