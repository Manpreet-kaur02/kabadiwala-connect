import React from 'react';
import { X, ShieldCheck, ExternalLink, BadgeCheck, AlertTriangle, Phone, Mail } from 'lucide-react';
import { RecyclerProfile, Language } from '../../types';
import { makeL } from '../../utils/i18n';

interface RecyclerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recycler: RecyclerProfile | null;
  language: Language;
}

/**
 * Answers the collector's most important trust question: "how do I know this
 * recycler is really authorized, and not just a name in an app?"
 *
 * We are honest about what the ✓ badge means: the platform's own admin team
 * checked the registration certificate at onboarding time (this is NOT a live
 * government API lookup — no such public real-time API exists yet), and we
 * give the collector the exact license number plus a direct link to the
 * official CPCB registry so they can independently cross-check it themselves.
 */
export const RecyclerVerificationModal: React.FC<RecyclerVerificationModalProps> = ({
  isOpen,
  onClose,
  recycler,
  language,
}) => {
  const L = makeL(language);
  if (!isOpen || !recycler) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {recycler.authorized ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {L('Authorized Recycler', 'अधिकृत रीसाइक्लर', 'अधिकृत रीसायकलर')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              {L('Not Yet Verified', 'अभी सत्यापित नहीं', 'अद्याप पडताळणी नाही')}
            </span>
          )}
        </div>

        <h2 className="text-lg font-extrabold text-slate-900 mt-3">{recycler.name}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{recycler.location}</p>

        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-slate-400 font-semibold">
              {L('Registration No.', 'पंजीकरण संख्या', 'नोंदणी क्रमांक')}
            </span>
            <span className="font-mono font-bold text-slate-900 text-right">{recycler.licenseNumber}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-400 font-semibold">
              {L('Issued By', 'जारीकर्ता', 'जारीकर्ता')}
            </span>
            <span className="font-semibold text-slate-800 text-right">
              {recycler.issuingAuthority || 'Central / State Pollution Control Board (CPCB / SPCB)'}
            </span>
          </div>
          {recycler.licenseIssuedOn && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-400 font-semibold">{L('Issued On', 'जारी तिथि', 'जारी तारीख')}</span>
              <span className="font-semibold text-slate-800">{recycler.licenseIssuedOn}</span>
            </div>
          )}
          {recycler.licenseValidTill && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-400 font-semibold">{L('Valid Till', 'वैधता तक', 'वैधता पर्यंत')}</span>
              <span className="font-semibold text-slate-800">{recycler.licenseValidTill}</span>
            </div>
          )}
        </div>

        <div className="mt-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11.5px] text-blue-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <BadgeCheck className="w-3.5 h-3.5" />
            {L('How was this checked?', 'यह जांच कैसे हुई?', 'ही तपासणी कशी झाली?')}
          </p>
          <p>
            {recycler.verificationMethod ||
              L(
                'Our team verified this facility\u2019s E-Waste (Management) Rules, 2022 registration certificate before listing it. This is a one-time manual check, not a live government feed \u2014 please also do your own check below before handing over a large lot.',
                'हमारी टीम ने इस फैसिलिटी का ई-वेस्ट (प्रबंधन) नियम, 2022 पंजीकरण प्रमाणपत्र लिस्ट करने से पहले जांचा। यह एक बार की मैनुअल जांच है, सरकार का लाइव डेटा नहीं \u2014 कृपया बड़ा माल देने से पहले नीचे खुद भी जांच लें।',
                'आमच्या टीमने ही फॅसिलिटी लिस्ट करण्यापूर्वी ई-वेस्ट (व्यवस्थापन) नियम, 2022 नोंदणी प्रमाणपत्र तपासले. ही एक-वेळ मॅन्युअल तपासणी आहे, सरकारी लाइव्ह डेटा नाही \u2014 मोठा माल देण्यापूर्वी कृपया खालीलप्रमाणे स्वतः देखील तपासा.'
              )}
          </p>
          {recycler.lastVerifiedOn && (
            <p className="mt-1 text-[10.5px] text-blue-700">
              {L('Last re-checked by admin', 'एडमिन द्वारा आखिरी बार जांचा', 'ऍडमिनने शेवटचे तपासले')}: {recycler.lastVerifiedOn}
            </p>
          )}
        </div>

        <a
          href="https://cpcb.nic.in/ewaste1/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-between gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          <span>
            {L(
              'Check this number yourself on the CPCB E-Waste portal',
              'यह नंबर खुद CPCB E-Waste पोर्टल पर जांचें',
              'हा नंबर स्वतः CPCB E-Waste पोर्टलवर तपासा'
            )}
          </span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <a
            href={`tel:${recycler.contactPhone}`}
            className="flex items-center justify-center gap-1.5 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Phone className="w-3.5 h-3.5" />
            {L('Call Facility', 'फैसिलिटी को कॉल करें', 'फॅसिलिटीला कॉल करा')}
          </a>
          <a
            href={`mailto:${recycler.contactEmail}`}
            className="flex items-center justify-center gap-1.5 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Mail className="w-3.5 h-3.5" />
            {L('Email', 'ईमेल', 'ईमेल')}
          </a>
        </div>

        <p className="mt-3 text-[10.5px] text-slate-400 leading-relaxed">
          {L(
            'If you believe a listed recycler is misusing this authorized badge, please report it from Settings → Report an Issue.',
            'अगर आपको लगता है कि किसी रीसाइक्लर ने यह बैज गलत तरीके से लिया है, तो सेटिंग्स → समस्या दर्ज करें से रिपोर्ट करें।',
            'जर तुम्हाला वाटत असेल की एखाद्या रीसायकलरने हा बॅज चुकीच्या पद्धतीने वापरला आहे, तर सेटिंग्ज → समस्या नोंदवा येथून कळवा.'
          )}
        </p>
      </div>
    </div>
  );
};
