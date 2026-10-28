import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, Users, TrendingUp, Filter, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/Toast';

export const Harvests: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchHarvests = async () => {
    try {
      const data = await apiRequest<{ listings: any[] }>('/api/listings?ownerOnly=true');
      setListings(data.listings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load harvests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/listings/${deleteId}`, { method: 'DELETE' });
      addToast('success', language === 'hi' ? 'फसल लिस्टिंग सफलतापूर्वक हटाई गई।' : 'Harvest listing deleted successfully.');
      setListings((prev) => prev.filter((l) => l.id !== deleteId));
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      (l.variety && l.variety.toLowerCase().includes(search.toLowerCase())) ||
      l.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title={t.confirmDeleteTitle}
        message={t.confirmDeleteMsg}
        confirmLabel={t.yesDelete}
        cancelLabel={t.cancelBtn}
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            {t.myHarvests}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight mt-0.5">
            {t.harvestListingsTitle}
          </h1>
          <p className="text-xs text-[#647067] mt-1">
            {language === 'hi'
              ? 'अपनी पंजीकृत फसलों की निगरानी करें, विवरण संपादित करें या खरीदार मैच शुरू करें।'
              : 'Manage your logged crop lots, update quality grades, and initiate buyer matching.'}
          </p>
        </div>

        <Link
          to="/farmer/add-harvest"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addNewHarvestBtn}</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'फसल, किस्म या जिला खोजें...' : 'Search crop, variety, district...'}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-700 focus:outline-none focus:border-[#166534]"
          >
            <option value="all">{language === 'hi' ? 'सभी स्थितियां' : 'All Statuses'}</option>
            <option value="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</option>
            <option value="sold">{language === 'hi' ? 'बिक चुकी' : 'Sold'}</option>
            <option value="withdrawn">{language === 'hi' ? 'वापस ली गई' : 'Withdrawn'}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading harvests..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title={t.noHarvestsYet}
          description={t.noHarvestsSub}
          actionText={t.addNewHarvestBtn}
          onAction={() => navigate('/farmer/add-harvest')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#166534] flex items-center justify-center font-bold text-lg">
                      🌾
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17251C]">
                        {lot.crop}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {lot.variety || (language === 'hi' ? 'मानक किस्म' : 'Standard Variety')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      lot.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lot.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F7F9F4] text-xs my-3">
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t.quantityCol}</span>
                    <span className="font-bold text-[#17251C]">
                      {lot.quantity} {lot.unit}
                    </span>
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

                {lot.asking_price && (
                  <p className="text-xs text-[#647067] mb-3">
                    <span className="font-semibold text-gray-700">
                      {language === 'hi' ? 'अपेक्षित सांकेतिक भाव:' : 'Asking Quote:'}
                    </span>{' '}
                    ₹{lot.asking_price}/quintal
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate('/farmer/buyers', { state: { selectedLot: lot } })}
                    className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.viewMatchesBtn}</span>
                  </button>
                  <button
                    onClick={() => navigate('/farmer/selling-analysis', { state: { selectedLot: lot } })}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{t.analyzeBtn}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate('/farmer/add-harvest', { state: { editLot: lot } })}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title={t.editBtn}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(lot.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.deleteBtn}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
