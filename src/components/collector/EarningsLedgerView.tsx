import React, { useMemo } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wallet,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { PickupRequest, TransactionRecord, Language } from '../../types';
import { BarDistributionChart, LineTrendChart } from '../common/SimpleCharts';
import { makeL, formatINR } from '../../utils/i18n';

interface EarningsLedgerViewProps {
  language: Language;
  requests: PickupRequest[];
  transactions: TransactionRecord[];
}

/**
 * The Earnings Ledger from the problem statement: "an easy-to-understand
 * earnings ledger showing transactions, payments, and pending dues." This is
 * a money-first view — separate from the Transactions page, which is a
 * detailed audit trail of every lot's traceability.
 */
export const EarningsLedgerView: React.FC<EarningsLedgerViewProps> = ({
  language,
  requests,
  transactions,
}) => {
  const L = makeL(language);

  const paidTotal = transactions.reduce((s, t) => s + t.finalPrice, 0);
  const pendingRequests = requests.filter(
    (r) => r.status === 'accepted' || r.status === 'scheduled'
  );
  const pendingDues = pendingRequests.reduce((s, r) => s + r.estimatedValue, 0);

  const today = new Date();
  const thisMonthLabel = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const byMaterial = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => map.set(String(t.material), (map.get(String(t.material)) || 0) + t.finalPrice));
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Simple last-6-period earnings trend built from settled transactions
  const trend = useMemo(() => {
    const sorted = [...transactions].reverse();
    let running = 0;
    const points = sorted.slice(-6).map((t, i) => {
      running += t.finalPrice;
      return { day: t.date.split(' ').slice(0, 2).join(' '), rate: running };
    });
    return points.length > 1 ? points : [{ day: 'Start', rate: 0 }, ...points];
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-amber-50 text-[11px] font-semibold border border-white/20 mb-3">
          <Wallet className="w-3.5 h-3.5" />
          <span>{thisMonthLabel}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {L('Earnings Ledger', 'कुल कमाई का ब्यौरा', 'एकूण कमाईचा तपशील')}
        </h1>
        <p className="mt-2 text-sm text-amber-50/90 max-w-2xl leading-relaxed">
          {L(
            'A simple record of money already paid and money still owed to you — so you always know where you stand.',
            'आपको मिल चुके और बाकी पैसों का आसान हिसाब — ताकि आपको हमेशा पता रहे।',
            'तुम्हाला मिळालेल्या व बाकी असलेल्या पैशांचा सोपा हिशोब — जेणेकरून तुम्हाला नेहमी माहीत असेल.'
          )}
        </p>
      </div>

      {/* Big money cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('Total Paid Out', 'कुल भुगतान', 'एकूण पेमेंट')}
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-800">{formatINR(paidTotal)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {transactions.length} {L('settled sales', 'पूरे सौदे', 'पूर्ण सौदे')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('Pending Dues', 'बाकी भुगतान', 'बाकी पेमेंट')}
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700">{formatINR(pendingDues)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingRequests.length} {L('pickups awaiting settlement', 'पिकअप बाकी', 'पिकअप बाकी')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <IndianRupee className="w-4 h-4 text-slate-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {L('Avg. Per Lot', 'औसत प्रति लॉट', 'सरासरी प्रति लॉट')}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatINR(transactions.length ? paidTotal / transactions.length : 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {L('across all materials', 'सभी सामग्री मिलाकर', 'सर्व साहित्य मिळून')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cumulative earnings trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            {L('Cumulative Earnings', 'संचित कमाई', 'संचित कमाई')}
          </h2>
          {trend.length > 1 ? (
            <LineTrendChart data={trend} unit="₹" />
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">
              {L('Complete a sale to see your trend.', 'बिक्री पूरी करें रुझान देखने के लिए।', 'कल दिसण्यासाठी विक्री पूर्ण करा.')}
            </p>
          )}
        </div>

        {/* Earnings by material */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {L('Earnings by Material', 'सामग्री अनुसार कमाई', 'साहित्यानुसार कमाई')}
          </h2>
          {byMaterial.length > 0 ? (
            <BarDistributionChart items={byMaterial.map((m) => ({ ...m, suffix: '₹' }))} />
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">
              {L('No settled sales yet.', 'अभी कोई बिक्री नहीं।', 'अद्याप विक्री नाही.')}
            </p>
          )}
        </div>
      </div>

      {/* Pending dues detail */}
      {pendingRequests.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
            {L('Pending Settlements', 'बाकी भुगतान का विवरण', 'बाकी पेमेंटचा तपशील')}
          </h2>
          <div className="divide-y divide-slate-50">
            {pendingRequests.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{r.sellerName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {r.material} • {r.weightKg} kg • {r.preferredDate}
                  </p>
                </div>
                <span className="font-black text-amber-700">{formatINR(r.estimatedValue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
