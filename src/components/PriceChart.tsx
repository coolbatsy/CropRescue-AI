import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PricePoint } from '../data/sampleMarketPrices';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { ShieldAlert } from 'lucide-react';

interface PriceChartProps {
  data: PricePoint[];
  cropName: string;
  stateName?: string;
  height?: number;
  compact?: boolean;
  showLegend?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  cropName,
  stateName,
  height = 320,
  compact = false,
  showLegend = true,
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-[#101a12] rounded-xl border border-gray-100 dark:border-[#233327] text-xs text-gray-500 dark:text-gray-400">
        {language === 'hi'
          ? 'इस चयन के लिए कोई भाव इतिहास डेटा उपलब्ध नहीं है।'
          : 'No price history data available for this selection.'}
      </div>
    );
  }

  const gridStroke = isDark ? '#233327' : '#E5E7EB';
  const axisStroke = isDark ? '#374151' : '#D1D5DB';
  const tickColor = isDark ? '#9ca3af' : '#647067';
  const modalLineColor = isDark ? '#4ade80' : '#166534';
  const maxLineColor = isDark ? '#86efac' : '#15803d';
  const minLineColor = isDark ? '#fbbf24' : '#d97706';

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-[#141f17]/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-gray-200 dark:border-[#2a3d2e] text-xs">
          <p className="font-bold text-[#17251C] dark:text-gray-100 mb-1.5">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between gap-4">
              <span>{language === 'hi' ? 'मॉडल भाव:' : 'Modal Price:'}</span>
              <span>₹{payload[0]?.value?.toLocaleString('en-IN')}/qtl</span>
            </p>
            {payload[1] && (
              <p className="text-blue-600 dark:text-blue-400 flex items-center justify-between gap-4">
                <span>{language === 'hi' ? 'अधिकतम भाव:' : 'Max Price:'}</span>
                <span>₹{payload[1]?.value?.toLocaleString('en-IN')}/qtl</span>
              </p>
            )}
            {payload[2] && (
              <p className="text-amber-600 dark:text-amber-400 flex items-center justify-between gap-4">
                <span>{language === 'hi' ? 'न्यूनतम भाव:' : 'Min Price:'}</span>
                <span>₹{payload[2]?.value?.toLocaleString('en-IN')}/qtl</span>
              </p>
            )}
          </div>
          <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-[#233327] text-[10px] text-gray-400">
            {language === 'hi' ? 'सांकेतिक डेमो डेटा' : 'Illustrative demo sample'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-w-0">
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#17251C] dark:text-gray-100">
              {language === 'hi'
                ? `${cropName} का सांकेतिक भाव रुझान ${stateName ? `(${stateName})` : ''}`
                : `Indicative Price Trend: ${cropName} ${stateName ? `(${stateName})` : ''}`}
            </h4>
            <p className="text-xs text-[#647067] dark:text-gray-400">
              {language === 'hi'
                ? 'मासिक मंडी मॉडल भाव (₹ प्रति क्विंटल)'
                : 'Monthly mandi modal prices (₹ per quintal)'}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{language === 'hi' ? 'डेमो डेटा — वास्तविक मंडी भाव नहीं' : 'Demo data — not live quotation'}</span>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height }} className="min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={
              compact
                ? { top: 6, right: 10, left: -22, bottom: 0 }
                : { top: 10, right: 10, left: -15, bottom: 0 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: compact ? 10 : 11, fill: tickColor }}
              stroke={axisStroke}
            />
            <YAxis
              tick={{ fontSize: compact ? 10 : 11, fill: tickColor }}
              stroke={axisStroke}
              tickFormatter={(val) => `₹${val}`}
              domain={['auto', 'auto']}
              width={compact ? 44 : 52}
            />
            <Tooltip content={customTooltip} />
            {showLegend && !compact && (
              <Legend
                wrapperStyle={{
                  fontSize: '11px',
                  paddingTop: '10px',
                  color: tickColor,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="modalPrice"
              name={language === 'hi' ? 'मॉडल भाव' : 'Modal Price'}
              stroke={modalLineColor}
              strokeWidth={compact ? 2 : 2.5}
              dot={{ r: compact ? 3 : 4, fill: modalLineColor }}
              activeDot={{ r: compact ? 5 : 6 }}
            />
            <Line
              type="monotone"
              dataKey="maxPrice"
              name={language === 'hi' ? 'अधिकतम' : 'Max Price'}
              stroke={maxLineColor}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minPrice"
              name={language === 'hi' ? 'न्यूनतम' : 'Min Price'}
              stroke={minLineColor}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
