import React, { useEffect, useRef, useState } from 'react';
import { X, ScanLine, CameraOff, Search, CheckCircle2 } from 'lucide-react';
import { TransactionRecord, Language } from '../../types';
import { makeL } from '../../utils/i18n';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
  language: Language;
  /** Called with the matched transaction once a handover QR / ID is resolved. */
  onMatched: (tx: TransactionRecord) => void;
}

// Minimal typing for the Shape Detection API — not yet in lib.dom.d.ts.
type BarcodeDetectorResult = { rawValue: string }[];
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
  }
}

/**
 * Recycler-side intake scanner. Deliberately built with ZERO extra npm
 * dependencies: it uses the browser's built-in Shape Detection API
 * (`window.BarcodeDetector`), which ships in Chrome for Android — the exact
 * browser almost every entry-level Android phone already has — so it adds
 * no bundle size at all. On a browser that doesn't support it yet (e.g.
 * desktop Safari), we fall back to typing in the Handover ID printed under
 * the QR on the collector's receipt, so scanning is never a hard blocker.
 */
export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  transactions,
  language,
  onMatched,
}) => {
  const L = makeL(language);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [matched, setMatched] = useState<TransactionRecord | null>(null);
  const [manualId, setManualId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const findTransaction = (raw: string): TransactionRecord | null => {
    let handoverId: string | null = null;
    let lotId: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      handoverId = parsed.handoverId ?? null;
      lotId = parsed.lotId ?? null;
    } catch {
      // Not JSON — treat the raw scanned/typed text as a plain ID.
      handoverId = raw.trim();
      lotId = raw.trim();
    }
    return (
      transactions.find(
        (t) =>
          (handoverId && (t.handoverId === handoverId || `HO-${t.id}` === handoverId)) ||
          (lotId && t.id === lotId)
      ) || null
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    setMatched(null);
    setManualId('');
    setManualError(null);
    setCameraError(null);

    const hasDetector = typeof window !== 'undefined' && !!window.BarcodeDetector;
    setSupported(hasDetector);
    if (!hasDetector) return;

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });
        const scanLoop = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              const tx = findTransaction(results[0].rawValue);
              if (tx) {
                setMatched(tx);
                return; // stop the loop once we have a match
              }
            }
          } catch {
            // ignore transient detection errors and keep scanning
          }
          rafRef.current = requestAnimationFrame(scanLoop);
        };
        scanLoop();
      } catch (err) {
        if (!cancelled) {
          setCameraError(
            err instanceof Error
              ? err.message
              : L('Could not access the camera', 'कैमरा एक्सेस नहीं हुआ', 'कॅमेरा उपलब्ध झाला नाही')
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSearch = () => {
    if (!manualId.trim()) return;
    const tx = findTransaction(manualId.trim());
    if (tx) {
      setManualError(null);
      setMatched(tx);
    } else {
      setManualError(
        L(
          'No matching handover found for that ID. Please check and try again.',
          'इस ID के लिए कोई हैंडओवर नहीं मिला। कृपया दोबारा जांचें।',
          'या ID साठी कोणताही हँडओव्हर सापडला नाही. कृपया पुन्हा तपासा.'
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-extrabold text-slate-900">
            {L('Scan Handover QR', 'हैंडओवर QR स्कैन करें', 'हँडओव्हर QR स्कॅन करा')}
          </h2>
        </div>

        {matched ? (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-emerald-900 mt-2">
              {L('Handover Matched', 'हैंडओवर मिल गया', 'हँडओव्हर जुळला')}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              {matched.id} • {matched.material} • {matched.weightKg} kg • {matched.collectorName}
            </p>
            <button
              onClick={() => {
                onMatched(matched);
                onClose();
              }}
              className="mt-3 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              {L('Open Audit Trail', 'ऑडिट देखें', 'ऑडिट पहा')}
            </button>
          </div>
        ) : (
          <>
            {supported && !cameraError && (
              <div className="mt-4 rounded-2xl overflow-hidden bg-slate-900 aspect-square relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-6 border-2 border-emerald-400/80 rounded-2xl pointer-events-none" />
              </div>
            )}

            {(!supported || cameraError) && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
                <CameraOff className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                <p>
                  {cameraError ||
                    L(
                      'Live camera scanning isn\u2019t supported on this browser yet. Enter the Handover ID printed on the collector\u2019s receipt instead.',
                      'इस ब्राउज़र पर लाइव कैमरा स्कैन अभी सपोर्ट नहीं है। इसके बजाय रसीद पर छपी हैंडओवर ID डालें।',
                      'या ब्राउझरवर लाइव्ह कॅमेरा स्कॅन अद्याप सपोर्ट नाही. त्याऐवजी पावतीवरील हँडओव्हर ID टाका.'
                    )}
                </p>
              </div>
            )}

            {/* Manual fallback is always available, even while the camera is active,
                since some phones' cameras struggle with small/glare-y screens. */}
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-slate-500">
                {L('Or type the Handover ID', 'या हैंडओवर ID टाइप करें', 'किंवा हँडओव्हर ID टाइप करा')}
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="HO-2026-00421"
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  onClick={handleManualSearch}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {manualError && <p className="mt-1.5 text-[11px] text-rose-600">{manualError}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
