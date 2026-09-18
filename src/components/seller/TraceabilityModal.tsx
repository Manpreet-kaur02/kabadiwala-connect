import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Truck,
  Home,
  Factory,
  ArrowRight,
  ExternalLink,
  Award,
  MapPin,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import { TransactionRecord, Language } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
  language: Language;
  onCaptureGeoTag?: (transactionId: string, lat: number, lng: number) => void;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  transaction,
  language,
  onCaptureGeoTag,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'done' | 'error'>('idle');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handoverId = transaction ? transaction.handoverId || `HO-${transaction.id}` : '';

  // Generate a real, scannable QR code encoding the handover record so a recycler
  // or auditor can verify the transaction without needing network access to this app.
  useEffect(() => {
    if (!transaction) {
      setQrDataUrl(null);
      return;
    }
    const payload = JSON.stringify({
      handoverId,
      lotId: transaction.id,
      batchId: transaction.batchId,
      material: transaction.material,
      weightKg: transaction.weightKg,
      finalPrice: transaction.finalPrice,
      collector: transaction.collectorName,
      recycler: transaction.recyclerName,
      geo:
        transaction.geoLat && transaction.geoLng
          ? { lat: transaction.geoLat, lng: transaction.geoLng }
          : undefined,
    });
    let cancelled = false;
    QRCode.toDataURL(payload, { margin: 1, width: 240, errorCorrectionLevel: 'H' })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [transaction, handoverId]);

  useEffect(() => {
    // Reset geo-capture UI state whenever a different transaction is opened
    setGeoStatus('idle');
    setGeoError(null);
  }, [transaction?.id]);

  if (!isOpen || !transaction) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError(isHi ? 'यह डिवाइस GPS सपोर्ट नहीं करता' : isMr ? 'हे डिव्हाइस GPS सपोर्ट करत नाही' : 'GPS is not supported on this device');
      return;
    }
    setGeoStatus('locating');
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoStatus('done');
        onCaptureGeoTag?.(transaction.id, latitude, longitude);
      },
      (err) => {
        setGeoStatus('error');
        setGeoError(err.message || (isHi ? 'GPS लोकेशन नहीं मिल सका' : isMr ? 'GPS लोकेशन मिळाले नाही' : 'Could not fetch GPS location'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stages = [
    { title: 'Seller Handover', sub: transaction.pickupLocation, date: '06 Sep 2026, 10:45 AM', completed: true, icon: Home },
    { title: 'Collector Verification', sub: transaction.collectorName, date: '06 Sep 2026, 11:20 AM', completed: true, icon: Truck },
    {
      title: 'Authorized Recycler Intake',
      sub: transaction.recyclerName,
      date: '07 Sep 2026, 03:15 PM',
      completed: transaction.traceabilityStage !== 'Seller' && transaction.traceabilityStage !== 'Collector',
      icon: Building2,
    },
    {
      title: 'Dismantling & Processing',
      sub: 'Hydrometallurgical Precious Metal Extraction',
      date: '08 Sep 2026, 09:00 AM',
      completed: transaction.traceabilityStage === 'Under Processing' || transaction.traceabilityStage === 'Recycled',
      icon: Factory,
    },
    {
      title: 'Recycling Completed (Zero Landfill)',
      sub: 'Green Certificate CPCB-EW-VERIFIED',
      date: '08 Sep 2026, 02:30 PM',
      completed: transaction.traceabilityStage === 'Recycled',
      icon: Award,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 pr-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              EPR Verified Chain-of-Custody
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Transaction Traceability Audit
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              ID: {transaction.id} • Batch: {transaction.batchId || 'BATCH-001'}
            </p>
            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Handover: {handoverId}</p>
          </div>

          {/* Real, scannable QR Code encoding the handover record.
              Shown on every screen size (previously hidden below the "sm"
              breakpoint, which is exactly the phone-sized screens most
              collectors and recyclers actually use) and sized large enough
              on screen to actually be scanned by another phone's camera. */}
          <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-center shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1.5 rounded-lg border border-slate-300 flex items-center justify-center shadow-2xs overflow-hidden">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Handover verification QR code" className="w-full h-full object-contain" />
              ) : (
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              )}
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1">Scan for CPCB Audit</span>
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="mt-1.5 text-[9.5px] font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2"
            >
              {isHi ? 'बड़ा दिखाएं / प्रिंट करें' : isMr ? 'मोठे दाखवा / प्रिंट करा' : 'Enlarge / Print'}
            </button>
          </div>
        </div>

        {/* Anomaly Warning Banner if flagged */}
        {transaction.anomalyStatus === 'suspicious' && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">⚠ Unusual Transaction Flagged by AI Risk Monitoring</p>
              <p className="text-[11.5px] mt-0.5 text-rose-700">{transaction.anomalyReason}</p>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Material</span>
            <span className="font-bold text-slate-900">{transaction.material}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Certified Weight</span>
            <span className="font-bold text-slate-900">{transaction.weightKg} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Final Payout</span>
            <span className="font-bold text-emerald-700">₹{transaction.finalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
            <span className="font-semibold text-slate-800">{transaction.status}</span>
          </div>
        </div>

        {/* GPS Geo-tag Capture */}
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-900">
                {isHi ? 'हैंडओवर GPS स्थान' : isMr ? 'हँडओव्हर GPS स्थान' : 'Handover GPS Location'}
              </span>
            </div>
            <button
              onClick={handleCaptureGps}
              disabled={geoStatus === 'locating'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[11px] font-semibold transition-colors"
            >
              {geoStatus === 'locating' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              {isHi ? 'GPS कैप्चर करें' : isMr ? 'GPS कॅप्चर करा' : 'Capture GPS'}
            </button>
          </div>
          <div className="mt-2 text-[11px]">
            {transaction.geoLat && transaction.geoLng ? (
              <p className="text-emerald-700 font-mono">
                ✓ {transaction.geoLat.toFixed(5)}, {transaction.geoLng.toFixed(5)}
                {transaction.geoCapturedAt ? ` • ${transaction.geoCapturedAt}` : ''}
              </p>
            ) : (
              <p className="text-slate-400">
                {isHi
                  ? 'अभी तक कोई GPS स्थान कैप्चर नहीं हुआ — ऊपर बटन दबाएं'
                  : isMr
                  ? 'अद्याप कोणतेही GPS स्थान कॅप्चर केलेले नाही — वरील बटण दाबा'
                  : 'No GPS location captured yet — tap the button above'}
              </p>
            )}
            {geoStatus === 'error' && geoError && <p className="text-rose-600 mt-1">{geoError}</p>}
          </div>
        </div>

        {/* Traceability Timeline */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Custody Verification Steps
          </h3>

          <div className="space-y-4 relative pl-6 border-l-2 border-emerald-500 ml-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[33px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      stage.completed ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-300'
                    }`}
                  >
                    {stage.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <p className={`text-xs font-bold ${stage.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.title}
                    </p>
                    <span className="text-[10px] text-slate-400">{stage.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{stage.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stakeholders Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Collector Handled</span>
            <p className="font-bold text-slate-800 mt-0.5">{transaction.collectorName}</p>
            <p className="text-[10px] text-slate-500">Identity & Weighing Scales Verified</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Recycler</span>
            <p className="font-bold text-slate-800 mt-0.5">{transaction.recyclerName}</p>
            <p className="text-[10px] text-slate-500">Government CPCB Authorized Facility</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={() => setIsReceiptOpen(true)}
            className="px-5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
          >
            {isHi ? 'रसीद प्रिंट / डाउनलोड करें' : isMr ? 'पावती प्रिंट / डाउनलोड करा' : 'Print / Download Receipt'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Close Audit Trail
          </button>
        </div>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={transaction}
        language={language}
      />
    </div>
  );
};
