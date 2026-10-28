// src/data/mandis.ts
export interface MandiCommodity {
  crop: string;
  modalPrice: number;   // ₹ / quintal
  minPrice: number;
  maxPrice: number;
  arrivals: number;     // in quintals
  updatedAt: string;
}

export type MandiType = 'APMC Mandi' | 'Rural Collection Center' | 'Village Haat (GrAM)';

export interface MandiItem {
  id: string;
  name: string;
  type: MandiType;
  district: string;
  state: string;
  villageOrTehsil?: string;
  lat: number;
  lng: number;
  contact: string;
  operatingHours: string;
  facilities: string[];
  commodities: MandiCommodity[];
}

export const SAMPLE_MANDIS: MandiItem[] = [
  // 1. Rural Collection Centers (Close to farms, lower logistics cost)
  {
    id: 'rcc-kakori',
    name: 'Kakori Village Collection Center (FPO Hub)',
    type: 'Rural Collection Center',
    district: 'Lucknow',
    villageOrTehsil: 'Kakori Tehsil',
    state: 'Uttar Pradesh',
    lat: 26.8833,
    lng: 80.7917,
    contact: '+91 94150 11223',
    operatingHours: '06:00 AM - 12:00 PM',
    facilities: ['Farmgate Weighbridge', 'Spot Payment', 'Direct FPO Aggregation'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2260, minPrice: 2180, maxPrice: 2320, arrivals: 450, updatedAt: 'Today, 07:45 AM' },
      { crop: 'Vegetables Mix', modalPrice: 1550, minPrice: 1350, maxPrice: 1800, arrivals: 320, updatedAt: 'Today, 06:30 AM' },
      { crop: 'Mustard', modalPrice: 5300, minPrice: 5120, maxPrice: 5450, arrivals: 180, updatedAt: 'Today, 07:15 AM' },
    ],
  },
  {
    id: 'rcc-malihabad',
    name: 'Malihabad Mango & Fruit Collection Center',
    type: 'Rural Collection Center',
    district: 'Lucknow',
    villageOrTehsil: 'Malihabad',
    state: 'Uttar Pradesh',
    lat: 26.9200,
    lng: 80.7100,
    contact: '+91 98390 44556',
    operatingHours: '05:00 AM - 01:00 PM',
    facilities: ['Solar Cold Room', 'Crate Sorting', 'Moisture Testing'],
    commodities: [
      { crop: 'Potato', modalPrice: 1400, minPrice: 1300, maxPrice: 1520, arrivals: 600, updatedAt: 'Today, 07:00 AM' },
      { crop: 'Tomato', modalPrice: 1720, minPrice: 1500, maxPrice: 1950, arrivals: 410, updatedAt: 'Today, 06:50 AM' },
    ],
  },
  {
    id: 'gram-mohanlalganj',
    name: 'Mohanlalganj Rural Haat (GrAM)',
    type: 'Village Haat (GrAM)',
    district: 'Lucknow',
    villageOrTehsil: 'Mohanlalganj',
    state: 'Uttar Pradesh',
    lat: 26.6800,
    lng: 80.9900,
    contact: '+91 94500 88990',
    operatingHours: '07:00 AM - 02:00 PM',
    facilities: ['Open Yard Shed', 'Direct Consumer-Trader Counter', 'Zero Mandi Cess'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2250, minPrice: 2150, maxPrice: 2300, arrivals: 250, updatedAt: 'Today, 08:00 AM' },
      { crop: 'Paddy', modalPrice: 2190, minPrice: 2080, maxPrice: 2280, arrivals: 520, updatedAt: 'Today, 08:15 AM' },
      { crop: 'Potato', modalPrice: 1380, minPrice: 1250, maxPrice: 1480, arrivals: 750, updatedAt: 'Today, 07:30 AM' },
    ],
  },
  {
    id: 'rcc-sehore',
    name: 'Ichhawar Gramin Kisan Collection Center',
    type: 'Rural Collection Center',
    district: 'Sehore',
    villageOrTehsil: 'Ichhawar Block',
    state: 'Madhya Pradesh',
    lat: 23.0200,
    lng: 77.0100,
    contact: '+91 7562 234 567',
    operatingHours: '06:30 AM - 01:30 PM',
    facilities: ['Electronic Assay', 'Immediate Payment Advice', 'Direct Silo Dispatch'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2320, minPrice: 2220, maxPrice: 2420, arrivals: 850, updatedAt: 'Today, 07:45 AM' },
      { crop: 'Gram (Chana)', modalPrice: 5820, minPrice: 5600, maxPrice: 6020, arrivals: 340, updatedAt: 'Today, 08:10 AM' },
      { crop: 'Soybean', modalPrice: 4700, minPrice: 4500, maxPrice: 4880, arrivals: 620, updatedAt: 'Today, 07:30 AM' },
    ],
  },

  // 2. Major APMC Wholesale Mandis
  {
    id: 'm-lucknow',
    name: 'Lucknow Dubagga Krishi Upaj Mandi',
    type: 'APMC Mandi',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8687,
    lng: 80.8661,
    contact: '+91 522 281 9922',
    operatingHours: '04:00 AM - 01:00 PM',
    facilities: ['Bulk Auction Platform', 'Electronic Tipping', 'Cold Storage Access'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2280, minPrice: 2160, maxPrice: 2390, arrivals: 1850, updatedAt: 'Today, 07:15 AM' },
      { crop: 'Potato', modalPrice: 1420, minPrice: 1280, maxPrice: 1560, arrivals: 4200, updatedAt: 'Today, 06:40 AM' },
      { crop: 'Mustard', modalPrice: 5320, minPrice: 5080, maxPrice: 5500, arrivals: 920, updatedAt: 'Today, 07:45 AM' },
      { crop: 'Tomato', modalPrice: 1750, minPrice: 1450, maxPrice: 2050, arrivals: 1650, updatedAt: 'Today, 06:30 AM' },
    ],
  },
  {
    id: 'm-kanpur',
    name: 'Kanpur Chakarpur Grain & Vegetable Mandi',
    type: 'APMC Mandi',
    district: 'Kanpur',
    state: 'Uttar Pradesh',
    lat: 26.4499,
    lng: 80.3319,
    contact: '+91 512 229 1044',
    operatingHours: '05:00 AM - 02:00 PM',
    facilities: ['Railhead Siding', 'Institutional Loading', 'Banking Counter'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2295, minPrice: 2180, maxPrice: 2400, arrivals: 2400, updatedAt: 'Today, 07:00 AM' },
      { crop: 'Gram (Chana)', modalPrice: 5900, minPrice: 5650, maxPrice: 6150, arrivals: 1100, updatedAt: 'Today, 07:30 AM' },
      { crop: 'Paddy', modalPrice: 2220, minPrice: 2100, maxPrice: 2340, arrivals: 3100, updatedAt: 'Today, 08:00 AM' },
    ],
  },
  {
    id: 'm-azadpur',
    name: 'Azadpur APMC Mandi (National Hub)',
    type: 'APMC Mandi',
    district: 'North Delhi',
    state: 'Delhi',
    lat: 28.7161,
    lng: 77.1724,
    contact: '+91 11 2769 1234',
    operatingHours: '04:00 AM - 02:00 PM',
    facilities: ['All-India Export Platform', 'Automated Sorting', 'Interstate Truck Yard'],
    commodities: [
      { crop: 'Wheat', modalPrice: 2320, minPrice: 2190, maxPrice: 2440, arrivals: 3200, updatedAt: 'Today, 06:30 AM' },
      { crop: 'Potato', modalPrice: 1480, minPrice: 1320, maxPrice: 1650, arrivals: 5800, updatedAt: 'Today, 07:15 AM' },
      { crop: 'Onion', modalPrice: 2150, minPrice: 1900, maxPrice: 2400, arrivals: 4900, updatedAt: 'Today, 07:00 AM' },
      { crop: 'Tomato', modalPrice: 1850, minPrice: 1550, maxPrice: 2150, arrivals: 2200, updatedAt: 'Today, 06:45 AM' },
    ],
  },
  {
    id: 'm-indore',
    name: 'Indore Krishi Upaj Mandi (Choithram)',
    type: 'APMC Mandi',
    district: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.6856,
    lng: 75.8398,
    contact: '+91 731 247 4321',
    operatingHours: '06:00 AM - 03:00 PM',
    facilities: ['Major Oilseed Yard', 'e-NAM Electronic Auction', 'Farmer Rest House'],
    commodities: [
      { crop: 'Soybean', modalPrice: 4740, minPrice: 4520, maxPrice: 4920, arrivals: 4100, updatedAt: 'Today, 08:10 AM' },
      { crop: 'Wheat', modalPrice: 2360, minPrice: 2240, maxPrice: 2480, arrivals: 3200, updatedAt: 'Today, 08:30 AM' },
      { crop: 'Gram (Chana)', modalPrice: 5880, minPrice: 5620, maxPrice: 6100, arrivals: 1800, updatedAt: 'Today, 07:50 AM' },
    ],
  },
];