import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Split, Users, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { LotOptimizerResult } from '../services/optimizerService';
import { CROPS } from '../data/crops';

export const LotOptimizer: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const selectedLot = (location.state as any)?.selectedLot;

  const [crop, setCrop] = useState<string>(selectedLot?.crop || 'Wheat');
  const [quantity, setQuantity] = useState<number>(selectedLot?.quantity || 100);
  const [unit, setUnit] = useState<'quintal' | 'kg'>(selectedLot?.unit || 'quintal');
  const [grade, setGrade] = useState<string>(selectedLot?.grade || 'Grade A (Sharbati/Premium)');
  const [minPrice, setMinPrice] = useState<number>(selectedLot?.min_selling_price || 2200);

  const [result, setResult] = useState<LotOptimizerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<LotOptimizerResult>('/api/optimize-allocation', {
        method: 'POST',
        body: JSON.stringify({
          crop,
          quantity,
          unit,
          grade,
          minAcceptablePrice: minPrice,
        }),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Optimization error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [crop, quantity, unit, grade, minPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.feat4Title}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.optimizerTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1 max-w-2xl">
            {t.optimizerSubtitle}
          </p>
        </div>
      </div>

      {/* Input controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block mb-1">{t.cropLabel}</span>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534] bg-white"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-gray-500 block mb-1">{t.quantityLabel}</span>
          <div className="flex gap-1">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-2/3 px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
            />
            <span className="w-1/3 flex items-center justify-center bg-gray-100 rounded-lg text-[11px] font-semibold text-gray-600">
              {unit}
            </span>
          </div>
        </div>

        <div>
          <span className="text-gray-500 block mb-1">{t.gradeLabel}</span>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div>
          <span className="text-gray-500 block mb-1">{t.minSellingPriceLabel}</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold focus:outline-none focus:border-[#166534]"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Evaluating buyer lot capacities and solving bounded allocation..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Top Recommendation Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#166534] to-[#14532D] text-white shadow-sm space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E] text-[#14532D] text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{result.isSplitAdvantageous ? 'Split Allocation Advantageous' : 'Single-Buyer Optimal'}</span>
            </span>
            <p className="text-sm font-semibold leading-relaxed">
              {language === 'hi' ? result.recommendationExplanationHi : result.recommendationExplanation}
            </p>
          </div>

          {/* Comparison Cards: Single Buyer vs Split Multi-Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Single Buyer Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#17251C]">{t.singleBuyerTitle}</h4>
                <span className="text-xs text-gray-500">1 Destination</span>
              </div>

              {result.bestSingleBuyer ? (
                <div className="p-4 rounded-xl bg-[#F7F9F4] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{result.bestSingleBuyer.buyerName}</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      ₹{result.bestSingleBuyer.estimatedNetProceeds.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-gray-600">
                    <div>
                      <span className="text-[10px] block text-gray-400">Absorbed Volume:</span>
                      <span className="font-semibold">{result.bestSingleBuyer.absorbedQuantityQuintals} qtl</span>
                    </div>
                    <div>
                      <span className="text-[10px] block text-gray-400">Unabsorbed Volume:</span>
                      <span className={`font-semibold ${result.bestSingleBuyer.unabsorbedQuantityQuintals > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {result.bestSingleBuyer.unabsorbedQuantityQuintals} qtl
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 pt-1">
                    Effective realization: ₹{result.bestSingleBuyer.effectiveNetPricePerQuintal}/quintal
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No single buyer can accommodate minimum batch constraints.</p>
              )}
            </div>

            {/* Split Multi-Buyer Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-300 ring-1 ring-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#17251C]">{t.splitBuyerTitle}</h4>
                <span className="text-xs font-semibold text-emerald-700">
                  {result.allocations.length} Buyers
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">Combined Net Realization</span>
                  <span className="font-extrabold text-emerald-800 text-base">
                    ₹{result.combinedNetProceeds.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-emerald-900">
                  <div>
                    <span className="text-[10px] block opacity-80">Total Liquidated:</span>
                    <span className="font-semibold">{result.totalSoldQuintals} qtl</span>
                  </div>
                  <div>
                    <span className="text-[10px] block opacity-80">Unsold Balance:</span>
                    <span className="font-semibold">{result.totalUnsoldQuintals} qtl</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between font-semibold">
                  <span>{t.splitBenefit}:</span>
                  <span className={result.differenceVsSingleBuyer >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                    {result.differenceVsSingleBuyer >= 0 ? '+' : ''}₹{result.differenceVsSingleBuyer.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17251C]">
              {language === 'hi' ? 'प्रस्तावित लॉट आवंटन तालिका' : 'Proposed Lot Allocation Breakdown'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2.5">Buyer</th>
                    <th className="pb-2.5">Allocated Qty</th>
                    <th className="pb-2.5">Quoted Price</th>
                    <th className="pb-2.5">Gross Value</th>
                    <th className="pb-2.5">Variable Cost</th>
                    <th className="pb-2.5">Fixed Dispatch</th>
                    <th className="pb-2.5 text-right">Net Proceeds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {result.allocations.map((a) => (
                    <tr key={a.buyerId} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-[#17251C]">
                        {a.buyerName}
                        <span className="block text-[10px] text-gray-400 font-normal">{a.buyerType}</span>
                      </td>
                      <td className="py-3">{a.allocatedQuantityQuintals} quintals</td>
                      <td className="py-3">₹{a.pricePerQuintal}/qtl</td>
                      <td className="py-3">₹{a.grossSaleValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-red-600">-₹{a.variableCosts.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-red-600">-₹{a.fixedCosts.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-bold text-emerald-800">
                        ₹{a.estimatedNetProceeds.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F9F4] text-[11px] text-[#647067] flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500 shrink-0" />
              <span>
                {language === 'hi'
                  ? 'गणितीय टिप्पणी: प्रत्येक अलग खरीदार को भेजने पर अलग से वाहन प्रेषण शुल्क (Fixed Dispatch Fee) देय होता है। जब तक अधिक भाव या अनबिकी मात्रा का लाभ इस खर्च से बड़ा न हो, एकल खरीदार बेहतर रहता है।'
                  : 'Logistics Rule: Each separate buyer requires an independent lorry dispatch fee. Splitting is only advantageous when volume absorption or premium pricing exceeds redundant transport setup costs.'}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
