import React, { useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Package,
  IndianRupee,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ArrowRight,
  Truck,
  Factory,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Language, TransactionRecord, CollectorProfile, RecyclerProfile, PickupRequest } from '../../types';
import { INITIAL_COLLECTORS, INITIAL_RECYCLERS } from '../../data/mockData';

interface AdminDashboardProps {
  language: Language;
  transactions: TransactionRecord[];
  requests: PickupRequest[];
  onViewTraceability: (tx: TransactionRecord) => void;
  isOnline: boolean;
  pendingSyncCount: number;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}> = ({ label, value, icon: Icon, accent, sub }) => (
  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-slate-900 mt-2">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  transactions,
  requests,
  onViewTraceability,
  isOnline,
  pendingSyncCount,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const totalCollectors = INITIAL_COLLECTORS.length;
    const totalRecyclers = INITIAL_RECYCLERS.length;
    const authorizedRecyclers = INITIAL_RECYCLERS.filter((r) => r.authorized).length;
    const totalLots = transactions.length + requests.length;
    const totalMaterialKg = transactions.reduce((sum, t) => sum + t.weightKg, 0);
    const totalValue = transactions.reduce((sum, t) => sum + t.finalPrice, 0);
    const anomalies = transactions.filter((t) => t.anomalyStatus === 'suspicious');
    const pendingPayments = requests.filter((r) => r.status !== 'completed').length;

    return {
      totalCollectors,
      totalRecyclers,
      authorizedRecyclers,
      totalLots,
      totalMaterialKg,
      totalValue,
      anomalies,
      pendingPayments,
    };
  }, [transactions, requests]);

  const materialCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => String(t.material)));
    return ['all', ...Array.from(set)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (materialFilter === 'all') return transactions;
    return transactions.filter((t) => String(t.material) === materialFilter);
  }, [transactions, materialFilter]);

  const stageIcon = (stage: TransactionRecord['traceabilityStage']) => {
    switch (stage) {
      case 'Seller':
        return <Users className="w-3.5 h-3.5" />;
      case 'Collector':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Authorized Recycler':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'Under Processing':
        return <Factory className="w-3.5 h-3.5" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  const t = {
    title: isHi ? 'एडमिन / PMU निगरानी डैशबोर्ड' : isMr ? 'प्रशासन / PMU देखरेख डॅशबोर्ड' : 'Admin / PMU Monitoring Dashboard',
    subtitle: isHi
      ? 'संपूर्ण प्लेटफॉर्म पर सामग्री प्रवाह, रिसाइक्लर प्राधिकरण और असामान्य लेन-देन की निगरानी'
      : isMr
      ? 'संपूर्ण प्लॅटफॉर्मवरील मटेरियल फ्लो, रीसायकलर अधिकृतता आणि असामान्य व्यवहारांची देखरेख'
      : 'Platform-wide visibility into material flow, recycler authorization and anomalous transactions',
    collectors: isHi ? 'कुल कलेक्टर' : isMr ? 'एकूण कलेक्टर' : 'Total Collectors',
    recyclers: isHi ? 'अधिकृत रिसाइक्लर' : isMr ? 'अधिकृत रीसायकलर' : 'Authorized Recyclers',
    lots: isHi ? 'कुल लॉट / लेन-देन' : isMr ? 'एकूण लॉट / व्यवहार' : 'Total Lots / Transactions',
    material: isHi ? 'कुल सामग्री (kg)' : isMr ? 'एकूण मटेरियल (kg)' : 'Total Material Traced (kg)',
    value: isHi ? 'कुल भुगतान मूल्य' : isMr ? 'एकूण देय मूल्य' : 'Total Transaction Value',
    anomalies: isHi ? 'फ्लैग किए गए असामान्य लेन-देन' : isMr ? 'फ्लॅग केलेले असामान्य व्यवहार' : 'Flagged Anomalies',
    syncStatus: isHi ? 'सिंक स्थिति' : isMr ? 'सिंक स्थिती' : 'Sync Status',
    materialFlow: isHi ? 'सामग्री प्रवाह (कलेक्टर → रिसाइक्लर)' : isMr ? 'मटेरियल फ्लो (कलेक्टर → रीसायकलर)' : 'Material Flow (Collector → Recycler)',
    recyclerRegistry: isHi ? 'रिसाइक्लर प्राधिकरण रजिस्ट्री' : isMr ? 'रीसायकलर अधिकृतता नोंदणी' : 'Recycler Authorization Registry',
    collectorNetwork: isHi ? 'कलेक्टर नेटवर्क' : isMr ? 'कलेक्टर नेटवर्क' : 'Collector Network',
    viewTrace: isHi ? 'ट्रेस देखें' : isMr ? 'ट्रेस पहा' : 'View Trace',
    allMaterials: isHi ? 'सभी सामग्री' : isMr ? 'सर्व मटेरियल' : 'All Materials',
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.title}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{t.subtitle}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
            isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>
            {isOnline ? (isHi ? 'सभी नोड सिंक में' : isMr ? 'सर्व नोड सिंकमध्ये' : 'All nodes synced') : t.syncStatus}
          </span>
          {pendingSyncCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px]">
              {pendingSyncCount} {isHi ? 'लंबित' : isMr ? 'प्रलंबित' : 'pending'}
            </span>
          )}
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={t.collectors} value={stats.totalCollectors} icon={Users} accent="bg-teal-50 text-teal-700" />
        <StatCard
          label={t.recyclers}
          value={`${stats.authorizedRecyclers}/${stats.totalRecyclers}`}
          icon={Building2}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard label={t.lots} value={stats.totalLots} icon={Package} accent="bg-emerald-50 text-emerald-700" />
        <StatCard
          label={t.material}
          value={`${stats.totalMaterialKg.toFixed(1)} kg`}
          icon={Truck}
          accent="bg-slate-100 text-slate-700"
        />
        <StatCard
          label={t.value}
          value={`₹${stats.totalValue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label={t.anomalies}
          value={stats.anomalies.length}
          icon={AlertTriangle}
          accent={stats.anomalies.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}
        />
      </div>

      {/* Anomaly List */}
      {stats.anomalies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-rose-700 flex items-center gap-1.5 mb-3">
            <ShieldAlert className="w-4 h-4" />
            {t.anomalies}
          </h3>
          <div className="space-y-2">
            {stats.anomalies.map((tx) => (
              <button
                key={tx.id}
                onClick={() => onViewTraceability(tx)}
                className="w-full text-left flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-rose-200 hover:border-rose-400 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {tx.id} • {tx.material} • {tx.weightKg} kg
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5 truncate">{tx.anomalyReason}</p>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 shrink-0">
                  {t.viewTrace} <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material Flow Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900">{t.materialFlow}</h3>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            {materialCategories.map((m) => (
              <option key={m} value={m}>
                {m === 'all' ? t.allMaterials : m}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3">Lot ID</th>
                <th className="py-2 pr-3">Material</th>
                <th className="py-2 pr-3">Collector</th>
                <th className="py-2 pr-3">Recycler</th>
                <th className="py-2 pr-3">Weight</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-2 pr-3 font-mono text-[11px] text-slate-500">{tx.id}</td>
                  <td className="py-2 pr-3 font-semibold text-slate-800">{tx.material}</td>
                  <td className="py-2 pr-3 text-slate-600">{tx.collectorName}</td>
                  <td className="py-2 pr-3 text-slate-600">{tx.recyclerName}</td>
                  <td className="py-2 pr-3 text-slate-600">{tx.weightKg} kg</td>
                  <td className="py-2 pr-3 font-semibold text-emerald-700">₹{tx.finalPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {stageIcon(tx.traceabilityStage)}
                      {tx.traceabilityStage}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => onViewTraceability(tx)}
                      className="text-emerald-700 font-semibold text-[11px] hover:underline"
                    >
                      {t.viewTrace}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recycler Registry + Collector Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">{t.recyclerRegistry}</h3>
          <div className="space-y-2">
            {INITIAL_RECYCLERS.map((r: RecyclerProfile) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                  <p className="text-[10.5px] text-slate-500 font-mono truncate">{r.licenseNumber}</p>
                  <p className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {r.location}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.authorized ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {r.authorized ? 'Authorized' : 'Unauthorized'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">{t.collectorNetwork}</h3>
          <div className="space-y-2">
            {INITIAL_COLLECTORS.map((c: CollectorProfile) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                  <p className="text-[10.5px] text-slate-500 truncate">{c.serviceArea}</p>
                </div>
                <span className="shrink-0 text-[10.5px] font-semibold text-slate-600">
                  {c.completedCollections} {isHi ? 'लेन-देन' : isMr ? 'व्यवहार' : 'collections'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
