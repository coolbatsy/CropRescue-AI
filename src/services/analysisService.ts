import { convertToQuintals } from './calculationService';

export interface SellingScenarioInput {
  crop: string;
  quantity: number;
  unit: 'quintal' | 'kg';
  currentPricePerQuintal: number;
  harvestDate?: string;
  sellingDeadline?: string;
  hasStorageAvailable: boolean;
  storageCostPerDayPerQuintal?: number;
  ambientSpoilageRatePerWeek?: number;
  baseTransportCost?: number;
  baseHandlingCost?: number;
}

export interface ScenarioResult {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  daysToWait: number;
  assumedPricePerQuintal: number;
  priceDeltaPercentage: number;
  originalQuantityQuintals: number;
  spoilagePercentage: number;
  sellableQuantityQuintals: number;
  grossSaleValue: number;
  transportCosts: number;
  handlingCosts: number;
  storageCosts: number;
  otherCosts: number;
  totalDeductions: number;
  estimatedNetProceeds: number;
  differenceVsSellNow: number;
  effectiveNetPricePerOriginalQuintal: number;
  deadlineFeasible: boolean;
  deadlineViolationDays: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  assumptions: string[];
  assumptionsHi: string[];
}

export interface SellingAnalysisReport {
  crop: string;
  originalQuantityQuintals: number;
  currentPricePerQuintal: number;
  scenarios: ScenarioResult[];
  recommendedScenarioId: string;
  recommendationSummary: string;
  recommendationSummaryHi: string;
  sensitivityNotes: string[];
  sensitivityNotesHi: string[];
}

export function analyzeSellingOptions(input: SellingScenarioInput): SellingAnalysisReport {
  const qtyQuintals = convertToQuintals(input.quantity, input.unit || 'quintal');
  const currentPrice = Number(input.currentPricePerQuintal) || 2000;
  const storageCostPerDay = Number(input.storageCostPerDayPerQuintal) || 1.2;
  const ambientSpoilageWeekly = Number(input.ambientSpoilageRatePerWeek) || 2.0;
  const baseTransport = Number(input.baseTransportCost) || Math.round(qtyQuintals * 35);
  const baseHandling = Number(input.baseHandlingCost) || Math.round(qtyQuintals * 22);

  // Calculate days remaining until deadline if dates provided
  let daysToDeadline = 45; // default reasonable window
  if (input.sellingDeadline && input.harvestDate) {
    const dStart = new Date(input.harvestDate).getTime();
    const dEnd = new Date(input.sellingDeadline).getTime();
    const diff = Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysToDeadline = diff;
  }

  const buildScenario = (
    id: string,
    title: string,
    titleHi: string,
    description: string,
    descriptionHi: string,
    days: number,
    priceDeltaPct: number,
    isStored: boolean,
    customSpoilagePct?: number,
    risk: 'Low' | 'Moderate' | 'High' = 'Moderate'
  ): ScenarioResult => {
    const assumedPrice = Math.round(currentPrice * (1 + priceDeltaPct / 100));

    // Spoilage calculation applied ONLY ONCE
    let spoilagePct = 0;
    if (days > 0) {
      if (customSpoilagePct !== undefined) {
        spoilagePct = customSpoilagePct;
      } else if (isStored) {
        // Controlled storage has lower spoilage
        spoilagePct = Math.min(15, (days / 30) * 1.5);
      } else {
        // Ambient ambient spoilage per week
        spoilagePct = Math.min(40, (days / 7) * ambientSpoilageWeekly);
      }
    }
    spoilagePct = Number(spoilagePct.toFixed(1));

    const sellableQty = Math.max(0, qtyQuintals * (1 - spoilagePct / 100));
    const grossSale = Math.round(sellableQty * assumedPrice);

    // Storage cost: ONLY applied if isStored is true and days > 0
    let storageCost = 0;
    if (isStored && days > 0) {
      storageCost = Math.round(qtyQuintals * storageCostPerDay * days);
    }

    const transport = Math.round(baseTransport * (isStored ? 1.2 : 1.0));
    const handling = Math.round(baseHandling * (isStored ? 1.4 : 1.0)); // extra in/out of warehouse
    const totalDeductions = transport + handling + storageCost;
    const netProceeds = grossSale - totalDeductions;
    const effectiveNetPrice = qtyQuintals > 0 ? netProceeds / qtyQuintals : 0;

    const isFeasible = days <= daysToDeadline;
    const violationDays = Math.max(0, days - daysToDeadline);

    const assumptions: string[] = [
      `Assumes market price of ₹${assumedPrice}/qtl (${priceDeltaPct >= 0 ? '+' : ''}${priceDeltaPct}% vs spot)`,
      `Expected wait period: ${days} days`,
      `Single spoilage deduction: ${spoilagePct}% (${(qtyQuintals - sellableQty).toFixed(1)} qtl)`,
    ];
    const assumptionsHi: string[] = [
      `अनुमानित बाजार भाव ₹${assumedPrice}/क्विंटल (${priceDeltaPct >= 0 ? '+' : ''}${priceDeltaPct}% वर्तमान की तुलना में)`,
      `प्रतीक्षा अवधि: ${days} दिन`,
      `एकल खराबी कटौती: ${spoilagePct}% (${(qtyQuintals - sellableQty).toFixed(1)} क्विंटल)`,
    ];

    if (isStored) {
      assumptions.push(`Scientific storage charges: ₹${storageCostPerDay}/qtl/day (Total ₹${storageCost.toLocaleString('en-IN')})`);
      assumptionsHi.push(`वैज्ञानिक भंडारण शुल्क: ₹${storageCostPerDay}/क्विंटल/दिन (कुल ₹${storageCost.toLocaleString('en-IN')})`);
    } else if (days > 0) {
      assumptions.push('Held at farm/ambient storage; zero warehouse fee but higher natural weight & moisture loss');
      assumptionsHi.push('खेत/सामान्य भंडारण में रखा गया; कोई गोदाम शुल्क नहीं लेकिन प्राकृतिक वजन और नमी का नुकसान');
    }

    return {
      id,
      title,
      titleHi,
      description,
      descriptionHi,
      daysToWait: days,
      assumedPricePerQuintal: assumedPrice,
      priceDeltaPercentage: priceDeltaPct,
      originalQuantityQuintals: qtyQuintals,
      spoilagePercentage: spoilagePct,
      sellableQuantityQuintals: Number(sellableQty.toFixed(1)),
      grossSaleValue: grossSale,
      transportCosts: transport,
      handlingCosts: handling,
      storageCosts: storageCost,
      otherCosts: 0,
      totalDeductions,
      estimatedNetProceeds: netProceeds,
      differenceVsSellNow: 0, // calculated relative to sell now below
      effectiveNetPricePerOriginalQuintal: Math.round(effectiveNetPrice),
      deadlineFeasible: isFeasible,
      deadlineViolationDays: violationDays,
      riskLevel: risk,
      assumptions,
      assumptionsHi,
    };
  };

  // Scenario 1: Option A - Sell Now
  const sellNow = buildScenario(
    'sell_now',
    'Option A: Sell Immediately',
    'विकल्प A: तुरंत बिक्री करें',
    'Liquidate entire harvest immediately at current spot market quotation with zero storage cost and zero spoilage loss.',
    'वर्तमान हाजिर भाव पर तुरंत पूरी फसल बेचें। कोई भंडारण लागत या खराबी नहीं।',
    0,
    0,
    false,
    0,
    'Low'
  );

  // Scenario 2: Option B1 - Wait (Market dip / harvest glut)
  const waitLower = buildScenario(
    'wait_glut_dip',
    'Option B1: Wait (Glut / Lower Price)',
    'विकल्प B1: प्रतीक्षा (मंडी में आवक बढ़ने से मंदी)',
    'Peak arrival glut leads to a 7.5% drop in wholesale prices after 14 days of farmgate holding.',
    '14 दिनों की प्रतीक्षा के बाद मंडी में अत्यधिक आवक से भाव में 7.5% की गिरावट का परिदृश्य।',
    14,
    -7.5,
    false,
    undefined,
    'High'
  );

  // Scenario 3: Option B2 - Wait (Price remains stable)
  const waitStable = buildScenario(
    'wait_stable',
    'Option B2: Wait (Stable Prices)',
    'विकल्प B2: प्रतीक्षा (भाव स्थिर)',
    'Price holds steady over 14 days, but natural moisture and grading loss reduces sellable volume.',
    '14 दिनों में भाव समान रहता है, किंतु प्राकृतिक वजन और नमी में कमी से मात्रा घटती है।',
    14,
    0,
    false,
    undefined,
    'Moderate'
  );

  // Scenario 4: Option B3 - Wait (Moderate price recovery)
  const waitHigher = buildScenario(
    'wait_recovery',
    'Option B3: Wait (Price Uptick +8%)',
    'विकल्प B3: प्रतीक्षा (भाव में 8% सुधार)',
    'Wholesale price strengthens by 8% after 21 days as initial market rush stabilizes.',
    'प्रारंभिक मंडी दबाव कम होने के बाद 21 दिनों में थोक भाव में 8% की बढ़ोतरी।',
    21,
    8,
    false,
    undefined,
    'Moderate'
  );

  // Scenario 5: Option C - Cold / Scientific Storage & Sell Off-Season
  const storeLater = buildScenario(
    'store_warehouse',
    'Option C: Scientific Storage & Off-Season Sale',
    'विकल्प C: वैज्ञानिक भंडारण और बेमौसमी बिक्री',
    input.hasStorageAvailable
      ? 'Deposit in authorized warehouse for 60 days to target off-season premium (+16%), incurring daily storage fee.'
      : 'Warehouse storage option (Note: Storage flag is currently OFF for this harvest).',
    input.hasStorageAvailable
      ? 'अधिकतम ऑफ-सीजन प्रीमियम (+16%) पाने के लिए 60 दिनों तक अधिकृत गोदाम में सुरक्षित रखें।'
      : 'गोदाम भंडारण विकल्प (ध्यान दें: इस फसल के लिए भंडारण सुविधा उपलब्ध नहीं चुनी गई है)।',
    60,
    16,
    input.hasStorageAvailable,
    input.hasStorageAvailable ? 2.5 : 20.0,
    input.hasStorageAvailable ? 'Moderate' : 'High'
  );

  const allScenarios = [sellNow, waitLower, waitStable, waitHigher, storeLater];

  // Calculate relative differences compared to Sell Now
  allScenarios.forEach((s) => {
    s.differenceVsSellNow = s.estimatedNetProceeds - sellNow.estimatedNetProceeds;
  });

  // Determine recommendation based on feasibility and risk-adjusted proceeds
  let recommendedId = 'sell_now';
  let bestScore = sellNow.estimatedNetProceeds;

  for (const s of allScenarios) {
    if (!s.deadlineFeasible) continue;
    if (s.id === 'store_warehouse' && !input.hasStorageAvailable) continue;

    // Apply risk discount: high risk requires significant gain to overcome certainty of spot sale
    const riskDiscount = s.riskLevel === 'High' ? 0.88 : s.riskLevel === 'Moderate' ? 0.95 : 1.0;
    const score = s.estimatedNetProceeds * riskDiscount;
    if (score > bestScore) {
      bestScore = score;
      recommendedId = s.id;
    }
  }

  const rec = allScenarios.find((s) => s.id === recommendedId) || sellNow;

  let summaryEn = '';
  let summaryHi = '';

  if (recommendedId === 'sell_now') {
    summaryEn = `Immediate sale (Option A) is recommended. At ₹${currentPrice}/qtl, selling now avoids ₹${(qtyQuintals * storageCostPerDay * 14).toFixed(0)} in storage carrying fees and prevents ${ambientSpoilageWeekly * 2}% moisture loss, locking in ₹${sellNow.estimatedNetProceeds.toLocaleString('en-IN')} net cash.`;
    summaryHi = `तुरंत बिक्री (विकल्प A) की सिफारिश की जाती है। ₹${currentPrice}/क्विंटल पर अभी बेचने से भंडारण का खर्च और प्राकृतिक वजन नुकसान बचता है, जिससे ₹${sellNow.estimatedNetProceeds.toLocaleString('en-IN')} की सुनिश्चित शुद्ध राशि प्राप्त होती है।`;
  } else if (recommendedId === 'store_warehouse') {
    summaryEn = `Scientific Storage (Option C) offers a projected net gain of ₹${rec.differenceVsSellNow.toLocaleString('en-IN')} over immediate sale, provided the crop is stored in certified dry conditions and market price increases by at least 16%.`;
    summaryHi = `वैज्ञानिक भंडारण (विकल्प C) से तुरंत बिक्री की तुलना में ₹${rec.differenceVsSellNow.toLocaleString('en-IN')} का अनुमानित शुद्ध लाभ प्राप्त हो सकता है, बशर्ते फसल को सही परिस्थितियों में रखा जाए और भाव कम से कम 16% बढ़े।`;
  } else {
    summaryEn = `${rec.title} provides an estimated ₹${rec.differenceVsSellNow.toLocaleString('en-IN')} edge, provided weather conditions permit farm holding without exceeding quality spoilage thresholds.`;
    summaryHi = `${rec.titleHi} से लगभग ₹${rec.differenceVsSellNow.toLocaleString('en-IN')} का अतिरिक्त लाभ संभव है, बशर्ते मौसम और भंडारण परिस्थितियां अनुकूल रहें।`;
  }

  const sensitivityNotes = [
    'Illustrative decision-support modeling based on user-entered parameters, not guaranteed future price movements.',
    `Recommendation changes if local mandi spot prices deviate by more than ±₹${Math.round(currentPrice * 0.05)}/quintal.`,
    'Uncontrolled farmgate storage during heavy rains or heatwaves can escalate spoilage rates beyond baseline assumptions.',
  ];
  const sensitivityNotesHi = [
    'यह उपयोगकर्ता द्वारा दर्ज किए गए मापदंडों पर आधारित परिदृश्य विश्लेषण है, कोई गारंटीकृत बाजार भविष्यवाणी नहीं।',
    `यदि स्थानीय मंडी भाव में ±₹${Math.round(currentPrice * 0.05)}/क्विंटल से अधिक उतार-चढ़ाव होता है तो निर्णय बदल सकता है।`,
    'बारिश या अत्यधिक गर्मी के दौरान खेत पर भंडारण से खराबी दर अनुमान से अधिक बढ़ सकती है।',
  ];

  return {
    crop: input.crop,
    originalQuantityQuintals: qtyQuintals,
    currentPricePerQuintal: currentPrice,
    scenarios: allScenarios,
    recommendedScenarioId: recommendedId,
    recommendationSummary: summaryEn,
    recommendationSummaryHi: summaryHi,
    sensitivityNotes,
    sensitivityNotesHi,
  };
}
