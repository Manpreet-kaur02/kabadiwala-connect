import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Recycle } from 'lucide-react';
import { TransactionRecord, Language } from '../../types';
import { makeL, formatINR } from '../../utils/i18n';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
  language: Language;
  /** % of the recycler's payout kept by the platform. Never charged to the collector. */
  platformFeePercent?: number;
}

/**
 * A free, print-and-download-ready handover receipt for every transaction.
 *
 * Design choices that matter for this platform:
 * - It is generated for EVERY transaction, at no cost to the collector — this
 *   is a core trust feature, not a paid add-on.
 * - "Print" uses the browser's native print dialog (Save as PDF works there
 *   on every entry-level Android phone / desktop, no extra library needed).
 * - "Download" saves a small, self-contained .html file (with the QR code
 *   embedded as an image) that opens correctly even with no internet and no
 *   app installed — good for WhatsApp-sharing with a recycler or auditor.
 * - The platform's revenue (a small % fee) is shown transparently as coming
 *   out of the RECYCLER's side, never subtracted from the collector's payout.
 */
export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  language,
  platformFeePercent = 2,
}) => {
  const L = makeL(language);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handoverId = transaction ? transaction.handoverId || `HO-${transaction.id}` : '';
  const platformFeeINR = transaction ? Math.round((transaction.finalPrice * platformFeePercent) / 100) : 0;

  useEffect(() => {
    if (!transaction) {
      setQrDataUrl(null);
      return;
    }
    const payload = JSON.stringify({
      handoverId,
      lotId: transaction.id,
      material: transaction.material,
      weightKg: transaction.weightKg,
      finalPrice: transaction.finalPrice,
      collector: transaction.collectorName,
      recycler: transaction.recyclerName,
      date: transaction.date,
    });
    let cancelled = false;
    // Higher error-correction ('H') and a generous quiet zone so the code
    // still scans reliably when photographed off a small phone screen,
    // printed on cheap paper, or slightly damaged/creased.
    QRCode.toDataURL(payload, { margin: 2, width: 320, errorCorrectionLevel: 'H' })
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

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8" />
<title>Receipt ${handoverId}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 480px; margin: 0 auto; }
  h1 { font-size: 18px; margin-bottom: 2px; }
  .muted { color: #64748b; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  td { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
  td.label { color: #64748b; }
  td.value { text-align: right; font-weight: 700; }
  .qr { text-align: center; margin-top: 20px; }
  .qr img { width: 180px; height: 180px; }
  .fee { font-size: 10.5px; color: #94a3b8; margin-top: 14px; text-align: center; }
  .total { font-size: 16px; font-weight: 800; color: #047857; }
</style>
</head>
<body>
  <h1>Kabadiwala Connect \u2014 ${L('Handover Receipt', 'हैंडओवर रसीद', 'हँडओव्हर पावती')}</h1>
  <p class="muted">${handoverId} • Lot ${transaction.id} • ${transaction.date}</p>
  <table>
    <tr><td class="label">${L('Material', 'सामग्री', 'साहित्य')}</td><td class="value">${transaction.material}</td></tr>
    <tr><td class="label">${L('Weight', 'वजन', 'वजन')}</td><td class="value">${transaction.weightKg} kg</td></tr>
    <tr><td class="label">${L('Collector', 'कलेक्टर', 'कलेक्टर')}</td><td class="value">${transaction.collectorName}</td></tr>
    <tr><td class="label">${L('Recycler', 'रीसाइक्लर', 'रीसायकलर')}</td><td class="value">${transaction.recyclerName}</td></tr>
    <tr><td class="label">${L('Pickup Location', 'पिकअप स्थान', 'पिकअप ठिकाण')}</td><td class="value">${transaction.pickupLocation}</td></tr>
    <tr><td class="label">${L('Amount Paid to Collector', 'कलेक्टर को भुगतान', 'कलेक्टरला दिलेली रक्कम')}</td><td class="value total">${formatINR(transaction.finalPrice)}</td></tr>
  </table>
  <div class="qr">
    ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" />` : ''}
    <p class="muted">${L('Scan to verify this handover', 'इस हैंडओवर को सत्यापित करने के लिए स्कैन करें', 'हा हँडओव्हर पडताळण्यासाठी स्कॅन करा')}</p>
  </div>
  <p class="fee">${L(
    `This receipt is free for the collector. A ${platformFeePercent}% platform facilitation fee (≈ ${formatINR(platformFeeINR)}) is charged separately to the recycler, not deducted from the amount above.`,
    `यह रसीद कलेक्टर के लिए मुफ़्त है। ${platformFeePercent}% प्लेटफ़ॉर्म शुल्क (लगभग ${formatINR(platformFeeINR)}) अलग से रीसाइक्लर से लिया जाता है, ऊपर की राशि में से नहीं काटा जाता।`,
    `ही पावती कलेक्टरसाठी मोफत आहे. ${platformFeePercent}% प्लॅटफॉर्म शुल्क (अंदाजे ${formatINR(platformFeeINR)}) रीसायकलरकडून वेगळे आकारले जाते, वरील रकमेतून वजा केले जात नाही.`
  )}</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${handoverId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs print:bg-white print:p-0">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto print:shadow-none print:border-0 print:max-h-none print:rounded-none">
        <div className="p-6 print:hidden flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-extrabold text-slate-900">
              {L('Handover Receipt', 'हैंडओवर रसीद', 'हँडओव्हर पावती')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / visually-full receipt body */}
        <div ref={printRef} className="p-6 sm:p-8">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Kabadiwala Connect
            </p>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              {L('Handover Receipt', 'हैंडओवर रसीद', 'हँडओव्हर पावती')}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {handoverId} • Lot {transaction.id} • {transaction.date}
            </p>
          </div>

          {/* Big, always-visible QR — no longer hidden on small phone screens */}
          <div className="mt-5 flex flex-col items-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white p-2 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Handover verification QR code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                  {L('Generating...', 'बन रहा है...', 'तयार होत आहे...')}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[220px]">
              {L(
                'Recycler: scan this at intake to auto-fill the handover check',
                'रीसाइक्लर: इसे इंटेक पर स्कैन करें',
                'रीसायकलर: हे इनटेकवर स्कॅन करा'
              )}
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-100 text-xs">
            {[
              [L('Material', 'सामग्री', 'साहित्य'), transaction.material],
              [L('Weight', 'वजन', 'वजन'), `${transaction.weightKg} kg`],
              [L('Collector', 'कलेक्टर', 'कलेक्टर'), transaction.collectorName],
              [L('Recycler', 'रीसाइक्लर', 'रीसायकलर'), transaction.recyclerName],
              [L('Pickup Location', 'पिकअप स्थान', 'पिकअप ठिकाण'), transaction.pickupLocation],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2">
                <span className="text-slate-400 font-semibold">{label}</span>
                <span className="font-bold text-slate-900 text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">
                {L('Amount Paid to You', 'आपको भुगतान', 'तुम्हाला दिलेली रक्कम')}
              </span>
              <span className="font-black text-emerald-700 text-base">
                {formatINR(transaction.finalPrice)}
              </span>
            </div>
          </div>

          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-500 leading-relaxed">
            {L(
              `This receipt is 100% free for you. A small ${platformFeePercent}% platform fee (≈ ${formatINR(
                platformFeeINR
              )}) is charged to the recycler separately — it is never deducted from your payout above.`,
              `यह रसीद आपके लिए पूरी तरह मुफ़्त है। ${platformFeePercent}% का छोटा प्लेटफ़ॉर्म शुल्क (लगभग ${formatINR(
                platformFeeINR
              )}) अलग से रीसाइक्लर से लिया जाता है — यह आपके ऊपर दिए गए भुगतान में से कभी नहीं कटता।`,
              `ही पावती तुमच्यासाठी पूर्णपणे मोफत आहे. ${platformFeePercent}% छोटे प्लॅटफॉर्म शुल्क (अंदाजे ${formatINR(
                platformFeeINR
              )}) रीसायकलरकडून वेगळे आकारले जाते — ते तुमच्या वरील रकमेतून कधीही कापले जात नाही.`
            )}
          </div>
        </div>

        <div className="p-6 pt-0 print:hidden grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
          >
            <Printer className="w-4 h-4" />
            {L('Print / Save as PDF', 'प्रिंट / PDF सेव करें', 'प्रिंट / PDF सेव्ह करा')}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white"
          >
            <Download className="w-4 h-4" />
            {L('Download Receipt', 'रसीद डाउनलोड करें', 'पावती डाउनलोड करा')}
          </button>
        </div>
      </div>
    </div>
  );
};
