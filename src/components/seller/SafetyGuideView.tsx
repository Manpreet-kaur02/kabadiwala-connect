import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  BatteryCharging,
  Tv,
  Monitor,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Info,
} from 'lucide-react';
import { Language } from '../../types';
import { SAFETY_GUIDES } from '../../data/mockData';

export const SafetyGuideView: React.FC<{ language: Language }> = ({ language }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-semibold mb-1 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>E-Waste Hazard Prevention</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'ई-कचरा सुरक्षा एवं रख-रखाव गाइड' : 'E-Waste Safe Handling & Precautions'}
        </h1>
        <p className="text-xs text-slate-500">
          Essential protocols to protect yourself, your family, and scrap collectors from toxic chemicals and electric discharge.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              {language === 'hi' ? 'महत्वपूर्ण चेतावनी: कभी भी ई-कचरा न जलाएं' : 'Zero Open Burning Mandate'}
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Burning wires or circuit boards releases toxic Dioxins and Lead vapor causing permanent respiratory damage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300">
            CPCB Clean Air Protocol
          </span>
        </div>
      </div>

      {/* Grid of Safety Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAFETY_GUIDES.map((guide) => (
          <div
            key={guide.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    guide.severity === 'critical'
                      ? 'bg-rose-100 text-rose-700'
                      : guide.severity === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {guide.id === 'safe-01' ? (
                    <BatteryCharging className="w-5 h-5" />
                  ) : guide.id === 'safe-02' ? (
                    <Monitor className="w-5 h-5" />
                  ) : guide.id === 'safe-03' ? (
                    <Tv className="w-5 h-5" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      guide.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {guide.severity} Risk
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {language === 'hi' ? guide.categoryHi : guide.category}
                  </h3>
                </div>
              </div>
            </div>

            {/* Instruction bullets */}
            <div className="space-y-1.5 text-xs text-slate-700">
              {(language === 'hi' ? guide.instructionsHi : guide.instructions).map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{inst}</p>
                </div>
              ))}
            </div>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DO'S</span>
                </span>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {guide.dos.map((d, i) => (
                    <li key={i}>✓ {d}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1 mb-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>DON'TS</span>
                </span>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {guide.donts.map((d, i) => (
                    <li key={i}>✕ {d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
