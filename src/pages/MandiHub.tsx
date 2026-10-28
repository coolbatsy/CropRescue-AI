// src/pages/MandiHub.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Phone,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Building2,
  Store,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_MANDIS, MandiItem, MandiType } from '../data/mandis';
import { calculateDistanceKm } from '../services/geoService';

export const MandiHub: React.FC = () => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === 1
            ? 'Location access was denied. You can still search by district or village name.'
            : 'Unable to pinpoint GPS coordinates. Please check your device location settings.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const cropOptions = useMemo(() => {
    const set = new Set<string>();
    SAMPLE_MANDIS.forEach((m) => m.commodities.forEach((c) => set.add(c.crop)));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const stateOptions = useMemo(() => {
    const set = new Set<string>(SAMPLE_MANDIS.map((m) => m.state));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const typeOptions = ['All', 'Rural Collection Center', 'Village Haat (GrAM)', 'APMC Mandi'];

  // Calculate distance & sort closest first
  const mandisWithDistance = useMemo(() => {
    return SAMPLE_MANDIS.map((mandi) => {
      const distance = userCoords
        ? calculateDistanceKm(userCoords.lat, userCoords.lng, mandi.lat, mandi.lng)
        : null;
      return { ...mandi, distance };
    }).sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });
  }, [userCoords]);

  // Apply filters
  const filteredMandis = useMemo(() => {
    return mandisWithDistance.filter((m) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.district.toLowerCase().includes(query) ||
        m.state.toLowerCase().includes(query) ||
        (m.villageOrTehsil && m.villageOrTehsil.toLowerCase().includes(query));

      const matchesState = selectedState === 'All' || m.state === selectedState;
      const matchesCrop =
        selectedCrop === 'All' || m.commodities.some((c) => c.crop === selectedCrop);
      const matchesType = selectedType === 'All' || m.type === selectedType;

      return matchesSearch && matchesState && matchesCrop && matchesType;
    });
  }, [mandisWithDistance, searchQuery, selectedCrop, selectedState, selectedType]);

  const getTypeBadge = (type: MandiType) => {
    if (type === 'Rural Collection Center') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-[#166534] dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
          <Store className="w-3 h-3 text-emerald-600" />
          Rural Collection Center
        </span>
      );
    }
    if (type === 'Village Haat (GrAM)') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
          <Layers className="w-3 h-3 text-amber-600" />
          Village Haat (GrAM)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
        <Building2 className="w-3 h-3 text-blue-600" />
        APMC Wholesale Yard
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Geolocation CTA */}
      <div className="bg-white dark:bg-[#141f17] rounded-3xl p-6 border border-gray-200/80 dark:border-[#233327] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Rural Aggregation & Mandi Rates
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17251C] dark:text-white tracking-tight">
            Live Mandi & Rural Collection Centers
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Compare wholesale APMC yards against nearby village collection hubs (GrAMs & FPO Centers) to save road transport costs.
          </p>
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-60 shrink-0 self-start md:self-auto cursor-pointer"
        >
          {locating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>{userCoords ? 'Refresh Farm GPS' : 'Detect My Location'}</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation Status Alert */}
      {geoError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold">GPS Notice</p>
            <p className="mt-0.5 opacity-90">{geoError}</p>
          </div>
        </div>
      )}

      {userCoords && !geoError && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>
              Your detected coordinates: <strong>{userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E</strong>. All collection centers and mandis are arranged by shortest road travel.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full">
            Nearest First
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#141f17] p-4 rounded-2xl border border-gray-200/80 dark:border-[#233327] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-2xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by mandi, village, tehsil, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#1c2c20] border border-gray-200 dark:border-[#233327] rounded-xl text-xs sm:text-sm text-[#17251C] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-[#1c2c20] border border-gray-200 dark:border-[#233327] rounded-xl text-xs font-semibold text-[#17251C] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                Type: {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-[#1c2c20] border border-gray-200 dark:border-[#233327] rounded-xl text-xs font-semibold text-[#17251C] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>
                Crop: {crop}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-[#1c2c20] border border-gray-200 dark:border-[#233327] rounded-xl text-xs font-semibold text-[#17251C] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            {stateOptions.map((st) => (
              <option key={st} value={st}>
                State: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Mandis and Rural Collection Centers */}
      {filteredMandis.length === 0 ? (
        <div className="bg-white dark:bg-[#141f17] rounded-3xl p-12 text-center border border-gray-200/80 dark:border-[#233327]">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No Centers Match Your Search</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the center type or crop filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredMandis.map((mandi) => {
            const displayedCommodities =
              selectedCrop === 'All'
                ? mandi.commodities
                : mandi.commodities.filter((c) => c.crop === selectedCrop);

            return (
              <div
                key={mandi.id}
                className="bg-white dark:bg-[#141f17] rounded-3xl p-5 border border-gray-200/80 dark:border-[#233327] shadow-xs flex flex-col justify-between hover:border-emerald-500/60 transition-all"
              >
                <div>
                  {/* Card Header: Type badge & distance */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {getTypeBadge(mandi.type)}
                    {mandi.distance !== null && (
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-[#166534] dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-[#22C55E]" />
                        {mandi.distance} km
                      </span>
                    )}
                  </div>

                  {/* Name and Location */}
                  <h3 className="font-bold text-base text-[#17251C] dark:text-white">
                    {mandi.name}
                  </h3>
                  <p className="text-xs text-[#647067] dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>
                      {mandi.villageOrTehsil ? `${mandi.villageOrTehsil}, ` : ''}
                      {mandi.district}, {mandi.state}
                    </span>
                  </p>

                  {/* Facilities Tags */}
                  {mandi.facilities && mandi.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {mandi.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1c2c20] text-gray-600 dark:text-gray-300 text-[10px] font-medium"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Operating Times */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-[#233327]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {mandi.operatingHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {mandi.contact}
                    </span>
                  </div>

                  {/* Today's Arrival Rates */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Live Collection / Modal Rates
                    </p>
                    {displayedCommodities.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#F7F9F4] dark:bg-[#1a281e] rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            {item.crop}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Arrival: {item.arrivals.toLocaleString()} qtl • {item.updatedAt}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-[#166534] dark:text-emerald-400 flex items-center justify-end gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                            ₹{item.modalPrice.toLocaleString()}/qtl
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Min ₹{item.minPrice} – Max ₹{item.maxPrice}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#233327] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    {mandi.type === 'APMC Mandi' ? 'Regulated APMC Yard' : 'Local Rural Collection Point'}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mandi.lat},${mandi.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline"
                  >
                    <span>Get Directions</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};