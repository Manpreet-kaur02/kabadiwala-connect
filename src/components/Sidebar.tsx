import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Calculator,
  Search,
  Truck,
  FileText,
  TrendingUp,
  ShieldAlert,
  Bell,
  User,
  Settings,
  Store,
  Layers,
  CircleDollarSign,
  Users,
  Compass,
  Building2,
  PackageCheck,
  CheckCircle,
  HelpCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { UserRole, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSwitchRole: () => void;
  profileName?: string;
  profileLocation?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  language,
  isMobileOpen,
  onCloseMobile,
  onSwitchRole,
  profileName,
  profileLocation,
}) => {
  const t = TRANSLATIONS[language];

  // Define nav links for each role
  const getNavItems = () => {
    if (currentRole === 'seller') {
      return [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'sell-ewaste', label: t.sellEWaste, icon: Truck, highlight: true },
        { id: 'ai-scanner', label: t.aiScanner, icon: ScanLine, badge: 'AI' },
        { id: 'price-estimate', label: t.priceEstimate, icon: Calculator },
        { id: 'find-collector', label: t.findCollector, icon: Search },
        { id: 'my-requests', label: t.myRequests, icon: PackageCheck },
        { id: 'transactions', label: t.transactions, icon: FileText },
        { id: 'price-history', label: t.priceHistory, icon: TrendingUp },
        { id: 'safety-guide', label: t.safetyGuide, icon: ShieldAlert },
        { id: 'notifications', label: t.notifications, icon: Bell },
        { id: 'profile', label: t.profile, icon: User },
        { id: 'settings', label: t.settings, icon: Settings },
      ];
    }

    if (currentRole === 'collector') {
      return [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'pickup-requests', label: t.pickupRequests, icon: Truck, badge: '3 New' },
        { id: 'my-collections', label: t.myCollections, icon: PackageCheck },
        { id: 'ai-scanner', label: t.aiScanner, icon: ScanLine, badge: 'AI' },
        { id: 'price-checker', label: t.priceChecker, icon: Calculator },
        { id: 'nearby-sellers', label: language === 'hi' ? 'आस-पास के सेलर' : 'Nearby Sellers', icon: Compass },
        { id: 'recycler-marketplace', label: t.recyclerMarketplace, icon: Store, highlight: true },
        { id: 'inventory', label: t.inventory, icon: Layers },
        { id: 'transactions', label: t.transactions, icon: FileText },
        { id: 'earnings', label: t.earnings, icon: CircleDollarSign },
        { id: 'price-history', label: t.priceHistory, icon: TrendingUp },
        { id: 'safety-guide', label: t.safetyGuide, icon: ShieldAlert },
        { id: 'notifications', label: t.notifications, icon: Bell },
        { id: 'profile', label: t.profile, icon: User },
        { id: 'settings', label: t.settings, icon: Settings },
      ];
    }

    if (currentRole === 'admin') {
      return [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'notifications', label: t.notifications, icon: Bell },
        { id: 'profile', label: t.profile, icon: ShieldCheck },
        { id: 'settings', label: t.settings, icon: Settings },
      ];
    }

    // Recycler Preview Navigation
    return [
      { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
      { id: 'incoming-material', label: language === 'hi' ? 'आने वाली सामग्री' : 'Incoming Material', icon: Truck, badge: 'Active' },
      { id: 'purchase-requests', label: language === 'hi' ? 'खरीद अनुरोध' : 'Purchase Requests', icon: Store },
      { id: 'inventory', label: t.inventory, icon: Layers },
      { id: 'transactions', label: t.transactions, icon: FileText },
      { id: 'collectors', label: language === 'hi' ? 'संबद्ध कबाड़ी' : 'Collectors Network', icon: Users },
      { id: 'analytics', label: language === 'hi' ? 'एनालिटिक्स' : 'Analytics', icon: TrendingUp },
      { id: 'notifications', label: t.notifications, icon: Bell },
      { id: 'profile', label: t.profile, icon: Building2 },
      { id: 'settings', label: t.settings, icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role Identity Tag */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {currentRole === 'seller'
                  ? 'Household / Seller'
                  : currentRole === 'collector'
                  ? 'Informal Collector'
                  : currentRole === 'admin'
                  ? 'Admin / PMU'
                  : 'Authorized Recycler'}
              </span>
            </div>
            <button
              onClick={onSwitchRole}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              {t.switchRole}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {profileName
              ? `${profileName.replace(/\(.*?\)/g, '').trim()}${
                  profileLocation ? ` • ${profileLocation}` : ''
                }`
              : currentRole === 'seller'
              ? 'Rahul Verma • Chandigarh'
              : currentRole === 'collector'
              ? 'Ravi Scrap • Sector 35'
              : 'GreenCycle Pvt Ltd • Derabassi'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : item.highlight
                    ? 'bg-slate-800/80 text-emerald-300 hover:bg-slate-800 hover:text-white border border-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Quick Switch & Demo Badge */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 mb-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart E-Waste Network</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {language === 'hi'
                ? 'अनौपचारिक कबाड़ी को औपचारिक रिसाइक्लिंग से जोड़ने वाला भारत का पहला डिजिटल सेतु।'
                : 'Empowering informal scrap workers with transparent digital market access.'}
            </p>
          </div>

          <button
            onClick={onSwitchRole}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अन्य रोल देखें' : 'Change User Role'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
