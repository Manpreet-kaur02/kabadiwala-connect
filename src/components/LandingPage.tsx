import React from 'react';
import {
  Recycle,
  ScanLine,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Truck,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  ChevronRight,
  Scale,
  Users,
  Cpu,
  Crown,
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { TRANSLATIONS, MATERIAL_PRICES } from '../data/mockData';

interface LandingPageProps {
  language: Language;
  onSelectRole: (role: UserRole) => void;
  onOpenRoleModal: () => void;
  onOpenSubscription?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onSelectRole,
  onOpenRoleModal,
  onOpenSubscription,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'hi'
                  ? 'भारत का पहला ई-कचरा डिजिटल सेतु'
                  : "India's First Informal-to-Formal E-Waste Bridge"}
              </span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t.appName}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-medium text-emerald-700">
              {t.subtagline}
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'hi'
                ? 'ई-कचरा बेचने वाले नागरिकों, स्थानीय कबाड़ीवालों और अधिकृत रिसाइकिलर्स को जोड़ने वाला एआई-सक्षम प्लेटफॉर्म।'
                : 'An AI-powered platform connecting e-waste sellers, local informal collectors, and authorized recyclers.'}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onSelectRole('seller')}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>{language === 'hi' ? 'ई-वेस्ट बेचें' : 'Sell E-Waste'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectRole('collector')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>{language === 'hi' ? 'कबाड़ीवाला के रूप में जुड़ें' : 'Join as Collector'}</span>
                <Truck className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={onOpenRoleModal}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm sm:text-base shadow-2xs transition-all flex items-center gap-2"
              >
                <span>{language === 'hi' ? 'डेमो एक्सप्लोर करें' : 'Explore Demo'}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Hackathon Prototype Tag */}
            <p className="mt-5 text-xs text-slate-500 font-medium">
              💡 {t.demoNotice}
            </p>

            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {language === 'hi'
                    ? 'किफायती Pro सब्सक्रिप्शन प्लान देखें'
                    : language === 'mr'
                    ? 'परवडणारे Pro सबस्क्रिप्शन प्लॅन पहा'
                    : 'View affordable Pro subscription plans'}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Visual Lifecycle Flow: Seller -> Collector -> Authorized Recycler -> Responsible Recycling */}
      <section className="py-14 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {language === 'hi' ? 'पारदर्शी चक्रीय प्रवाह' : 'Closed Loop Ecosystem'}
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'कचरे से मूल्य तक: हमारा 4-चरणीय मॉडल'
                : 'How Kabadiwala Connect Bridges the Chain'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Seller */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span>{language === 'hi' ? 'विक्रेता (सेलर)' : 'Seller'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                  Doorstep
                </span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'मोबाइल से फोटो खींचें, एआई से सही कीमत जानें और नजदीकी कबाड़ी को मुफ्त पिकअप बुक करें।'
                  : 'Snaps a photo, receives instant AI material valuation, and books verified doorstep scrap collection.'}
              </p>
            </div>

            {/* Step 2: Collector */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span>{language === 'hi' ? 'कबाड़ीवाला (कलेक्टर)' : 'Collector'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">
                  Informal
                </span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'अनुरोध स्वीकार करता है, डिजिटल तौल से पारदर्शी दाम देता है और अपना स्टॉक ऐप में दर्ज करता है।'
                  : 'Accepts requests, verifies condition with AI guidance, pays transparent rates, and aggregates inventory.'}
              </p>
            </div>

            {/* Step 3: Authorized Recycler */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span>{language === 'hi' ? 'अधिकृत रीसाइक्लर' : 'Authorized Recycler'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                  CPCB Certified
                </span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'कबाड़ी से सीधा बल्क लॉट खरीदता है और बिचौलियों के बिना उच्चतम औद्योगिक भाव देता है।'
                  : 'Buys bulk aggregated lots from informal collectors at fair industrial rates without middlemen.'}
              </p>
            </div>

            {/* Step 4: Responsible Recycling */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span>{language === 'hi' ? 'जिम्मेदार रीसाइक्लिंग' : 'Responsible Recycling'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  Traceable
                </span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'खतरनाक रसायनों का वैज्ञानिक निस्तारण, बहुमूल्य धातुओं की सुरक्षित रिकवरी और डिजिटल सर्टिफिकेट।'
                  : 'Zero open burning. Scientific dismantling, heavy metal recovery, and auditable EPR certificate.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Benefits Grid */}
      <section className="py-14 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {language === 'hi' ? 'मुख्य तकनीकी विशेषताएं' : 'Core Capabilities'}
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'तकनीक और जमीनी हकीकत का संगम'
                : 'Built for High Impact in the Indian Marketplace'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'hi' ? '1. एआई सामग्री पहचान' : '1. AI Material Recognition'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'पीसीबी, कॉपर केबल, बैटरी या एलसीडी की तस्वीर से सटीक श्रेणी और स्थिति का तुरंत पता लगाता है।'
                  : 'Computer-vision inference detects PCBs, copper cables, lithium batteries, and displays with condition grades.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'hi' ? '2. उचित मूल्य अनुमान' : '2. Fair Price Estimation'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'सामग्री, वजन, स्थान और ऐतिहासिक दरों के आधार पर पारदर्शी बेंचमार्क भाव, ताकि कोई धोखा न हो।'
                  : 'Transparent benchmark valuation algorithms prevent arbitrary underpricing and protect scrap workers.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'hi' ? '3. सत्यापित कबाड़ी नेटवर्क' : '3. Trusted Collector Connection'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'मोहल्ले के भरोसेमंद कबाड़ीवालों को सत्यापित प्रोफाइल और डिजिटल पिकअप शेड्यूलिंग से सशक्त बनाता है।'
                  : 'Connects households to verified local kabadiwalas with verified phone, ratings, and instant pickups.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'hi' ? '4. अधिकृत रीसाइक्लर बाजार' : '4. Authorized Recycler Network'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'कबाड़ीवालों को राज्य प्रदूषण नियंत्रण बोर्ड (CPCB) अधिकृत रीसाइक्लर्स से सीधे जोड़कर 20-30% अधिक आय।'
                  : 'Direct pipeline to CPCB authorized formal recyclers, giving collectors bulk wholesale buying margins.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'hi' ? '5. पारदर्शी लेन-देन एवं सुरक्षा गाइड' : '5. Transparent Traceability & Safety Guides'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'पिकअप से लेकर फैक्टरी तक हर किलो ई-कचरे की डिजिटल ट्रैकिंग, साथ ही जहरीली गैस और बैटरी विस्फोट से सुरक्षा के स्पष्ट निर्देश।'
                  : 'End-to-end chain-of-custody tracking with digital batch IDs, alongside illustrated safety instructions for handling hazardous batteries and toxic CRT/CCFL components.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Benchmark Snapshot (Synthetic Demo) */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                {language === 'hi' ? 'ताजा सांकेतिक दरें' : 'Indicative Market Rates'}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {language === 'hi' ? 'ई-कचरा मूल्य तालिका (चंडीगढ़ / उत्तर भारत)' : 'E-Waste Benchmark Rates (North India)'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              * Indicative demo values for hackathon simulation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.values(MATERIAL_PRICES).slice(0, 6).map((item) => (
              <div
                key={item.material}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all text-center"
              >
                <div className="text-xs font-semibold text-slate-600 truncate">{item.material}</div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  ₹{item.indicativeRatePerKg}
                  <span className="text-xs font-normal text-slate-500">/kg</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  +{item.changeWeekPercent}% this week
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onOpenRoleModal}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              {language === 'hi' ? 'रोल चुनें और ऐप शुरू करें →' : 'Launch Interactive Application →'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
