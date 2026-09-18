import React from 'react';
import { UserRole, Language } from '../types';
import { Home, Truck, Building2, CheckCircle, ArrowRight, X, Sparkles, ShieldCheck, Crown } from 'lucide-react';
import { TRANSLATIONS } from '../data/mockData';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  language: Language;
  onViewPlans?: () => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  language,
  onViewPlans,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'hi'
              ? 'आप कबाड़ीवाला कनेक्ट का उपयोग कैसे करेंगे?'
              : 'How are you using Kabadiwala Connect?'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'hi'
              ? 'अपनी भूमिका चुनें। कोई पासवर्ड की आवश्यकता नहीं है, तुरंत लाइव प्रोटोटाइप देखें।'
              : 'Select your role to enter the customized dashboard. No credentials needed for this prototype.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Seller Card */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 hover:border-emerald-500 hover:shadow-lg transition-all group text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                {language === 'hi' ? 'भूमिका 1' : 'Role 01'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {language === 'hi' ? 'विक्रेता (सेलर)' : 'Seller'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'मैं अपने घर या ऑफिस का पुराना ई-कचरा बेचना चाहता हूँ।'
                  : 'I want to sell / dispose of my e-waste.'}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('seller')}
              className="mt-6 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t.loginAsSeller}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Collector Card */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/30 hover:border-teal-500 hover:shadow-lg transition-all group text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                {language === 'hi' ? 'भूमिका 2' : 'Role 02'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {language === 'hi' ? 'कबाड़ीवाला (कलेक्टर)' : 'Collector'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'मैं घरों से ई-कचरा एकत्र करता हूँ और रीसाइक्लर को बेचता हूँ।'
                  : 'I collect e-waste from sellers.'}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('collector')}
              className="mt-6 w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t.loginAsCollector}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recycler Preview Card */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-blue-500 hover:shadow-lg transition-all group text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'hi' ? 'भूमिका 3' : 'Role 03'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {language === 'hi' ? 'रीसाइक्लर (प्रमाणित)' : 'Recycler'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'मैं अधिकृत प्लांट में ई-कचरे को प्रोसेस और रीसायकल करता हूँ।'
                  : 'I process and recycle e-waste.'}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('recycler')}
              className="mt-6 w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t.previewRecycler}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin / PMU Card */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 hover:border-indigo-500 hover:shadow-lg transition-all group text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-700/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                {language === 'hi' ? 'भूमिका 4' : language === 'mr' ? 'भूमिका ४' : 'Role 04'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {language === 'hi' ? 'एडमिन (सरकारी निगरानी)' : language === 'mr' ? 'प्रशासन (सरकारी देखरेख)' : 'Admin / PMU'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'मैं संपूर्ण मटीरियल फ्लो, रिसाइक्लर प्राधिकरण और असामान्य लेन-देन की निगरानी करता हूँ।'
                  : language === 'mr'
                  ? 'मी संपूर्ण मटेरियल फ्लो, रीसायकलर अधिकृतता आणि असामान्य व्यवहारांवर देखरेख करतो.'
                  : 'I monitor material flow, recycler authorization and anomalies platform-wide.'}
              </p>
            </div>
            <button
              onClick={() => onSelectRole('admin')}
              className="mt-6 w-full py-2.5 px-3 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{language === 'hi' ? 'एडमिन व्यू खोलें' : language === 'mr' ? 'प्रशासन दृश्य उघडा' : 'Open Admin View'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? '💡 आप बाद में ऊपर दिए गए "स्विच रोल" बटन से कभी भी भूमिका बदल सकते हैं।'
              : '💡 You can freely toggle between roles at any point from the top bar.'}
          </p>
          {onViewPlans && (
            <button
              onClick={onViewPlans}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'या किफायती Pro सब्सक्रिप्शन प्लान देखें'
                  : language === 'mr'
                  ? 'किंवा परवडणारे Pro सबस्क्रिप्शन प्लॅन पहा'
                  : 'Or view affordable Pro subscription plans'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
