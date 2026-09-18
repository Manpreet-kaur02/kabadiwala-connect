import React from 'react';
import {
  ScanLine,
  Calculator,
  Search,
  Truck,
  ArrowRight,
  Sparkles,
  Package,
  Clock,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import { PickupRequest, TransactionRecord, Language } from '../../types';
import { makeL, formatINR } from '../../utils/i18n';

interface SellStartHubViewProps {
  language: Language;
  requests: PickupRequest[];
  transactions: TransactionRecord[];
  onOpenScanner: () => void;
  onOpenEstimator: () => void;
  onFindCollector: () => void;
  onRequestGenericPickup: () => void;
}

/**
 * "Sell E-Waste" is the seller's start-selling hub: three ways to begin
 * (scan, estimate, or go straight to a collector) plus a snapshot of what's
 * in flight. This is intentionally different from "Find Collector", which is
 * a pure browse/filter list of collectors.
 */
export const SellStartHubView: React.FC<SellStartHubViewProps> = ({
  language,
  requests,
  transactions,
  onOpenScanner,
  onOpenEstimator,
  onFindCollector,
  onRequestGenericPickup,
}) => {
  const L = makeL(language);

  const activeCount = requests.filter(
    (r) => r.status === 'new' || r.status === 'accepted' || r.status === 'scheduled'
  ).length;
  const completedCount = transactions.length;
  const totalEarned = transactions.reduce((s, t) => s + t.finalPrice, 0);

  const steps = [
    {
      id: 'scan',
      icon: ScanLine,
      title: L('Scan with camera', 'कैमरे से स्कैन करें', 'कॅमेऱ्याने स्कॅन करा'),
      desc: L(
        'Point your camera at the item — AI identifies the material and condition for you.',
        'सामान पर कैमरा रखें — एआई खुद सामग्री और हालत पहचान लेगा।',
        'सामानावर कॅमेरा धरा — एआय स्वतः साहित्य व स्थिती ओळखेल.'
      ),
      action: onOpenScanner,
      cta: L('Open Scanner', 'स्कैनर खोलें', 'स्कॅनर उघडा'),
      badge: 'AI',
    },
    {
      id: 'estimate',
      icon: Calculator,
      title: L('Enter details manually', 'खुद जानकारी भरें', 'स्वतः माहिती भरा'),
      desc: L(
        'Know the material and weight already? Get an instant fair-price range.',
        'सामग्री और वजन पता है? तुरंत उचित भाव पाएं।',
        'साहित्य व वजन माहीत आहे? लगेच योग्य भाव मिळवा.'
      ),
      action: onOpenEstimator,
      cta: L('Estimate Price', 'भाव देखें', 'भाव पहा'),
    },
    {
      id: 'collector',
      icon: Search,
      title: L('Go straight to a collector', 'सीधे कलेक्टर के पास जाएं', 'थेट कलेक्टरकडे जा'),
      desc: L(
        'Already know what you have? Skip ahead and book a verified collector directly.',
        'पहले से पता है? सीधे सत्यापित कलेक्टर बुक करें।',
        'आधीच माहीत आहे? थेट पडताळलेला कलेक्टर बुक करा.'
      ),
      action: onFindCollector,
      cta: L('Browse Collectors', 'कलेक्टर देखें', 'कलेक्टर पहा'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-50 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{L('Start Selling', 'बेचना शुरू करें', 'विकणे सुरू करा')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {L('Sell your e-waste in 3 steps', 'अपना ई-वेस्ट 3 आसान चरणों में बेचें', 'तुमचा ई-वेस्ट 3 सोप्या टप्प्यांत विका')}
          </h1>
          <p className="mt-2 text-sm text-emerald-50/90 leading-relaxed">
            {L(
              'Photograph or describe what you have, see a fair price instantly, and a verified collector picks it up from your doorstep.',
              'सामान की फोटो लें या बताएं, तुरंत उचित भाव देखें, और सत्यापित कलेक्टर आपके घर से उठा ले जाएगा।',
              'सामानाचा फोटो घ्या किंवा सांगा, लगेच योग्य भाव पहा, आणि पडताळलेला कलेक्टर घरातून घेऊन जाईल.'
            )}
          </p>

          <button
            onClick={onRequestGenericPickup}
            className="mt-5 px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2 hover:bg-emerald-50"
          >
            <Truck className="w-4 h-4" />
            <span>{L('Post a Pickup Request Now', 'अभी पिकअप अनुरोध भेजें', 'आता पिकअप विनंती पाठवा')}</span>
          </button>
        </div>
      </div>

      {/* 3-step cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {step.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {step.badge}
                    </span>
                  )}
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed flex-1">{step.desc}</p>
              <button
                onClick={step.action}
                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>{step.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Snapshot of what's already in flight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('In Progress', 'चल रहे', 'सुरू आहे')}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('requests awaiting pickup', 'पिकअप की प्रतीक्षा में', 'पिकअपची वाट पाहत आहे')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('Completed', 'पूरे हुए', 'पूर्ण')}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{completedCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('sales settled to date', 'अब तक बिक चुके', 'आतापर्यंत विकले')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <IndianRupee className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('Total Received', 'कुल प्राप्त', 'एकूण मिळाले')}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-800">{formatINR(totalEarned)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('across all sales', 'सभी बिक्री मिलाकर', 'सर्व विक्री मिळून')}
          </p>
        </div>
      </div>
    </div>
  );
};
