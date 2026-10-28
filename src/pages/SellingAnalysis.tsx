import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Warehouse,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SellingAnalysisReport, ScenarioResult } from '../services/analysisService';

export const SellingAnalysis: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedLot = (location.state as any)?.selectedLot;

  // Scenario input state
  const [crop, setCrop] = useState<string>(selectedLot?.crop || 'Wheat');
  const [quantity, setQuantity] = useState<number>(selectedLot?.quantity || 100);
  const [unit, setUnit] = useState<'quintal' | 'kg'>(selectedLot?.unit || 'quintal');
  const [currentPrice, setCurrentPrice] = useState<number>(selectedLot?.asking_price || 2450);
  const [hasStorageAvailable, setHasStorageAvailable] = useState<boolean>(
    selectedLot?.storage_available !== undefined ? Boolean(selectedLot.storage_available) : true
  );
  const [storageCostPerDay, setStorageCostPerDay] = useState<number>(
    selectedLot?.storage_cost_per_day || 0.8
  );
  const [ambientSpoilageWeekly, setAmbientSpoilageWeekly] = useState<number>(
    selectedLot?.spoilage_rate || 0.6
  );
  const [harvestDate, setHarvestDate] = useState<string>(
    selectedLot?.harvest_date || new Date().toISOString().split('T')[0]
  );
  const [sellingDeadline, setSellingDeadline] = useState<string>(
    selectedLot?.selling_deadline ||
      new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [report, setReport] = useState<SellingAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<SellingAnalysisReport>('/api/analyze-selling-options', {
        method: 'POST',
        body: JSON.stringify({
          crop,
          quantity,
          unit,
          currentPricePerQuintal: currentPrice,
          harvestDate,
          sellingDeadline,
          hasStorageAvailable,
          storageCostPerDayPerQuintal: storageCostPerDay,
          ambientSpoilageRatePerWeek: ambientSpoilageWeekly,
        }),
      });
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error running selling scenario analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [crop, quantity, unit, currentPrice, hasStorageAvailable, storageCostPerDay, ambientSpoilageWeekly, harvestDate, sellingDeadline]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.feat2Title}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.scenariosTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1 max-w-2xl">
            {t.scenariosSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#17251C] bg-[#F7F9F4] px-3 py-2 rounded-xl border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasStorageAvailable}
              onChange={(e) => setHasStorageAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-[#166534] focus:ring-[#166534]"
            />
            <span>{language === 'hi' ? 'भंडारण सुविधा उपलब्ध है' : 'Storage Available'}</span>
          </label>
        </div>
      </div>

      {/* Assumptions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block mb-1">{t.cropLabel}</span>
          <span className="font-bold text-[#17251C] text-sm">{crop}</span>
        </div>

        <div>
          <span className="text-gray-500 block mb-1">{t.quantityLabel}</span>
          <span className="font-bold text-[#17251C] text-sm">{quantity} {unit}</span>
        </div>

        <div>
          <span className="text-gray-500 block mb-1">
            {language === 'hi' ? 'हाजिर भाव (₹/क्विंटल)' : 'Spot Price (₹/qtl)'}
          </span>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div>
          <span className="text-gray-500 block mb-1">
            {language === 'hi' ? 'साप्ताहिक खराबी (%)' : 'Weekly Spoilage (%)'}
          </span>
          <input
            type="number"
            step="0.1"
            value={ambientSpoilageWeekly}
            onChange={(e) => setAmbientSpoilageWeekly(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div>
          <span className="text-gray-500 block mb-1">{t.deadlineCol}</span>
          <input
            type="date"
            value={sellingDeadline}
            onChange={(e) => setSellingDeadline(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Simulating selling scenarios, storage fees, and spoilage penalties..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top Recommendation Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#14532D] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E] text-[#14532D] text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{language === 'hi' ? 'अनुशंसित निर्णय' : 'Recommended Decision'}</span>
              </span>
              <p className="text-sm sm:text-base font-semibold leading-relaxed pt-1">
                {language === 'hi' ? report.recommendationSummaryHi : report.recommendationSummary}
              </p>
            </div>

            <button
              onClick={() => navigate('/calculator')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#14532D] text-xs font-bold shrink-0 hover:bg-gray-100 transition-colors shadow-xs"
            >
              {t.profitCalculator}
            </button>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {report.scenarios.map((sc) => (
              <RecommendationCard
                key={sc.id}
                scenario={sc}
                isRecommended={sc.id === report.recommendedScenarioId}
              />
            ))}
          </div>

          {/* Sensitivity & Risk Notes */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <h4 className="text-sm font-bold text-[#17251C]">
                {language === 'hi' ? 'निर्णय संवेदनशीलता व अनिश्चितता प्रकटीकरण' : 'Decision Sensitivity & Uncertainty Disclosures'}
              </h4>
            </div>
            <div className="space-y-1.5 text-xs text-[#647067] leading-relaxed">
              {(language === 'hi' ? report.sensitivityNotesHi : report.sensitivityNotes).map((sn, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-[#166534] font-bold">•</span>
                  <span>{sn}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
