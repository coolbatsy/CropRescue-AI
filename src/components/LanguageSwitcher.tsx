import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center bg-white/90 dark:bg-[#141f17] border border-gray-200/80 dark:border-[#233327] rounded-xl p-1 shadow-xs text-xs font-medium transition-colors">
      {!compact && <Globe className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ade80] ml-1.5 mr-1" />}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg transition-all ${
          language === 'en'
            ? 'bg-[#166534] dark:bg-emerald-600 text-white shadow-xs font-semibold'
            : 'text-[#647067] dark:text-gray-300 hover:text-[#17251C] dark:hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-300 dark:text-gray-600 mx-0.5">|</span>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2 py-1 rounded-lg transition-all font-devanagari ${
          language === 'hi'
            ? 'bg-[#166534] dark:bg-emerald-600 text-white shadow-xs font-semibold'
            : 'text-[#647067] dark:text-gray-300 hover:text-[#17251C] dark:hover:text-white'
        }`}
        aria-label="Switch to Hindi"
      >
        हिन्दी
      </button>
    </div>
  );
};
