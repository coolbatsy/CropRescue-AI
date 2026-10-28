import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const NotFound: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#166534] flex items-center justify-center mb-4">
        <Sprout className="w-8 h-8" />
      </div>
      <span className="text-4xl font-black text-[#14532D]">404</span>
      <h2 className="text-xl font-bold text-[#17251C] mt-2">
        {language === 'hi' ? 'पृष्ठ नहीं मिला' : 'Page Not Found'}
      </h2>
      <p className="text-xs text-[#647067] max-w-sm mt-1 mb-6">
        {language === 'hi'
          ? 'आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है या स्थानांतरित कर दिया गया है।'
          : 'The agricultural decision page you are looking for does not exist or has been moved.'}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Return to Home'}</span>
      </Link>
    </div>
  );
};
