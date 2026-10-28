import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Database,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetSampleData = async () => {
    setResetting(true);
    try {
      await apiRequest('/api/reset-sample-data', { method: 'POST' });
      addToast('success', t.resetSuccessToast);
      setConfirmResetOpen(false);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to reset sample data.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmDialog
        isOpen={confirmResetOpen}
        title={language === 'hi' ? 'डेमो डेटा रीसेट की पुष्टि करें' : 'Confirm Sample Data Reset'}
        message={
          language === 'hi'
            ? 'क्या आप वाकई डेमो फसल लिस्टिंग को मूल स्थिति में रीसेट करना चाहते हैं? वास्तविक उपयोगकर्ता खाते सुरक्षित रहेंगे।'
            : 'Are you sure you want to restore initial demo harvest listings? User accounts will remain safe.'
        }
        confirmLabel={language === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, Reset Data'}
        cancelLabel={t.cancelBtn}
        isDestructive={false}
        onConfirm={handleResetSampleData}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
          {t.settings}
        </span>
        <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
          {t.settingsTitle}
        </h1>
        <p className="text-xs text-[#647067] mt-1 max-w-xl">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#166534]" />
          <h3 className="text-base font-bold text-[#17251C]">
            {t.languagePreference}
          </h3>
        </div>
        <p className="text-xs text-[#647067]">
          {language === 'hi'
            ? 'अपनी पसंदीदा भाषा चुनें। यह वरीयता आपके ब्राउज़र में सुरक्षित रहेगी और तुरंत लागू होगी।'
            : 'Select your preferred application language. Preference is persisted in localStorage without page reload.'}
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              language === 'en'
                ? 'border-[#166534] bg-emerald-50 text-[#166534] ring-2 ring-[#166534]/20'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>English (EN)</span>
            {language === 'en' && <CheckCircle2 className="w-4 h-4 text-[#166534]" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`p-3.5 rounded-2xl border text-xs font-bold font-devanagari flex items-center justify-between transition-all ${
              language === 'hi'
                ? 'border-[#166534] bg-emerald-50 text-[#166534] ring-2 ring-[#166534]/20'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>हिन्दी (Hindi)</span>
            {language === 'hi' && <CheckCircle2 className="w-4 h-4 text-[#166534]" />}
          </button>
        </div>
      </div>

      {/* System & Persistence Diagnostics Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#166534]" />
          <h3 className="text-base font-bold text-[#17251C]">
            {t.systemDiagnostics}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F7F9F4] border border-gray-100 space-y-1">
            <span className="text-gray-500 font-semibold block">{t.dbStatus}:</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.dbStatusVal}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F9F4] border border-gray-100 space-y-1">
            <span className="text-gray-500 font-semibold block">Authentication Engine:</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Node Scrypt & Expiring Bearer Tokens</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F9F4] border border-gray-100 space-y-1">
            <span className="text-gray-500 font-semibold block">Market Intelligence Data:</span>
            <span className="font-bold text-gray-800">
              Deterministic Sample Agmarknet Profiles
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F9F4] border border-gray-100 space-y-1">
            <span className="text-gray-500 font-semibold block">Application Version:</span>
            <span className="font-bold text-gray-800">CropRescue AI v1.0.0</span>
          </div>
        </div>

        {/* Data Persistence Explanation */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed space-y-1.5">
          <span className="font-bold text-gray-900 block">
            {language === 'hi' ? 'डेटा भंडारण व निरंतरता की व्याख्या:' : 'Data Persistence Architecture:'}
          </span>
          <p>
            {language === 'hi'
              ? '• सभी उपयोगकर्ता खाते (किसान व खरीदार), दर्ज की गई फसलें और खरीद रुचियां वास्तविक SQLite डेटाबेस में संग्रहीत हैं जो सर्वर रीस्टार्ट होने पर भी सुरक्षित रहती हैं।'
              : '• User credentials, harvest lots, and buyer expressions of interest are persistently committed to a true SQLite database (`data/croprescue.db`).'}
          </p>
          <p>
            {language === 'hi'
              ? '• भाषा चयन जैसी व्यक्तिगत प्राथमिकताएं ब्राउज़र localStorage में सुरक्षित रहती हैं।'
              : '• Browser-specific UI preferences like language are retained in browser localStorage.'}
          </p>
        </div>
      </div>

      {/* Reset Sample Data Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-[#17251C]">
          {language === 'hi' ? 'डेमो डेटा प्रबंधन' : 'Demo Data Management'}
        </h3>
        <p className="text-xs text-[#647067] leading-relaxed">
          {language === 'hi'
            ? 'परीक्षण या प्रस्तुति के बाद प्रारंभिक सांकेतिक फसल सूचियों और खरीदार मैचों को मूल स्थिति में रीसेट करें।'
            : 'Restore baseline demonstration listings and buyer matches to default state without affecting user accounts.'}
        </p>

        <div>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
            <span>{t.resetSampleBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
