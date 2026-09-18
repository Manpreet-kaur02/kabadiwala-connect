import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Download,
  Filter,
  Eye,
  QrCode,
} from 'lucide-react';
import { TransactionRecord, Language } from '../../types';
import { INITIAL_RECYCLERS } from '../../data/mockData';
import { QRScannerModal } from './QRScannerModal';
import { RecyclerVerificationModal } from '../common/RecyclerVerificationModal';

interface RecyclerDashboardProps {
  language: Language;
  transactions?: TransactionRecord[];
  onViewTraceability: (tx: TransactionRecord) => void;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({
  language,
  transactions = [],
  onViewTraceability,
}) => {
  const recycler = INITIAL_RECYCLERS[0];
  const [issuedCertificateId, setIssuedCertificateId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const safeTransactions = transactions || [];

  const handleIssueCertificate = (txId: string) => {
    setIssuedCertificateId(txId);
    setTimeout(() => {
      setIssuedCertificateId(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={() => setIsVerificationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Recycler Compliance Portal • CPCB License #{recycler.licenseNumber}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {recycler.name}
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Directly sourcing clean, aggregated scrap lots from verified informal collectors. Zero child labor, hydrometallurgical closed-loop processing, and automated EPR certificate generation.
          </p>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Scan Collector's Handover QR
          </button>
        </div>
      </div>

      {/* Certificate Issued Toast notification */}
      {issuedCertificateId && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">EPR Green Certificate Generated Successfully!</p>
              <p className="text-[11px] text-emerald-700">
                Form 6 uploaded to Central Pollution Control Board (CPCB) registry for {issuedCertificateId}.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-1 rounded border border-emerald-200">
            CPCB-EW-VERIFIED
          </span>
        </div>
      )}

      {/* 4 Recycler Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Monthly Inward Lots
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">428.5 kg</div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            Sourced from 18 verified kabadiwalas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            EPR Credits Credited
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">1,240 Pts</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Sold to OEMs for compliance target
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Precious Metals Yield
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1">4.2g Au / 14kg Cu</div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            Hydrometallurgical clean extraction
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Formal Traceability Score
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">99.8%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            100% Zero-Landfill Verified
          </p>
        </div>
      </div>

      {/* Traceability Audit Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Collector Inward Batches & Custody Registry
            </h2>
            <p className="text-xs text-slate-500">
              Real-time scrap intake from informal sector partners
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Showing {transactions.length} active registered batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="p-3">Batch ID</th>
                <th className="p-3">Material</th>
                <th className="p-3">Collector</th>
                <th className="p-3">Net Weight</th>
                <th className="p-3">Settlement</th>
                <th className="p-3">Compliance Stage</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-800">
                    <div>{tx.id}</div>
                    <span className="text-[10px] text-slate-400 font-sans">{tx.date}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{tx.material}</td>
                  <td className="p-3 text-slate-700">
                    <span className="font-medium">{tx.collectorName}</span>
                    <span className="text-[10px] text-slate-400 block">{tx.pickupLocation}</span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{tx.weightKg} kg</td>
                  <td className="p-3 font-bold text-emerald-800">
                    ₹{tx.finalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {tx.traceabilityStage}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onViewTraceability(tx)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold"
                    >
                      Audit Trail
                    </button>
                    <button
                      onClick={() => handleIssueCertificate(tx.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs inline-flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      <span>Issue CPCB Cert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Anomaly & Fraud Risk Monitor */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Scrap Anomaly & Risk Monitoring
            </h3>
          </div>
          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
            1 Risk Item Under Review
          </span>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-amber-950">
              Batch #KC-2026-00122 (Lithium Battery Lot)
            </span>
            <p className="text-[11.5px] text-amber-800 mt-0.5">
              Reason: 32% weight variance from initial digital scale scan. Suspected casing moisture / contamination.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Secondary laboratory moisture calibration requested.')}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-xs transition-colors"
            >
              Order Lab Re-Test
            </button>
            <button
              onClick={() => alert('Weight adjustment settled with collector.')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 rounded-lg font-bold text-xs"
            >
              Approve Variance
            </button>
          </div>
        </div>
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        transactions={safeTransactions}
        language={language}
        onMatched={(tx) => onViewTraceability(tx)}
      />

      <RecyclerVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        recycler={recycler}
        language={language}
      />
    </div>
  );
};
