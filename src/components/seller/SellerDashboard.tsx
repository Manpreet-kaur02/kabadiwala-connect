import React from 'react';
import {
  Sparkles,
  ScanLine,
  Calculator,
  Search,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  IndianRupee,
  MapPin,
  Star,
  FileText,
} from 'lucide-react';
import { PickupRequest, CollectorProfile, TransactionRecord, Language } from '../../types';
import { INITIAL_COLLECTORS, TRANSLATIONS, MATERIAL_PRICES } from '../../data/mockData';

interface SellerDashboardProps {
  language: Language;
  requests?: PickupRequest[];
  transactions?: TransactionRecord[];
  onOpenScanner: () => void;
  onOpenEstimator: () => void;
  onFindCollector: () => void;
  onViewRequestDetails: (req: PickupRequest) => void;
  onViewTransaction: (tx: TransactionRecord) => void;
  onViewAllRequests: () => void;
  onViewAllTransactions: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  language,
  requests = [],
  transactions = [],
  onOpenScanner,
  onOpenEstimator,
  onFindCollector,
  onViewRequestDetails,
  onViewTransaction,
  onViewAllRequests,
  onViewAllTransactions,
}) => {
  const t = TRANSLATIONS[language];
  const safeRequests = requests || [];
  const safeTransactions = transactions || [];

  const activeRequestsCount = safeRequests.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length;
  const completedSalesCount = safeTransactions.filter((t) => t.status === 'Completed').length;
  const totalEarned = safeTransactions.reduce((acc, curr) => acc + (curr.status === 'Completed' ? curr.finalPrice : 0), 0);

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Doorstep Certified E-Waste Disposal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'शुभ प्रभात, राहुल 👋' : 'Good morning, Rahul 👋'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            {language === 'hi'
              ? 'अपना ई-कचरा सुरक्षित बेचें, पारदर्शी भाव पाएं और जिम्मेदार रीसाइक्लिंग में योगदान दें।'
              : 'Sell your e-waste safely, get transparent rates, and bring scrap workers into the formal green chain.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'ई-वेस्ट स्कैन करें' : 'Scan E-Waste with AI'}</span>
            </button>
            <button
              onClick={onOpenEstimator}
              className="px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-400/30 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-emerald-300" />
              <span>{language === 'hi' ? 'कीमत का अनुमान लगाएं' : 'Get Price Estimate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated E-Waste Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'अनुमानित स्क्रैप मूल्य' : 'Estimated Scrap Value'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹3,450</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Across 3 scanned home items
          </p>
        </div>

        {/* Active Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'सक्रिय अनुरोध' : 'Active Requests'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeRequestsCount}</div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            {activeRequestsCount > 0 ? '1 arriving today' : 'All cleared'}
          </p>
        </div>

        {/* Completed Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'सफल बिक्री' : 'Completed Sales'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{completedSalesCount}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            100% CPCB certified recycled
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'कुल अर्जित आय' : 'Total Earned'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Paid directly via UPI/Cash
          </p>
        </div>
      </div>

      {/* 3 Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Scan E-Waste */}
        <div
          onClick={onOpenScanner}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Computer Vision
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {language === 'hi' ? '📷 ई-वेस्ट स्कैन करें' : '📷 Scan E-Waste'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload or snap a photo. Instant detection of PCB, cables, batteries with condition grading.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
            <span>Start Camera Scan</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 2: Get Price Estimate */}
        <div
          onClick={onOpenEstimator}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
              Market Valuator
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {language === 'hi' ? '₹ कीमत का अनुमान' : '₹ Get Price Estimate'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculate expected value by weight, condition, and current regional scrap benchmarks.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-teal-600 group-hover:text-teal-700">
            <span>Calculate Payout</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 3: Find Collector */}
        <div
          onClick={onFindCollector}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Verified Network
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {language === 'hi' ? '♻ कबाड़ीवाला खोजें' : '♻ Find Collector'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Browse ratings, distance, and verified profiles of kabadiwalas in your sector.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-800 group-hover:text-emerald-700">
            <span>View 4 Local Collectors</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Grid: Active Requests + Nearby Collectors Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Pickup Requests (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'हाल के पिकअप अनुरोध' : 'Active Pickup Requests'}
              </h2>
              <p className="text-xs text-slate-500">Track current doorstep collections</p>
            </div>
            <button
              onClick={onViewAllRequests}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {safeRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                onClick={() => onViewRequestDetails(req)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{req.material}</span>
                      <span className="text-[11px] text-slate-500 font-medium">({req.weightKg} kg)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{req.address}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Slot: {req.preferredDate} ({req.preferredTime})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">
                    ₹{req.estimatedValue.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      req.status === 'new'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : req.status === 'accepted'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : req.status === 'scheduled'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Collectors Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'पास के कबाड़ीवाले' : 'Nearby Collectors'}
              </h2>
              <p className="text-xs text-slate-500">Verified scrap partners</p>
            </div>
            <button
              onClick={onFindCollector}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_COLLECTORS.slice(0, 3).map((col) => (
              <div
                key={col.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-900">{col.name}</span>
                    {col.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {col.distanceKm} km • {col.serviceArea}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-900 justify-end">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{col.rating}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    {col.pickupAvailable ? 'Pickup Free' : 'Yard Only'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Traceability Snapshot */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'hi' ? 'हाल के लेन-देन एवं ट्रैकिंग' : 'Recent Transactions & Traceability'}
            </h2>
            <p className="text-xs text-slate-500">
              Click any transaction to view end-to-end chain-of-custody audit
            </p>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5">ID / Date</th>
                <th className="pb-2.5">Material</th>
                <th className="pb-2.5">Weight</th>
                <th className="pb-2.5">Collector</th>
                <th className="pb-2.5">Recycler</th>
                <th className="pb-2.5 text-right">Final Payout</th>
                <th className="pb-2.5 text-center">Trace Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeTransactions.slice(0, 3).map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onViewTransaction(tx)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 font-mono font-medium text-slate-800 group-hover:text-emerald-700">
                    <div>{tx.id}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{tx.date}</div>
                  </td>
                  <td className="py-3 font-bold text-slate-900">{tx.material}</td>
                  <td className="py-3 text-slate-700">{tx.weightKg} kg</td>
                  <td className="py-3 text-slate-600">{tx.collectorName}</td>
                  <td className="py-3 text-slate-600">{tx.recyclerName}</td>
                  <td className="py-3 text-right font-bold text-emerald-700">
                    ₹{tx.finalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tx.traceabilityStage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
