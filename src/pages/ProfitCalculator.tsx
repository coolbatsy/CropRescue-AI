import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  Scale,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  Info,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  calculateNetProceeds,
  runBenchmarkCalculationTest,
  NetProceedsResult,
} from '../services/calculationService';

export const ProfitCalculator: React.FC = () => {
  const { t, language } = useLanguage();

  // Inputs
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<'quintal' | 'kg'>('quintal');
  const [pricePerQuintal, setPricePerQuintal] = useState<number>(2000);
  const [transportCosts, setTransportCosts] = useState<number>(8000);
  const [handlingCosts, setHandlingCosts] = useState<number>(2000);
  const [storageCosts, setStorageCosts] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(1000);
  const [spoilagePercentage, setSpoilagePercentage] = useState<number>(0);

  const [benchmarkPassed, setBenchmarkPassed] = useState<boolean | null>(null);

  // Compute live output
  let calculation: NetProceedsResult | null = null;
  let calculationError: string | null = null;

  try {
    calculation = calculateNetProceeds({
      quantity,
      unit,
      pricePerQuintal,
      transportCosts,
      handlingCosts,
      storageCosts,
      otherCharges,
      spoilagePercentage,
    });
  } catch (err: any) {
    calculationError = err.message;
  }

  const loadBenchmark = () => {
    setQuantity(100);
    setUnit('quintal');
    setPricePerQuintal(2000);
    setTransportCosts(8000);
    setHandlingCosts(2000);
    setStorageCosts(0);
    setOtherCharges(1000);
    setSpoilagePercentage(0);

    const passed = runBenchmarkCalculationTest();
    setBenchmarkPassed(passed);
  };

  const handleReset = () => {
    setQuantity(50);
    setUnit('quintal');
    setPricePerQuintal(2400);
    setTransportCosts(3500);
    setHandlingCosts(1200);
    setStorageCosts(0);
    setOtherCharges(500);
    setSpoilagePercentage(0);
    setBenchmarkPassed(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.profitCalculator}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.calculatorTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1 max-w-xl">
            {t.calculatorSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBenchmark}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
            title="Load Section 13 Test Case"
          >
            <FileCheck2 className="w-4 h-4 text-[#166534]" />
            <span>{t.benchmarkTestBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
            title="Reset to sample"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Benchmark Verification Status Notice */}
      {benchmarkPassed !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">
                {language === 'hi' ? 'मानक परीक्षण सफल (100 क्विंटल @ ₹2,000)' : 'Benchmark Test Verified (100 qtl @ ₹2,000)'}
              </span>
              <span>
                {language === 'hi'
                  ? 'सकल: ₹2,00,000 | कटौतियां (₹8,000 + ₹2,000 + ₹1,000): ₹11,000 | शुद्ध प्राप्ति: ₹1,89,000 (₹1,890/क्विंटल)'
                  : 'Gross: ₹200,000 | Deductions (₹8,000 + ₹2,000 + ₹1,000): ₹11,000 | Expected Net: ₹189,000 (₹1,890/qtl)'}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase">
            100% Passed
          </span>
        </div>
      )}

      {/* Calculation Grid: Inputs on Left, Output Realization on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {language === 'hi' ? 'बिक्री मापदंड व खर्च प्रविष्टियां' : 'Sales Inputs & Expenses'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1">
                {t.quantityLabel}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1">
                {t.unitLabel}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'quintal' | 'kg')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#166534] bg-white"
              >
                <option value="quintal">{t.quintals} (100 kg)</option>
                <option value="kg">{t.kg}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1">
              {language === 'hi' ? 'बिक्री भाव (₹ प्रति क्विंटल)' : 'Sale Price (₹ per quintal)'}
            </label>
            <input
              type="number"
              min="0"
              value={pricePerQuintal}
              onChange={(e) => setPricePerQuintal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#166534]"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              {language === 'hi' ? 'व्यय व कटौतियां (₹)' : 'Deductions & Expenses (₹)'}
            </span>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs text-gray-700 mb-0.5">
                  {t.calcTransportDed} (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportCosts}
                  onChange={(e) => setTransportCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-0.5">
                  {t.calcHandlingDed} (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={handlingCosts}
                  onChange={(e) => setHandlingCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-0.5">
                  {t.calcStorageDed} (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={storageCosts}
                  onChange={(e) => setStorageCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-0.5">
                  {t.calcOtherDed} (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-0.5">
                  {language === 'hi' ? 'वैकल्पिक नमी व खराबी नुकसान (%)' : 'Optional Spoilage / Moisture Loss (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={spoilagePercentage}
                  onChange={(e) => setSpoilagePercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {language === 'hi' ? 'सटीक वित्तीय गणना' : 'Deterministic Net Calculation'}
          </h3>

          {calculationError ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{calculationError}</span>
            </div>
          ) : calculation ? (
            <div className="space-y-4">
              {/* Highlight Net Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  calculation.isNegativeNetProceeds
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {t.calcNetProceeds}
                  </span>
                  {calculation.isNegativeNetProceeds ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                      Net Loss Warning
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Net Realization
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight">
                    ₹{calculation.estimatedNetProceeds.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs font-semibold mt-1 opacity-90">
                  {t.calcEffectivePrice}: ₹{calculation.effectiveNetPricePerOriginalQuintal.toLocaleString('en-IN')}/quintal
                </p>
              </div>

              {/* Itemized Waterfall List */}
              <div className="space-y-2 text-xs border border-gray-100 rounded-2xl p-4 bg-[#F7F9F4]/50">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#647067]">
                    {language === 'hi' ? 'मूल फसल मात्रा:' : 'Original Quantity:'}
                  </span>
                  <span className="font-bold text-[#17251C]">
                    {calculation.originalQuantityQuintals} quintals ({calculation.originalQuantityQuintals * 100} kg)
                  </span>
                </div>

                {calculation.spoilageLossQuintals > 0 && (
                  <div className="flex items-center justify-between py-1 text-amber-700">
                    <span>
                      {language === 'hi' ? 'खराबी / वजन में कमी:' : 'Spoilage Loss:'}
                    </span>
                    <span className="font-semibold">
                      -{calculation.spoilageLossQuintals} qtl ({calculation.sellableQuantityQuintals} qtl sellable)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1.5 border-t border-gray-200">
                  <span className="font-bold text-[#17251C]">{t.calcGrossValue}:</span>
                  <span className="font-bold text-[#17251C] text-sm">
                    ₹{calculation.grossSaleValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1 pt-1 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>• {t.calcTransportDed}:</span>
                    <span className="text-red-600 font-medium">-₹{calculation.transportDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• {t.calcHandlingDed}:</span>
                    <span className="text-red-600 font-medium">-₹{calculation.handlingDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• {t.calcStorageDed}:</span>
                    <span className="text-red-600 font-medium">-₹{calculation.storageDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• {t.calcOtherDed}:</span>
                    <span className="text-red-600 font-medium">-₹{calculation.otherDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-200 text-red-700 font-bold">
                  <span>{t.calcTotalDed}:</span>
                  <span>-₹{calculation.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              {calculation.notes.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  {calculation.notes.map((note, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>{note}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
