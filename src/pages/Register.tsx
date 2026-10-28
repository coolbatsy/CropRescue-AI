import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, Sprout, AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'hi' ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setError(language === 'hi' ? 'कृपया नियम और शर्तों को स्वीकार करें।' : 'Please accept the terms acknowledgement.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      navigate(user.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl shadow-gray-900/5">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534] to-[#14532D] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sprout className="w-7 h-7 text-[#A3E635]" />
          </div>
          <h2 className="text-2xl font-black text-[#17251C] tracking-tight">{t.registerTitle}</h2>
          <p className="text-xs text-[#647067] mt-1.5">{t.registerSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
              {t.roleLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'farmer'
                    ? 'border-[#166534] bg-emerald-50 text-[#166534] ring-1 ring-[#166534]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🧑‍🌾</span>
                <span>{language === 'hi' ? 'किसान' : 'Farmer'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'buyer'
                    ? 'border-[#166534] bg-emerald-50 text-[#166534] ring-1 ring-[#166534]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🏢</span>
                <span>{language === 'hi' ? 'खरीदार' : 'Buyer'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1">
              {t.fullNameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251C] mb-1">
              {t.phoneLabel}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1">
                {t.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#22C55E]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-[#647067] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#166534] focus:ring-[#166534]"
              />
              <span>{t.termsAgree}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? t.loading : t.registerBtn}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#647067]">
          <span>{t.alreadyHaveAccount} </span>
          <Link to="/login" className="font-semibold text-[#166534] hover:underline">
            {t.loginBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
