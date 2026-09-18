import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Languages,
  Volume2,
  Type,
  Contrast,
  WifiOff,
  Wifi,
  RefreshCw,
  Bell,
  Database,
  Download,
  Trash2,
  ShieldCheck,
  Info,
  Gauge,
  ImageOff,
  AlertTriangle,
} from 'lucide-react';
import { Language } from '../../types';
import { makeL } from '../../utils/i18n';

export interface AppSettings {
  voiceEnabled: boolean;
  autoSpeakPrices: boolean;
  speechRate: number;
  largeText: boolean;
  highContrast: boolean;
  autoSync: boolean;
  dataSaver: boolean;
  notifyPickup: boolean;
  notifyPrice: boolean;
  notifySafety: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  voiceEnabled: true,
  autoSpeakPrices: true,
  speechRate: 0.9,
  largeText: false,
  highContrast: false,
  autoSync: true,
  dataSaver: false,
  notifyPickup: true,
  notifyPrice: true,
  notifySafety: true,
};

interface SettingsViewProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  settings: AppSettings;
  onChangeSettings: (next: AppSettings) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  onExportData: () => void;
  onClearLocalData: () => void;
  onTestVoice: () => void;
}

/** Reusable toggle row */
const Toggle: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ElementType;
}> = ({ label, hint, checked, onChange, icon: Icon }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-start justify-between gap-4 py-3 text-left border-b border-slate-50 last:border-0 group"
  >
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
    </div>
    <span
      className={`shrink-0 mt-0.5 w-10 h-5.5 rounded-full p-0.5 transition-colors flex items-center ${
        checked ? 'bg-emerald-600' : 'bg-slate-300'
      }`}
      style={{ height: '1.375rem' }}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
        style={{ transform: checked ? 'translateX(1.15rem)' : 'translateX(0)' }}
      />
    </span>
  </button>
);

const Section: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-1">
      <Icon className="w-4 h-4 text-emerald-600" />
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onChangeLanguage,
  settings,
  onChangeSettings,
  isOnline,
  pendingSyncCount,
  onSyncNow,
  onExportData,
  onClearLocalData,
  onTestVoice,
}) => {
  const L = makeL(language);
  const [confirmClear, setConfirmClear] = useState(false);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    onChangeSettings({ ...settings, [key]: value });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 mb-3">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>{L('App Settings', 'ऐप सेटिंग्स', 'ॲप सेटिंग्ज')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {L('Settings', 'सेटिंग्स', 'सेटिंग्ज')}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          {L(
            'Language, voice, readability, offline sync and data controls — tuned for low-literacy users on entry-level Android phones.',
            'भाषा, आवाज, पढ़ने में आसानी, ऑफलाइन सिंक और डेटा — सस्ते एंड्रॉइड फोन और कम पढ़े-लिखे उपयोगकर्ताओं के लिए।',
            'भाषा, आवाज, वाचनीयता, ऑफलाइन सिंक आणि डेटा — स्वस्त अँड्रॉइड फोन आणि कमी साक्षर वापरकर्त्यांसाठी.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ---------- Language ---------- */}
        <Section
          title={L('Language', 'भाषा', 'भाषा')}
          subtitle={L(
            'Applies across the whole app instantly',
            'पूरे ऐप में तुरंत लागू होगा',
            'संपूर्ण ॲपमध्ये लगेच लागू होईल'
          )}
          icon={Languages}
        >
          <div className="grid grid-cols-3 gap-2 pt-3">
            {(
              [
                { code: 'en' as Language, label: 'English', sub: 'English' },
                { code: 'hi' as Language, label: 'हिन्दी', sub: 'Hindi' },
                { code: 'mr' as Language, label: 'मराठी', sub: 'Marathi' },
              ]
            ).map((opt) => (
              <button
                key={opt.code}
                onClick={() => onChangeLanguage(opt.code)}
                className={`py-3 px-2 rounded-xl border text-center transition-all ${
                  language === opt.code
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                }`}
              >
                <div className="text-sm font-bold">{opt.label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    language === opt.code ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* ---------- Voice & Audio ---------- */}
        <Section
          title={L('Voice & Audio', 'आवाज और ऑडियो', 'आवाज व ऑडिओ')}
          subtitle={L(
            'For collectors who prefer listening over reading',
            'जो पढ़ने के बजाय सुनना पसंद करते हैं',
            'वाचण्याऐवजी ऐकणे पसंत करणाऱ्यांसाठी'
          )}
          icon={Volume2}
        >
          <Toggle
            icon={Volume2}
            label={L('Voice assistant', 'वॉइस असिस्टेंट', 'व्हॉइस असिस्टंट')}
            hint={L(
              'Show the floating mic button and accept spoken commands',
              'माइक बटन दिखाएं और बोलकर कमांड दें',
              'माइक बटण दाखवा आणि बोलून आज्ञा द्या'
            )}
            checked={settings.voiceEnabled}
            onChange={(v) => set('voiceEnabled', v)}
          />
          <Toggle
            icon={Volume2}
            label={L('Speak prices aloud', 'भाव बोलकर सुनाएं', 'भाव बोलून सांगा')}
            hint={L(
              'Price board and estimates are read out automatically',
              'रेट बोर्ड और अनुमान अपने आप बोले जाएंगे',
              'दर फलक व अंदाज आपोआप वाचले जातील'
            )}
            checked={settings.autoSpeakPrices}
            onChange={(v) => set('autoSpeakPrices', v)}
          />

          <div className="py-3 border-b border-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-slate-400" />
                {L('Speaking speed', 'बोलने की गति', 'बोलण्याचा वेग')}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700">
                {settings.speechRate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={settings.speechRate}
              onChange={(e) => set('speechRate', parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{L('Slow', 'धीमा', 'हळू')}</span>
              <span>{L('Fast', 'तेज', 'वेगवान')}</span>
            </div>
          </div>

          <button
            onClick={onTestVoice}
            className="mt-3 w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            {L('Test voice output', 'आवाज टेस्ट करें', 'आवाज तपासा')}
          </button>
        </Section>

        {/* ---------- Readability ---------- */}
        <Section
          title={L('Readability & Accessibility', 'पढ़ने में आसानी', 'वाचनीयता')}
          subtitle={L(
            'Larger text and stronger contrast for outdoor use',
            'धूप में और बड़े अक्षरों में आसानी से पढ़ें',
            'उन्हात व मोठ्या अक्षरात सहज वाचा'
          )}
          icon={Type}
        >
          <Toggle
            icon={Type}
            label={L('Large text mode', 'बड़े अक्षर', 'मोठी अक्षरे')}
            hint={L(
              'Increases font size across the entire app',
              'पूरे ऐप में अक्षर बड़े हो जाएंगे',
              'संपूर्ण ॲपमध्ये अक्षरे मोठी होतील'
            )}
            checked={settings.largeText}
            onChange={(v) => set('largeText', v)}
          />
          <Toggle
            icon={Contrast}
            label={L('High contrast', 'तेज कंट्रास्ट', 'उच्च कॉन्ट्रास्ट')}
            hint={L(
              'Darker text and stronger borders for bright sunlight',
              'धूप में दिखने के लिए गहरा टेक्स्ट',
              'उन्हात दिसण्यासाठी गडद मजकूर'
            )}
            checked={settings.highContrast}
            onChange={(v) => set('highContrast', v)}
          />
          <Toggle
            icon={ImageOff}
            label={L('Data saver', 'डेटा बचत', 'डेटा बचत')}
            hint={L(
              'Compress photos before upload — helps on 2G/3G networks',
              'फोटो छोटी करके भेजें — 2G/3G पर मददगार',
              'फोटो लहान करून पाठवा — 2G/3G वर उपयुक्त'
            )}
            checked={settings.dataSaver}
            onChange={(v) => set('dataSaver', v)}
          />
        </Section>

        {/* ---------- Offline & Sync ---------- */}
        <Section
          title={L('Offline & Sync', 'ऑफलाइन और सिंक', 'ऑफलाइन व सिंक')}
          subtitle={L(
            'Records are always saved on the phone first',
            'रिकॉर्ड पहले फोन में सुरक्षित होते हैं',
            'नोंदी प्रथम फोनमध्ये सुरक्षित होतात'
          )}
          icon={Database}
        >
          <div
            className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold ${
                    isOnline ? 'text-emerald-900' : 'text-amber-900'
                  }`}
                >
                  {isOnline
                    ? L('Online', 'ऑनलाइन', 'ऑनलाइन')
                    : L('Offline mode', 'ऑफलाइन मोड', 'ऑफलाइन मोड')}
                </p>
                <p
                  className={`text-[11px] ${
                    isOnline ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {pendingSyncCount > 0
                    ? L(
                        `${pendingSyncCount} record(s) waiting to sync`,
                        `${pendingSyncCount} रिकॉर्ड सिंक होने बाकी`,
                        `${pendingSyncCount} नोंदी सिंक होणे बाकी`
                      )
                    : L('Everything is synced', 'सब कुछ सिंक हो चुका है', 'सर्व सिंक झाले आहे')}
                </p>
              </div>
            </div>
            <button
              onClick={onSyncNow}
              disabled={!isOnline || pendingSyncCount === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {L('Sync now', 'अभी सिंक करें', 'आता सिंक करा')}
            </button>
          </div>

          <div className="mt-1">
            <Toggle
              icon={RefreshCw}
              label={L('Auto-sync when online', 'इंटरनेट आते ही सिंक', 'इंटरनेट येताच सिंक')}
              hint={L(
                'Queued lots upload automatically as soon as a network is found',
                'नेटवर्क मिलते ही रुके हुए लॉट अपने आप भेजे जाएंगे',
                'नेटवर्क मिळताच थांबलेले लॉट आपोआप पाठवले जातील'
              )}
              checked={settings.autoSync}
              onChange={(v) => set('autoSync', v)}
            />
          </div>
        </Section>

        {/* ---------- Notifications ---------- */}
        <Section
          title={L('Notifications', 'सूचनाएं', 'सूचना')}
          subtitle={L('Choose what you want to be alerted about', 'किस बारे में सूचना चाहिए', 'कशाबद्दल सूचना हवी')}
          icon={Bell}
        >
          <Toggle
            icon={Bell}
            label={L('Pickup & handover updates', 'पिकअप और हैंडओवर', 'पिकअप व हस्तांतरण')}
            checked={settings.notifyPickup}
            onChange={(v) => set('notifyPickup', v)}
          />
          <Toggle
            icon={Bell}
            label={L('Daily price changes', 'रोज के भाव में बदलाव', 'दैनिक दर बदल')}
            checked={settings.notifyPrice}
            onChange={(v) => set('notifyPrice', v)}
          />
          <Toggle
            icon={ShieldCheck}
            label={L('Safety advisories', 'सुरक्षा सलाह', 'सुरक्षा सल्ला')}
            checked={settings.notifySafety}
            onChange={(v) => set('notifySafety', v)}
          />
        </Section>

        {/* ---------- Data & Privacy ---------- */}
        <Section
          title={L('Data & Privacy', 'डेटा और गोपनीयता', 'डेटा व गोपनीयता')}
          subtitle={L(
            'Your records belong to you',
            'आपका डेटा आपका ही है',
            'तुमचा डेटा तुमचाच आहे'
          )}
          icon={ShieldCheck}
        >
          <div className="pt-3 space-y-2.5">
            <button
              onClick={onExportData}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {L('Export my data (JSON)', 'मेरा डेटा डाउनलोड करें', 'माझा डेटा डाउनलोड करा')}
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {L('Reset local demo data', 'लोकल डेटा रीसेट करें', 'लोकल डेटा रीसेट करा')}
              </button>
            ) : (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2.5">
                <p className="text-[11px] text-red-900 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {L(
                    'This clears every lot, transaction and profile stored on this device and restores the demo seed data. Cannot be undone.',
                    'इससे इस फोन में सेव सभी लॉट, लेन-देन और प्रोफाइल मिट जाएंगे और डेमो डेटा वापस आ जाएगा। वापस नहीं लाया जा सकता।',
                    'यामुळे या फोनमधील सर्व लॉट, व्यवहार व प्रोफाइल पुसले जातील आणि डेमो डेटा परत येईल. परत आणता येणार नाही.'
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearLocalData();
                      setConfirmClear(false);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold"
                  >
                    {L('Yes, reset', 'हां, रीसेट करें', 'होय, रीसेट करा')}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold"
                  >
                    {L('Cancel', 'रद्द करें', 'रद्द करा')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <p>
              {L(
                'Kabadiwala Connect • Prototype build v1.1 — synthetic demo data for Smart India Hackathon. No personal identity documents are collected.',
                'कबाड़ीवाला कनेक्ट • प्रोटोटाइप v1.1 — स्मार्ट इंडिया हैकाथॉन के लिए डेमो डेटा। कोई पहचान दस्तावेज नहीं लिया जाता।',
                'कबाडीवाला कनेक्ट • प्रोटोटाइप v1.1 — स्मार्ट इंडिया हॅकाथॉनसाठी डेमो डेटा. कोणतेही ओळख कागदपत्र घेतले जात नाही.'
              )}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};
