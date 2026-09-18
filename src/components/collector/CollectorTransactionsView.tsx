import React, { useState } from 'react';
import { FileText, Eye, Filter, AlertTriangle } from 'lucide-react';
import { TransactionRecord, Language } from '../../types';
import { makeL, formatINR } from '../../utils/i18n';

interface CollectorTransactionsViewProps {
  language: Language;
  transactions: TransactionRecord[];
  onViewTraceability: (tx: TransactionRecord) => void;
}

/**
 * A detailed, audit-style list of every lot the collector has dispatched —
 * the traceability record. This complements (not duplicates) the Earnings
 * Ledger, which is money-first rather than lot-by-lot detail.
 */
export const CollectorTransactionsView: React.FC<CollectorTransactionsViewProps> = ({
  language,
  transactions,
  onViewTraceability,
}) => {
  const L = makeL(language);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered =
    statusFilter === 'all' ? transactions : transactions.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {L('Transaction History', 'लेन-देन इतिहास', 'व्यवहार इतिहास')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {L(
            'Every lot you have dispatched, with full chain-of-custody traceability to the recycler.',
            'आपके भेजे गए हर लॉट का रिकॉर्ड, रीसाइक्लर तक पूरा ट्रेस।',
            'तुम्ही पाठवलेल्या प्रत्येक लॉटची नोंद, रीसायकलरपर्यंत पूर्ण ट्रेस.'
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="p-3">{L('Batch', 'बैच', 'बॅच')}</th>
              <th className="p-3">{L('Material', 'सामग्री', 'साहित्य')}</th>
              <th className="p-3">{L('Weight', 'वजन', 'वजन')}</th>
              <th className="p-3">{L('Recycler', 'रीसाइक्लर', 'रीसायकलर')}</th>
              <th className="p-3">{L('Final Price', 'अंतिम भाव', 'अंतिम दर')}</th>
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
                <td className="p-3 font-semibold text-slate-900">
                  {tx.material}
                  {tx.anomalyStatus === 'suspicious' && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-700">{tx.weightKg} kg</td>
                <td className="p-3 text-slate-600">{tx.recyclerName}</td>
                <td className="p-3 font-bold text-emerald-800">{formatINR(tx.finalPrice)}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onViewTraceability(tx)}
                    className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {L('View', 'देखें', 'पहा')}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
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
