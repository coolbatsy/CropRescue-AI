import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Warehouse,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');

  // Interest Modal
  const [selectedListingForInterest, setSelectedListingForInterest] = useState<any | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submittingInterest, setSubmittingInterest] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, type, message: msg }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchListings = async () => {
    try {
      const data = await apiRequest<{ listings: any[] }>('/api/listings');
      setListings(data.listings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load harvest marketplace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleOpenInterestModal = (listing: any) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/marketplace' } } });
      return;
    }
    if (user.role !== 'buyer') {
      addToast('info', language === 'hi' ? 'केवल खरीदार खाते ही खरीद रुचि दर्ज कर सकते हैं।' : 'Only registered buyer accounts can express purchase interest.');
      return;
    }
    setSelectedListingForInterest(listing);
    setProposedPrice(listing.asking_price?.toString() || '');
    setMessage('');
    setPhone('');
    setModalError(null);
  };

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForInterest) return;
    setSubmittingInterest(true);
    setModalError(null);

    try {
      await apiRequest(`/api/listings/${selectedListingForInterest.id}/interest`, {
        method: 'POST',
        body: JSON.stringify({
          proposedPrice: Number(proposedPrice) || null,
          message: message.trim(),
          phone: phone.trim(),
        }),
      });

      addToast(
        'success',
        language === 'hi'
          ? 'आपकी खरीद रुचि सफलतापूर्वक दर्ज हो गई है।'
          : 'Your expression of interest was recorded in CropRescue AI!'
      );
      setSelectedListingForInterest(null);
      fetchListings();
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit expression of interest.');
    } finally {
      setSubmittingInterest(false);
    }
  };

  // Unique filters
  const uniqueStates = Array.from(new Set(listings.map((l) => l.state))).filter(Boolean);
  const uniqueCrops = Array.from(new Set(listings.map((l) => l.crop))).filter(Boolean);

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      (l.variety && l.variety.toLowerCase().includes(search.toLowerCase())) ||
      l.district.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'all' || l.state === selectedState;
    const matchesCrop = selectedCrop === 'all' || l.crop === selectedCrop;
    return matchesSearch && matchesState && matchesCrop;
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.navMarketplace}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.browseHarvestsTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1 max-w-2xl">
            {t.browseHarvestsSubtitle}
          </p>
        </div>

        {user?.role === 'buyer' && (
          <button
            onClick={() => navigate('/buyer/my-interests')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F7F9F4] border border-gray-200 text-[#17251C] hover:bg-gray-100 text-xs sm:text-sm font-semibold rounded-xl transition-colors self-start sm:self-auto"
          >
            <HeartHandshake className="w-4 h-4 text-[#166534]" />
            <span>{t.myInterestsTitle}</span>
          </button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchCropPlaceholder}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-700 focus:outline-none focus:border-[#166534]"
          >
            <option value="all">{language === 'hi' ? 'सभी फसलें' : 'All Crops'}</option>
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-700 focus:outline-none focus:border-[#166534]"
          >
            <option value="all">{language === 'hi' ? 'सभी राज्य' : 'All States'}</option>
            {uniqueStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <LoadingSpinner message="Loading marketplace harvest listings..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title={language === 'hi' ? 'कोई फसल लिस्टिंग नहीं मिली' : 'No Harvest Listings Found'}
          description={
            language === 'hi'
              ? 'वर्तमान फ़िल्टर या खोज मानदंड से कोई फसल मेल नहीं खाती।'
              : 'No available harvest matches your search filters. Try adjusting your search query or state selection.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <Link to={`/listings/${lot.id}`} className="hover:text-[#166534] transition-colors">
                      <h3 className="text-base font-bold text-[#17251C]">
                        {lot.crop}
                      </h3>
                    </Link>
                    <span className="text-xs text-gray-500 font-medium">
                      {lot.variety || 'Standard'} • Farmer: {lot.farmer_name}
                    </span>
                  </div>

                  {lot.asking_price ? (
                    <div className="text-right">
                      <span className="text-base font-black text-[#166534] block">
                        ₹{lot.asking_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 block -mt-0.5">/quintal</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">Open Bid</span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F7F9F4] text-xs my-3">
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t.quantityCol}</span>
                    <span className="font-bold text-[#17251C]">{lot.quantity} {lot.unit}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[10px]">{t.gradeCol}</span>
                    <span className="font-bold text-[#17251C] line-clamp-1">{lot.grade}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[10px]">{t.locationCol}</span>
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {lot.district}, {lot.state}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[10px]">{t.deadlineCol}</span>
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {lot.selling_deadline}
                    </span>
                  </div>
                </div>

                {lot.storage_available ? (
                  <p className="text-[11px] text-emerald-800 flex items-center gap-1.5 mb-2">
                    <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Farmgate storage available (₹{lot.storage_cost_per_day}/day/qtl)</span>
                  </p>
                ) : null}
              </div>

              {/* Express Interest Button */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                <span className="text-[11px] text-gray-400">
                  {lot.interest_count || 0} buyers interested
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenInterestModal(lot)}
                  className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t.expressInterestBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      {selectedListingForInterest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#17251C]">
                  {language === 'hi' ? 'खरीद रुचि व्यक्त करें' : 'Express Purchase Interest'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedListingForInterest.crop} ({selectedListingForInterest.quantity} {selectedListingForInterest.unit}) • Farmer: {selectedListingForInterest.farmer_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedListingForInterest(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitInterest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17251C] mb-1">
                  {t.proposedPriceLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="2450"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17251C] mb-1">
                  {language === 'hi' ? 'संपर्क फ़ोन नंबर' : 'Contact Phone Number'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94140 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17251C] mb-1">
                  {t.messageLabel}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'hi' ? 'वितरण शर्तें, तौल प्रक्रिया या भुगतान समय सीमा...' : 'Delivery conditions, inspection schedule, or payment terms...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedListingForInterest(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submittingInterest}
                  className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingInterest ? t.loading : t.submitInterestBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
