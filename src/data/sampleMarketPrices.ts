// src/data/sampleMarketPrices.ts
export interface PricePoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  volumeQuintals: number;
}

export interface StatePriceData {
  state: string;
  districts: string[];
  history: PricePoint[];
}

export const SAMPLE_MARKET_PRICES: Record<string, StatePriceData[]> = {
  wheat: [
    {
      state: 'Madhya Pradesh',
      districts: ['Indore', 'Sehore', 'Hoshangabad', 'Ujjain'],
      history: [
        // 2022
        { date: 'Jan 2022', avgPrice: 1980, minPrice: 1850, maxPrice: 2090, modalPrice: 1970, volumeQuintals: 12000 },
        { date: 'Apr 2022', avgPrice: 2050, minPrice: 1920, maxPrice: 2160, modalPrice: 2030, volumeQuintals: 22000 },
        { date: 'Jul 2022', avgPrice: 2100, minPrice: 1980, maxPrice: 2220, modalPrice: 2090, volumeQuintals: 14500 },
        { date: 'Oct 2022', avgPrice: 2140, minPrice: 2010, maxPrice: 2270, modalPrice: 2130, volumeQuintals: 11000 },
        
        // 2023
        { date: 'Jan 2023', avgPrice: 2160, minPrice: 2040, maxPrice: 2290, modalPrice: 2150, volumeQuintals: 13000 },
        { date: 'Apr 2023', avgPrice: 2125, minPrice: 2000, maxPrice: 2250, modalPrice: 2125, volumeQuintals: 26000 },
        { date: 'Jul 2023', avgPrice: 2190, minPrice: 2080, maxPrice: 2310, modalPrice: 2180, volumeQuintals: 12500 },
        { date: 'Oct 2023', avgPrice: 2240, minPrice: 2120, maxPrice: 2360, modalPrice: 2220, volumeQuintals: 9800 },

        // 2024
        { date: 'Jan 2024', avgPrice: 2275, minPrice: 2150, maxPrice: 2390, modalPrice: 2260, volumeQuintals: 14000 },
        { date: 'Apr 2024', avgPrice: 2275, minPrice: 2170, maxPrice: 2380, modalPrice: 2275, volumeQuintals: 28000 },
        { date: 'Jul 2024', avgPrice: 2320, minPrice: 2200, maxPrice: 2440, modalPrice: 2300, volumeQuintals: 11500 },
        { date: 'Oct 2024', avgPrice: 2360, minPrice: 2240, maxPrice: 2480, modalPrice: 2350, volumeQuintals: 8900 },

        // 2025
        { date: 'Jan 2025', avgPrice: 2390, minPrice: 2260, maxPrice: 2510, modalPrice: 2380, volumeQuintals: 13500 },
        { date: 'Apr 2025', avgPrice: 2425, minPrice: 2300, maxPrice: 2550, modalPrice: 2420, volumeQuintals: 25000 },
        { date: 'Jul 2025', avgPrice: 2460, minPrice: 2340, maxPrice: 2580, modalPrice: 2450, volumeQuintals: 10200 },
        { date: 'Oct 2025', avgPrice: 2490, minPrice: 2370, maxPrice: 2620, modalPrice: 2480, volumeQuintals: 7800 },

        // 2026
        { date: 'Jan 2026', avgPrice: 2510, minPrice: 2390, maxPrice: 2640, modalPrice: 2500, volumeQuintals: 12400 },
        { date: 'Apr 2026', avgPrice: 2275, minPrice: 2150, maxPrice: 2420, modalPrice: 2260, volumeQuintals: 27500 },
        { date: 'Jul 2026', avgPrice: 2350, minPrice: 2200, maxPrice: 2480, modalPrice: 2340, volumeQuintals: 7200 },
        { date: 'Oct 2026', avgPrice: 2470, minPrice: 2320, maxPrice: 2600, modalPrice: 2460, volumeQuintals: 4900 },
      ],
    },
    {
      state: 'Uttar Pradesh',
      districts: ['Lucknow', 'Agra', 'Aligarh', 'Varanasi'],
      history: [
        { date: 'Jan 2022', avgPrice: 1950, minPrice: 1820, maxPrice: 2060, modalPrice: 1940, volumeQuintals: 14000 },
        { date: 'Jul 2022', avgPrice: 2070, minPrice: 1950, maxPrice: 2180, modalPrice: 2060, volumeQuintals: 13000 },
        { date: 'Jan 2023', avgPrice: 2130, minPrice: 2000, maxPrice: 2250, modalPrice: 2120, volumeQuintals: 15000 },
        { date: 'Jul 2023', avgPrice: 2160, minPrice: 2040, maxPrice: 2280, modalPrice: 2150, volumeQuintals: 11000 },
        { date: 'Jan 2024', avgPrice: 2240, minPrice: 2110, maxPrice: 2360, modalPrice: 2230, volumeQuintals: 16000 },
        { date: 'Jul 2024', avgPrice: 2290, minPrice: 2160, maxPrice: 2410, modalPrice: 2280, volumeQuintals: 10500 },
        { date: 'Jan 2025', avgPrice: 2350, minPrice: 2220, maxPrice: 2470, modalPrice: 2340, volumeQuintals: 14500 },
        { date: 'Jul 2025', avgPrice: 2410, minPrice: 2280, maxPrice: 2530, modalPrice: 2400, volumeQuintals: 9200 },
        { date: 'Jan 2026', avgPrice: 2460, minPrice: 2320, maxPrice: 2580, modalPrice: 2450, volumeQuintals: 13800 },
        { date: 'Oct 2026', avgPrice: 2420, minPrice: 2280, maxPrice: 2540, modalPrice: 2410, volumeQuintals: 4800 },
      ],
    },
  ],
  rice: [
    {
      state: 'Punjab',
      districts: ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar'],
      history: [
        { date: 'Jan 2022', avgPrice: 2850, minPrice: 2650, maxPrice: 3050, modalPrice: 2820, volumeQuintals: 11000 },
        { date: 'Oct 2022', avgPrice: 2980, minPrice: 2750, maxPrice: 3200, modalPrice: 2950, volumeQuintals: 24000 },
        { date: 'Jan 2023', avgPrice: 3050, minPrice: 2820, maxPrice: 3280, modalPrice: 3020, volumeQuintals: 12500 },
        { date: 'Oct 2023', avgPrice: 3180, minPrice: 2920, maxPrice: 3420, modalPrice: 3150, volumeQuintals: 26500 },
        { date: 'Jan 2024', avgPrice: 3240, minPrice: 2980, maxPrice: 3490, modalPrice: 3210, volumeQuintals: 10800 },
        { date: 'Oct 2024', avgPrice: 3380, minPrice: 3100, maxPrice: 3620, modalPrice: 3350, volumeQuintals: 28000 },
        { date: 'Jan 2025', avgPrice: 3420, minPrice: 3150, maxPrice: 3680, modalPrice: 3400, volumeQuintals: 9500 },
        { date: 'Oct 2025', avgPrice: 3510, minPrice: 3220, maxPrice: 3760, modalPrice: 3490, volumeQuintals: 25000 },
        { date: 'May 2026', avgPrice: 3200, minPrice: 2950, maxPrice: 3450, modalPrice: 3180, volumeQuintals: 9200 },
        { date: 'Oct 2026', avgPrice: 3550, minPrice: 3250, maxPrice: 3800, modalPrice: 3520, volumeQuintals: 11200 },
      ],
    },
  ],
  potato: [
    {
      state: 'Uttar Pradesh',
      districts: ['Agra', 'Farrukhabad', 'Kannauj', 'Mathura'],
      history: [
        { date: 'Jan 2022', avgPrice: 850, minPrice: 700, maxPrice: 1020, modalPrice: 820, volumeQuintals: 38000 },
        { date: 'Oct 2022', avgPrice: 1350, minPrice: 1150, maxPrice: 1550, modalPrice: 1320, volumeQuintals: 18000 },
        { date: 'Jan 2023', avgPrice: 780, minPrice: 650, maxPrice: 940, modalPrice: 760, volumeQuintals: 42000 },
        { date: 'Oct 2023', avgPrice: 1220, minPrice: 1050, maxPrice: 1400, modalPrice: 1200, volumeQuintals: 19500 },
        { date: 'Jan 2024', avgPrice: 950, minPrice: 800, maxPrice: 1120, modalPrice: 920, volumeQuintals: 36000 },
        { date: 'Oct 2024', avgPrice: 1680, minPrice: 1450, maxPrice: 1900, modalPrice: 1650, volumeQuintals: 15000 },
        { date: 'Jan 2025', avgPrice: 1050, minPrice: 880, maxPrice: 1220, modalPrice: 1020, volumeQuintals: 34000 },
        { date: 'Oct 2025', avgPrice: 1480, minPrice: 1260, maxPrice: 1700, modalPrice: 1450, volumeQuintals: 16000 },
        { date: 'May 2026', avgPrice: 1150, minPrice: 950, maxPrice: 1350, modalPrice: 1120, volumeQuintals: 32000 },
        { date: 'Oct 2026', avgPrice: 1580, minPrice: 1320, maxPrice: 1750, modalPrice: 1550, volumeQuintals: 12800 },
      ],
    },
  ],
  onion: [
    {
      state: 'Maharashtra',
      districts: ['Nashik', 'Lasalgaon', 'Ahmednagar', 'Solapur'],
      history: [
        { date: 'Jan 2022', avgPrice: 1850, minPrice: 1400, maxPrice: 2200, modalPrice: 1800, volumeQuintals: 28000 },
        { date: 'Oct 2022', avgPrice: 1450, minPrice: 1100, maxPrice: 1750, modalPrice: 1420, volumeQuintals: 34000 },
        { date: 'Jan 2023', avgPrice: 1350, minPrice: 1000, maxPrice: 1650, modalPrice: 1300, volumeQuintals: 36000 },
        { date: 'Oct 2023', avgPrice: 2850, minPrice: 2300, maxPrice: 3400, modalPrice: 2800, volumeQuintals: 16000 },
        { date: 'Jan 2024', avgPrice: 1750, minPrice: 1350, maxPrice: 2100, modalPrice: 1700, volumeQuintals: 30000 },
        { date: 'Oct 2024', avgPrice: 3100, minPrice: 2500, maxPrice: 3700, modalPrice: 3050, volumeQuintals: 14000 },
        { date: 'Jan 2025', avgPrice: 2100, minPrice: 1650, maxPrice: 2550, modalPrice: 2050, volumeQuintals: 25000 },
        { date: 'Oct 2025', avgPrice: 2450, minPrice: 1950, maxPrice: 2900, modalPrice: 2400, volumeQuintals: 18500 },
        { date: 'May 2026', avgPrice: 1650, minPrice: 1300, maxPrice: 1950, modalPrice: 1620, volumeQuintals: 26000 },
        { date: 'Oct 2026', avgPrice: 2680, minPrice: 2180, maxPrice: 3100, modalPrice: 2640, volumeQuintals: 11200 },
      ],
    },
  ],
  mustard: [
    {
      state: 'Rajasthan',
      districts: ['Bharatpur', 'Bikaner', 'Alwar', 'Kota'],
      history: [
        { date: 'Jan 2022', avgPrice: 6200, minPrice: 5800, maxPrice: 6600, modalPrice: 6150, volumeQuintals: 9500 },
        { date: 'Oct 2022', avgPrice: 5800, minPrice: 5400, maxPrice: 6150, modalPrice: 5750, volumeQuintals: 7200 },
        { date: 'Jan 2023', avgPrice: 5400, minPrice: 5050, maxPrice: 5750, modalPrice: 5350, volumeQuintals: 10500 },
        { date: 'Oct 2023', avgPrice: 5150, minPrice: 4800, maxPrice: 5450, modalPrice: 5100, volumeQuintals: 6800 },
        { date: 'Jan 2024', avgPrice: 5050, minPrice: 4700, maxPrice: 5350, modalPrice: 5000, volumeQuintals: 11000 },
        { date: 'Oct 2024', avgPrice: 5350, minPrice: 4950, maxPrice: 5700, modalPrice: 5300, volumeQuintals: 6200 },
        { date: 'Jan 2025', avgPrice: 5250, minPrice: 4880, maxPrice: 5600, modalPrice: 5200, volumeQuintals: 10800 },
        { date: 'Oct 2025', avgPrice: 5480, minPrice: 5080, maxPrice: 5820, modalPrice: 5420, volumeQuintals: 5800 },
        { date: 'May 2026', avgPrice: 4950, minPrice: 4600, maxPrice: 5300, modalPrice: 4920, volumeQuintals: 11500 },
        { date: 'Oct 2026', avgPrice: 5550, minPrice: 5150, maxPrice: 5880, modalPrice: 5500, volumeQuintals: 4700 },
      ],
    },
  ],
};