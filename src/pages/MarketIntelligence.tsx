import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, ShieldAlert, Filter, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PriceChart } from '../components/PriceChart';
import { CROPS } from '../data/crops';
import { SAMPLE_MARKET_PRICES, StatePriceData, PricePoint } from '../data/sampleMarketPrices';

export const MarketIntelligence: React.FC = () => {
  const { t, language } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  const cropStates: StatePriceData[] = SAMPLE_MARKET_PRICES[selectedCrop] || SAMPLE_MARKET_PRICES.wheat;
  const currentStateData = cropStates[selectedStateIndex] || cropStates[0];
  const history: PricePoint[] = currentStateData?.history || [];

  // Statistics
  const latestPoint = history[history.length - 1];
  const previousPoint = history[history.length - 2] || latestPoint;
  const priceChange = latestPoint && previousPoint ? latestPoint.modalPrice - previousPoint.modalPrice : 0;
  const pctChange = previousPoint ? (priceChange / previousPoint.modalPrice) * 100 : 0;

  const maxPriceInPeriod = history.reduce((max, p) => Math.max(max, p.maxPrice), 0);
  const minPriceInPeriod = history.reduce((min, p) => (min === 0 ? p.minPrice : Math.min(min, p.minPrice)), 0);

  const selectedCropObj = CROPS.find((c) => c.id === selectedCrop) || CROPS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.marketIntel}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.marketTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1 max-w-2xl">
            {t.marketSubtitle}
          </p>
        </div>

        {/* Mandatory Prominent Disclosure Banner */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 max-w-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold block">{t.marketDisclaimer}</span>
            <span className="text-[10px] text-amber-800/80">
              {language === 'hi'
                ? 'यह वास्तविक समय का मंडी भाव नहीं है। केवल ऐतिहासिक प्रवृत्तियों को समझने के लिए सांकेतिक डेटा।'
                : 'Not an AGMARKNET or live exchange ticker. Historical sample data for decision support.'}
            </span>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-semibold">{t.selectCrop}:</span>
          <select
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              setSelectedStateIndex(0);
              setSelectedDistrict('All');
            }}
            className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-800 bg-white focus:outline-none focus:border-[#166534]"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.hindiName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-semibold">{t.selectState}:</span>
          <select
            value={selectedStateIndex}
            onChange={(e) => {
              setSelectedStateIndex(Number(e.target.value));
              setSelectedDistrict('All');
            }}
            className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-800 bg-white focus:outline-none focus:border-[#166534]"
          >
            {cropStates.map((st, idx) => (
              <option key={idx} value={idx}>
                {st.state}
              </option>
            ))}
          </select>
        </div>

        {currentStateData?.districts && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">{t.selectDistrict}:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-800 bg-white focus:outline-none focus:border-[#166534]"
            >
              <option value="All">All Mandi Hubs</option>
              {currentStateData.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">{t.modalPrice}</span>
          <span className="text-xl font-black text-[#166534] mt-0.5 block">
            ₹{latestPoint ? latestPoint.modalPrice.toLocaleString('en-IN') : '0'}/qtl
          </span>
          <div className="flex items-center gap-1 text-[11px] mt-1 font-semibold">
            {priceChange >= 0 ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +₹{priceChange} (+{pctChange.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> ₹{priceChange} ({pctChange.toFixed(1)}%)
              </span>
            )}
            <span className="text-gray-400">vs prev month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">{t.avgPrice}</span>
          <span className="text-xl font-bold text-[#17251C] mt-0.5 block">
            ₹{latestPoint ? latestPoint.avgPrice.toLocaleString('en-IN') : '0'}/qtl
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Weighted mandi average</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">Range (Sample Period)</span>
          <span className="text-sm font-bold text-[#17251C] mt-1 block">
            ₹{minPriceInPeriod} — ₹{maxPriceInPeriod}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Min/Max modal boundaries</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-gray-500 text-[11px] block">{t.volumeTraded}</span>
          <span className="text-xl font-bold text-gray-700 mt-0.5 block">
            {latestPoint ? latestPoint.volumeQuintals.toLocaleString('en-IN') : '0'} qtl
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Sample monthly mandi volume</span>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <PriceChart
          data={history}
          cropName={selectedCropObj.name}
          stateName={currentStateData?.state}
          height={340}
        />
      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#17251C]">
          {language === 'hi' ? 'मासिक भाव व व्यापार मात्रा विवरण' : 'Monthly Historical Quotations Table'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5">Month</th>
                <th className="pb-2.5">Modal Price</th>
                <th className="pb-2.5">Average Price</th>
                <th className="pb-2.5">Min Price</th>
                <th className="pb-2.5">Max Price</th>
                <th className="pb-2.5 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {history.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-2.5 font-bold text-[#17251C]">{row.date}</td>
                  <td className="py-2.5 font-bold text-[#166534]">₹{row.modalPrice}/qtl</td>
                  <td className="py-2.5">₹{row.avgPrice}/qtl</td>
                  <td className="py-2.5 text-amber-700">₹{row.minPrice}/qtl</td>
                  <td className="py-2.5 text-blue-700">₹{row.maxPrice}/qtl</td>
                  <td className="py-2.5 text-right">{row.volumeQuintals.toLocaleString('en-IN')} quintals</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F9F4] text-[11px] text-[#647067] flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            {language === 'hi'
              ? 'डेटा आर्किटेक्चर नोट: यह मॉड्यूल आसानी से वास्तविक AGMARKNET या e-NAM API सेवा से जोड़ा जा सकता है।'
              : 'Architecture Note: This market-data module is decoupled, enabling seamless drop-in integration with official e-NAM or AGMARKNET data APIs when certified.'}
          </span>
        </div>
      </div>
    </div>
  );
};
