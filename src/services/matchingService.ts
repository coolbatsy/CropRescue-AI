// src/services/matchingService.ts
import { SAMPLE_BUYERS, SampleBuyer } from '../data/sampleBuyers';
import { convertToQuintals } from './calculationService';
import { calculateDistanceKm } from './geoService';

export interface HarvestMatchRequest {
  crop: string;
  quantity: number;
  unit: 'quintal' | 'kg';
  grade: string;
  state: string;
  district: string;
  userLat?: number;
  userLng?: number;
  harvestDate?: string;
  sellingDeadline?: string;
  minAcceptablePrice?: number;
  maxTransportDistanceKm?: number;
  customBuyers?: SampleBuyer[];
}

export interface BuyerMatchItem {
  buyerId: string;
  buyerName: string;
  buyerType: string;
  location: string;
  distanceKm: number;
  indicativePricePerQuintal: number;
  compatibleQuantityQuintals: number;
  unabsorbedQuantityQuintals: number;
  grossSaleValue: number;
  transportDeduction: number;
  handlingDeduction: number;
  totalDeductions: number;
  estimatedNetProceeds: number;
  effectiveNetPricePerQuintal: number;
  paymentTerms: string;
  paymentTermsHi: string;
  deliveryRequirement: string;
  matchReasons: string[];
  keyRisks: string[];
  rank: number;
}

export interface RejectedBuyerItem {
  buyerId: string;
  buyerName: string;
  buyerType: string;
  location: string;
  rejectionReasons: string[];
  rejectionReasonsHi: string[];
}

export interface MatchEngineResult {
  totalCandidatesEvaluated: number;
  compatibleMatches: BuyerMatchItem[];
  rejectedCandidates: RejectedBuyerItem[];
  harvestQuantityQuintals: number;
  crop: string;
  grade: string;
  bestEstimatedNetProceeds: number;
  bestBuyerName: string | null;
}

export function matchBuyers(request: HarvestMatchRequest): MatchEngineResult {
  const allBuyers = request.customBuyers && request.customBuyers.length > 0
    ? request.customBuyers
    : SAMPLE_BUYERS;

  const harvestQty = convertToQuintals(request.quantity, request.unit || 'quintal');
  const cropLower = (request.crop || '').toLowerCase().trim();
  const minPrice = Number(request.minAcceptablePrice) || 0;
  const maxDistance = Number(request.maxTransportDistanceKm) || 300;

  const compatibleMatches: BuyerMatchItem[] = [];
  const rejectedCandidates: RejectedBuyerItem[] = [];

  for (const buyer of allBuyers) {
    if (!buyer.active) continue;

    const rejectionReasons: string[] = [];
    const rejectionReasonsHi: string[] = [];

    // 1. Crop compatibility
    const acceptsCrop = buyer.acceptedCrops.some(
      (c) => c.toLowerCase() === cropLower || cropLower.includes(c.toLowerCase()) || c.toLowerCase().includes(cropLower)
    );
    if (!acceptsCrop) {
      rejectionReasons.push(`Does not purchase ${request.crop}`);
      rejectionReasonsHi.push(`${request.crop} की खरीद नहीं करते हैं`);
    }

    // 2. Grade compatibility
    if (acceptsCrop && request.grade) {
      const gradeLower = request.grade.toLowerCase();
      const acceptsGrade = buyer.acceptedGrades.some((g) => {
        const gLow = g.toLowerCase();
        if (gradeLower.includes('grade a') && gLow.includes('grade a')) return true;
        if (gradeLower.includes('grade b') && gLow.includes('grade b')) return true;
        if (gradeLower.includes('grade c') && gLow.includes('grade c')) return true;
        return gLow.includes(gradeLower) || gradeLower.includes(gLow);
      });
      if (!acceptsGrade) {
        rejectionReasons.push(`Quality grade "${request.grade}" does not meet buyer specifications`);
        rejectionReasonsHi.push(`गुणवत्ता ग्रेड "${request.grade}" खरीदार के मानकों से मेल नहीं खाती`);
      }
    }

    // 3. Price quotation check
    const indicativePrice = buyer.indicativePricePerQuintal[cropLower] || 0;
    if (acceptsCrop && indicativePrice <= 0) {
      rejectionReasons.push('No active quotation for this crop');
      rejectionReasonsHi.push('इस फसल के लिए कोई सक्रिय भाव उपलब्ध नहीं है');
    } else if (minPrice > 0 && indicativePrice < minPrice) {
      rejectionReasons.push(`Offered price (₹${indicativePrice}/qtl) is below your minimum threshold of ₹${minPrice}/qtl`);
      rejectionReasonsHi.push(`प्रस्तावित भाव (₹${indicativePrice}/क्विंटल) आपके न्यूनतम भाव से कम है`);
    }

    // 4. Batch quantity check
    if (harvestQty < buyer.minQuantityQuintals) {
      rejectionReasons.push(`Batch size (${harvestQty} qtl) is below buyer's minimum capacity (${buyer.minQuantityQuintals} qtl)`);
      rejectionReasonsHi.push(`मात्रा न्यूनतम क्षमता (${buyer.minQuantityQuintals} क्विंटल) से कम है`);
    }

    // 5. Accurate GPS Proximity Calculation
    let effectiveDistance: number;
    if (request.userLat && request.userLng && buyer.lat && buyer.lng) {
      effectiveDistance = calculateDistanceKm(request.userLat, request.userLng, buyer.lat, buyer.lng);
    } else {
      const isLocalState = buyer.state.toLowerCase() === (request.state || '').toLowerCase();
      effectiveDistance = isLocalState ? buyer.estimatedDistanceKm : buyer.estimatedDistanceKm + 100;
    }

    if (effectiveDistance > maxDistance) {
      rejectionReasons.push(`Distance (${effectiveDistance} km) exceeds maximum acceptable transport limit (${maxDistance} km)`);
      rejectionReasonsHi.push(`दूरी (${effectiveDistance} किमी) आपकी अधिकतम परिवहन सीमा से अधिक है`);
    }

    if (rejectionReasons.length > 0) {
      rejectedCandidates.push({
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerType: buyer.buyerType,
        location: `${buyer.district}, ${buyer.state}`,
        rejectionReasons,
        rejectionReasonsHi,
      });
      continue;
    }

    // Feasible candidate calculations
    const compatibleQty = Math.min(harvestQty, buyer.maxQuantityQuintals);
    const unabsorbedQty = Math.max(0, harvestQty - buyer.maxQuantityQuintals);

    const grossSale = compatibleQty * indicativePrice;
    const transportCost = Math.round(compatibleQty * buyer.transportRatePerKmPerQuintal * (effectiveDistance / 25));
    const handlingCost = Math.round(compatibleQty * buyer.handlingFeePerQuintal);
    const totalDeductions = transportCost + handlingCost;
    const netProceeds = grossSale - totalDeductions;
    const effectiveNetPrice = compatibleQty > 0 ? netProceeds / compatibleQty : 0;

    const matchReasons: string[] = [
      `Located ${effectiveDistance} km from your farm (${buyer.district}, ${buyer.state})`,
      `Can absorb ${compatibleQty} quintals (${Math.round((compatibleQty / harvestQty) * 100)}% of harvest)`,
      `Quoted base price: ₹${indicativePrice}/quintal`,
    ];

    const keyRisks: string[] = [];
    if (unabsorbedQty > 0) {
      keyRisks.push(`Leaves ${unabsorbedQty} quintals unabsorbed; requires multi-buyer allocation`);
    }
    if (effectiveDistance > 100) {
      keyRisks.push(`Transit distance of ${effectiveDistance} km will incur higher road freight`);
    }

    compatibleMatches.push({
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerType: buyer.buyerType,
      location: `${buyer.district}, ${buyer.state}`,
      distanceKm: effectiveDistance,
      indicativePricePerQuintal: indicativePrice,
      compatibleQuantityQuintals: compatibleQty,
      unabsorbedQuantityQuintals: unabsorbedQty,
      grossSaleValue: grossSale,
      transportDeduction: transportCost,
      handlingDeduction: handlingCost,
      totalDeductions,
      estimatedNetProceeds: netProceeds,
      effectiveNetPricePerQuintal: Math.round(effectiveNetPrice),
      paymentTerms: buyer.paymentTerms,
      paymentTermsHi: buyer.paymentTermsHi,
      deliveryRequirement: buyer.deliveryRequirement,
      matchReasons,
      keyRisks,
      rank: 0,
    });
  }

  // Primary sort by shortest distance first, then by net proceeds
  compatibleMatches.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return b.estimatedNetProceeds - a.estimatedNetProceeds;
  });

  compatibleMatches.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  return {
    totalCandidatesEvaluated: allBuyers.length,
    compatibleMatches,
    rejectedCandidates,
    harvestQuantityQuintals: harvestQty,
    crop: request.crop,
    grade: request.grade,
    bestEstimatedNetProceeds: compatibleMatches[0] ? compatibleMatches[0].estimatedNetProceeds : 0,
    bestBuyerName: compatibleMatches[0] ? compatibleMatches[0].buyerName : null,
  };
}