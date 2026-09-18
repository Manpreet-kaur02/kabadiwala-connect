import React, { useMemo, useState } from 'react';
import {
  Compass,
  MapPin,
  Phone,
  Package,
  Navigation,
  Clock,
  Star,
  Building2,
  Home,
  Store,
  Filter,
  CheckCircle2,
  Radar,
} from 'lucide-react';
import { PickupRequest, Language, MaterialType } from '../../types';
import { makeL, formatINR } from '../../utils/i18n';

interface NearbySellersViewProps {
  language: Language;
  requests: PickupRequest[];
  onAcceptRequest: (id: string) => void;
  onViewOnMap: (req: PickupRequest) => void;
  onContactLead: (name: string, phone: string) => void;
}

/** Standing (non-request) seller leads in the collector's beat — bulk/institutional sources */
interface SellerLead {
  id: string;
  name: string;
  type: 'Household' | 'Shop' | 'Office' | 'Institution';
  area: string;
  distanceKm: number;
  phone: string;
  expectedMaterials: MaterialType[];
  approxWeightKg: number;
  rating: number;
  lastSoldAgo: string;
}

const SELLER_LEADS: SellerLead[] = [
  {
    id: 'LEAD-001',
    name: 'Sector 34 Computer Market Assoc.',
    type: 'Shop',
    area: 'Sector 34-A, Chandigarh',
    distanceKm: 1.9,
    phone: '+91 98151 20034',
    expectedMaterials: ['PCB', 'Hard Disk (HDD)', 'Laptop'],
    approxWeightKg: 45,
    rating: 4.6,
    lastSoldAgo: '6 days ago',
  },
  {
    id: 'LEAD-002',
    name: 'Shivalik Enclave RWA',
    type: 'Household',
    area: 'Sector 49-B, Chandigarh',
    distanceKm: 3.2,
    phone: '+91 98760 44219',
    expectedMaterials: ['Mixed E-waste', 'Copper Cable', 'Adapter / Charger'],
    approxWeightKg: 28,
    rating: 4.4,
    lastSoldAgo: '2 weeks ago',
  },
  {
    id: 'LEAD-003',
    name: 'Nova Diagnostics Lab',
    type: 'Institution',
    area: 'Phase 5, Mohali',
    distanceKm: 5.4,
    phone: '+91 97790 33450',
    expectedMaterials: ['Printer / Scanner', 'LCD Screen', 'Motor'],
    approxWeightKg: 62,
    rating: 4.8,
    lastSoldAgo: '1 month ago',
  },
  {
    id: 'LEAD-004',
    name: 'Bansal Electronics Repair',
    type: 'Shop',
    area: 'Sector 22-D, Chandigarh',
    distanceKm: 2.1,
    phone: '+91 98882 66031',
    expectedMaterials: ['PCB', 'Lithium Battery', 'Mobile Phone'],
    approxWeightKg: 17,
    rating: 4.5,
    lastSoldAgo: '3 days ago',
  },
  {
    id: 'LEAD-005',
    name: 'Zirakpur IT Park — Facility Desk',
    type: 'Office',
    area: 'Zirakpur Bypass',
    distanceKm: 8.6,
    phone: '+91 98153 77120',
    expectedMaterials: ['Laptop', 'CRT Monitor', 'Copper Cable'],
    approxWeightKg: 110,
    rating: 4.9,
    lastSoldAgo: '5 weeks ago',
  },
];

const TYPE_ICON: Record<SellerLead['type'], React.ElementType> = {
  Household: Home,
  Shop: Store,
  Office: Building2,
  Institution: Building2,
};

/** deterministic angle so the radar layout is stable between renders */
const angleFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return (hash / 360) * Math.PI * 2;
};

export const NearbySellersView: React.FC<NearbySellersViewProps> = ({
  language,
  requests,
  onAcceptRequest,
  onViewOnMap,
  onContactLead,
}) => {
  const L = makeL(language);
  const [radiusKm, setRadiusKm] = useState(10);
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'value'>('distance');

  /** Live pickup requests from sellers that this collector can still pick up */
  const liveRequests = useMemo(() => {
    let list = requests.filter(
      (r) => r.distanceKm <= radiusKm && (r.status === 'new' || r.status === 'accepted')
    );
    if (materialFilter !== 'all') {
      list = list.filter((r) => String(r.material) === materialFilter);
    }
    return [...list].sort((a, b) =>
      sortBy === 'distance'
        ? a.distanceKm - b.distanceKm
        : b.estimatedValue - a.estimatedValue
    );
  }, [requests, radiusKm, materialFilter, sortBy]);

  const leads = useMemo(() => {
    let list = SELLER_LEADS.filter((l) => l.distanceKm <= radiusKm);
    if (materialFilter !== 'all') {
      list = list.filter((l) => l.expectedMaterials.some((m) => String(m) === materialFilter));
    }
    return [...list].sort((a, b) =>
      sortBy === 'distance'
        ? a.distanceKm - b.distanceKm
        : b.approxWeightKg - a.approxWeightKg
    );
  }, [radiusKm, materialFilter, sortBy]);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => set.add(String(r.material)));
    SELLER_LEADS.forEach((l) => l.expectedMaterials.forEach((m) => set.add(String(m))));
    return Array.from(set).sort();
  }, [requests]);

  const totalOpportunityValue = liveRequests.reduce((s, r) => s + r.estimatedValue, 0);
  const totalLeadWeight = leads.reduce((s, l) => s + l.approxWeightKg, 0);

  /** radar plot points */
  const radarPoints = [
    ...liveRequests.slice(0, 8).map((r) => ({
      id: r.id,
      distanceKm: r.distanceKm,
      label: r.sellerName,
      kind: 'request' as const,
    })),
    ...leads.slice(0, 6).map((l) => ({
      id: l.id,
      distanceKm: l.distanceKm,
      label: l.name,
      kind: 'lead' as const,
    })),
  ];

  const maxRadius = Math.max(radiusKm, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>{L('Live in your beat', 'आपके इलाके में', 'तुमच्या भागात')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {L('Nearby Sellers', 'आस-पास के सेलर', 'आसपासचे विक्रेते')}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          {L(
            'Open pickup requests and known bulk e-waste sources within your service area, sorted so you can plan one efficient collection round.',
            'आपके इलाके में खुले पिकअप अनुरोध और बड़े ई-वेस्ट स्रोत — एक ही चक्कर में ज्यादा माल उठाने के लिए।',
            'तुमच्या भागातील खुल्या पिकअप विनंत्या आणि मोठे ई-वेस्ट स्रोत — एकाच फेरीत जास्त माल उचलण्यासाठी.'
          )}
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Open Requests', 'खुले अनुरोध', 'खुल्या विनंत्या')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{liveRequests.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('within', 'के अंदर', 'च्या आत')} {radiusKm} km
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Estimated Value', 'अनुमानित मूल्य', 'अंदाजे मूल्य')}
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {formatINR(totalOpportunityValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('If all are collected', 'सब उठाने पर', 'सर्व उचलल्यास')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Bulk Sources', 'बड़े स्रोत', 'मोठे स्रोत')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{leads.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ≈ {totalLeadWeight} kg {L('potential', 'संभावित', 'संभाव्य')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Nearest Stop', 'सबसे पास', 'सर्वात जवळ')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {liveRequests.length > 0
              ? `${liveRequests[0].distanceKm.toFixed(1)} km`
              : leads.length > 0
              ? `${leads[0].distanceKm.toFixed(1)} km`
              : '—'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('From your location', 'आपकी जगह से', 'तुमच्या ठिकाणावरून')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {L('Filter your round', 'अपना चक्कर चुनें', 'तुमची फेरी निवडा')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                {L('Search radius', 'दूरी', 'अंतर')}
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-700">
                {radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              {L('Material', 'सामग्री', 'साहित्य')}
            </label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="all">{L('All materials', 'सभी सामग्री', 'सर्व साहित्य')}</option>
              {materialOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              {L('Sort by', 'क्रम', 'क्रम')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'value')}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="distance">{L('Nearest first', 'सबसे पास पहले', 'सर्वात जवळ आधी')}</option>
              <option value="value">{L('Highest value first', 'सबसे ज्यादा दाम पहले', 'सर्वाधिक किंमत आधी')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Radar / proximity map */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <Radar className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {L('Proximity Map', 'नक्शा', 'नकाशा')}
            </h2>
          </div>

          <svg viewBox="0 0 220 220" className="w-full max-w-[280px] mx-auto">
            {[1, 0.66, 0.33].map((ring) => (
              <circle
                key={ring}
                cx={110}
                cy={110}
                r={95 * ring}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ))}
            <line x1={15} y1={110} x2={205} y2={110} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={110} y1={15} x2={110} y2={205} stroke="#f1f5f9" strokeWidth={1} />

            {/* radius labels */}
            <text x={112} y={22} fontSize={7} fill="#94a3b8">
              {radiusKm} km
            </text>
            <text x={112} y={52} fontSize={7} fill="#cbd5e1">
              {Math.round(radiusKm * 0.66)} km
            </text>

            {radarPoints.map((p) => {
              const a = angleFor(p.id);
              const r = Math.min(p.distanceKm / maxRadius, 1) * 92;
              const cx = 110 + Math.cos(a) * r;
              const cy = 110 + Math.sin(a) * r;
              return (
                <g key={p.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={p.kind === 'request' ? 5.5 : 4}
                    fill={p.kind === 'request' ? '#059669' : '#64748b'}
                    opacity={0.9}
                  />
                  {p.kind === 'request' && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={9}
                      fill="none"
                      stroke="#059669"
                      strokeWidth={1}
                      opacity={0.35}
                    />
                  )}
                </g>
              );
            })}

            {/* collector at centre */}
            <circle cx={110} cy={110} r={7} fill="#0f172a" />
            <circle cx={110} cy={110} r={12} fill="none" stroke="#0f172a" strokeWidth={1} opacity={0.3} />
            <text x={110} y={132} fontSize={7.5} fill="#0f172a" textAnchor="middle" fontWeight="bold">
              {L('You', 'आप', 'तुम्ही')}
            </text>
          </svg>

          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              {L('Pickup request', 'पिकअप अनुरोध', 'पिकअप विनंती')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              {L('Bulk source', 'बड़ा स्रोत', 'मोठा स्रोत')}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 text-center leading-relaxed">
            {L(
              'Positions are indicative. Real GPS coordinates are captured at handover.',
              'यह नक्शा अनुमानित है। असली जीपीएस हैंडओवर के समय लिया जाता है।',
              'हा नकाशा अंदाजे आहे. खरे जीपीएस हस्तांतरणाच्या वेळी घेतले जाते.'
            )}
          </p>
        </div>

        {/* Lists */}
        <div className="lg:col-span-3 space-y-5">
          {/* Live requests */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {L('Open Pickup Requests', 'खुले पिकअप अनुरोध', 'खुल्या पिकअप विनंत्या')}
              </h2>
              <span className="text-[10px] text-slate-400">
                {liveRequests.length} {L('found', 'मिले', 'सापडले')}
              </span>
            </div>

            {liveRequests.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                {L(
                  'No open requests in this radius. Try increasing the distance.',
                  'इस दूरी में कोई अनुरोध नहीं। दूरी बढ़ाकर देखें।',
                  'या अंतरात विनंती नाही. अंतर वाढवून पहा.'
                )}
              </p>
            )}

            <div className="divide-y divide-slate-50">
              {liveRequests.map((req) => (
                <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">{req.sellerName}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'new'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {req.status === 'new'
                          ? L('New', 'नया', 'नवीन')
                          : L('Accepted', 'स्वीकृत', 'स्वीकारले')}
                      </span>
                      {req.pendingSync && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {L('Offline', 'ऑफलाइन', 'ऑफलाइन')}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.location}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Navigation className="w-3 h-3" />
                        {req.distanceKm} km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {req.material} • {req.weightKg} kg
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {req.preferredTime}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-1">
                      <div className="text-sm font-black text-emerald-800">
                        {formatINR(req.estimatedValue)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {L('est. value', 'अनुमान', 'अंदाज')}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewOnMap(req)}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-semibold text-slate-700"
                    >
                      {L('Route', 'रास्ता', 'मार्ग')}
                    </button>
                    {req.status === 'new' ? (
                      <button
                        onClick={() => onAcceptRequest(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs"
                      >
                        {L('Accept', 'स्वीकारें', 'स्वीकारा')}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {L('Yours', 'आपका', 'तुमचे')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk leads */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {L('Bulk E-Waste Sources', 'बड़े ई-वेस्ट स्रोत', 'मोठे ई-वेस्ट स्रोत')}
              </h2>
              <span className="text-[10px] text-slate-400">
                {L('Shops, offices & societies', 'दुकानें, दफ्तर, सोसाइटी', 'दुकाने, कार्यालये, सोसायट्या')}
              </span>
            </div>

            {leads.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                {L(
                  'No bulk sources in this radius.',
                  'इस दूरी में कोई बड़ा स्रोत नहीं।',
                  'या अंतरात मोठा स्रोत नाही.'
                )}
              </p>
            )}

            <div className="divide-y divide-slate-50">
              {leads.map((lead) => {
                const Icon = TYPE_ICON[lead.type];
                return (
                  <div
                    key={lead.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        {lead.name}
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {lead.rating}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.area}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Navigation className="w-3 h-3" />
                          {lead.distanceKm} km
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Package className="w-3 h-3" />≈ {lead.approxWeightKg} kg
                        </span>
                        <span className="text-slate-400">
                          {L('Last sold', 'पिछली बार', 'शेवटची विक्री')}: {lead.lastSoldAgo}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {lead.expectedMaterials.map((m) => (
                          <span
                            key={String(m)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onContactLead(lead.name, lead.phone)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {L('Contact', 'संपर्क करें', 'संपर्क करा')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
