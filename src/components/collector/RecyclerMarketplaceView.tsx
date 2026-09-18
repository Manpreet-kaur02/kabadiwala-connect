import React, { useMemo, useState } from 'react';
import {
  Store,
  Building2,
  ShieldCheck,
  MapPin,
  Star,
  Phone,
  Mail,
  Package,
  Truck,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { InventoryItem, Language, MaterialType, RecyclerProfile } from '../../types';
import { INITIAL_RECYCLERS } from '../../data/mockData';
import { makeL } from '../../utils/i18n';
import { RecyclerVerificationModal } from '../common/RecyclerVerificationModal';

interface RecyclerMarketplaceViewProps {
  language: Language;
  inventory: InventoryItem[];
  onSellToRecycler: (recyclerId: string) => void;
}

/**
 * "Recycler Marketplace" lets the collector compare authorized recyclers and
 * their live buying rates before dispatching a lot — the counterpart to
 * "Find Collector" on the seller side. This is intentionally distinct from
 * "Inventory", which shows the collector's own stock, not recycler options.
 */
export const RecyclerMarketplaceView: React.FC<RecyclerMarketplaceViewProps> = ({
  language,
  inventory,
  onSellToRecycler,
}) => {
  const L = makeL(language);
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rate'>('rate');
  const [verifyingRecycler, setVerifyingRecycler] = useState<RecyclerProfile | null>(null);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    INITIAL_RECYCLERS.forEach((r) => Object.keys(r.buyingRates).forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, []);

  const recyclers = useMemo(() => {
    let list = [...INITIAL_RECYCLERS];
    if (materialFilter !== 'all') {
      list = list.filter((r) => r.buyingRates[materialFilter] !== undefined);
    }
    return list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      const rateA = materialFilter !== 'all' ? a.buyingRates[materialFilter] || 0 : Math.max(...Object.values(a.buyingRates));
      const rateB = materialFilter !== 'all' ? b.buyingRates[materialFilter] || 0 : Math.max(...Object.values(b.buyingRates));
      return rateB - rateA;
    });
  }, [materialFilter, sortBy]);

  const inventoryMaterials = new Set(inventory.map((i) => String(i.material)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[11px] font-semibold border border-blue-400/30 mb-3">
          <Store className="w-3.5 h-3.5" />
          <span>{L('Compare & Dispatch', 'तुलना करें और भेजें', 'तुलना करा आणि पाठवा')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {L('Recycler Marketplace', 'रीसाइक्लर बाजार', 'रीसायकलर बाजार')}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          {L(
            'Compare live buying rates from CPCB authorized recyclers and dispatch your yard stock to whoever pays best.',
            'सीपीसीबी अधिकृत रीसाइक्लर्स के भाव तुलना करें और सबसे अच्छा भाव देने वाले को माल भेजें।',
            'सीपीसीबी अधिकृत रीसायकलरचे दर तुलना करा आणि सर्वोत्तम भाव देणाऱ्याला माल पाठवा.'
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {L('Filter', 'फ़िल्टर', 'फिल्टर')}
          </span>
        </div>
        <select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="all">{L('All materials', 'सभी सामग्री', 'सर्व साहित्य')}</option>
          {materialOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'distance' | 'rate')}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="rate">{L('Best rate first', 'सबसे अच्छा भाव पहले', 'सर्वोत्तम दर आधी')}</option>
          <option value="distance">{L('Nearest first', 'सबसे पास पहले', 'सर्वात जवळ आधी')}</option>
        </select>
        <span className="text-[11px] text-slate-400 sm:ml-auto self-center">
          {recyclers.length} {L('authorized recyclers', 'अधिकृत रीसाइक्लर', 'अधिकृत रीसायकलर')}
        </span>
      </div>

      {/* Recycler cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recyclers.map((r) => {
          const rateEntries = Object.entries(r.buyingRates).filter(
            ([mat]) => materialFilter === 'all' || mat === materialFilter
          );
          const hasMatchingStock = rateEntries.some(([mat]) => inventoryMaterials.has(mat));

          return (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                hasMatchingStock ? 'border-emerald-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                      {r.authorized && (
                        <button
                          onClick={() => setVerifyingRecycler(r)}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          title={L('Tap to verify authorization', 'सत्यापन देखने के लिए टैप करें', 'पडताळणी पाहण्यासाठी टॅप करा')}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          CPCB
                        </button>
                      )}
                      {hasMatchingStock && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {L('Matches your stock', 'आपके स्टॉक से मेल', 'तुमच्या स्टॉकशी जुळते')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {r.location} • {r.distanceKm} km
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{r.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {L('Min lot', 'न्यूनतम लॉट', 'किमान लॉट')}: {r.minQuantityKg} kg
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium ${
                      r.pickupAvailable ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.pickupAvailable
                      ? L('✓ Pickup Available', '✓ पिकअप उपलब्ध', '✓ पिकअप उपलब्ध')
                      : L('Drop-off Only', 'ड्रॉप-ऑफ केवल', 'ड्रॉप-ऑफ फक्त')}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    {L('Buying Rates', 'खरीद भाव', 'खरेदी दर')}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {rateEntries.slice(0, 6).map(([mat, rate]) => (
                      <div
                        key={mat}
                        className={`px-2 py-1 rounded-lg border text-[11px] flex items-center justify-between ${
                          inventoryMaterials.has(mat)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="truncate">{mat}</span>
                        <span className="font-bold shrink-0 ml-1">₹{rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${r.contactPhone}`}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{L('Call', 'कॉल करें', 'कॉल करा')}</span>
                </a>
                <button
                  onClick={() => onSellToRecycler(r.id)}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>{L('Sell Lot Here', 'यहां लॉट बेचें', 'येथे लॉट विका')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <RecyclerVerificationModal
        isOpen={Boolean(verifyingRecycler)}
        onClose={() => setVerifyingRecycler(null)}
        recycler={verifyingRecycler}
        language={language}
      />
    </div>
  );
};
