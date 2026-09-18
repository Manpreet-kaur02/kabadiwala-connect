import React from 'react';
import {
  Truck,
  Package,
  Building2,
  Scale,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Phone,
  ScanLine,
  Calculator,
} from 'lucide-react';
import { PickupRequest, InventoryItem, TransactionRecord, Language } from '../../types';
import { TRANSLATIONS } from '../../data/mockData';

interface CollectorDashboardProps {
  language: Language;
  requests?: PickupRequest[];
  inventory?: InventoryItem[];
  transactions?: TransactionRecord[];
  onNavigateToPickups: () => void;
  onNavigateToInventory: () => void;
  onOpenBulkSale: () => void;
  onOpenWeighingModal: (req: PickupRequest) => void;
  onAcceptRequest: (id: string) => void;
  onOpenScanner?: () => void;
  onOpenPriceChecker?: () => void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  language,
  requests = [],
  inventory = [],
  transactions = [],
  onNavigateToPickups,
  onNavigateToInventory,
  onOpenBulkSale,
  onOpenWeighingModal,
  onAcceptRequest,
  onOpenScanner,
  onOpenPriceChecker,
}) => {
  const safeRequests = requests || [];
  const safeInventory = inventory || [];
  const safeTransactions = transactions || [];

  const pendingRequests = safeRequests.filter((r) => r.status === 'new' || r.status === 'accepted' || r.status === 'scheduled');
  const completedToday = safeRequests.filter((r) => r.status === 'completed');
  const totalStockKg = safeInventory.reduce((sum, item) => sum + (item.weightKg || 0), 0);
  const totalStockValuation = safeInventory.reduce((sum, item) => sum + ((item.weightKg || 0) * (item.estimatedRatePerKg || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Collector Greeting Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Micro-Collector • Sector 38 Depot, Chandigarh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'नमस्ते, रवि जी 🙏' : 'Namaste, Ravi Ji 🙏'}
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
            {language === 'hi'
              ? 'आज आपके पास 3 नए पिकअप अनुरोध हैं। स्टॉक तैयार करें और अधिकृत रीसाइक्लर्स को थोक में बेचें।'
              : 'You have active doorstep pickup routes scheduled. Aggregate clean lots to maximize recycler wholesale payouts.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                <span>{language === 'hi' ? 'एआई स्कैनर (AI Scan)' : 'AI Scan Scrap'}</span>
              </button>
            )}
            {onOpenPriceChecker && (
              <button
                onClick={onOpenPriceChecker}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <Calculator className="w-4 h-4 text-emerald-300" />
                <span>{language === 'hi' ? 'मूल्य चेकर' : 'Fair Price Checker'}</span>
              </button>
            )}
            <button
              onClick={onNavigateToPickups}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'hi' ? 'आज के पिकअप देखें' : 'View Today\'s Pickups'}</span>
            </button>
            <button
              onClick={onOpenBulkSale}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>{language === 'hi' ? 'थोक माल बेचें' : 'Sell Bulk Lot to Recycler'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Pickups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Pickups
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingRequests.length}</div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            2 in Sector 35 & 42
          </p>
        </div>

        {/* Collected Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{completedToday.length}</div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            All weighed via calibrated digital scale
          </p>
        </div>

        {/* Total Yard Stock (kg) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Stock In Yard
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStockKg.toFixed(1)} kg</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Across {inventory.length} sorted grades
          </p>
        </div>

        {/* Yard Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Est. Inventory Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ₹{totalStockValuation.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Ready for authorized dispatch
          </p>
        </div>
      </div>

      {/* Grid: Pending Pickups (7 cols) + Yard Stock Highlights (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Pickups Queue */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'सक्रिय पिकअप कार्य' : 'Active Pickup Route Tasks'}
              </h2>
              <p className="text-xs text-slate-500">Collect, weigh on digital scale & pay instantly</p>
            </div>
            <button
              onClick={onNavigateToPickups}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{req.material}</span>
                    <span className="text-xs font-semibold text-slate-600">({req.weightKg} kg)</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'new'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : req.status === 'accepted'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.address}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Seller: <strong className="text-slate-800">{req.sellerName}</strong> • Slot: {req.preferredDate} ({req.preferredTime})
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs font-black text-slate-900">
                    Est. ₹{req.estimatedValue.toLocaleString('en-IN')}
                  </span>
                  {req.status === 'new' ? (
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-2xs"
                    >
                      Accept
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenWeighingModal(req)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Weigh & Pay</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                All pickup route tasks are completed for now!
              </div>
            )}
          </div>
        </div>

        {/* Yard Inventory Snapshot */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Yard Stock Snapshot</h2>
              <p className="text-xs text-slate-500">Sorted lots ready for dispatch</p>
            </div>
            <button
              onClick={onNavigateToInventory}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Full Yard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {safeInventory.map((item) => {
              const weight = item.weightKg || 0;
              const rate = item.estimatedRatePerKg || 0;
              const marketValue = Math.round(weight * rate);
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{item.material}</span>
                    <span className="text-[11px] text-slate-500">
                      Stock: <strong className="text-slate-700">{weight} kg</strong> • Bin: {item.storageLocation || 'Bin A-1'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 block">
                      ₹{marketValue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400">₹{rate}/kg</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onOpenBulkSale}
            className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Create Bulk Lot Dispatch to Recycler</span>
          </button>
        </div>
      </div>
    </div>
  );
};
