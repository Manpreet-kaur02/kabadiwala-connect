import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  Scale,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MaterialType, PickupRequest, CollectorProfile, Language } from '../../types';
import { MATERIAL_PRICES } from '../../data/mockData';

interface PickupRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollector?: CollectorProfile | null;
  initialMaterial?: MaterialType;
  initialWeight?: number;
  initialValue?: number;
  onSubmitSuccess: (newRequest: PickupRequest) => void;
  language: Language;
}

export const PickupRequestFormModal: React.FC<PickupRequestFormModalProps> = ({
  isOpen,
  onClose,
  selectedCollector,
  initialMaterial = 'PCB',
  initialWeight = 5.0,
  initialValue,
  onSubmitSuccess,
  language,
}) => {
  if (!isOpen) return null;

  const [material, setMaterial] = useState<MaterialType>(initialMaterial);
  const [weight, setWeight] = useState<number>(initialWeight);
  const [address, setAddress] = useState('House No. 1242, Sector 35-C, Chandigarh, 160035');
  const [preferredDate, setPreferredDate] = useState('2026-09-09');
  const [preferredTime, setPreferredTime] = useState('10:30 AM - 12:00 PM');
  const [specialInstructions, setSpecialInstructions] = useState('Items packed in cardboard box. Please call 15 minutes before arrival.');
  const [submittedRequest, setSubmittedRequest] = useState<PickupRequest | null>(null);

  const priceBenchmark = MATERIAL_PRICES[material]?.indicativeRatePerKg || 300;
  const calculatedValue = initialValue || Math.round(priceBenchmark * weight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq: PickupRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      sellerName: 'Rahul Verma',
      sellerPhone: '+91 98765 43210',
      location: 'Sector 35-C, Chandigarh',
      distanceKm: selectedCollector?.distanceKm || 2.4,
      material,
      weightKg: weight,
      estimatedValue: calculatedValue,
      preferredDate,
      preferredTime,
      address,
      status: 'new',
      createdAt: 'Just now',
      specialInstructions,
    };

    setSubmittedRequest(newReq);
    onSubmitSuccess(newReq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: Form Fill */}
        {!submittedRequest ? (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'ई-वेस्ट पिकअप बुक करें' : 'Schedule Doorstep Scrap Pickup'}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCollector
                    ? `Assigning to: ${selectedCollector.name} (${selectedCollector.distanceKm} km away)`
                    : 'Broadcast to verified neighborhood kabadiwalas'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Material & Weight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-Waste Material
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as MaterialType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {Object.keys(MATERIAL_PRICES).map((m) => (
                      <option key={m} value={m}>
                        {m} (~₹{MATERIAL_PRICES[m as MaterialType].indicativeRatePerKg}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approx Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Doorstep Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="09:00 AM - 11:00 AM">Morning (09:00 AM - 11:00 AM)</option>
                    <option value="11:00 AM - 01:00 PM">Noon (11:00 AM - 01:00 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Notes / Accessibility Instructions
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. 2nd floor, lift available, batteries taped..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Valuation Summary Card */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">Expected Payout:</span>
                  <span className="text-lg font-bold text-emerald-800">
                    ₹{calculatedValue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Calculated for {weight} kg {material}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    Zero Pickup Fee
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Confirm Pickup Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* State 2: Request Created Confirmation & Timeline */
          <div className="text-center space-y-5 animate-in fade-in py-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Pickup Request Created ✓
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Request ID: <span className="font-mono font-bold text-slate-800">{submittedRequest.id}</span>
              </p>
            </div>

            {/* Status Timeline */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Live Traceability Lifecycle
              </span>

              <div className="space-y-3 relative pl-6 border-l-2 border-emerald-500 ml-3 text-xs">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full ring-4 ring-emerald-100" />
                  <p className="font-bold text-emerald-800">1. Request Sent</p>
                  <p className="text-[11px] text-slate-500">Dispatched to verified collectors nearby</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-slate-300 rounded-full" />
                  <p className="font-semibold text-slate-700">2. Collector Accepted</p>
                  <p className="text-[11px] text-slate-400">Collector confirms arrival slot</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-slate-300 rounded-full" />
                  <p className="font-semibold text-slate-700">3. Pickup Scheduled</p>
                  <p className="text-[11px] text-slate-400">{submittedRequest.preferredDate} ({submittedRequest.preferredTime})</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-slate-300 rounded-full" />
                  <p className="font-semibold text-slate-700">4. Item Collected & Digital Weighing</p>
                  <p className="text-[11px] text-slate-400">Instant UPI / Cash payout</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-slate-300 rounded-full" />
                  <p className="font-semibold text-slate-700">5. Recycler Processing</p>
                  <p className="text-[11px] text-slate-400">Authorized facility smelts & recycles</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-slate-300 rounded-full" />
                  <p className="font-semibold text-slate-700">6. Completed (E-Waste Certificate Issued)</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              View In My Requests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
