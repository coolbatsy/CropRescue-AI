import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { CROPS } from '../data/crops';

export const AddHarvest: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const editLot = (location.state as any)?.editLot;
  const isEditing = Boolean(editLot);

  // Form State
  const [crop, setCrop] = useState(editLot?.crop || 'Wheat');
  const [variety, setVariety] = useState(editLot?.variety || '');
  const [quantity, setQuantity] = useState(editLot?.quantity?.toString() || '100');
  const [unit, setUnit] = useState<'quintal' | 'kg'>(editLot?.unit || 'quintal');
  const [grade, setGrade] = useState(editLot?.grade || 'Grade A (Sharbati/Premium)');
  const [harvestDate, setHarvestDate] = useState(
    editLot?.harvest_date || new Date().toISOString().split('T')[0]
  );
  const [sellingDeadline, setSellingDeadline] = useState(
    editLot?.selling_deadline ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [state, setState] = useState(editLot?.state || 'Madhya Pradesh');
  const [district, setDistrict] = useState(editLot?.district || 'Sehore');
  const [askingPrice, setAskingPrice] = useState(editLot?.asking_price?.toString() || '2450');
  const [storageAvailable, setStorageAvailable] = useState(
    editLot?.storage_available !== undefined ? Boolean(editLot.storage_available) : true
  );
  const [storageCostPerDay, setStorageCostPerDay] = useState(
    editLot?.storage_cost_per_day?.toString() || '0.8'
  );
  const [spoilageRate, setSpoilageRate] = useState(
    editLot?.spoilage_rate?.toString() || '0.5'
  );
  const [maxTransportKm, setMaxTransportKm] = useState(
    editLot?.max_transport_km?.toString() || '150'
  );
  const [minSellingPrice, setMinSellingPrice] = useState(
    editLot?.min_selling_price?.toString() || '2200'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-update grade choices and defaults when crop changes
  const selectedCropInfo = CROPS.find((c) => c.name.toLowerCase() === crop.toLowerCase()) || CROPS[0];

  const handleCropChange = (selectedCropName: string) => {
    setCrop(selectedCropName);
    const info = CROPS.find((c) => c.name.toLowerCase() === selectedCropName.toLowerCase());
    if (info) {
      if (info.standardGrades[0]) setGrade(info.standardGrades[0]);
      if (info.varieties[0]) setVariety(info.varieties[0]);
      setStorageCostPerDay(info.typicalStorageCostPerDayPerQuintal.toString());
      setSpoilageRate(info.defaultSpoilageRatePerWeek.toString());
      setAskingPrice(info.suggestedMaxPrice.toString());
      setMinSellingPrice(info.suggestedMinPrice.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError(language === 'hi' ? 'मात्रा शून्य से अधिक होनी चाहिए।' : 'Quantity must be greater than zero.');
      return;
    }

    if (new Date(sellingDeadline) < new Date(harvestDate)) {
      setError(
        language === 'hi'
          ? 'बिक्री की अंतिम तिथि कटाई की तिथि से पहले नहीं हो सकती।'
          : 'Selling deadline cannot precede harvest date.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        crop,
        variety: variety.trim(),
        quantity: numQty,
        unit,
        grade,
        harvestDate,
        sellingDeadline,
        state: state.trim(),
        district: district.trim(),
        askingPrice: Number(askingPrice) || null,
        storageAvailable,
        storageCostPerDay: Number(storageCostPerDay) || 0,
        spoilageRate: Number(spoilageRate) || 0,
        maxTransportKm: Number(maxTransportKm) || 300,
        minSellingPrice: Number(minSellingPrice) || 0,
      };

      if (isEditing) {
        await apiRequest(`/api/listings/${editLot.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      navigate('/farmer/harvests');
    } catch (err: any) {
      setError(err.message || 'Failed to save harvest listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#17251C] tracking-tight">
            {isEditing ? t.formTitleEdit : t.formTitleAdd}
          </h1>
          <p className="text-xs text-[#647067] mt-0.5">{t.formSubtitle}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        {/* Core Crop Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
            {language === 'hi' ? '१. फसल का विवरण' : '1. Crop Details'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.cropLabel} *
              </label>
              <select
                value={crop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534] bg-white"
              >
                {CROPS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.hindiName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.varietyLabel}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Sharbati, HD-2967, Pusa 1121"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.quantityLabel} *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  required
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-2/3 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'quintal' | 'kg')}
                  className="w-1/3 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534] bg-white"
                >
                  <option value="quintal">{t.quintals} (100 kg)</option>
                  <option value="kg">{t.kg}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.gradeLabel} *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534] bg-white"
              >
                {selectedCropInfo.standardGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline & Location */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
            {language === 'hi' ? '२. समय व स्थान' : '2. Timeline & Location'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.harvestDateLabel} *
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.sellingDeadlineLabel} *
              </label>
              <input
                type="date"
                required
                value={sellingDeadline}
                onChange={(e) => setSellingDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.stateLabel} *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Madhya Pradesh, Punjab, Haryana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.districtLabel} *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Sehore, Indore, Karnal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>
          </div>
        </div>

        {/* Pricing, Storage & Spoilage Constraints */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
            {language === 'hi' ? '३. मूल्य व भंडारण मापदंड' : '3. Pricing & Storage Parameters'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.askingPriceLabel}
              </label>
              <input
                type="number"
                min="0"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="2450"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.minSellingPriceLabel}
              </label>
              <input
                type="number"
                min="0"
                value={minSellingPrice}
                onChange={(e) => setMinSellingPrice(e.target.value)}
                placeholder="2200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.storageCostLabel}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={storageCostPerDay}
                onChange={(e) => setStorageCostPerDay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.spoilageRateLabel}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={spoilageRate}
                onChange={(e) => setSpoilageRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251C] mb-1.5">
                {t.maxTransportLabel}
              </label>
              <input
                type="number"
                min="0"
                value={maxTransportKm}
                onChange={(e) => setMaxTransportKm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-[#17251C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={storageAvailable}
                  onChange={(e) => setStorageAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#166534] focus:ring-[#166534]"
                />
                <span>{t.storageAvailableLabel}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t.cancelBtn}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t.loading : t.saveHarvestBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
