export interface NetProceedsInput {
  quantity: number;
  unit: 'quintal' | 'kg';
  pricePerQuintal: number;
  transportCosts: number;
  handlingCosts: number;
  storageCosts: number;
  otherCharges: number;
  spoilagePercentage?: number; // optional loss percentage
}

export interface NetProceedsResult {
  originalQuantityQuintals: number;
  sellableQuantityQuintals: number;
  spoilageLossQuintals: number;
  pricePerQuintal: number;
  grossSaleValue: number;
  transportDeduction: number;
  handlingDeduction: number;
  storageDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  estimatedNetProceeds: number;
  effectiveNetPricePerOriginalQuintal: number;
  isNegativeNetProceeds: boolean;
  notes: string[];
}

export function convertToQuintals(quantity: number, unit: 'quintal' | 'kg'): number {
  if (unit === 'kg') {
    return quantity / 100;
  }
  return quantity;
}

export function convertFromQuintals(quantityInQuintals: number, targetUnit: 'quintal' | 'kg'): number {
  if (targetUnit === 'kg') {
    return quantityInQuintals * 100;
  }
  return quantityInQuintals;
}

export function calculateNetProceeds(input: NetProceedsInput): NetProceedsResult {
  const notes: string[] = [];

  const rawQty = Number(input.quantity) || 0;
  const price = Number(input.pricePerQuintal) || 0;
  const transport = Math.max(0, Number(input.transportCosts) || 0);
  const handling = Math.max(0, Number(input.handlingCosts) || 0);
  const storage = Math.max(0, Number(input.storageCosts) || 0);
  const other = Math.max(0, Number(input.otherCharges) || 0);
  const spoilageRate = Math.max(0, Math.min(100, Number(input.spoilagePercentage) || 0));

  if (rawQty <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }
  if (price < 0) {
    throw new Error('Price per quintal cannot be negative.');
  }

  const originalQtyQuintals = convertToQuintals(rawQty, input.unit || 'quintal');
  const spoilageLossQuintals = (originalQtyQuintals * spoilageRate) / 100;
  const sellableQtyQuintals = Math.max(0, originalQtyQuintals - spoilageLossQuintals);

  // Exact Section 13 Formula:
  // Gross sale value = Sellable quantity in quintals × Price per quintal
  const grossSaleValue = sellableQtyQuintals * price;

  // Total deductions = Transport + Handling + Storage + Other applicable costs
  const totalDeductions = transport + handling + storage + other;

  // Estimated net sale proceeds = Gross sale value − Total deductions
  const estimatedNetProceeds = grossSaleValue - totalDeductions;

  // Effective net proceeds per original quintal = Estimated net sale proceeds ÷ Original quantity in quintals
  const effectiveNetPrice = originalQtyQuintals > 0
    ? estimatedNetProceeds / originalQtyQuintals
    : 0;

  const isNegative = estimatedNetProceeds < 0;
  if (isNegative) {
    notes.push('Warning: Total selling deductions exceed gross sale proceeds, resulting in a net cash loss.');
  }

  if (spoilageRate > 0) {
    notes.push(`Spoilage reduction of ${spoilageRate}% deducted ${spoilageLossQuintals.toFixed(2)} quintals from sellable harvest.`);
  }

  return {
    originalQuantityQuintals: Number(originalQtyQuintals.toFixed(2)),
    sellableQuantityQuintals: Number(sellableQtyQuintals.toFixed(2)),
    spoilageLossQuintals: Number(spoilageLossQuintals.toFixed(2)),
    pricePerQuintal: price,
    grossSaleValue: Math.round(grossSaleValue),
    transportDeduction: Math.round(transport),
    handlingDeduction: Math.round(handling),
    storageDeduction: Math.round(storage),
    otherDeductions: Math.round(other),
    totalDeductions: Math.round(totalDeductions),
    estimatedNetProceeds: Math.round(estimatedNetProceeds),
    effectiveNetPricePerOriginalQuintal: Math.round(effectiveNetPrice * 100) / 100,
    isNegativeNetProceeds: isNegative,
    notes,
  };
}

/**
 * Standard benchmark validation test as requested in Section 13:
 * Quantity = 100 quintals
 * Price = ₹2,000/quintal
 * Transport = ₹8,000, Handling = ₹2,000, Other = ₹1,000, Storage = ₹0
 * Expected total deductions = ₹11,000
 * Expected net proceeds = ₹189,000
 */
export function runBenchmarkCalculationTest(): boolean {
  const result = calculateNetProceeds({
    quantity: 100,
    unit: 'quintal',
    pricePerQuintal: 2000,
    transportCosts: 8000,
    handlingCosts: 2000,
    storageCosts: 0,
    otherCharges: 1000,
    spoilagePercentage: 0,
  });

  const passed =
    result.grossSaleValue === 200000 &&
    result.totalDeductions === 11000 &&
    result.estimatedNetProceeds === 189000 &&
    result.effectiveNetPricePerOriginalQuintal === 1890;

  return passed;
}
