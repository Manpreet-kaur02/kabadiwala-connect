import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { MaterialType, Language } from '../../types';
import { MATERIAL_PRICES, TRANSLATIONS } from '../../data/mockData';
import { LineTrendChart, BarDistributionChart } from '../common/SimpleCharts';

export const PriceHistoryView: React.FC<{ language: Language }> = ({ language }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('PCB');
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('30d');

  const priceData = MATERIAL_PRICES[selectedMaterial] || MATERIAL_PRICES['PCB'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Intelligence Index</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'ई-कचरा मूल्य इतिहास एवं रुझान' : 'Scrap Material Price Trends & History'}
          </h1>
          <p className="text-xs text-slate-500">
            Transparent regional trading rates across North India industrial scrap yards.
          </p>
        </div>

        {/* Demo Notice */}
        <span className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          * Synthetic indicative benchmark data for prototype
        </span>
      </div>

      {/* Material Selector Horizontal Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {Object.keys(MATERIAL_PRICES).map((mat) => (
          <button
            key={mat}
            onClick={() => setSelectedMaterial(mat as MaterialType)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              selectedMaterial === mat
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {mat}
          </button>
        ))}
      </div>

      {/* Main Trends & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {priceData.category}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{selectedMaterial}</span>
                <span className="text-emerald-600 text-sm font-bold flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  +{priceData.changeWeekPercent}% this week
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Current Spot</span>
                <span className="text-2xl font-black text-emerald-800">
                  ₹{priceData.indicativeRatePerKg}
                  <span className="text-xs font-normal text-slate-500">/kg</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="pt-2">
            <LineTrendChart data={priceData.history30Days} height={180} />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Min (30d)</span>
              <span className="font-bold text-slate-800 mt-0.5 block">₹{priceData.minRate}/kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Max (30d)</span>
              <span className="font-bold text-slate-800 mt-0.5 block">₹{priceData.maxRate}/kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Monthly Volatility</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">±4.2% (Stable)</span>
            </div>
          </div>
        </div>

        {/* City Comparison & Demand (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Regional Price Comparison</span>
              </h3>
              <span className="text-[10px] text-slate-400">INR / kg</span>
            </div>

            <BarDistributionChart
              items={priceData.locationRates.map((loc) => ({
                label: loc.city,
                value: loc.rate,
                suffix: '₹/kg',
                color: loc.city === 'Chandigarh' ? 'bg-emerald-600' : 'bg-slate-400',
              }))}
            />
          </div>

          {/* Recycler Intake Tip */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bulk Lot Premium Advice</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-emerald-800">
              Authorized recyclers pay 8% to 15% higher wholesale spot rates when informal collectors aggregate lots above 15 kg. Check the Recycler Marketplace in Collector Mode to view active lot tenders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
