// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#14532D] text-white/90 border-t border-[#166534]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center text-[#14532D] shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                CropRescue<span className="text-[#A3E635]">.AI</span>
              </span>
            </Link>
            <p className="text-xs text-white/70 italic leading-relaxed">
              "{t.tagline}"
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              {language === 'hi'
                ? 'भारतीय किसानों के लिए पारदर्शी कृषि निर्णय सहायता प्रणाली, जो बिक्री लागत, खरीदार मिलान और बाजार विकल्पों को समझने में मदद करती है।'
                : 'An explainable agricultural decision-support platform empowering Indian farmers to compare buyers, analyze storage costs, and decide when and how to sell.'}
            </p>
          </div>

          {/* Decision Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3E635] mb-3">
              {language === 'hi' ? 'निर्णय उपकरण' : 'Decision Tools'}
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link to="/calculator" className="hover:text-white transition-colors">
                  {t.profitCalculator}
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-white transition-colors">
                  {t.sellingAnalysis}
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-white transition-colors">
                  {t.lotOptimizer}
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  {t.navMarketplace}
                </Link>
              </li>
              <li>
                <Link to="/mandi-hub" className="hover:text-white transition-colors">
                  Live Mandi Hub
                </Link>
              </li>
              <li>
                <Link to="/market-intelligence" className="hover:text-white transition-colors">
                  {t.navMarketIntel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3E635] mb-3">
              {language === 'hi' ? 'त्वरित लिंक' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t.navHome}
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  {t.navHowItWorks}
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  {t.navFeatures}
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  {t.navLogin}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  {t.navRegister}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  {t.settings}
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimers & Ethics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
              {language === 'hi' ? 'पारदर्शिता व अस्वीकरण' : 'Transparency & Disclosures'}
            </h4>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डेमो डेटा सूचना' : 'Demo Data Notice'}</span>
              </div>
              {language === 'hi'
                ? 'डेमो डेटा — यह मंडी का वास्तविक समय का भाव नहीं है। सभी आंकड़े एवं खरीदार विवरण केवल निर्णय-सहायता और परिदृश्य तुलना के उद्देश्य से हैं।'
                : 'Demo data — not a live mandi quotation. All figures, buyers, and price patterns are illustrative decision-support models designed to evaluate selling trade-offs.'}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} CropRescue AI. Dedicated to Indian Farmers.</p>
          <p className="flex items-center gap-1">
            <span>Built with integrity & mathematical clarity</span>
          </p>
        </div>
      </div>
    </footer>
  );
};