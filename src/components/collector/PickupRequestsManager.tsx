import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Scale,
  Calendar,
  Filter,
  ArrowRight,
  AlertCircle,
  Check,
  ScanLine,
} from 'lucide-react';
import { PickupRequest, Language } from '../../types';

interface PickupRequestsManagerProps {
  language: Language;
  requests?: PickupRequest[];
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onScheduleRequest: (id: string) => void;
  onOpenWeighingModal: (req: PickupRequest) => void;
  onOpenScanForRequest?: (req: PickupRequest) => void;
  /** Which status bucket opens first. */
  initialFilter?: 'all' | 'new' | 'in_progress' | 'completed';
  /** Hide the other filter pills so this becomes a focused, single-purpose page. */
  lockFilter?: boolean;
  /** Overrides the default header copy — lets the same component read as two different pages. */
  headerTitle?: string;
  headerSubtitle?: string;
}

export const PickupRequestsManager: React.FC<PickupRequestsManagerProps> = ({
  language,
  requests = [],
  onAcceptRequest,
  onDeclineRequest,
  onScheduleRequest,
  onOpenWeighingModal,
  onOpenScanForRequest,
  initialFilter = 'all',
  lockFilter = false,
  headerTitle,
  headerSubtitle,
}) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>(initialFilter);
  const safeRequests = requests || [];

  React.useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const filtered = safeRequests.filter((r) => {
    if (filter === 'new') return r.status === 'new';
    if (filter === 'in_progress') return r.status === 'accepted' || r.status === 'scheduled';
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {headerTitle ||
              (language === 'hi' ? 'पिकअप अनुरोध प्रबंधन' : 'Pickup Requests Dispatch Center')}
          </h1>
          <p className="text-xs text-slate-500">
            {headerSubtitle ||
              'Accept seller bookings, navigate routes, and complete digital scale weigh-ins.'}
          </p>
        </div>

        {/* Filter Pills */}
        {!lockFilter && (
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({safeRequests.length})
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'new' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New ({safeRequests.filter((r) => r.status === 'new').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'in_progress' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In-Route ({safeRequests.filter((r) => r.status === 'accepted' || r.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({safeRequests.filter((r) => r.status === 'completed').length})
            </button>
          </div>
        )}
      </div>

      {/* Requests Cards List */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Request Meta */}
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  req.status === 'new'
                    ? 'bg-blue-100 text-blue-700'
                    : req.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                <Truck className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-semibold">{req.id}</span>
                  <h3 className="font-bold text-sm text-slate-900">{req.material}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    {req.weightKg} kg
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{req.sellerName}</span>
                  <a
                    href={`tel:${req.sellerPhone}`}
                    className="flex items-center gap-1 text-teal-700 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{req.sellerPhone}</span>
                  </a>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{req.address} ({req.distanceKm} km)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Slot: {req.preferredDate} ({req.preferredTime})</span>
                  </span>
                  {req.specialInstructions && (
                    <span className="italic text-slate-400">"{req.specialInstructions}"</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Payout</span>
                <span className="text-base font-black text-slate-900">
                  ₹{req.estimatedValue.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {req.status === 'new' && (
                  <>
                    <button
                      onClick={() => onDeclineRequest(req.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Decline"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </button>
                  </>
                )}

                {req.status === 'accepted' && (
                  <button
                    onClick={() => onScheduleRequest(req.id)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Confirm Scheduled</span>
                  </button>
                )}

                {(req.status === 'accepted' || req.status === 'scheduled') && (
                  <>
                    {onOpenScanForRequest && (
                      <button
                        onClick={() => onOpenScanForRequest(req)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center gap-1.5 transition-all"
                        title="AI Scan & Verify material"
                      >
                        <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI Scan</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenWeighingModal(req)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Weigh & Pay</span>
                    </button>
                  </>
                )}

                {req.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settled & In Stock</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 text-xs text-slate-500">
            No pickup requests currently in this filter view.
          </div>
        )}
      </div>
    </div>
  );
};
