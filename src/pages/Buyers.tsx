// src/pages/Buyers.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Navigation, RefreshCw, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../api/client';
import { BuyerCard } from '../components/BuyerCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { MatchEngineResult } from '../services/matchingService';
import { CROPS } from '../data/crops';

export const Buyers: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedLotFromState = (location.state as any)?.selectedLot;

  const [myListings, setMyListings] = useState<any[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>(selectedLotFromState?.id || '');
  const [crop, setCrop] = useState<string>(selectedLotFromState?.crop || 'Wheat');
  const [quantity, setQuantity] = useState<number>(selectedLotFromState?.quantity || 100);
  const [unit, setUnit] = useState<'quintal' | 'kg'>(selectedLotFromState?.unit || 'quintal');
  const [grade, setGrade] = useState<string>(selectedLotFromState?.grade || 'Grade A (Sharbati/Premium)');
  const [state, setState] = useState<string>(selectedLotFromState?.state || 'Madhya Pradesh');
  const [district, setDistrict] = useState<string>(selectedLotFromState?.district || 'Sehore');
  const [minPrice, setMinPrice] = useState<number>(selectedLotFromState?.min_selling_price || 2200);

  // Farmer Device Coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const [matchResult, setMatchResult] = useState<MatchEngineResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detect GPS
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch farmer's own listings
  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await apiRequest<{ listings: any[] }>('/api/listings?ownerOnly=true');
        setMyListings(data.listings || []);
        if (!selectedLotId && data.listings && data.listings.length > 0) {
          applyLot(data.listings[0]);
        }
      } catch {
        // ignore
      }
    }
    fetchListings();
  }, []);

  const applyLot = (lot: any) => {
    setSelectedLotId(lot.id);
    setCrop(lot.crop);
    setQuantity(lot.quantity);
    setUnit(lot.unit);
    setGrade(lot.grade);
    setState(lot.state);
    setDistrict(lot.district);
    setMinPrice(lot.min_selling_price || 0);
  };

  const handleLotSelect = (id: string) => {
    const found = myListings.find((l) => l.id === id);
    if (found) applyLot(found);
  };

  const runMatching = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<MatchEngineResult>('/api/match-buyers', {
        method: 'POST',
        body: JSON.stringify({
          crop,
          quantity,
          unit,
          grade,
          state,
          district,
          userLat: userCoords?.lat,
          userLng: userCoords?.lng,
          minAcceptablePrice: minPrice,
        }),
      });
      setMatchResult(result);
    } catch (err: any) {
      setError(err.message || 'Error running buyer matching.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMatching();
  }, [crop, quantity, unit, grade, state, district, minPrice, userCoords]);

  return (
    <div className="space-y-6">
      {/* Header with GPS Location CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141f17] p-6 rounded-3xl border border-gray-100 dark:border-[#233327] shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#4ade80]">
            {t.feat1Title}
          </span>
          <h1 className="text-2xl font-black text-[#17251C] dark:text-white tracking-tight mt-0.5">
            {language === 'hi' ? 'निकटतम खरीदार मिलान इंजन' : 'Nearby Buyer Recommendation Engine'}
          </h1>
          <p className="text-xs text-[#647067] dark:text-gray-400 mt-1 max-w-2xl">
            {language === 'hi'
              ? 'आपके खेत के सबसे नजदीकी खरीदारों को प्राथमिकता देता है जिससे परिवहन खर्च कम से कम लगे।'
              : 'Automatically ranks verified buyers by proximity to your farm location to minimize transport deductions.'}
          </p>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#166534] dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
        >
          {locating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          <span>{userCoords ? 'GPS Synced' : 'Detect Farm Location'}</span>
        </button>
      </div>

      {userCoords && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Buyers sorted by real road distance from coordinates: <strong>{userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E</strong>.
          </span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white dark:bg-[#141f17] p-4 rounded-2xl border border-gray-100 dark:border-[#233327] shadow-2xs grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">{t.cropLabel}</span>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">{t.quantityLabel}</span>
          <div className="flex gap-1">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-2/3 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
            <span className="w-1/3 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              {unit}
            </span>
          </div>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">{t.gradeLabel}</span>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">{t.locationCol}</span>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">{t.minSellingPriceLabel}</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating nearest buyers based on your farm location..." />
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : matchResult ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166534] dark:text-[#4ade80]" />
              <span className="font-semibold text-emerald-950 dark:text-emerald-300">
                Found {matchResult.compatibleMatches.length} matching buyers sorted by closest distance.
              </span>
            </div>
          </div>

          {matchResult.compatibleMatches.length === 0 ? (
            <EmptyState
              title={language === 'hi' ? 'कोई नजदीकी खरीदार नहीं मिला' : 'No Nearby Compatible Buyers Found'}
              description={language === 'hi' ? 'कृपया न्यूनतम भाव या फसल में बदलाव करके पुनः खोजें।' : 'Try relaxing the minimum price or transport distance limits.'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchResult.compatibleMatches.map((m) => (
                <BuyerCard
                  key={m.buyerId}
                  match={m}
                  actionLabel={language === 'hi' ? 'विश्लेषण करें' : 'Analyze Scenarios'}
                  onSelect={() => navigate('/farmer/selling-analysis', { state: { selectedLot: selectedLotFromState, buyer: m } })}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};