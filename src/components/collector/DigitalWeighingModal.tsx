import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  X,
  Sparkles,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Bluetooth,
  RefreshCw,
} from 'lucide-react';
import { PickupRequest, MaterialType, Language } from '../../types';
import { MATERIAL_PRICES } from '../../data/mockData';

interface DigitalWeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PickupRequest | null;
  onCompletePickup: (requestId: string, finalWeight: number, finalPayout: number) => void;
  language: Language;
}

export const DigitalWeighingModal: React.FC<DigitalWeighingModalProps> = ({
  isOpen,
  onClose,
  request,
  onCompletePickup,
  language,
}) => {
  if (!isOpen || !request) return null;

  const [calibratedWeight, setCalibratedWeight] = useState<number>(request.weightKg);
  const [conditionGrade, setConditionGrade] = useState<'A Grade (Clean)' | 'B Grade (Standard)' | 'C Grade (Scrap)'>('B Grade (Standard)');
  const [paymentMethod, setPaymentMethod] = useState<'Instant UPI' | 'Cash'>('Instant UPI');
  const [isSimulatingScale, setIsSimulatingScale] = useState(false);

  const priceBenchmark = MATERIAL_PRICES[request.material]?.indicativeRatePerKg || 300;
  const gradeMultiplier = conditionGrade.startsWith('A') ? 1.05 : conditionGrade.startsWith('C') ? 0.9 : 1.0;
  const finalRate = Math.round(priceBenchmark * gradeMultiplier);
  const finalPayout = Math.round(finalRate * calibratedWeight);

  const handleSimulateWeigh = () => {
    setIsSimulatingScale(true);
    setTimeout(() => {
      // Small realistic variation ±0.2 kg
      const variation = (Math.random() * 0.4 - 0.2);
      setCalibratedWeight(Math.max(0.1, Number((request.weightKg + variation).toFixed(2))));
      setIsSimulatingScale(false);
    }, 800);
  };

  const handleConfirm = () => {
    onCompletePickup(request.id, calibratedWeight, finalPayout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'hi' ? 'डिजिटल तौल एवं भुगतान' : 'Digital Scale Verification & Payout'}
            </h2>
            <p className="text-xs text-slate-500">
              Pickup from: <strong className="text-slate-800">{request.sellerName}</strong> • {request.material}
            </p>
          </div>
        </div>

        {/* Digital Scale Readout Simulation */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-400">
              <Bluetooth className="w-3.5 h-3.5 animate-pulse" />
              <span>Scale Connected (Tara-Scale-BT-04)</span>
            </div>
            <button
              onClick={handleSimulateWeigh}
              disabled={isSimulatingScale}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSimulatingScale ? 'animate-spin' : ''}`} />
              <span>Tare / Re-weigh</span>
            </button>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl sm:text-5xl font-mono font-black text-teal-400 tracking-wider">
              {isSimulatingScale ? '---.--' : calibratedWeight.toFixed(2)}
              <span className="text-lg font-sans text-slate-400 ml-2">kg</span>
            </div>
            <span className="text-[10px] text-teal-500 uppercase font-semibold tracking-widest mt-1 block">
              ✓ Calibrated & Certified Zero-Error
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2.5 text-slate-300">
            <span>Quoted by Seller: {request.weightKg} kg</span>
            <span>Variance: {(calibratedWeight - request.weightKg).toFixed(2)} kg</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Quality Grading */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Grade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A Grade (Clean)', 'B Grade (Standard)', 'C Grade (Scrap)'] as const).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setConditionGrade(grade)}
                  className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                    conditionGrade === grade
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seller Payout Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Instant UPI', 'Cash'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                    paymentMethod === m
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m === 'Instant UPI' ? '⚡ Instant UPI QR' : '💵 Direct Cash'}
                </button>
              ))}
            </div>
          </div>

          {/* Final Settlement Total */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 block">Total Payout to Seller:</span>
              <span className="text-2xl font-black text-emerald-800">
                ₹{finalPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Rate: ₹{finalRate}/kg × {calibratedWeight} kg
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Receipt Generated
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition-all"
          >
            <span>Complete Pickup & Add to Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
