import React, { useMemo, useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Languages,
  ShieldCheck,
  BadgeCheck,
  Star,
  Package,
  Wallet,
  Pencil,
  Save,
  X,
  Building2,
  FileCheck,
  Recycle,
  Truck,
  CreditCard,
  Info,
  Clock,
} from 'lucide-react';
import {
  UserRole,
  Language,
  TransactionRecord,
  PickupRequest,
  InventoryItem,
} from '../../types';
import { INITIAL_COLLECTORS, INITIAL_RECYCLERS } from '../../data/mockData';
import { makeL, formatINR } from '../../utils/i18n';

export interface UserProfileData {
  name: string;
  phone: string;
  location: string;
  address: string;
  preferredLanguage: Language;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  upiId: string;
  serviceArea: string;
  /** Collector/Recycler only */
  licenseNumber: string;
}

interface ProfileViewProps {
  role: UserRole;
  language: Language;
  profile: UserProfileData;
  onSaveProfile: (next: UserProfileData) => void;
  transactions: TransactionRecord[];
  requests: PickupRequest[];
  inventory: InventoryItem[];
  onChangeLanguage: (lang: Language) => void;
  onOpenSettings: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  role,
  language,
  profile,
  onSaveProfile,
  transactions,
  requests,
  inventory,
  onChangeLanguage,
  onOpenSettings,
}) => {
  const L = makeL(language);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfileData>(profile);

  // Keep the draft in sync if the saved profile changes while not editing
  React.useEffect(() => {
    if (!isEditing) setDraft(profile);
  }, [profile, isEditing]);

  const collectorRef = INITIAL_COLLECTORS[0];
  const recyclerRef = INITIAL_RECYCLERS[0];

  /** Live stats computed from the actual app datasets (not hardcoded) */
  const stats = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'Completed');
    const totalWeight = transactions.reduce((sum, t) => sum + (t.weightKg || 0), 0);
    const totalValue = transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
    const inventoryWeight = inventory.reduce((s, i) => s + (i.weightKg || 0), 0);
    const inventoryValue = inventory.reduce(
      (s, i) => s + (i.weightKg || 0) * (i.estimatedRatePerKg || 0),
      0
    );
    return {
      transactionCount: transactions.length,
      completedCount: completed.length,
      requestCount: requests.length,
      totalWeight,
      totalValue,
      inventoryWeight,
      inventoryValue,
    };
  }, [transactions, requests, inventory]);

  const roleMeta = (() => {
    switch (role) {
      case 'seller':
        return {
          tag: L('Household / Seller', 'घरेलू विक्रेता', 'घरगुती विक्रेता'),
          icon: User,
          accent: 'emerald',
        };
      case 'collector':
        return {
          tag: L('Informal Collector (Kabadiwala)', 'कबाड़ीवाला (कलेक्टर)', 'कबाडीवाला (कलेक्टर)'),
          icon: Truck,
          accent: 'emerald',
        };
      case 'recycler':
        return {
          tag: L('CPCB Authorized Recycler', 'सीपीसीबी अधिकृत रीसाइक्लर', 'सीपीसीबी अधिकृत रीसायकलर'),
          icon: Building2,
          accent: 'blue',
        };
      default:
        return {
          tag: L('Admin / State PMU Cell', 'एडमिन / राज्य पीएमयू', 'प्रशासन / राज्य पीएमयू'),
          icon: ShieldCheck,
          accent: 'slate',
        };
    }
  })();

  const RoleIcon = roleMeta.icon;

  const initials = draft.name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleSave = () => {
    onSaveProfile(draft);
    if (draft.preferredLanguage !== language) {
      onChangeLanguage(draft.preferredLanguage);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const field = (
    label: string,
    value: string,
    key: keyof UserProfileData,
    Icon: React.ElementType,
    placeholder?: string
  ) => (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      ) : (
        <p className="text-sm font-semibold text-slate-800 break-words">
          {value || <span className="text-slate-400 font-normal">—</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ---------- Header card ---------- */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-emerald-300 shrink-0">
            {initials || '--'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 mb-2">
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleMeta.tag}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
              {draft.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {draft.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {draft.phone}
              </span>
              {(role === 'collector' || role === 'recycler') && (
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {L('Verified', 'सत्यापित', 'सत्यापित')}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {L('Save', 'सेव करें', 'सेव्ह करा')}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {L('Cancel', 'रद्द', 'रद्द')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {L('Edit Profile', 'प्रोफाइल बदलें', 'प्रोफाइल बदला')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Live stats from real datasets ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {role === 'seller'
              ? L('Pickup Requests', 'पिकअप अनुरोध', 'पिकअप विनंत्या')
              : L('Total Transactions', 'कुल लेन-देन', 'एकूण व्यवहार')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {role === 'seller' ? stats.requestCount : stats.transactionCount}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {stats.completedCount} {L('completed', 'पूरे हुए', 'पूर्ण')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {L('Material Handled', 'कुल सामग्री', 'एकूण साहित्य')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.totalWeight.toFixed(1)} kg
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('Traceable to authorized chain', 'औपचारिक चेन में दर्ज', 'औपचारिक साखळीत नोंद')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {role === 'seller'
              ? L('Total Received', 'कुल प्राप्त', 'एकूण मिळाले')
              : L('Total Earnings', 'कुल कमाई', 'एकूण कमाई')}
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {formatINR(stats.totalValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {L('Across all settled lots', 'सभी लॉट मिलाकर', 'सर्व लॉट मिळून')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {role === 'collector'
              ? L('Stock in Hand', 'मौजूदा स्टॉक', 'सध्याचा स्टॉक')
              : L('Rating', 'रेटिंग', 'रेटिंग')}
          </span>
          {role === 'collector' ? (
            <>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.inventoryWeight.toFixed(1)} kg
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                ≈ {formatINR(stats.inventoryValue)}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                {role === 'recycler' ? recyclerRef.rating : 4.7}
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {L('Based on platform feedback', 'प्लेटफॉर्म फीडबैक से', 'प्लॅटफॉर्म फीडबॅकवरून')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ---------- Editable details ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {L('Profile Details', 'प्रोफाइल विवरण', 'प्रोफाइल तपशील')}
            </h2>
            <span className="text-[10px] text-slate-400">
              {L('Saved on this device', 'इसी फोन में सुरक्षित', 'याच फोनमध्ये सुरक्षित')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field(L('Full Name', 'पूरा नाम', 'पूर्ण नाव'), draft.name, 'name', User)}
            {field(L('Mobile Number', 'मोबाइल नंबर', 'मोबाइल नंबर'), draft.phone, 'phone', Phone)}
            {field(L('City / Area', 'शहर / इलाका', 'शहर / भाग'), draft.location, 'location', MapPin)}
            {field(
              role === 'seller'
                ? L('Pickup Address', 'पिकअप पता', 'पिकअप पत्ता')
                : L('Registered Address', 'पंजीकृत पता', 'नोंदणीकृत पत्ता'),
              draft.address,
              'address',
              MapPin
            )}

            {role !== 'seller' &&
              field(
                L('Service Area', 'सेवा क्षेत्र', 'सेवा क्षेत्र'),
                draft.serviceArea,
                'serviceArea',
                Recycle
              )}

            {(role === 'collector' || role === 'recycler') &&
              field(
                role === 'recycler'
                  ? L('CPCB Authorization No.', 'सीपीसीबी लाइसेंस नंबर', 'सीपीसीबी परवाना क्रमांक')
                  : L('Collector Registration ID', 'कलेक्टर पंजीकरण आईडी', 'कलेक्टर नोंदणी क्रमांक'),
                draft.licenseNumber,
                'licenseNumber',
                FileCheck
              )}

            {/* Preferred Language */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Languages className="w-3 h-3" />
                {L('Preferred Language', 'पसंदीदा भाषा', 'पसंतीची भाषा')}
              </label>
              {isEditing ? (
                <select
                  value={draft.preferredLanguage}
                  onChange={(e) =>
                    setDraft({ ...draft, preferredLanguage: e.target.value as Language })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-slate-800">
                  {draft.preferredLanguage === 'hi'
                    ? 'हिन्दी'
                    : draft.preferredLanguage === 'mr'
                    ? 'मराठी'
                    : 'English'}
                </p>
              )}
            </div>

            {/* Payment mode */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3 h-3" />
                {L('Preferred Payment', 'भुगतान का तरीका', 'पेमेंट पद्धत')}
              </label>
              {isEditing ? (
                <select
                  value={draft.paymentMode}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      paymentMode: e.target.value as UserProfileData['paymentMode'],
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="Cash">{L('Cash', 'नकद', 'रोख')}</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">
                    {L('Bank Transfer', 'बैंक ट्रांसफर', 'बँक ट्रान्सफर')}
                  </option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-slate-800">
                  {draft.paymentMode === 'Cash' ? L('Cash', 'नकद', 'रोख') : draft.paymentMode}
                </p>
              )}
            </div>

            {draft.paymentMode !== 'Cash' &&
              field(
                L('UPI ID / Account', 'यूपीआई आईडी / खाता', 'UPI आयडी / खाते'),
                draft.upiId,
                'upiId',
                CreditCard,
                'name@upi'
              )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <p>
              {L(
                'Only the minimum profile required by the E-Waste Rules is stored: ID, preferred language, operating area and transaction history. No Aadhaar, no bank KYC documents are collected.',
                'ई-वेस्ट नियमों के अनुसार सिर्फ जरूरी जानकारी रखी जाती है: आईडी, भाषा, इलाका और लेन-देन इतिहास। आधार या बैंक केवाईसी दस्तावेज नहीं लिए जाते।',
                'ई-वेस्ट नियमांनुसार फक्त आवश्यक माहिती ठेवली जाते: आयडी, भाषा, कार्यक्षेत्र आणि व्यवहार इतिहास. आधार किंवा बँक केवायसी कागदपत्रे घेतली जात नाहीत.'
              )}
            </p>
          </div>
        </div>

        {/* ---------- Right column: role specific card ---------- */}
        <div className="space-y-5">
          {role === 'collector' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                {L('Verification Status', 'सत्यापन स्थिति', 'पडताळणी स्थिती')}
              </h3>
              {[
                {
                  label: L('Mobile verified', 'मोबाइल सत्यापित', 'मोबाइल पडताळला'),
                  ok: true,
                },
                {
                  label: L('Operating area confirmed', 'कार्यक्षेत्र दर्ज', 'कार्यक्षेत्र नोंदवले'),
                  ok: true,
                },
                {
                  label: L('Linked to authorized recycler', 'अधिकृत रीसाइक्लर से जुड़ा', 'अधिकृत रीसायकलरशी जोडले'),
                  ok: true,
                },
                {
                  label: L('Safety training completed', 'सुरक्षा प्रशिक्षण पूरा', 'सुरक्षा प्रशिक्षण पूर्ण'),
                  ok: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                >
                  <span className="text-slate-700">{item.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.ok
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.ok ? L('Done', 'पूरा', 'पूर्ण') : L('Pending', 'बाकी', 'बाकी')}
                  </span>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-slate-500">
                {L('Service area', 'सेवा क्षेत्र', 'सेवा क्षेत्र')}: {collectorRef.serviceArea}
              </div>
            </div>
          )}

          {role === 'recycler' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                {L('Facility & Authorization', 'सुविधा एवं अधिकार', 'सुविधा व अधिकार')}
              </h3>
              <div className="text-xs space-y-2 text-slate-700">
                <p>
                  <span className="text-slate-400">{L('Facility', 'सुविधा', 'सुविधा')}: </span>
                  {recyclerRef.name}
                </p>
                <p>
                  <span className="text-slate-400">{L('License', 'लाइसेंस', 'परवाना')}: </span>
                  <span className="font-mono">{recyclerRef.licenseNumber}</span>
                </p>
                <p>
                  <span className="text-slate-400">{L('Location', 'स्थान', 'ठिकाण')}: </span>
                  {recyclerRef.location}
                </p>
                <p>
                  <span className="text-slate-400">
                    {L('Min. lot size', 'न्यूनतम लॉट', 'किमान लॉट')}:{' '}
                  </span>
                  {recyclerRef.minQuantityKg} kg
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {recyclerRef.materialsAccepted.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(role === 'seller' || role === 'admin') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                {L('Recent Activity', 'हाल की गतिविधि', 'अलीकडील हालचाल')}
              </h3>
              {transactions.slice(0, 4).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{tx.material}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tx.date}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-800 shrink-0">
                    {formatINR(tx.finalPrice)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-xs text-slate-400">
                  {L('No transactions yet.', 'अभी कोई लेन-देन नहीं।', 'अद्याप व्यवहार नाहीत.')}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {L('Open Settings', 'सेटिंग्स खोलें', 'सेटिंग्ज उघडा')}
          </button>
        </div>
      </div>
    </div>
  );
};
