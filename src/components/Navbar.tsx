import React, { useState } from 'react';
import {
  Recycle,
  Bell,
  Search,
  Languages,
  User,
  Menu,
  X,
  ChevronDown,
  Check,
  ShieldCheck,
  ArrowRightLeft,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { UserRole, Language, AppNotification } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface NavbarProps {
  currentRole: UserRole;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSwitchRole: () => void;
  onNavigateHome: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  isOnline?: boolean;
  pendingSyncCount?: number;
  /** Live profile values so the navbar reflects edits made on the Profile page */
  profileName?: string;
  profileLocation?: string;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubscription?: () => void;
  isSubscribedCurrentRole?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  language,
  onLanguageChange,
  onSwitchRole,
  onNavigateHome,
  notifications = [],
  onMarkNotificationAsRead,
  onToggleMobileMenu,
  isMobileMenuOpen,
  isOnline = true,
  pendingSyncCount = 0,
  profileName,
  profileLocation,
  onOpenProfile,
  onOpenNotifications,
  onOpenSubscription,
  isSubscribedCurrentRole = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  const roleLabel = {
    landing: 'Demo Mode',
    seller: language === 'hi' ? 'विक्रेता (सेलर)' : 'Seller Account',
    collector: language === 'hi' ? 'कबाड़ीवाला (कलेक्टर)' : 'Collector Account',
    recycler: language === 'hi' ? 'रीसाइक्लर (प्रमाणित)' : 'Recycler Partner',
    admin: language === 'hi' ? 'एडमिन (PMU)' : 'Admin (PMU)',
  }[currentRole];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            {currentRole !== 'landing' && (
              <button
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group text-left focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Recycle className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                    {t.appName}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    AI Ready
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 hidden md:block line-clamp-1 font-normal">
                  {t.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Center Search (only in active dashboard mode) */}
          {currentRole !== 'landing' && (
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Controls: Role Badge, Language, Notification, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline / Sync Status */}
            {currentRole !== 'landing' && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={
                  isOnline
                    ? language === 'hi'
                      ? 'ऑनलाइन • डेटा सिंक हो चुका है'
                      : 'Online • data synced'
                    : language === 'hi'
                    ? 'ऑफलाइन • डेटा फोन पर सुरक्षित, इंटरनेट आने पर सिंक होगा'
                    : 'Offline • saved on device, will sync when back online'
                }
              >
                {isOnline ? (
                  pendingSyncCount > 0 ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5" />
                  )
                ) : (
                  <WifiOff className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">
                  {isOnline
                    ? pendingSyncCount > 0
                      ? language === 'hi'
                        ? `सिंक हो रहा है (${pendingSyncCount})`
                        : `Syncing (${pendingSyncCount})`
                      : language === 'hi'
                      ? 'ऑनलाइन'
                      : 'Online'
                    : language === 'hi'
                    ? `ऑफलाइन • ${pendingSyncCount} लंबित`
                    : `Offline • ${pendingSyncCount} pending`}
                </span>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'hi'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिंदी में बदलें"
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('mr')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'mr'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="मराठीत बदला"
              >
                मराठी
              </button>
            </div>

            {/* Role Switcher Pill */}
            {currentRole !== 'landing' && (
              <button
                onClick={onSwitchRole}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70 transition-colors text-xs font-medium"
                title="Switch between Seller, Collector, and Recycler"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>{roleLabel}</span>
              </button>
            )}

            {/* Subscribe / Pro Plan button */}
            {currentRole !== 'landing' && onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSubscribedCurrentRole
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/70'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title={
                  isSubscribedCurrentRole
                    ? language === 'hi'
                      ? 'आपकी सक्रिय सब्सक्रिप्शन देखें'
                      : 'View your active subscription'
                    : language === 'hi'
                    ? 'सब्सक्रिप्शन प्लान देखें'
                    : 'View subscription plans'
                }
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {isSubscribedCurrentRole
                    ? language === 'hi'
                      ? 'प्रो सक्रिय'
                      : language === 'mr'
                      ? 'प्रो सक्रिय'
                      : 'Pro Active'
                    : language === 'hi'
                    ? 'सब्सक्राइब करें'
                    : language === 'mr'
                    ? 'सबस्क्राइब करा'
                    : 'Subscribe'}
                </span>
              </button>
            )}

            {/* Notifications Dropdown */}
            {currentRole !== 'landing' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {t.notifications}
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Live Simulation</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {safeNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationAsRead?.(n.id)}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800">
                              {language === 'hi' ? n.titleHi : n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timeAgo}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {language === 'hi' ? n.messageHi : n.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                      {onOpenNotifications ? (
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onOpenNotifications();
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          {language === 'hi'
                            ? 'सभी सूचनाएं देखें'
                            : language === 'mr'
                            ? 'सर्व सूचना पहा'
                            : 'View all notifications'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'सभी लेन-देन की सूचनाएं यहां दिखती हैं'
                            : 'Real-time trace alerts for pickup & recycling updates'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Switch Role / Login button on landing */}
            {currentRole === 'landing' ? (
              <div className="flex items-center gap-2">
                {onOpenSubscription && (
                  <button
                    onClick={onOpenSubscription}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'hi' ? 'प्लान्स देखें' : language === 'mr' ? 'प्लॅन्स पहा' : 'View Plans'}</span>
                  </button>
                )}
                <button
                  onClick={onSwitchRole}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <span>{language === 'hi' ? 'डेमो लॉगिन' : 'Demo Login'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* User Profile button — opens the Profile page */
              <button
                type="button"
                onClick={onOpenProfile}
                title={language === 'en' ? 'Open profile' : 'प्रोफाइल खोलें'}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 rounded-r-lg py-1 pr-1.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs shadow-inner">
                  {currentRole === 'seller' ? 'RV' : currentRole === 'collector' ? 'RK' : currentRole === 'admin' ? 'PMU' : 'GC'}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    {profileName
                      ? profileName.replace(/\(.*?\)/g, '').trim()
                      : currentRole === 'seller'
                      ? 'Rahul Verma'
                      : currentRole === 'collector'
                      ? 'Ravi Kumar'
                      : currentRole === 'admin'
                      ? 'State PMU Cell'
                      : 'GreenCycle'}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {profileLocation ||
                      (currentRole === 'seller'
                        ? 'Chandigarh'
                        : currentRole === 'collector'
                        ? 'Mohali'
                        : currentRole === 'admin'
                        ? 'State EPR Cell'
                        : 'Derabassi')}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
