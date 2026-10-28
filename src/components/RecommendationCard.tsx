import React from 'react';
import { ScenarioResult } from '../services/analysisService';
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown, Warehouse, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface RecommendationCardProps {
  scenario: ScenarioResult;
  isRecommended: boolean;
  onSelect?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  scenario,
  isRecommended,
  onSelect,
}) => {
  const { language } = useLanguage();

  const riskBadgeClasses = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-red-50 text-red-700 border-red-200',
  }[scenario.riskLevel];

  const isPositiveDiff = scenario.differenceVsSellNow > 0;
  const isNegativeDiff = scenario.differenceVsSellNow < 0;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
        isRecommended
          ? 'bg-white border-[#22C55E] ring-2 ring-[#22C55E]/30 shadow-md'
          : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-2xs'
      }`}
    >
      {/* Recommended Ribbon */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-[#22C55E] text-[#14532D] text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सिफारिश किया गया विकल्प' : 'Recommended Strategy'}</span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pr-12">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeClasses}`}>
            {scenario.riskLevel} Risk
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {scenario.daysToWait === 0
              ? (language === 'hi' ? 'तुरंत (0 दिन)' : 'Immediate (0 days)')
              : `${scenario.daysToWait} ${language === 'hi' ? 'दिन प्रतीक्षा' : 'days wait'}`}
          </span>
        </div>

        <h4 className="text-base font-bold text-[#17251C] mb-1">
          {language === 'hi' ? scenario.titleHi : scenario.title}
        </h4>
        <p className="text-xs text-[#647067] leading-relaxed mb-4">
          {language === 'hi' ? scenario.descriptionHi : scenario.description}
        </p>

        {/* Deadline Alert if violated */}
        {!scenario.deadlineFeasible && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {language === 'hi'
                ? `चेतावनी: यह विकल्प आपकी बिक्री सीमा से ${scenario.deadlineViolationDays} दिन अधिक ले रहा है!`
                : `Deadline Exceeded: This option exceeds your selling window by ${scenario.deadlineViolationDays} days!`}
            </span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#F7F9F4] border border-gray-100 text-xs mb-3">
          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'अनुमानित भाव' : 'Assumed Price'}
            </span>
            <span className="font-bold text-[#17251C] text-sm">
              ₹{scenario.assumedPricePerQuintal.toLocaleString('en-IN')}/qtl
            </span>
            <span className="text-[10px] text-gray-400 block">
              ({scenario.priceDeltaPercentage >= 0 ? '+' : ''}{scenario.priceDeltaPercentage}% vs spot)
            </span>
          </div>

          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'विक्रय योग्य मात्रा' : 'Sellable Qty'}
            </span>
            <span className="font-bold text-[#17251C] text-sm">
              {scenario.sellableQuantityQuintals} quintals
            </span>
            <span className="text-[10px] text-gray-400 block">
              ({scenario.spoilagePercentage}% spoilage loss)
            </span>
          </div>

          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'कुल कटौतियां' : 'Total Costs'}
            </span>
            <span className="font-semibold text-gray-700 text-sm">
              ₹{scenario.totalDeductions.toLocaleString('en-IN')}
            </span>
            {scenario.storageCosts > 0 && (
              <span className="text-[10px] text-amber-700 block">
                (incl. ₹{scenario.storageCosts} storage)
              </span>
            )}
          </div>

          <div className="bg-emerald-50 -m-1.5 p-1.5 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 font-semibold block text-[11px]">
              {language === 'hi' ? 'अनुमानित शुद्ध रकम' : 'Net Proceeds'}
            </span>
            <span className="font-extrabold text-emerald-800 text-base">
              ₹{scenario.estimatedNetProceeds.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block">
              (₹{scenario.effectiveNetPricePerOriginalQuintal}/qtl effective)
            </span>
          </div>
        </div>

        {/* Diff vs Sell Now */}
        {scenario.id !== 'sell_now' && (
          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-200/60 mb-3">
            <span className="text-gray-600 font-medium">
              {language === 'hi' ? 'तुरंत बिक्री से अंतर:' : 'Diff vs Sell Now:'}
            </span>
            <span
              className={`font-bold flex items-center gap-1 ${
                isPositiveDiff
                  ? 'text-emerald-600'
                  : isNegativeDiff
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {isPositiveDiff && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegativeDiff && <TrendingDown className="w-3.5 h-3.5" />}
              {isPositiveDiff ? '+' : ''}₹{scenario.differenceVsSellNow.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Assumptions List */}
        <div className="space-y-1 text-[11px] text-[#647067] border-t border-gray-100 pt-2.5">
          <p className="font-semibold text-gray-700">
            {language === 'hi' ? 'मुख्य धारणाएं:' : 'Assumptions:'}
          </p>
          {(language === 'hi' ? scenario.assumptionsHi : scenario.assumptions).map((asm, i) => (
            <p key={i} className="flex items-start gap-1">
              <span className="text-[#166534]">•</span>
              <span>{asm}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
