import { SAMPLE_BUYERS, SampleBuyer } from '../data/sampleBuyers';
import { convertToQuintals } from './calculationService';

export interface LotOptimizationRequest {
  crop: string;
  quantity: number;
  unit: 'quintal' | 'kg';
  grade: string;
  state?: string;
  district?: string;
  minAcceptablePrice?: number;
  customBuyers?: SampleBuyer[];
}

export interface BuyerAllocationItem {
  buyerId: string;
  buyerName: string;
  buyerType: string;
  allocatedQuantityQuintals: number;
  pricePerQuintal: number;
  grossSaleValue: number;
  variableCosts: number;
  fixedCosts: number;
  totalCosts: number;
  estimatedNetProceeds: number;
  effectiveNetPricePerQuintal: number;
  notes: string;
}

export interface SingleBuyerComparison {
  buyerId: string;
  buyerName: string;
  absorbedQuantityQuintals: number;
  unabsorbedQuantityQuintals: number;
  estimatedNetProceeds: number;
  effectiveNetPricePerQuintal: number;
}

export interface LotOptimizerResult {
  crop: string;
  totalHarvestQuintals: number;
  feasible: boolean;
  allocations: BuyerAllocationItem[];
  totalSoldQuintals: number;
  totalUnsoldQuintals: number;
  combinedGrossSaleValue: number;
  combinedTotalCosts: number;
  combinedNetProceeds: number;
  bestSingleBuyer: SingleBuyerComparison | null;
  differenceVsSingleBuyer: number;
  isSplitAdvantageous: boolean;
  recommendationExplanation: string;
  recommendationExplanationHi: string;
  emptyStateReason?: string;
}

export function optimizeLotAllocation(request: LotOptimizationRequest): LotOptimizerResult {
  const harvestQty = convertToQuintals(request.quantity, request.unit || 'quintal');
  const cropLower = (request.crop || '').toLowerCase().trim();
  const minPrice = Number(request.minAcceptablePrice) || 0;

  const candidatePool = (request.customBuyers && request.customBuyers.length > 0
    ? request.customBuyers
    : SAMPLE_BUYERS
  ).filter((b) => {
    if (!b.active) return false;
    const acceptsCrop = b.acceptedCrops.some(
      (c) => c.toLowerCase() === cropLower || cropLower.includes(c.toLowerCase()) || c.toLowerCase().includes(cropLower)
    );
    if (!acceptsCrop) return false;
    const price = b.indicativePricePerQuintal[cropLower] || 0;
    if (price <= 0 || (minPrice > 0 && price < minPrice)) return false;
    return true;
  });

  if (candidatePool.length === 0) {
    return {
      crop: request.crop,
      totalHarvestQuintals: harvestQty,
      feasible: false,
      allocations: [],
      totalSoldQuintals: 0,
      totalUnsoldQuintals: harvestQty,
      combinedGrossSaleValue: 0,
      combinedTotalCosts: 0,
      combinedNetProceeds: 0,
      bestSingleBuyer: null,
      differenceVsSingleBuyer: 0,
      isSplitAdvantageous: false,
      recommendationExplanation: 'No compatible buyers currently active for this crop and minimum price criteria.',
      recommendationExplanationHi: 'इस फसल और न्यूनतम भाव मानदंड के लिए वर्तमान में कोई उपयुक्त खरीदार सक्रिय नहीं है।',
      emptyStateReason: 'No compatible buyers found in the candidate pool.',
    };
  }

  // 1. Evaluate single buyer sales
  let bestSingle: SingleBuyerComparison | null = null;
  for (const buyer of candidatePool) {
    const price = buyer.indicativePricePerQuintal[cropLower];
    const singleQty = Math.min(harvestQty, buyer.maxQuantityQuintals);
    if (singleQty < buyer.minQuantityQuintals) continue;

    const gross = singleQty * price;
    const varCost = Math.round(singleQty * (buyer.transportRatePerKmPerQuintal * (buyer.estimatedDistanceKm / 25) + buyer.handlingFeePerQuintal));
    const fixCost = buyer.fixedDispatchFee;
    const net = gross - (varCost + fixCost);
    const eff = singleQty > 0 ? net / singleQty : 0;

    if (!bestSingle || net > bestSingle.estimatedNetProceeds) {
      bestSingle = {
        buyerId: buyer.id,
        buyerName: buyer.name,
        absorbedQuantityQuintals: singleQty,
        unabsorbedQuantityQuintals: Math.max(0, harvestQty - singleQty),
        estimatedNetProceeds: net,
        effectiveNetPricePerQuintal: Math.round(eff),
      };
    }
  }

  // 2. Greedy Bounded Multi-Buyer Allocation
  // Sort candidate buyers by highest unit net yield
  const scoredBuyers = candidatePool
    .map((b) => {
      const price = b.indicativePricePerQuintal[cropLower];
      const unitVarCost = b.transportRatePerKmPerQuintal * (b.estimatedDistanceKm / 25) + b.handlingFeePerQuintal;
      const unitMargin = price - unitVarCost;
      return { buyer: b, price, unitVarCost, unitMargin };
    })
    .sort((a, b) => b.unitMargin - a.unitMargin);

  let remainingToAllocate = harvestQty;
  const allocations: BuyerAllocationItem[] = [];

  for (const item of scoredBuyers) {
    if (remainingToAllocate <= 0) break;
    const b = item.buyer;

    // Check if remaining quantity meets min batch
    if (remainingToAllocate < b.minQuantityQuintals) {
      // If we cannot meet min quantity, skip unless it is the only allocation
      if (allocations.length > 0) continue;
    }

    const allocQty = Math.min(remainingToAllocate, b.maxQuantityQuintals);
    if (allocQty <= 0) continue;

    const gross = Math.round(allocQty * item.price);
    const variableCosts = Math.round(allocQty * item.unitVarCost);
    const fixedCosts = b.fixedDispatchFee;
    const totalCosts = variableCosts + fixedCosts;
    const net = gross - totalCosts;

    allocations.push({
      buyerId: b.id,
      buyerName: b.name,
      buyerType: b.buyerType,
      allocatedQuantityQuintals: allocQty,
      pricePerQuintal: item.price,
      grossSaleValue: gross,
      variableCosts,
      fixedCosts,
      totalCosts,
      estimatedNetProceeds: net,
      effectiveNetPricePerQuintal: allocQty > 0 ? Math.round(net / allocQty) : 0,
      notes: `Absorbs ${allocQty} qtl (${Math.round((allocQty / harvestQty) * 100)}%) at ₹${item.price}/qtl. Fixed dispatch fee: ₹${fixedCosts.toLocaleString('en-IN')}`,
    });

    remainingToAllocate -= allocQty;
  }

  const totalSold = allocations.reduce((sum, a) => sum + a.allocatedQuantityQuintals, 0);
  const totalUnsold = Math.max(0, harvestQty - totalSold);
  const combinedGross = allocations.reduce((sum, a) => sum + a.grossSaleValue, 0);
  const combinedCosts = allocations.reduce((sum, a) => sum + a.totalCosts, 0);
  const combinedNet = combinedGross - combinedCosts;

  const singleNet = bestSingle ? bestSingle.estimatedNetProceeds : 0;
  const diffVsSingle = combinedNet - singleNet;
  const isSplitAdvantageous = Boolean(
    allocations.length > 1 &&
      (diffVsSingle > 0 ||
        (bestSingle &&
          bestSingle.unabsorbedQuantityQuintals > 0 &&
          totalSold > bestSingle.absorbedQuantityQuintals))
  );

  let explanationEn = '';
  let explanationHi = '';

  if (allocations.length === 1) {
    explanationEn = `Single-buyer allocation to ${allocations[0].buyerName} is optimal. Splitting is not needed as this buyer accommodates the batch without incurring secondary logistics fees.`;
    explanationHi = `${allocations[0].buyerName} को एकल खरीदार आवंटन सबसे उपयुक्त है। अतिरिक्त लॉजिस्टिक्स शुल्क से बचने के लिए इसे बांटने की आवश्यकता नहीं है।`;
  } else if (isSplitAdvantageous) {
    explanationEn = `Splitting across ${allocations.length} buyers yields ₹${diffVsSingle.toLocaleString('en-IN')} higher net proceeds than the best single buyer, successfully liquidating ${totalSold} quintals while respecting buyer capacity caps.`;
    explanationHi = `${allocations.length} खरीदारों में फसल बांटने से एकल खरीदार की तुलना में ₹${diffVsSingle.toLocaleString('en-IN')} का अधिक शुद्ध लाभ मिलता है और खरीदारों की क्षमता सीमा के भीतर ${totalSold} क्विंटल की पूरी बिक्री संभव होती है।`;
  } else {
    explanationEn = `Selling to single buyer (${bestSingle?.buyerName || 'preferred buyer'}) yields higher proceeds because multiple buyer dispatches incur redundant fixed transport charges of ₹${allocations.reduce((s, a) => s + a.fixedCosts, 0).toLocaleString('en-IN')}.`;
    explanationHi = `एकल खरीदार (${bestSingle?.buyerName || 'प्राथमिक खरीदार'}) को बेचना अधिक फायदेमंद है क्योंकि कई खरीदारों को अलग-अलग भेजने पर ₹${allocations.reduce((s, a) => s + a.fixedCosts, 0).toLocaleString('en-IN')} का दोहरा निश्चित परिवहन खर्च लग जाता है।`;
  }

  return {
    crop: request.crop,
    totalHarvestQuintals: harvestQty,
    feasible: allocations.length > 0,
    allocations,
    totalSoldQuintals: totalSold,
    totalUnsoldQuintals: totalUnsold,
    combinedGrossSaleValue: combinedGross,
    combinedTotalCosts: combinedCosts,
    combinedNetProceeds: combinedNet,
    bestSingleBuyer: bestSingle,
    differenceVsSingleBuyer: diffVsSingle,
    isSplitAdvantageous,
    recommendationExplanation: explanationEn,
    recommendationExplanationHi: explanationHi,
  };
}
