import React from 'react';
import { BuyerMatchItem } from '../services/matchingService';
import { Building2, MapPin, Truck, ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface BuyerCardProps {
  match: BuyerMatchItem;
  onSelect?: (match: BuyerMatchItem) => void;
  actionLabel?: string;
}

export const BuyerCard: React.FC<BuyerCardProps> = ({
  match,
  onSelect,
  actionLabel = 'Select Buyer',
}) => {
  const { language } = useLanguage();
  const isTopRank = match.rank === 1;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all p-5 relative overflow-hidden flex flex-col justify-between ${
        isTopRank
          ? 'border-[#22C55E] ring-1 ring-[#22C55E]/40 shadow-sm'
          : 'border-gray-200/80 hover:border-gray-300 shadow-2xs'
      }`}
    >
      {isTopRank && (
        <div className="absolute top-0 right-0 bg-[#22C55E] text-[#14532D] text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1 shadow-xs">
          <CheckCircle2 className="w-3 h-3" />
          <span>{language === 'hi' ? '#1 उच्चतम शुद्ध प्राप्ति' : '#1 Highest Net Yield'}</span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 pr-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#F7F9F4] text-[#166534] border border-[#166534]/15">
                {match.buyerType}
              </span>
              <span className="text-xs text-[#647067] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {match.location} ({match.distanceKm} km)
              </span>
            </div>
            <h4 className="text-base font-bold text-[#17251C] leading-snug">
              {match.buyerName}
            </h4>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#F7F9F4] border border-gray-100 my-3 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'सांकेतिक भाव' : 'Quote Price'}
            </span>
            <span className="font-bold text-[#17251C] text-sm">
              ₹{match.indicativePricePerQuintal.toLocaleString('en-IN')}/qtl
            </span>
          </div>

          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'स्वीकृत मात्रा' : 'Quantity'}
            </span>
            <span className="font-bold text-[#17251C] text-sm">
              {match.compatibleQuantityQuintals} quintals
            </span>
          </div>

          <div>
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'कुल कटौतियां' : 'Deductions'}
            </span>
            <span className="font-semibold text-red-600 text-sm">
              -₹{match.totalDeductions.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gray-400 block">
              (₹{match.transportDeduction} trans + ₹{match.handlingDeduction} hand)
            </span>
          </div>

          <div className="bg-emerald-50/80 -m-1.5 p-1.5 rounded-lg border border-emerald-200/50">
            <span className="text-emerald-800 font-semibold block text-[11px]">
              {language === 'hi' ? 'अनुमानित शुद्ध रकम' : 'Net Proceeds'}
            </span>
            <span className="font-extrabold text-emerald-700 text-base">
              ₹{match.estimatedNetProceeds.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-800/80 font-medium block">
              (₹{match.effectiveNetPricePerQuintal}/qtl effective)
            </span>
          </div>
        </div>

        {/* Reasons & Risks */}
        <div className="space-y-1.5 my-3">
          {match.matchReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-[#166534]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#22C55E]" />
              <span>{reason}</span>
            </div>
          ))}
          {match.keyRisks.map((risk, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>{risk}</span>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-2.5 mt-2 space-y-0.5">
          <p>
            <span className="font-semibold text-gray-700">
              {language === 'hi' ? 'भुगतान शर्तें:' : 'Payment:'}
            </span>{' '}
            {language === 'hi' ? match.paymentTermsHi : match.paymentTerms}
          </p>
          <p>
            <span className="font-semibold text-gray-700">
              {language === 'hi' ? 'डिलीवरी शर्त:' : 'Delivery:'}
            </span>{' '}
            {match.deliveryRequirement}
          </p>
        </div>
      </div>

      {onSelect && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => onSelect(match)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
