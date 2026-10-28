import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Warehouse,
  ShieldCheck,
  HeartHandshake,
  Share2,
  Printer,
  Calculator,
  Users,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interest Modal
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, type, message: msg }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      try {
        const data = await apiRequest<{ listing: any }>(`/api/listings/${id}`);
        setListing(data.listing);
        if (data.listing.asking_price) {
          setProposedPrice(data.listing.asking_price.toString());
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load harvest listing details.');
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  const handleOpenInterest = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }
    if (user.role !== 'buyer') {
      addToast(
        'info',
        language === 'hi'
          ? 'केवल खरीदार खाते ही खरीद रुचि दर्ज कर सकते हैं।'
          : 'Only buyer accounts can express purchase interest.'
      );
      return;
    }
    setInterestModalOpen(true);
    setModalError(null);
  };

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setSubmitting(true);
    setModalError(null);

    try {
      await apiRequest(`/api/listings/${listing.id}/interest`, {
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
          ? 'आपकी खरीद रुचि सफलतापूर्वक दर्ज कर ली गई है!'
          : 'Your expression of interest was recorded in CropRescue AI!'
      );
      setInterestModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit expression of interest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading harvest details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-xs my-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Listing Not Found</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          The requested harvest listing does not exist or may have been concluded.
        </p>
        <Link
          to="/marketplace"
          className="px-4 py-2 bg-[#166534] text-white text-xs font-semibold rounded-xl"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'वापस जाएं' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रिंट' : 'Print Spec'}</span>
          </button>
        </div>
      </div>

      {/* Main Spec Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {listing.crop}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Lot #{listing.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17251C] tracking-tight">
              {listing.crop} {listing.variety ? `(${listing.variety})` : ''}
            </h1>
            <p className="text-xs text-[#647067] mt-1 flex items-center gap-1.5">
              <span>Farmer: <strong>{listing.farmer_name}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {listing.district}, {listing.state}
              </span>
            </p>
          </div>

          <div className="sm:text-right bg-[#F7F9F4] p-4 rounded-2xl border border-gray-100 sm:bg-transparent sm:border-0 sm:p-0">
            <span className="text-xs text-gray-400 uppercase tracking-wider block">
              {language === 'hi' ? 'अपेक्षित सांकेतिक भाव' : 'Asking Price'}
            </span>
            <span className="text-3xl font-black text-[#166534]">
              {listing.asking_price ? `₹${listing.asking_price.toLocaleString('en-IN')}` : 'Open Quote'}
            </span>
            <span className="text-xs text-gray-500 block">per quintal</span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F7F9F4] border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">{t.quantityCol}</span>
            <span className="text-base font-extrabold text-[#17251C] mt-0.5 block">
              {listing.quantity} {listing.unit}
            </span>
            <span className="text-[10px] text-gray-500">
              ({listing.unit === 'kg' ? (listing.quantity / 100).toFixed(1) : listing.quantity * 100} {listing.unit === 'kg' ? 'quintals' : 'kg'})
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">{t.gradeCol}</span>
            <span className="text-sm font-bold text-[#17251C] mt-0.5 block">
              {listing.grade}
            </span>
            <span className="text-[10px] text-gray-500">Verified Specification</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Harvest Date</span>
            <span className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {listing.harvest_date}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">{t.deadlineCol}</span>
            <span className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {listing.selling_deadline}
            </span>
          </div>
        </div>

        {/* Storage & Logistics parameters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {language === 'hi' ? 'भंडारण व लॉजिस्टिक्स स्थिति' : 'Storage & Logistics Conditions'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
              <span className="text-gray-400 block text-[10px]">Storage Availability:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                {listing.storage_available ? 'Farmgate / Nearby Warehouse Available' : 'No Dedicated Storage'}
              </span>
              {listing.storage_available ? (
                <span className="text-[10px] text-gray-500 block mt-0.5">₹{listing.storage_cost_per_day}/day/quintal</span>
              ) : null}
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
              <span className="text-gray-400 block text-[10px]">Weekly Spoilage Risk:</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">
                {listing.spoilage_rate ? `${listing.spoilage_rate}% per week` : 'Standard ambient rate'}
              </span>
              <span className="text-[10px] text-gray-500">Natural moisture loss model</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
              <span className="text-gray-400 block text-[10px]">Max Transport Limit:</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">
                {listing.max_transport_km ? `${listing.max_transport_km} km` : '300 km standard'}
              </span>
              <span className="text-[10px] text-gray-500">Transit boundary</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenInterest}
              className="w-full sm:w-auto px-6 py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t.expressInterestBtn}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              to="/calculator"
              className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-[#166534]" />
              <span>{t.profitCalculator}</span>
            </Link>

            <Link
              to="/farmer/buyers"
              state={{ selectedLot: listing }}
              className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#166534]" />
              <span>{t.viewMatchesBtn}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Express Interest Modal */}
      {interestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#17251C]">
                  {language === 'hi' ? 'खरीद रुचि व्यक्त करें' : 'Express Purchase Interest'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {listing.crop} ({listing.quantity} {listing.unit}) • Farmer: {listing.farmer_name}
                </p>
              </div>
              <button
                onClick={() => setInterestModalOpen(false)}
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
                  onClick={() => setInterestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? t.loading : t.submitInterestBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
