import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Users,
  TrendingUp,
  Calculator,
  Split,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  Scale,
  Warehouse,
  ChevronRight,
  LineChart as LineChartIcon,
  Truck,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PriceChart } from '../components/PriceChart';
import { SAMPLE_MARKET_PRICES } from '../data/sampleMarketPrices';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'rice' | 'soyabean' | 'mustard' | 'maize'>('wheat');

  const previewPriceData = SAMPLE_MARKET_PRICES.wheat[0]?.history || [];
  const activeCropData = SAMPLE_MARKET_PRICES[selectedCrop]?.[0]?.history || previewPriceData;
  const activeCropState = SAMPLE_MARKET_PRICES[selectedCrop]?.[0]?.state || 'Madhya Pradesh';

  const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal();
  const { ref: previewRef, isVisible: previewVisible } = useScrollReveal();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: trustRef, isVisible: trustVisible } = useScrollReveal();

  const marqueeItems = [
    t.marquee1,
    t.marquee2,
    t.marquee3,
    t.marquee4,
    t.marquee5,
  ];

  const cropTabs = [
    { key: 'wheat', nameEn: 'Wheat (गेहूं)', icon: '🌾', modal: '₹2,460/qtl' },
    { key: 'rice', nameEn: 'Paddy (धान)', icon: '🌾', modal: '₹3,400/qtl' },
    { key: 'soyabean', nameEn: 'Soyabean (सोयाबीन)', icon: '🌱', modal: '₹4,750/qtl' },
    { key: 'mustard', nameEn: 'Mustard (सरसों)', icon: '🌻', modal: '₹5,520/qtl' },
    { key: 'maize', nameEn: 'Maize (मक्का)', icon: '🌽', modal: '₹2,180/qtl' },
  ];

  const features = [
    {
      icon: Users,
      title: t.feat1Title,
      desc: t.feat1Desc,
      link: '/marketplace',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: TrendingUp,
      title: t.feat2Title,
      desc: t.feat2Desc,
      link: '/farmer/selling-analysis',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      icon: Calculator,
      title: t.feat3Title,
      desc: t.feat3Desc,
      link: '/calculator',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      icon: Split,
      title: t.feat4Title,
      desc: t.feat4Desc,
      link: '/farmer/optimizer',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      icon: BarChart3,
      title: t.feat5Title,
      desc: t.feat5Desc,
      link: '/market-intelligence',
      color: 'bg-teal-50 text-teal-700',
    },
    {
      icon: CheckCircle2,
      title: t.feat6Title,
      desc: t.feat6Desc,
      link: '/register',
      color: 'bg-rose-50 text-rose-700',
    },
  ];

  const steps = [
    { num: '01', title: t.step1Title, desc: t.step1Desc },
    { num: '02', title: t.step2Title, desc: t.step2Desc },
    { num: '03', title: t.step3Title, desc: t.step3Desc },
    { num: '04', title: t.step4Title, desc: t.step4Desc },
    { num: '05', title: t.step5Title, desc: t.step5Desc },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-[#F7F9F4] to-white dark:from-[#0c140e] dark:to-[#141f17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#166534] dark:text-emerald-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{t.badgeText}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#17251C] dark:text-gray-100 tracking-tight leading-[1.15]">
                {language === 'hi' ? (
                  <>
                    आपकी फसल। <span className="text-[#166534] dark:text-[#4ade80]">आपका बाजार।</span> आपका फैसला।
                  </>
                ) : (
                  <>
                    Your Harvest. <span className="text-[#166534] dark:text-[#4ade80]">Your Market.</span> Your Decision.
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#647067] dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/calculator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#166534] hover:bg-[#14532D] text-white text-sm font-bold rounded-xl shadow-md shadow-[#166534]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{t.heroPrimaryBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#101a12] border border-gray-300 dark:border-[#2a3d2e] text-[#17251C] dark:text-gray-200 hover:border-[#166534] text-sm font-semibold rounded-xl shadow-2xs transition-all hover:bg-gray-50 dark:hover:bg-[#152318]"
                >
                  <span>{t.heroSecondaryBtn}</span>
                </Link>
              </div>

              {/* Disclaimer micro-tag */}
              <div className="pt-2">
                <span className="text-[11px] text-[#647067] dark:text-gray-400 flex items-center justify-center lg:justify-start gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                  <span>{t.heroDemoDisclaimer}</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual & Interactive Sample Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">
                {/* Floating Top Card: Decision Preview */}
                <div className="bg-white dark:bg-[#141f17] rounded-2xl p-5 border border-emerald-100 dark:border-[#233327] shadow-xl shadow-emerald-950/5 relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-[#233327]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        🌾
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#17251C] dark:text-gray-100">Wheat Sharbati Grade A</h4>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">100 quintals • Sehore, MP</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                      Option A: Sell Now
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F7F9F4] dark:bg-[#101a12]">
                      <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Indicative Buyer Offer</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">₹2,450/qtl</span>
                      <span className="text-[10px] text-gray-400 block">Gross: ₹2,45,000</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-emerald-800 dark:text-emerald-300 block text-[10px] font-semibold">Net Realization</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">₹2,34,500</span>
                      <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 block">₹2,345/qtl effective</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#647067] dark:text-gray-400">
                    <span>Itemized Deductions:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">-₹10,500 (Transport + Handling)</span>
                  </div>
                </div>

                {/* Floating Bottom Card: Clean Mini Price Trend (Uncluttered & Proportionate) */}
                <div className="bg-white dark:bg-[#141f17] rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-[#233327] shadow-lg shadow-emerald-950/5 w-full min-w-0">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-[#233327]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#17251C] dark:text-gray-100">
                        {language === 'hi' ? 'मंडी भाव रुझान (मध्य प्रदेश)' : 'Mandi Price Movement (MP)'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        +8.2%
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'hi' ? '6-माह रुझान' : '6-Month Trend'}
                    </span>
                  </div>

                  <div className="h-36 w-full min-w-0">
                    <PriceChart data={previewPriceData} cropName="Wheat" height={140} compact={true} />
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#233327] flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1 rounded-full bg-emerald-700 dark:bg-emerald-400"></span>
                      <span>{language === 'hi' ? 'मॉडल भाव' : 'Modal Price'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1 rounded-full bg-emerald-500 dark:bg-emerald-300"></span>
                      <span>{language === 'hi' ? 'अधिकतम' : 'Max'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1 rounded-full bg-amber-500 dark:bg-amber-400"></span>
                      <span>{language === 'hi' ? 'न्यूनतम' : 'Min'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED MARQUEE */}
      <div className="w-full max-w-full overflow-hidden bg-[#14532D] py-3.5 text-white border-y border-[#166534]">
        <div className="marquee-container">
          <div className="flex whitespace-nowrap animate-marquee">
            {marqueeItems.concat(marqueeItems).map((text, idx) => (
              <div key={idx} className="flex items-center mx-6 text-xs sm:text-sm font-semibold tracking-wide shrink-0">
                <span className="text-[#A3E635] mr-3">✦</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 FEATURE CARDS */}
      <section
        id="features"
        ref={featuresRef}
        className={`py-16 md:py-24 bg-white dark:bg-[#141f17] transition-all duration-700 ${
          featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-[#17251C] dark:text-gray-100 tracking-tight">
              {t.featuresTitle}
            </h2>
            <p className="text-sm text-[#647067] dark:text-gray-400 mt-3">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  to={feat.link}
                  className="group bg-[#F7F9F4] dark:bg-[#101a12] p-6 rounded-2xl border border-gray-100 dark:border-[#233327] hover:border-[#166534] dark:hover:border-emerald-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#17251C] dark:text-gray-100 mb-2 group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-200/60 dark:border-[#233327] flex items-center text-xs font-semibold text-[#166534] dark:text-emerald-400 gap-1 group-hover:gap-1.5 transition-all">
                    <span>{language === 'hi' ? 'सुविधा देखें' : 'Explore Feature'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW / INTERACTIVE MARKET INTELLIGENCE DEMO (SECTION 5F) */}
      <section
        ref={previewRef}
        className={`py-16 md:py-20 bg-gradient-to-b from-[#F7F9F4] to-white dark:from-[#0c140e] dark:to-[#141f17] border-y border-gray-200/80 dark:border-[#233327] transition-all duration-700 ${
          previewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                <LineChartIcon className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{language === 'hi' ? 'लाइव उत्पाद पूर्वावलोकन' : 'Live Product Preview'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17251C] dark:text-gray-100 tracking-tight">
                {language === 'hi'
                  ? 'मंडी भाव विश्लेषण और पारदर्शी निर्णय मॉडल'
                  : 'Market Intelligence & Transparent Decision Modeling'}
              </h2>
              <p className="text-sm text-[#647067] dark:text-gray-400 mt-1 max-w-2xl">
                {language === 'hi'
                  ? 'देखें कि कैसे CropRescue AI हर फसल के वास्तविक खर्च, भाड़ा और भंडारण लागत को जोड़कर सही नेट आय दिखाता है।'
                  : 'Experience how CropRescue AI factors freight, storage, and handling to expose real net realization per quintal.'}
              </p>
            </div>

            <Link
              to="/market-intelligence"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline"
            >
              <span>{language === 'hi' ? 'सभी मंडियों का विश्लेषण' : 'View Full Market Intelligence'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Crop Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {cropTabs.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCrop(c.key as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedCrop === c.key
                    ? 'bg-[#166534] text-white shadow-md shadow-emerald-900/10 scale-[1.02]'
                    : 'bg-white dark:bg-[#141f17] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#233327] hover:border-emerald-600'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.nameEn}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedCrop === c.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#101a12] text-gray-500'
                }`}>
                  {c.modal}
                </span>
              </button>
            ))}
          </div>

          {/* Preview Container: Chart on Left + Decision Breakdown on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Chart Area */}
            <div className="lg:col-span-7 bg-white dark:bg-[#141f17] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#233327] shadow-xs flex flex-col justify-between">
              <div>
                <PriceChart
                  data={activeCropData}
                  cropName={selectedCrop.toUpperCase()}
                  stateName={activeCropState}
                  height={280}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#233327] flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  {language === 'hi'
                    ? 'स्रोत: सांकेतिक मॉडल भाव नमूना (Agmarknet मानक प्रारूप)'
                    : 'Source: Indicative benchmark samples (Agmarknet standard format)'}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {language === 'hi' ? 'मासिक अपडेट' : 'Monthly cadence'}
                </span>
              </div>
            </div>

            {/* Decision Logic Preview Card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#141f17] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#233327] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-[#233327]">
                  <div>
                    <h3 className="text-sm font-bold text-[#17251C] dark:text-gray-100">
                      {language === 'hi' ? 'निवल आय गणना उदाहरण' : 'Net Proceeds Comparison'}
                    </h3>
                    <p className="text-xs text-[#647067] dark:text-gray-400">
                      100 quintals lot • Direct Buyer vs Mandi
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    +₹12,500 Edge
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#101a12] border border-gray-100 dark:border-[#233327]">
                    <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      <span>Option A: Mandi Gate Sale</span>
                      <span>₹2,40,000</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>- Local Freight (40 km):</span>
                        <span className="text-rose-600 dark:text-rose-400">-₹6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- Loading / Unloading:</span>
                        <span className="text-rose-600 dark:text-rose-400">-₹2,500</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-[#233327]">
                        <span>Net In-Pocket:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">₹2,31,500</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      <span>Option B: Direct Verified Buyer</span>
                      <span>₹2,44,000</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5">
                      <div className="flex justify-between">
                        <span>- Buyer Pickup at Farmgate:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">₹0 (Zero Freight)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- Loading Assistance:</span>
                        <span className="text-rose-600 dark:text-rose-400">-₹1,500</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200/60 dark:border-emerald-800">
                        <span>Net In-Pocket:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-sm">₹2,42,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#233327]">
                <Link
                  to="/calculator"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'अपनी उपज का हिसाब लगाएं' : 'Calculate Your Batch Net Proceeds'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (5 STEPS) */}
      <section
        id="how-it-works"
        ref={stepsRef}
        className={`py-16 md:py-24 bg-[#F7F9F4] dark:bg-[#0c140e] border-y border-gray-200/80 dark:border-[#233327] transition-all duration-700 ${
          stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-[#17251C] dark:text-gray-100 tracking-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="text-sm text-[#647067] dark:text-gray-400 mt-3">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#141f17] p-5 rounded-2xl border border-gray-100 dark:border-[#233327] shadow-2xs flex flex-col justify-between relative group hover:border-[#22C55E] transition-all"
              >
                <div>
                  <span className="text-2xl font-black text-[#166534]/30 dark:text-emerald-500/30 block mb-2 group-hover:text-[#22C55E] transition-colors">
                    {st.num}
                  </span>
                  <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100 mb-2 leading-snug">
                    {st.title}
                  </h4>
                  <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CROPRESCUE AI? (TRUST & INTEGRITY) */}
      <section
        ref={trustRef}
        className={`py-16 md:py-24 bg-white dark:bg-[#141f17] transition-all duration-700 ${
          trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">
                {language === 'hi' ? 'ईमानदार वादे' : 'Transparent Foundations'}
              </span>
              <h2 className="text-3xl font-extrabold text-[#17251C] dark:text-gray-100 tracking-tight leading-tight">
                {t.whyTitle}
              </h2>
              <p className="text-sm text-[#647067] dark:text-gray-400 leading-relaxed">
                {t.whySubtitle}
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                <span className="font-bold block mb-1">
                  {language === 'hi' ? 'हमारा सिद्धांत:' : 'Our Core Philosophy:'}
                </span>
                {language === 'hi'
                  ? 'हम कभी भी भविष्य के भाव या मुनाफे का झूठा दावा नहीं करते। हम किसान को हर खर्च—हम्माली, भाड़ा, नमी का नुकसान और भंडारण शुल्क—स्पष्ट दिखाकर बेहतर मोलभाव की ताकत देते हैं।'
                  : 'We never promise guaranteed profits or claim ungrounded crystal-ball predictions. We simply itemize every freight rupee, handling fee, and spoilage percentage so farmers can negotiate with clarity.'}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-[#101a12] border border-gray-100 dark:border-[#233327]">
                <Scale className="w-6 h-6 text-[#166534] dark:text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100 mb-1.5">{t.trust1Title}</h4>
                <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">{t.trust1Desc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-[#101a12] border border-gray-100 dark:border-[#233327]">
                <Users className="w-6 h-6 text-[#166534] dark:text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100 mb-1.5">{t.trust2Title}</h4>
                <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">{t.trust2Desc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-[#101a12] border border-gray-100 dark:border-[#233327]">
                <Clock className="w-6 h-6 text-[#166534] dark:text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100 mb-1.5">{t.trust3Title}</h4>
                <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">{t.trust3Desc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-[#101a12] border border-gray-100 dark:border-[#233327]">
                <ShieldCheck className="w-6 h-6 text-[#166534] dark:text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100 mb-1.5">{t.trust4Title}</h4>
                <p className="text-xs text-[#647067] dark:text-gray-400 leading-relaxed">{t.trust4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#166534] to-[#14532D] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t.ctaTitle}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            {t.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#22C55E] hover:bg-[#16a34a] text-[#14532D] text-sm font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              {t.ctaGetStarted}
            </Link>
            <Link
              to="/calculator"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {t.ctaExplore}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
