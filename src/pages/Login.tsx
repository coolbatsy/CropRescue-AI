import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Eye, EyeOff, Lock, Mail, Sprout, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoFarmer = () => {
    setEmail('farmer@croprescue.in');
    setPassword('Password@123');
    setError(null);
  };

  const fillDemoBuyer = () => {
    setEmail('buyer@croprescue.in');
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl shadow-gray-900/5">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534] to-[#14532D] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sprout className="w-7 h-7 text-[#A3E635]" />
          </div>
          <h2 className="text-2xl font-black text-[#17251C] tracking-tight">{t.loginTitle}</h2>
          <p className="text-xs text-[#647067] mt-1.5">{t.loginSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? t.loading : t.loginBtn}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center mb-2.5">
            {language === 'hi' ? 'त्वरित डेमो परीक्षण खाते:' : 'Quick Demo Accounts:'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoFarmer}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold transition-colors"
            >
              🧑‍🌾 {language === 'hi' ? 'किसान डेमो' : 'Farmer Demo'}
            </button>
            <button
              type="button"
              onClick={fillDemoBuyer}
              className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-semibold transition-colors"
            >
              🏢 {language === 'hi' ? 'खरीदार डेमो' : 'Buyer Demo'}
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-[#647067]">
          <span>{t.dontHaveAccount} </span>
          <Link to="/register" className="font-semibold text-[#166534] hover:underline">
            {t.registerBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
