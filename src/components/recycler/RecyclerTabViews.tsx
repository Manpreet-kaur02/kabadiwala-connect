import React, { useMemo, useState } from 'react';
import {
  Truck,
  Store,
  Layers,
  FileText,
  Users,
  TrendingUp,
  Star,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  Eye,
  ArrowUpRight,
  AlertTriangle,
  Recycle,
  QrCode,
} from 'lucide-react';
import { TransactionRecord, Language, InventoryItem } from '../../types';
import {
  INITIAL_COLLECTORS,
  INITIAL_RECYCLERS,
  INITIAL_COLLECTOR_INVENTORY,
} from '../../data/mockData';
import { BarDistributionChart, LineTrendChart } from '../common/SimpleCharts';
import { makeL, formatINR } from '../../utils/i18n';
import { QRScannerModal } from './QRScannerModal';

/* ------------------------------------------------------------------ */
/* Shared page shell                                                   */
/* ------------------------------------------------------------------ */
const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ElementType;
}> = ({ title, subtitle, icon: Icon }) => (
  <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg">
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-400/30 mb-3">
      <Icon className="w-3.5 h-3.5" />
      <span>{INITIAL_RECYCLERS[0].name}</span>
    </div>
    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h1>
    <p className="mt-1.5 text-sm text-slate-300 max-w-2xl leading-relaxed">{subtitle}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* 1. Incoming Material                                                */
/* ------------------------------------------------------------------ */
export const RecyclerIncomingView: React.FC<{
  language: Language;
  transactions: TransactionRecord[];
  onViewTraceability: (tx: TransactionRecord) => void;
}> = ({ language, transactions, onViewTraceability }) => {
  const L = makeL(language);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const inbound = transactions.filter(
    (t) => t.status === 'In Transit' || t.status === 'Collected' || t.status === 'Processing'
  );
  const list = inbound.length > 0 ? inbound : transactions;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Truck}
        title={L('Incoming Material', 'आने वाली सामग्री', 'येणारे साहित्य')}
        subtitle={L(
          'Lots dispatched by collectors that have not yet been weighed in at the facility gate.',
          'कलेक्टर द्वारा भेजे गए लॉट जिनकी तौल अभी फैसिलिटी पर नहीं हुई है।',
          'कलेक्टरने पाठवलेले लॉट ज्यांचे वजन अद्याप सुविधेत झालेले नाही.'
        )}
      />

      <button
        onClick={() => setIsScannerOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
      >
        <QrCode className="w-4 h-4" />
        {L('Scan Gate Handover QR', 'गेट हैंडओवर QR स्कैन करें', 'गेट हँडओव्हर QR स्कॅन करा')}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {list.length === 0 && (
          <p className="p-8 text-center text-xs text-slate-400">
            {L('No inbound lots right now.', 'अभी कोई लॉट नहीं आ रहा।', 'सध्या कोणताही लॉट येत नाही.')}
          </p>
        )}
        {list.map((tx) => (
          <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="font-mono">{tx.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {tx.traceabilityStage}
                </span>
                {tx.anomalyStatus === 'suspicious' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {L('Flagged', 'संदिग्ध', 'संशयित')}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {tx.material} • {tx.weightKg} kg
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {tx.collectorName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tx.pickupLocation}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tx.date}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-sm font-black text-emerald-800">
                  {formatINR(tx.finalPrice)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {L('settlement', 'भुगतान', 'पेमेंट')}
                </div>
              </div>
              <button
                onClick={() => onViewTraceability(tx)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                {L('Audit trail', 'ऑडिट देखें', 'ऑडिट पहा')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        transactions={transactions}
        language={language}
        onMatched={(tx) => onViewTraceability(tx)}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Purchase Requests (collector lot offers)                         */
/* ------------------------------------------------------------------ */
interface LotOffer {
  id: string;
  collectorName: string;
  material: string;
  weightKg: number;
  askingRate: number;
  ourRate: number;
  distanceKm: number;
  receivedAgo: string;
}

const LOT_OFFERS: LotOffer[] = [
  {
    id: 'OFF-2026-311',
    collectorName: 'Ravi Scrap Collection',
    material: 'PCB',
    weightKg: 18.5,
    askingRate: 352,
    ourRate: 340,
    distanceKm: 6.2,
    receivedAgo: '25 mins ago',
  },
  {
    id: 'OFF-2026-310',
    collectorName: 'Gurpreet Metal & E-Scrap',
    material: 'Copper Cable',
    weightKg: 42.0,
    askingRate: 470,
    ourRate: 462,
    distanceKm: 9.1,
    receivedAgo: '1 hour ago',
  },
  {
    id: 'OFF-2026-308',
    collectorName: 'Sharma Ji Electronic Scrap',
    material: 'LCD Screen',
    weightKg: 24.0,
    askingRate: 145,
    ourRate: 132,
    distanceKm: 12.4,
    receivedAgo: '3 hours ago',
  },
];

export const RecyclerPurchaseRequestsView: React.FC<{
  language: Language;
  onAction: (message: string) => void;
}> = ({ language, onAction }) => {
  const L = makeL(language);
  const [handled, setHandled] = useState<Record<string, 'accepted' | 'countered' | 'declined'>>({});

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Store}
        title={L('Purchase Requests', 'खरीद अनुरोध', 'खरेदी विनंत्या')}
        subtitle={L(
          'Aggregated lots offered by verified collectors. Accept, counter-quote or decline — every decision is written to the transaction dataset.',
          'सत्यापित कलेक्टर द्वारा भेजे गए लॉट। स्वीकारें, दूसरा भाव दें या मना करें — हर फैसला डेटासेट में दर्ज होता है।',
          'पडताळलेल्या कलेक्टरनी दिलेले लॉट. स्वीकारा, दुसरा भाव द्या किंवा नाकारा — प्रत्येक निर्णय डेटासेटमध्ये नोंदवला जातो.'
        )}
      />

      <div className="grid grid-cols-1 gap-4">
        {LOT_OFFERS.map((offer) => {
          const state = handled[offer.id];
          const total = offer.weightKg * offer.ourRate;
          const gap = offer.askingRate - offer.ourRate;
          return (
            <div
              key={offer.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-slate-700">{offer.id}</span>
                    <span className="text-slate-400">•</span>
                    {offer.collectorName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {offer.material} • {offer.weightKg} kg
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {offer.distanceKm} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {offer.receivedAgo}
                    </span>
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-3 max-w-md">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        {L('Asking', 'मांगा भाव', 'मागितलेला दर')}
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        ₹{offer.askingRate}/kg
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                      <div className="text-[9px] uppercase font-bold text-emerald-600">
                        {L('Our rate', 'हमारा भाव', 'आमचा दर')}
                      </div>
                      <div className="text-sm font-black text-emerald-800">₹{offer.ourRate}/kg</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        {L('Lot value', 'कुल मूल्य', 'एकूण मूल्य')}
                      </div>
                      <div className="text-sm font-black text-slate-900">{formatINR(total)}</div>
                    </div>
                  </div>

                  {gap > 0 && (
                    <p className="text-[11px] text-amber-700 mt-2 inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {L(
                        `Collector is asking ₹${gap}/kg above our board rate.`,
                        `कलेक्टर हमारे भाव से ₹${gap}/kg ज्यादा मांग रहा है।`,
                        `कलेक्टर आमच्या दरापेक्षा ₹${gap}/kg जास्त मागत आहे.`
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {state ? (
                    <span
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 border ${
                        state === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : state === 'countered'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {state === 'accepted'
                        ? L('Accepted', 'स्वीकृत', 'स्वीकारले')
                        : state === 'countered'
                        ? L('Counter sent', 'भाव भेजा', 'दर पाठवला')
                        : L('Declined', 'अस्वीकृत', 'नाकारले')}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setHandled((h) => ({ ...h, [offer.id]: 'accepted' }));
                          onAction(
                            `Lot ${offer.id} accepted at ₹${offer.ourRate}/kg — pickup scheduled.`
                          );
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-2xs"
                      >
                        {L('Accept lot', 'लॉट स्वीकारें', 'लॉट स्वीकारा')}
                      </button>
                      <button
                        onClick={() => {
                          setHandled((h) => ({ ...h, [offer.id]: 'countered' }));
                          onAction(`Counter-quote of ₹${offer.ourRate}/kg sent for ${offer.id}.`);
                        }}
                        className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-[11px] font-bold"
                      >
                        {L('Counter quote', 'दूसरा भाव दें', 'दुसरा दर द्या')}
                      </button>
                      <button
                        onClick={() => {
                          setHandled((h) => ({ ...h, [offer.id]: 'declined' }));
                          onAction(`Lot ${offer.id} declined.`);
                        }}
                        className="px-3 py-2 text-slate-500 hover:text-slate-800 rounded-xl text-[11px] font-semibold"
                      >
                        {L('Decline', 'मना करें', 'नाकारा')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Facility Inventory                                               */
/* ------------------------------------------------------------------ */
export const RecyclerInventoryView: React.FC<{
  language: Language;
  transactions: TransactionRecord[];
}> = ({ language, transactions }) => {
  const L = makeL(language);

  /** Facility stock = material received through the platform, grouped by category */
  const stock = useMemo(() => {
    const map = new Map<string, { weight: number; value: number; lots: number }>();
    transactions.forEach((t) => {
      const key = String(t.material);
      const prev = map.get(key) || { weight: 0, value: 0, lots: 0 };
      map.set(key, {
        weight: prev.weight + t.weightKg,
        value: prev.value + t.finalPrice,
        lots: prev.lots + 1,
      });
    });
    // top up with seeded collector inventory so an empty demo still renders
    if (map.size === 0) {
      INITIAL_COLLECTOR_INVENTORY.forEach((i: InventoryItem) => {
        map.set(String(i.material), {
          weight: i.weightKg,
          value: i.weightKg * i.estimatedRatePerKg,
          lots: 1,
        });
      });
    }
    return Array.from(map.entries())
      .map(([material, v]) => ({ material, ...v }))
      .sort((a, b) => b.weight - a.weight);
  }, [transactions]);

  const totalWeight = stock.reduce((s, i) => s + i.weight, 0);
  const totalValue = stock.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Layers}
        title={L('Facility Inventory', 'फैसिलिटी इन्वेंटरी', 'सुविधा इन्व्हेंटरी')}
        subtitle={L(
          'Material currently held at the plant, grouped by category and awaiting processing.',
          'प्लांट में मौजूद सामग्री, श्रेणी के अनुसार, प्रोसेसिंग की प्रतीक्षा में।',
          'प्लांटमध्ये असलेले साहित्य, श्रेणीनुसार, प्रक्रियेच्या प्रतीक्षेत.'
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Total Stock', 'कुल स्टॉक', 'एकूण स्टॉक')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalWeight.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Acquisition Cost', 'खरीद लागत', 'खरेदी खर्च')}
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{formatINR(totalValue)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Categories', 'श्रेणियां', 'श्रेणी')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stock.length}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
          {L('Stock by Material', 'सामग्री के अनुसार स्टॉक', 'साहित्यानुसार स्टॉक')}
        </h2>
        <BarDistributionChart
          items={stock.map((s) => ({
            label: s.material,
            value: Math.round(s.weight),
            suffix: 'kg',
          }))}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="p-3">{L('Material', 'सामग्री', 'साहित्य')}</th>
              <th className="p-3">{L('Lots', 'लॉट', 'लॉट')}</th>
              <th className="p-3">{L('Weight', 'वजन', 'वजन')}</th>
              <th className="p-3">{L('Cost', 'लागत', 'खर्च')}</th>
              <th className="p-3">{L('Avg Rate', 'औसत भाव', 'सरासरी दर')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stock.map((s) => (
              <tr key={s.material} className="hover:bg-slate-50/70">
                <td className="p-3 font-semibold text-slate-900">{s.material}</td>
                <td className="p-3 text-slate-700">{s.lots}</td>
                <td className="p-3 font-bold text-slate-900">{s.weight.toFixed(1)} kg</td>
                <td className="p-3 font-bold text-emerald-800">{formatINR(s.value)}</td>
                <td className="p-3 text-slate-700">
                  ₹{Math.round(s.value / (s.weight || 1))}/kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Transactions ledger                                              */
/* ------------------------------------------------------------------ */
export const RecyclerTransactionsView: React.FC<{
  language: Language;
  transactions: TransactionRecord[];
  onViewTraceability: (tx: TransactionRecord) => void;
}> = ({ language, transactions, onViewTraceability }) => {
  const L = makeL(language);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered =
    statusFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.status === statusFilter);

  const totalSettled = transactions.reduce((s, t) => s + t.finalPrice, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileText}
        title={L('Transaction Ledger', 'लेन-देन बही', 'व्यवहार नोंदवही')}
        subtitle={L(
          'Every settled purchase with its handover reference, forming the traceability record required under the E-Waste Rules.',
          'हर भुगतान का रिकॉर्ड और हैंडओवर संदर्भ — ई-वेस्ट नियमों के अनुसार ट्रेसेबिलिटी।',
          'प्रत्येक पेमेंटची नोंद व हस्तांतरण संदर्भ — ई-वेस्ट नियमांनुसार ट्रेसेबिलिटी.'
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'Completed', 'Processing', 'In Transit', 'Collected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? L('All', 'सभी', 'सर्व') : s}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-emerald-800">
          {L('Total settled', 'कुल भुगतान', 'एकूण पेमेंट')}: {formatINR(totalSettled)}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="p-3">{L('Batch', 'बैच', 'बॅच')}</th>
              <th className="p-3">{L('Material', 'सामग्री', 'साहित्य')}</th>
              <th className="p-3">{L('Collector', 'कलेक्टर', 'कलेक्टर')}</th>
              <th className="p-3">{L('Weight', 'वजन', 'वजन')}</th>
              <th className="p-3">{L('Quoted', 'भाव', 'दर')}</th>
              <th className="p-3">{L('Final', 'अंतिम', 'अंतिम')}</th>
              <th className="p-3">{L('Status', 'स्थिति', 'स्थिती')}</th>
              <th className="p-3 text-right">{L('Trace', 'ट्रेस', 'ट्रेस')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/70">
                <td className="p-3 font-mono font-bold text-slate-800">
                  <div>{tx.id}</div>
                  <span className="text-[10px] text-slate-400 font-sans">{tx.date}</span>
                </td>
                <td className="p-3 font-semibold text-slate-900">{tx.material}</td>
                <td className="p-3 text-slate-700">{tx.collectorName}</td>
                <td className="p-3 font-bold text-slate-900">{tx.weightKg} kg</td>
                <td className="p-3 text-slate-600">{formatINR(tx.quotedPrice)}</td>
                <td className="p-3 font-bold text-emerald-800">{formatINR(tx.finalPrice)}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onViewTraceability(tx)}
                    className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700"
                  >
                    {L('View', 'देखें', 'पहा')}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  {L('No transactions in this filter.', 'इस फिल्टर में कुछ नहीं।', 'या फिल्टरमध्ये काही नाही.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Collector network                                                */
/* ------------------------------------------------------------------ */
export const RecyclerCollectorsView: React.FC<{
  language: Language;
  transactions: TransactionRecord[];
  onContact: (name: string, phone: string) => void;
}> = ({ language, transactions, onContact }) => {
  const L = makeL(language);

  const supplyByCollector = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      map.set(t.collectorName, (map.get(t.collectorName) || 0) + t.weightKg);
    });
    return map;
  }, [transactions]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title={L('Collector Network', 'संबद्ध कबाड़ी', 'संलग्न कबाडी')}
        subtitle={L(
          'Verified informal collectors supplying this facility, with the volume each has channelled into the formal chain.',
          'इस फैसिलिटी को माल देने वाले सत्यापित कबाड़ी और उन्होंने औपचारिक चेन में कितना माल भेजा।',
          'या सुविधेला माल देणारे पडताळलेले कबाडी आणि त्यांनी औपचारिक साखळीत किती माल पाठवला.'
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INITIAL_COLLECTORS.map((c) => {
          const supplied = supplyByCollector.get(c.name) || 0;
          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {c.serviceArea}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {c.rating}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    {L('Supplied', 'दिया गया', 'दिलेले')}
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {supplied.toFixed(1)} kg
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    {L('Lifetime', 'कुल', 'एकूण')}
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {c.completedCollections}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    {L('Distance', 'दूरी', 'अंतर')}
                  </div>
                  <div className="text-sm font-black text-slate-900">{c.distanceKm} km</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {c.materialsAccepted.slice(0, 4).map((m) => (
                  <span
                    key={String(m)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onContact(c.name, c.phone)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {L('Contact collector', 'कलेक्टर से संपर्क', 'कलेक्टरशी संपर्क')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Analytics                                                        */
/* ------------------------------------------------------------------ */
export const RecyclerAnalyticsView: React.FC<{
  language: Language;
  transactions: TransactionRecord[];
}> = ({ language, transactions }) => {
  const L = makeL(language);

  const byMaterial = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) =>
      map.set(String(t.material), (map.get(String(t.material)) || 0) + t.weightKg)
    );
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Math.round(value), suffix: 'kg' }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const intakeTrend = useMemo(
    () => [
      { day: 'Apr', rate: 286 },
      { day: 'May', rate: 312 },
      { day: 'Jun', rate: 345 },
      { day: 'Jul', rate: 398 },
      { day: 'Aug', rate: 421 },
      { day: 'Sep', rate: 428 },
    ],
    []
  );

  const totalWeight = transactions.reduce((s, t) => s + t.weightKg, 0);
  const totalSpend = transactions.reduce((s, t) => s + t.finalPrice, 0);
  const flagged = transactions.filter((t) => t.anomalyStatus === 'suspicious').length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={TrendingUp}
        title={L('Analytics', 'एनालिटिक्स', 'विश्लेषण')}
        subtitle={L(
          'Intake trends, material mix and procurement cost, generated directly from platform transaction data.',
          'प्लेटफॉर्म के लेन-देन डेटा से बने रुझान, सामग्री मिश्रण और खरीद लागत।',
          'प्लॅटफॉर्मच्या व्यवहार डेटावरून तयार झालेले कल, साहित्य मिश्रण व खरेदी खर्च.'
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Total Intake', 'कुल आवक', 'एकूण आवक')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalWeight.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Procurement Spend', 'खरीद खर्च', 'खरेदी खर्च')}
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{formatINR(totalSpend)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Avg Rate', 'औसत भाव', 'सरासरी दर')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{Math.round(totalSpend / (totalWeight || 1))}/kg
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Flagged Lots', 'संदिग्ध लॉट', 'संशयित लॉट')}
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">{flagged}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            {L('Monthly Intake (kg)', 'मासिक आवक (kg)', 'मासिक आवक (kg)')}
          </h2>
          <LineTrendChart data={intakeTrend} unit="" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-600" />
            {L('Material Mix', 'सामग्री मिश्रण', 'साहित्य मिश्रण')}
          </h2>
          {byMaterial.length > 0 ? (
            <BarDistributionChart items={byMaterial} />
          ) : (
            <p className="text-xs text-slate-400">
              {L('Not enough data yet.', 'अभी पर्याप्त डेटा नहीं।', 'अद्याप पुरेसा डेटा नाही.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
