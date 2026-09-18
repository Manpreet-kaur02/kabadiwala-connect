import React, { useState } from 'react';
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Search,
  Filter,
  FileText,
  Eye,
} from 'lucide-react';
import { PickupRequest, TransactionRecord, Language } from '../../types';

interface SellerRequestsViewProps {
  language: Language;
  requests?: PickupRequest[];
  transactions?: TransactionRecord[];
  onViewRequestDetails: (req: PickupRequest) => void;
  onViewTransactionTraceability: (tx: TransactionRecord) => void;
  onNewRequest: () => void;
  /** Which sub-view opens first. 'requests' = My Requests page, 'transactions' = Transactions page. */
  initialTab?: 'requests' | 'transactions';
  /** Hide the other sub-view's tab entirely so this becomes a focused, single-purpose page. */
  lockTab?: boolean;
}

export const SellerRequestsView: React.FC<SellerRequestsViewProps> = ({
  language,
  requests = [],
  transactions = [],
  onViewRequestDetails,
  onViewTransactionTraceability,
  onNewRequest,
  initialTab = 'requests',
  lockTab = false,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'transactions'>(initialTab);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Re-sync when the sidebar routes to a different sub-view of this shared component
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const safeRequests = requests || [];
  const safeTransactions = transactions || [];

  const filteredRequests = safeRequests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === 'requests'
              ? language === 'hi'
                ? 'मेरे पिकअप अनुरोध'
                : 'My Pickup Requests'
              : language === 'hi'
              ? 'लेन-देन एवं रसीदें'
              : 'Transactions & Receipts'}
          </h1>
          <p className="text-xs text-slate-500">
            {activeTab === 'requests'
              ? language === 'hi'
                ? 'अपने भेजे गए पिकअप अनुरोधों की स्थिति देखें — नया, स्वीकृत, शेड्यूल्ड।'
                : 'Track the live status of pickups you have booked — new, accepted, scheduled.'
              : language === 'hi'
              ? 'पूरे हो चुके सौदे और उनकी सत्यापित रसीद देखें।'
              : 'Review completed sales and their verified chain-of-custody receipt.'}
          </p>
        </div>

        <button
          onClick={onNewRequest}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'hi' ? 'नया पिकअप बुक करें' : 'Book New Pickup'}</span>
        </button>
      </div>

      {/* Tabs — hidden when this page is locked to a single sub-view from the sidebar */}
      {!lockTab && (
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Requests ({requests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Completed Transactions ({transactions.length})</span>
          </button>
        </div>
      )}

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex gap-2 text-xs">
            {['all', 'new', 'accepted', 'scheduled', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize border transition-all ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 font-semibold">{req.id}</span>
                      <span className="font-bold text-sm text-slate-900">{req.material}</span>
                      <span className="text-xs text-slate-500 font-medium">({req.weightKg} kg)</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{req.address}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span>Preferred Slot: <strong className="text-slate-700">{req.preferredDate} ({req.preferredTime})</strong></span>
                      <span>• Created: {req.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-base font-black text-slate-900">
                    ₹{req.estimatedValue.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'new'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : req.status === 'accepted'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : req.status === 'scheduled'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {req.status}
                    </span>
                    <button
                      onClick={() => onViewRequestDetails(req)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-md"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 text-xs text-slate-500">
                No pickup requests found under "{filterStatus}" status.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Settled Sales Audit Log
            </span>
            <span className="text-xs text-slate-500">Click row for full chain-of-custody trace</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="p-3">Tx ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Collector</th>
                  <th className="p-3">Recycler</th>
                  <th className="p-3 text-right">Final Price</th>
                  <th className="p-3 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onViewTransactionTraceability(tx)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-slate-800">{tx.id}</td>
                    <td className="p-3 text-slate-500">{tx.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{tx.material}</td>
                    <td className="p-3 text-slate-700">{tx.weightKg} kg</td>
                    <td className="p-3 text-slate-600">{tx.collectorName}</td>
                    <td className="p-3 text-slate-600">{tx.recyclerName}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      ₹{tx.finalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span>Trace</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
