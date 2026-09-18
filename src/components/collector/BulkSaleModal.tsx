import React, { useState } from 'react';
import {
  Building2,
  Package,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { MaterialType, InventoryItem, RecyclerFacility, Language } from '../../types';
import { INITIAL_RECYCLERS, MATERIAL_PRICES } from '../../data/mockData';

interface BulkSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onConfirmSale: (
    material: MaterialType,
    weightSoldKg: number,
    recycler: RecyclerFacility,
    totalGrossRevenue: number,
    profit: number
  ) => void;
  language: Language;
  /** Pre-select a recycler when opened from the Recycler Marketplace's "Sell Lot Here" button. */
  preselectedRecyclerId?: string | null;
}

export const BulkSaleModal: React.FC<BulkSaleModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onConfirmSale,
  language,
  preselectedRecyclerId,
}) => {
  if (!isOpen) return null;

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(
    inventory[0]?.material || 'PCB'
  );
  const currentInvItem = inventory.find((i) => i.material === selectedMaterial) || inventory[0];
  const [weightToSell, setWeightToSell] = useState<number>(currentInvItem ? currentInvItem.weightKg : 10);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>(
    preselectedRecyclerId || INITIAL_RECYCLERS[0].id
  );

  // Keep the selection in sync if the modal is reopened targeting a different recycler
  React.useEffect(() => {
    if (isOpen && preselectedRecyclerId) {
      setSelectedRecyclerId(preselectedRecyclerId);
    }
  }, [isOpen, preselectedRecyclerId]);

  const selectedRecycler = INITIAL_RECYCLERS.find((r) => r.id === selectedRecyclerId) || INITIAL_RECYCLERS[0];
  const recyclerPriceOffer = selectedRecycler.buyingRates[selectedMaterial] || 380;
  const collectorCostBasis = currentInvItem ? currentInvItem.estimatedRatePerKg : 320;

  const totalGrossRevenue = Math.round(recyclerPriceOffer * weightToSell);
  const totalCost = Math.round(collectorCostBasis * weightToSell);
  const netProfit = Math.round(totalGrossRevenue - totalCost);
  const profitMarginPercent = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 15;

  const handleConfirm = () => {
    onConfirmSale(selectedMaterial, weightToSell, selectedRecycler, totalGrossRevenue, netProfit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'hi' ? 'रीसाइक्लर को थोक लॉट बेचें' : 'Sell Bulk Inventory to Recycler'}
            </h2>
            <p className="text-xs text-slate-500">
              Direct formal intake with verified EPR compliance & prompt wire transfer.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Material Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Inventory Category to Dispatch
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => {
                const mat = e.target.value as MaterialType;
                setSelectedMaterial(mat);
                const item = inventory.find((i) => i.material === mat);
                if (item) setWeightToSell(item.weightKg);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.material}>
                  {inv.material} — Available: {inv.weightKg} kg (Avg Cost: ₹{inv.estimatedRatePerKg}/kg)
                </option>
              ))}
            </select>
          </div>

          {/* Weight to dispatch */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Lot Dispatch Weight</span>
              <span className="text-teal-700">Stock max: {currentInvItem?.weightKg || 0} kg</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={currentInvItem?.weightKg || 100}
                value={weightToSell}
                onChange={(e) => setWeightToSell(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">kg</span>
            </div>
          </div>

          {/* Recycler Facility Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authorized Recycler Partner
            </label>
            <div className="space-y-2">
              {INITIAL_RECYCLERS.map((r) => {
                const rate = r.buyingRates[selectedMaterial] || 380;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecyclerId(r.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedRecyclerId === r.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          CPCB Lic
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {r.location} • Min lot: {r.minQuantityKg} kg
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-blue-900 block">₹{rate}/kg</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Bulk Rate</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profit & Margin Calculator Card */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-950 border-b border-emerald-200 pb-2">
              <span>Wholesale Gross Revenue:</span>
              <span className="text-base font-black text-emerald-900">
                ₹{totalGrossRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Cost Basis</span>
                <span className="font-semibold text-slate-900">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Net Profit</span>
                <span className="font-bold text-emerald-700">+₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Margin</span>
                <span className="font-bold text-emerald-700">{profitMarginPercent}%</span>
              </div>
            </div>
          </div>

          {/* Compliance Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Formal intake manifest (Form 6 CPCB E-Waste Rules) will be issued instantly with payment.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Confirm Wholesale Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
