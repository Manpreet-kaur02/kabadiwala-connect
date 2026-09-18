import React, { useState } from 'react';
import {
  Package,
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { InventoryItem, MaterialType, Language } from '../../types';
import { MATERIAL_PRICES } from '../../data/mockData';
import { BarDistributionChart } from '../common/SimpleCharts';

interface CollectorInventoryViewProps {
  language: Language;
  inventory: InventoryItem[];
  onOpenBulkSale: () => void;
  onAddManualStock: () => void;
}

export const CollectorInventoryView: React.FC<CollectorInventoryViewProps> = ({
  language,
  inventory,
  onOpenBulkSale,
  onAddManualStock,
}) => {
  const totalWeight = inventory.reduce((sum, item) => sum + item.weightKg, 0);
  const totalValuation = inventory.reduce((sum, item) => sum + (item.weightKg * item.estimatedRatePerKg), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'कबाड़ी इन्वेंटरी एवं स्क्रैप स्टॉक' : 'Aggregated Scrap Inventory'}
          </h1>
          <p className="text-xs text-slate-500">
            Track categorized e-waste lots in your yard and dispatch wholesale to authorized recyclers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenBulkSale}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'रीसाइक्लर को बेचें' : 'Sell Lot to Recycler'}</span>
          </button>
        </div>
      </div>

      {/* Top Valuation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Yard Weight
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalWeight.toFixed(1)} kg</div>
          <span className="text-[11px] text-teal-700 font-medium mt-0.5 block">
            Across {inventory.length} sorted categories
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Current Yard Scrap Value
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Based on active spot benchmark rates
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Recycler Wholesale Premium
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1">
            +₹{Math.round(totalValuation * 0.12).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-700 font-medium mt-0.5 block">
            Extra profit when sold in bulk {'>'}25kg
          </span>
        </div>
      </div>

      {/* Grid: Inventory List + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Categorized Stock Lots</h2>
              <p className="text-xs text-slate-500">Sorted by precious metal concentration</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">Material</th>
                  <th className="pb-2.5">In Stock</th>
                  <th className="pb-2.5">Avg Cost</th>
                  <th className="pb-2.5">Yard Value</th>
                  <th className="pb-2.5">Storage Bin</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5">
                      <span className="font-bold text-slate-900 block">{item.material}</span>
                      <span className="text-[10px] text-slate-400">Updated: {item.lastUpdated}</span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-800">{item.weightKg} kg</td>
                    <td className="py-3.5 text-slate-600">₹{item.estimatedRatePerKg}/kg</td>
                    <td className="py-3.5 font-bold text-emerald-800">
                      ₹{Math.round(item.weightKg * item.estimatedRatePerKg).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                        {item.storageLocation || 'Bin A-1'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={onOpenBulkSale}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>Dispatch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Breakdown Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Weight Breakdown by Scrap Type
            </h3>
          </div>

          <BarDistributionChart
            items={inventory.map((inv) => ({
              label: inv.material,
              value: inv.weightKg,
              suffix: 'kg',
              color: inv.material === 'PCB' ? 'bg-emerald-600' : inv.material === 'Copper Cable' ? 'bg-teal-600' : 'bg-blue-600',
            }))}
          />

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Formal Aggregator Perk</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Aggregating and separating PCB and Copper Cable doubles your margins when selling directly to CPCB accredited recyclers rather than intermediate traders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
