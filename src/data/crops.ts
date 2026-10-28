export interface CropInfo {
  id: string;
  name: string;
  hindiName: string;
  category: 'Cereal' | 'Pulse' | 'Vegetable' | 'Oilseed';
  defaultUnit: 'quintal' | 'kg';
  standardGrades: string[];
  varieties: string[];
  shelfLifeDaysAmbient: number;
  typicalStorageCostPerDayPerQuintal: number; // in INR
  defaultSpoilageRatePerWeek: number; // in percentage
  suggestedMinPrice: number;
  suggestedMaxPrice: number;
}

export const CROPS: CropInfo[] = [
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं',
    category: 'Cereal',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Sharbati/Premium)', 'Grade B (Standard/FAQ)', 'Grade C (Feed/Commercial)'],
    varieties: ['Sharbati', 'HD-2967', 'HD-3086', 'Lok-1', 'PBW-550'],
    shelfLifeDaysAmbient: 180,
    typicalStorageCostPerDayPerQuintal: 0.8,
    defaultSpoilageRatePerWeek: 0.5,
    suggestedMinPrice: 2100,
    suggestedMaxPrice: 2600,
  },
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    hindiName: 'धान / चावल',
    category: 'Cereal',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Basmati/Long Grain)', 'Grade B (Common/FAQ)', 'Grade C (Broken/Coarse)'],
    varieties: ['Pusa 1121', 'Basmati 1509', 'Sona Masoori', 'IR-64', 'PR-126'],
    shelfLifeDaysAmbient: 150,
    typicalStorageCostPerDayPerQuintal: 0.9,
    defaultSpoilageRatePerWeek: 0.6,
    suggestedMinPrice: 2000,
    suggestedMaxPrice: 3800,
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू',
    category: 'Vegetable',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Large/Table Premium)', 'Grade B (Medium/Standard)', 'Grade C (Processing/Small)'],
    varieties: ['Kufri Jyoti', 'Kufri Bahar', 'Kufri Chipsona', 'Kufri Pukhraj', 'Desi'],
    shelfLifeDaysAmbient: 20,
    typicalStorageCostPerDayPerQuintal: 2.5,
    defaultSpoilageRatePerWeek: 3.5,
    suggestedMinPrice: 900,
    suggestedMaxPrice: 1700,
  },
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर',
    category: 'Vegetable',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Firm Red/Export)', 'Grade B (Firm Pink/Local Mandi)', 'Grade C (Soft/Processing)'],
    varieties: ['Abhinav', 'Vaishali', 'Himsona', 'Desi Round', 'Roma'],
    shelfLifeDaysAmbient: 6,
    typicalStorageCostPerDayPerQuintal: 4.0,
    defaultSpoilageRatePerWeek: 12.0,
    suggestedMinPrice: 800,
    suggestedMaxPrice: 2400,
  },
  {
    id: 'onion',
    name: 'Onion',
    hindiName: 'प्याज',
    category: 'Vegetable',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Large Red/Export)', 'Grade B (Medium/Mandi standard)', 'Grade C (Small/Golta)'],
    varieties: ['Nasik Red', 'Bhima Super', 'Pusa Red', 'Garwa', 'White Onion'],
    shelfLifeDaysAmbient: 35,
    typicalStorageCostPerDayPerQuintal: 1.8,
    defaultSpoilageRatePerWeek: 2.8,
    suggestedMinPrice: 1400,
    suggestedMaxPrice: 2900,
  },
  {
    id: 'mustard',
    name: 'Mustard',
    hindiName: 'सरसों',
    category: 'Oilseed',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (High Oil >42%)', 'Grade B (Standard 38-40%)', 'Grade C (Mixed/Below 38%)'],
    varieties: ['Pusa Bold', 'Giriraj', 'NRCHB-101', 'RH-749', 'Kranti'],
    shelfLifeDaysAmbient: 240,
    typicalStorageCostPerDayPerQuintal: 0.85,
    defaultSpoilageRatePerWeek: 0.3,
    suggestedMinPrice: 4800,
    suggestedMaxPrice: 5800,
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    hindiName: 'मक्का',
    category: 'Cereal',
    defaultUnit: 'quintal',
    standardGrades: ['Grade A (Dry Yellow Food-Grade)', 'Grade B (Starch/Feed Grade)', 'Grade C (Commercial)'],
    varieties: ['DeKalb 9108', 'Pioneer 3396', 'NK-6240', 'Ganga-5', 'Desi Peela'],
    shelfLifeDaysAmbient: 120,
    typicalStorageCostPerDayPerQuintal: 0.75,
    defaultSpoilageRatePerWeek: 0.8,
    suggestedMinPrice: 1800,
    suggestedMaxPrice: 2350,
  },
];
