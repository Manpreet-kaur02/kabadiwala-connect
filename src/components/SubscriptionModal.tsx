import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Crown,
  Home,
  Truck,
  Building2,
  ShieldCheck,
  ArrowRight,
  Gift,
  Loader2,
} from 'lucide-react';
import { Language, SubscriptionPlan, UserRole, ActiveSubscription } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  activeSubscription: ActiveSubscription | null;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onContinueFree: (role: UserRole) => void;
  onCancelSubscription: () => void;
}

const ROLE_ICON: Record<UserRole, React.ElementType> = {
  landing: Sparkles,
  seller: Home,
  collector: Truck,
  recycler: Building2,
  admin: ShieldCheck,
};

const COLOR_CLASSES: Record<
  SubscriptionPlan['color'],
  { border: string; bg: string; iconBg: string; button: string; text: string; ring: string }
> = {
  emerald: {
    border: 'border-emerald-200 hover:border-emerald-500',
    bg: 'bg-emerald-50/30',
    iconBg: 'bg-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500',
  },
  teal: {
    border: 'border-teal-200 hover:border-teal-500',
    bg: 'bg-teal-50/30',
    iconBg: 'bg-teal-600',
    button: 'bg-teal-700 hover:bg-teal-800',
    text: 'text-teal-700',
    ring: 'ring-teal-500',
  },
  slate: {
    border: 'border-slate-200 hover:border-blue-500',
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-800',
    button: 'bg-slate-900 hover:bg-slate-800',
    text: 'text-slate-700',
    ring: 'ring-blue-500',
  },
  indigo: {
    border: 'border-indigo-200 hover:border-indigo-500',
    bg: 'bg-indigo-50/30',
    iconBg: 'bg-indigo-700',
    button: 'bg-indigo-700 hover:bg-indigo-800',
    text: 'text-indigo-700',
    ring: 'ring-indigo-500',
  },
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  language,
  activeSubscription,
  onSubscribe,
  onContinueFree,
  onCancelSubscription,
}) => {
  const [confirmedPlan, setConfirmedPlan] = useState<SubscriptionPlan | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const planName = (p: SubscriptionPlan) => (isHi ? p.nameHi : isMr ? p.nameMr : p.name);
  const planTagline = (p: SubscriptionPlan) => (isHi ? p.taglineHi : isMr ? p.taglineMr : p.tagline);
  const planBenefits = (p: SubscriptionPlan) => (isHi ? p.benefitsHi : isMr ? p.benefitsMr : p.benefits);

  const roleLabel = (role: UserRole) => {
    const map: Record<UserRole, { en: string; hi: string; mr: string }> = {
      landing: { en: 'Home', hi: 'होम', mr: 'होम' },
      seller: { en: 'Seller', hi: 'विक्रेता', mr: 'विक्रेता' },
      collector: { en: 'Collector', hi: 'कलेक्टर', mr: 'कलेक्टर' },
      recycler: { en: 'Recycler', hi: 'रीसाइक्लर', mr: 'रीसायकलर' },
      admin: { en: 'Admin / PMU', hi: 'एडमिन / PMU', mr: 'प्रशासन / PMU' },
    };
    return isHi ? map[role].hi : isMr ? map[role].mr : map[role].en;
  };

  const handleSubscribeClick = (plan: SubscriptionPlan) => {
    setProcessingPlanId(plan.id);
    // Small artificial delay so the "processing" state feels real in the demo
    setTimeout(() => {
      onSubscribe(plan);
      setProcessingPlanId(null);
      setConfirmedPlan(plan);
    }, 700);
  };

  const closeAndReset = () => {
    setConfirmedPlan(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeAndReset}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ---------------- Confirmation screen after subscribing ---------------- */}
        {confirmedPlan ? (
          <div className="max-w-lg mx-auto text-center py-6">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl ${COLOR_CLASSES[confirmedPlan.color].iconBg} text-white flex items-center justify-center shadow-lg mb-4`}
            >
              <Crown className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
              <Check className="w-3.5 h-3.5" />
              {isHi ? 'सब्सक्रिप्शन सक्रिय (डेमो)' : isMr ? 'सबस्क्रिप्शन सक्रिय (डेमो)' : 'Subscription Active (Demo)'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {isHi
                ? `आप अब ${planName(confirmedPlan)} पर हैं`
                : isMr
                ? `तुम्ही आता ${planName(confirmedPlan)} वर आहात`
                : `You're now on ${planName(confirmedPlan)}`}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isHi
                ? `${roleLabel(confirmedPlan.role)} डेमो अब Pro सुविधाओं के साथ अनलॉक हो गया है।`
                : isMr
                ? `${roleLabel(confirmedPlan.role)} डेमो आता Pro सुविधांसह अनलॉक झाला आहे.`
                : `The ${roleLabel(confirmedPlan.role)} demo is now unlocked with these Pro benefits.`}
            </p>

            <div className="mt-5 text-left bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5">
              {planBenefits(confirmedPlan).map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${COLOR_CLASSES[confirmedPlan.color].text}`} />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button
              onClick={closeAndReset}
              className={`mt-6 w-full py-3 px-4 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${COLOR_CLASSES[confirmedPlan.color].button}`}
            >
              <span>
                {isHi
                  ? `${roleLabel(confirmedPlan.role)} डैशबोर्ड खोलें`
                  : isMr
                  ? `${roleLabel(confirmedPlan.role)} डॅशबोर्ड उघडा`
                  : `Go to ${roleLabel(confirmedPlan.role)} Dashboard`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* ---------------- Plans grid ---------------- */}
            <div className="text-center max-w-xl mx-auto mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-3">
                <Crown className="w-3.5 h-3.5" />
                <span>{isHi ? 'सब्सक्रिप्शन प्लान्स' : isMr ? 'सबस्क्रिप्शन प्लॅन्स' : 'Subscription Plans'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isHi
                  ? 'हर भूमिका के लिए किफायती प्रो प्लान'
                  : isMr
                  ? 'प्रत्येक भूमिकेसाठी परवडणारी प्रो योजना'
                  : 'Affordable Pro plans for every role'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {isHi
                  ? 'फ्री डेमो हमेशा की तरह उपलब्ध है। सब्सक्राइब करने पर उस भूमिका के डेमो में अतिरिक्त सुविधाएं मिलती हैं।'
                  : isMr
                  ? 'फ्री डेमो नेहमीप्रमाणे उपलब्ध आहे. सबस्क्राइब केल्यास त्या भूमिकेच्या डेमोमध्ये जास्तीच्या सुविधा मिळतात.'
                  : 'Free demo access remains available as always — subscribing simply adds extra Pro perks to that role\u2019s demo.'}
              </p>
            </div>

            {activeSubscription && (
              <div className="max-w-xl mx-auto mb-6 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs">
                <span className="text-amber-800 font-medium flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  {isHi
                    ? `सक्रिय: ${SUBSCRIPTION_PLANS.find((p) => p.id === activeSubscription.planId)?.name ?? ''}`
                    : `Active: ${SUBSCRIPTION_PLANS.find((p) => p.id === activeSubscription.planId)?.name ?? ''}`}
                </span>
                <button
                  onClick={onCancelSubscription}
                  className="text-amber-700 font-semibold hover:underline shrink-0"
                >
                  {isHi ? 'रद्द करें' : isMr ? 'रद्द करा' : 'Cancel'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const colors = COLOR_CLASSES[plan.color];
                const Icon = ROLE_ICON[plan.role];
                const isActive = activeSubscription?.planId === plan.id;
                const isProcessing = processingPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all group text-left ${
                      isActive ? `ring-2 ${colors.ring}` : ''
                    }`}
                  >
                    {plan.highlight && !isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
                        {isHi ? 'सबसे लोकप्रिय' : isMr ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> {isHi ? 'सक्रिय' : isMr ? 'सक्रिय' : 'Active'}
                      </span>
                    )}

                    <div>
                      <div
                        className={`w-12 h-12 rounded-xl ${colors.iconBg} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${colors.text}`}>
                        {roleLabel(plan.role)}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{planName(plan)}</h3>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900">₹{plan.priceMonthly}</span>
                        <span className="text-xs text-slate-500">
                          /{isHi ? 'माह' : isMr ? 'महिना' : 'month'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{planTagline(plan)}</p>

                      <ul className="mt-4 space-y-2">
                        {planBenefits(plan).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11.5px] text-slate-700">
                            <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colors.text}`} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSubscribeClick(plan)}
                      disabled={isProcessing}
                      className={`mt-6 w-full py-2.5 px-3 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 ${colors.button}`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isActive ? (
                        <>
                          <span>
                            {isHi ? `${roleLabel(plan.role)} डैशबोर्ड खोलें` : isMr ? `${roleLabel(plan.role)} डॅशबोर्ड उघडा` : 'Open Dashboard'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>{isHi ? 'सब्सक्राइब करें' : isMr ? 'सबस्क्राइब करा' : 'Subscribe'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-slate-400" />
                {isHi
                  ? 'बिना सब्सक्रिप्शन के भी सभी भूमिकाओं का फ्री डेमो हमेशा उपलब्ध है।'
                  : isMr
                  ? 'सबस्क्रिप्शनशिवायही सर्व भूमिकांचा फ्री डेमो नेहमी उपलब्ध आहे.'
                  : 'No subscription needed — free demo access to every role is always available.'}
              </p>
              <button
                onClick={() => onContinueFree('landing')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline shrink-0"
              >
                {isHi ? 'फ्री डेमो जारी रखें →' : isMr ? 'फ्री डेमो सुरू ठेवा →' : 'Continue with free demo →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
