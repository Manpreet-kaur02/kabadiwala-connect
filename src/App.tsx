import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Language,
  PickupRequest,
  InventoryItem,
  TransactionRecord,
  MaterialType,
  CollectorProfile,
  RecyclerFacility,
  AppNotification,
  SubscriptionPlan,
  ActiveSubscription,
} from './types';
import {
  INITIAL_PICKUP_REQUESTS,
  INITIAL_COLLECTOR_INVENTORY as INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_COLLECTORS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Toast } from './components/common/Toast';

// Seller Components
import { SellerDashboard } from './components/seller/SellerDashboard';
import { PriceEstimatorView } from './components/seller/PriceEstimatorView';
import { FindCollectorView } from './components/seller/FindCollectorView';
import { SellerRequestsView } from './components/seller/SellerRequestsView';
import { SellStartHubView } from './components/seller/SellStartHubView';
import { PriceHistoryView } from './components/seller/PriceHistoryView';
import { SafetyGuideView } from './components/seller/SafetyGuideView';
import { AIScannerModal } from './components/seller/AIScannerModal';
import { PickupRequestFormModal } from './components/seller/PickupRequestFormModal';
import { TraceabilityModal } from './components/seller/TraceabilityModal';

// Collector Components
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { PickupRequestsManager } from './components/collector/PickupRequestsManager';
import { CollectorInventoryView } from './components/collector/CollectorInventoryView';
import { CollectorPriceChecker } from './components/collector/CollectorPriceChecker';
import { DigitalWeighingModal } from './components/collector/DigitalWeighingModal';
import { BulkSaleModal } from './components/collector/BulkSaleModal';
import { RecyclerMarketplaceView } from './components/collector/RecyclerMarketplaceView';
import { EarningsLedgerView } from './components/collector/EarningsLedgerView';
import { CollectorTransactionsView } from './components/collector/CollectorTransactionsView';

// Recycler Components
import { RecyclerDashboard } from './components/recycler/RecyclerDashboard';

// Admin / PMU Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Phase 2: Common & Voice Components
import { AIMaterialScanner } from './components/common/AIMaterialScanner';
import { VoiceAssistantModal, FloatingVoiceTrigger } from './components/voice/VoiceAssistantModal';

// Shared account views (Profile / Settings / Notifications)
import { ProfileView, UserProfileData } from './components/common/ProfileView';
import { SettingsView, AppSettings, DEFAULT_SETTINGS } from './components/common/SettingsView';
import { NotificationsView } from './components/common/NotificationsView';
import { NearbySellersView } from './components/collector/NearbySellersView';

// Recycler sub-tab views
import {
  RecyclerIncomingView,
  RecyclerPurchaseRequestsView,
  RecyclerInventoryView,
  RecyclerTransactionsView,
  RecyclerCollectorsView,
  RecyclerAnalyticsView,
} from './components/recycler/RecyclerTabViews';

import { speakText } from './services/voiceService';

export default function App() {
  // Application State
  const [role, setRole] = useState<UserRole>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Offline-first support: local persistence key + helpers
  const LOCAL_DB_KEY = 'kabadiwala-connect-local-db-v1';

  const loadLocalDb = (): {
    requests?: PickupRequest[];
    inventory?: InventoryItem[];
    transactions?: TransactionRecord[];
    notifications?: AppNotification[];
  } => {
    try {
      const raw = window.localStorage.getItem(LOCAL_DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const savedDb = loadLocalDb();

  // Core Datasets State (hydrated from on-device local storage when available,
  // simulating the SQLite offline-first store described in the problem statement)
  const [requests, setRequests] = useState<PickupRequest[]>(savedDb.requests || INITIAL_PICKUP_REQUESTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(savedDb.inventory || INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(savedDb.transactions || INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(savedDb.notifications || INITIAL_NOTIFICATIONS);

  // Connectivity + Sync Queue State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // ---------------------------------------------------------------
  // App Settings (persisted separately so a data reset can keep them)
  // ---------------------------------------------------------------
  const SETTINGS_KEY = 'kabadiwala-connect-settings-v1';
  const PROFILES_KEY = 'kabadiwala-connect-profiles-v1';

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // ---------------------------------------------------------------
  // Per-role profiles (Collector Dataset / minimal profile in the PS)
  // ---------------------------------------------------------------
  const DEFAULT_PROFILES: Record<string, UserProfileData> = {
    seller: {
      name: 'Rahul Verma',
      phone: '+91 98765 43210',
      location: 'Sector 35-C, Chandigarh',
      address: 'House No. 1242, Sector 35-C, Chandigarh, 160035',
      preferredLanguage: 'en',
      paymentMode: 'UPI',
      upiId: 'rahulverma@okaxis',
      serviceArea: '',
      licenseNumber: '',
    },
    collector: {
      name: 'Ravi Kumar (रवि कबाड़ीवाला)',
      phone: '+91 98881 23456',
      location: 'Sector 35, Chandigarh',
      address: 'Scrap Yard, Behind Sector 38 Market, Chandigarh',
      preferredLanguage: 'hi',
      paymentMode: 'Cash',
      upiId: '',
      serviceArea: 'Sector 15 to 45, Chandigarh & Mohali',
      licenseNumber: 'KC-COL-2026-0184',
    },
    recycler: {
      name: 'GreenCycle Recycling Pvt. Ltd.',
      phone: '+91 172 400 2210',
      location: 'Derabassi, Punjab',
      address: 'Plot 22, Industrial Focal Point, Derabassi, SAS Nagar',
      preferredLanguage: 'en',
      paymentMode: 'Bank Transfer',
      upiId: 'greencycle@hdfcbank',
      serviceArea: 'Chandigarh Tricity + Patiala belt',
      licenseNumber: 'DL-EW-2024-0091',
    },
    admin: {
      name: 'State PMU Cell',
      phone: '+91 172 274 0000',
      location: 'Chandigarh',
      address: 'State EPR Monitoring Cell, Secretariat, Chandigarh',
      preferredLanguage: 'en',
      paymentMode: 'Bank Transfer',
      upiId: '',
      serviceArea: 'Statewide',
      licenseNumber: 'PMU-EW-2026',
    },
  };

  const [profiles, setProfiles] = useState<Record<string, UserProfileData>>(() => {
    try {
      const raw = window.localStorage.getItem(PROFILES_KEY);
      return raw ? { ...DEFAULT_PROFILES, ...JSON.parse(raw) } : DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  // ---------------------------------------------------------------
  // Subscription (demo): one active role-based plan at a time, persisted
  // separately so a data reset can leave a paying (demo) subscriber's plan intact
  // ---------------------------------------------------------------
  const SUBSCRIPTION_KEY = 'kabadiwala-connect-subscription-v1';

  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(() => {
    try {
      const raw = window.localStorage.getItem(SUBSCRIPTION_KEY);
      return raw ? (JSON.parse(raw) as ActiveSubscription) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (activeSubscription) {
        window.localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(activeSubscription));
      } else {
        window.localStorage.removeItem(SUBSCRIPTION_KEY);
      }
    } catch {
      /* non-fatal */
    }
  }, [activeSubscription]);

  // Modals State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerContextRole, setScannerContextRole] = useState<'seller' | 'collector'>('seller');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState<boolean>(false);
  const [isBulkSaleModalOpen, setIsBulkSaleModalOpen] = useState<boolean>(false);
  const [preselectedRecyclerId, setPreselectedRecyclerId] = useState<string | null>(null);
  const [selectedTraceTx, setSelectedTraceTx] = useState<TransactionRecord | null>(null);
  const [weighingTargetRequest, setWeighingTargetRequest] = useState<PickupRequest | null>(null);
  const [targetCollectorForBooking, setTargetCollectorForBooking] = useState<CollectorProfile | null>(null);

  // Prefill state from Scanner / Quick actions
  const [estimatorPrefill, setEstimatorPrefill] = useState<{
    material: MaterialType;
    weight: number;
    condition: 'Good' | 'Used' | 'Damaged';
    location?: string;
  }>({
    material: 'PCB / Circuit Board',
    weight: 5.0,
    condition: 'Good',
    location: 'Chandigarh',
  });

  const [collectorPricePrefill, setCollectorPricePrefill] = useState<{
    material: MaterialType;
    weight: number;
    condition: 'Good' | 'Used' | 'Damaged';
  }>({
    material: 'Cable / Wire',
    weight: 10.0,
    condition: 'Used',
  });

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // Role Switch Handler
  // Derived: how many locally-created records are still waiting for a sync to the server
  const pendingSyncCount = requests.filter((r) => r.pendingSync).length;

  // Persist the "local database" to the device on every change (offline-first architecture:
  // core datasets always live on-device first, and are synced to the backend when online)
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCAL_DB_KEY,
        JSON.stringify({ requests, inventory, transactions, notifications })
      );
    } catch {
      // Storage full or unavailable — non-fatal for the demo prototype
    }
  }, [requests, inventory, transactions, notifications]);

  // Persist settings
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* non-fatal */
    }
  }, [settings]);

  // Persist profiles
  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      /* non-fatal */
    }
  }, [profiles]);

  // Apply accessibility settings globally so they actually affect the UI
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = settings.largeText ? '18px' : '16px';
    root.classList.toggle('kc-high-contrast', settings.highContrast);
  }, [settings.largeText, settings.highContrast]);

  // Listen for connectivity changes and auto-sync any queued offline records
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && settings.autoSync) {
      const syncTimer = setTimeout(() => {
        setRequests((prev) => prev.map((r) => (r.pendingSync ? { ...r, pendingSync: false } : r)));
        showToast(
          language === 'hi'
            ? `${pendingSyncCount} रिकॉर्ड सर्वर से सिंक हो गए`
            : `${pendingSyncCount} offline record(s) synced to server`,
          'success'
        );
      }, 1800);
      return () => clearTimeout(syncTimer);
    }
  }, [isOnline, pendingSyncCount, language, settings.autoSync]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActiveTab('dashboard');
    setIsRoleModalOpen(false);
    setIsMobileMenuOpen(false);
    if (newRole !== 'landing') {
      showToast(`Switched to ${newRole.toUpperCase()} View`, 'info');
    }
  };

  // Subscription Handlers
  const handleSubscribeToPlan = (plan: SubscriptionPlan) => {
    setActiveSubscription({
      planId: plan.id,
      role: plan.role,
      subscribedAt: new Date().toISOString(),
    });
    setRole(plan.role);
    setActiveTab('dashboard');
    setIsRoleModalOpen(false);
    setIsMobileMenuOpen(false);
    showToast(
      language === 'hi'
        ? `${plan.nameHi} सक्रिय — ${plan.role.toUpperCase()} डेमो अब Pro सुविधाओं के साथ`
        : `${plan.name} activated — ${plan.role.toUpperCase()} demo unlocked with Pro benefits`,
      'success'
    );
  };

  const handleCancelSubscription = () => {
    setActiveSubscription(null);
    showToast(
      language === 'hi' ? 'सब्सक्रिप्शन रद्द कर दी गई (डेमो)' : 'Subscription cancelled (demo)',
      'info'
    );
  };

  // Language Toggle Handler
  const handleLanguageToggle = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    showToast(nextLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई' : 'Language switched to English', 'info');
  };

  // Open Scanner modal for Seller
  const handleOpenScannerForSeller = (suggestedMaterial?: MaterialType) => {
    setScannerContextRole('seller');
    setIsScannerOpen(true);
  };

  // Open Scanner modal for Collector
  const handleOpenScannerForCollector = (suggestedMaterial?: MaterialType) => {
    setScannerContextRole('collector');
    setIsScannerOpen(true);
  };

  // Open Scan for specific Collector Request
  const handleOpenScanForRequest = (req: PickupRequest) => {
    setScannerContextRole('collector');
    setCollectorPricePrefill({
      material: req.material,
      weight: req.weightKg,
      condition: 'Used',
    });
    setIsScannerOpen(true);
  };

  // Scanner Complete Handler -> Routes directly to Estimator or Collector Price Checker
  const handleScanComplete = (
    material: MaterialType,
    condition: 'Good' | 'Used' | 'Damaged' = 'Good',
    estimatedWeight?: number
  ) => {
    setIsScannerOpen(false);
    if (scannerContextRole === 'collector' || role === 'collector') {
      setCollectorPricePrefill({
        material,
        condition,
        weight: estimatedWeight || collectorPricePrefill.weight || 10.0,
      });
      setActiveTab('price-checker');
      showToast(`AI verified ${material} (${condition}) — Price Checker offer ready`, 'success');
    } else {
      setEstimatorPrefill({
        material,
        condition,
        weight: estimatedWeight || estimatorPrefill.weight || 5.0,
        location: 'Chandigarh',
      });
      setActiveTab('price-estimate');
      showToast(`Detected ${material} (${condition}) — Check Fair Price Estimate`, 'success');
    }
  };

  // Estimator "Request Collector" click
  const handleEstimatorRequestCollector = (
    material: MaterialType,
    weight: number,
    estValue?: number
  ) => {
    setEstimatorPrefill((prev) => ({ ...prev, material, weight }));
    setTargetCollectorForBooking(INITIAL_COLLECTORS[0]);
    setIsPickupModalOpen(true);
  };

  // Booking from Find Collector list
  const handleBookCollector = (collector: CollectorProfile) => {
    setTargetCollectorForBooking(collector);
    setIsPickupModalOpen(true);
  };

  // Submit new pickup request
  const handleCreatePickupSuccess = (newReq: PickupRequest) => {
    const reqToSave: PickupRequest = { ...newReq, pendingSync: !isOnline };
    setRequests((prev) => [reqToSave, ...prev]);
    if (!isOnline) {
      showToast(
        language === 'hi'
          ? `लॉट ${newReq.id} फोन पर सेव हो गया, इंटरनेट आने पर सिंक होगा`
          : `Lot ${newReq.id} saved offline on device — will sync automatically once online`,
        'warning'
      );
    } else {
      showToast(`Pickup request ${newReq.id} scheduled successfully!`, 'success');
    }
  };

  // Collector actions
  const handleAcceptRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
    );
    showToast('Pickup request accepted! Contacting seller.', 'success');
  };

  const handleDeclineRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    showToast('Request declined and reassigned to nearby collector pool.', 'info');
  };

  const handleScheduleRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'scheduled' } : r))
    );
    showToast('Arrival scheduled with seller.', 'success');
  };

  // Complete digital weighing & payout
  const handleCompletePickupAndPay = (requestId: string, finalWeight: number, finalPayout: number) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // 1. Update Request status to completed
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'completed', weightKg: finalWeight, estimatedValue: finalPayout }
          : r
      )
    );

    // 2. Add to Collector Yard Inventory
    setInventory((prev) => {
      const existing = prev.find((item) => item.material === targetReq.material);
      if (existing) {
        const newQty = Number((existing.weightKg + finalWeight).toFixed(2));
        const newCost = Math.round((existing.estimatedRatePerKg * existing.weightKg + finalPayout) / newQty);
        return prev.map((item) =>
          item.material === targetReq.material
            ? { ...item, weightKg: newQty, estimatedRatePerKg: newCost, lastUpdated: 'Just now' }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: `inv-${Date.now()}`,
            material: targetReq.material,
            weightKg: finalWeight,
            estimatedRatePerKg: Math.round(finalPayout / finalWeight),
            condition: 'Used',
            storageLocation: 'Bin E-10',
            lastUpdated: 'Just now',
          },
        ];
      }
    });

    // 3. Create Transaction Record
    const newTx: TransactionRecord = {
      id: `KC-2026-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      sellerName: targetReq.sellerName,
      collectorName: 'Ravi Scrap Collection',
      recyclerName: 'GreenCycle Recycling Pvt. Ltd.',
      material: targetReq.material,
      weightKg: finalWeight,
      quotedPrice: targetReq.estimatedValue,
      finalPrice: finalPayout,
      status: 'Completed',
      traceabilityStage: 'Collector',
      pickupLocation: targetReq.location,
      batchId: `BATCH-OCT-${Date.now().toString().slice(-4)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Pickup completed! ₹${finalPayout} paid to ${targetReq.sellerName}. Stock added to yard.`, 'success');
  };

  // Bulk Sale to Recycler by Collector
  const handleBulkSaleToRecycler = (
    material: MaterialType,
    weightSoldKg: number,
    recycler: RecyclerFacility,
    totalGrossRevenue: number,
    profit: number
  ) => {
    setInventory((prev) =>
      prev
        .map((item) => {
          if (item.material === material) {
            const rem = Number((item.weightKg - weightSoldKg).toFixed(1));
            return rem > 0 ? { ...item, weightKg: rem } : null;
          }
          return item;
        })
        .filter(Boolean) as InventoryItem[]
    );

    const newTx: TransactionRecord = {
      id: `KC-2026-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      sellerName: 'Sector 38 Depot (Aggregated)',
      collectorName: 'Ravi Scrap Collection',
      recyclerName: recycler.name,
      material,
      weightKg: weightSoldKg,
      quotedPrice: totalGrossRevenue - profit,
      finalPrice: totalGrossRevenue,
      status: 'Processing',
      traceabilityStage: 'Authorized Recycler',
      pickupLocation: 'Chandigarh Industrial Area Phase 1',
      batchId: `LOT-${material.toString().toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Dispatched ${weightSoldKg} kg ${material} to ${recycler.name}. Net Profit: ₹${profit}`, 'success');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast(
      language === 'en' ? 'All notifications marked as read' : 'सभी सूचनाएं पढ़ी हुई कर दी गईं',
      'info'
    );
  };

  // ---------------------------------------------------------------
  // Profile & Settings handlers
  // ---------------------------------------------------------------
  const activeProfile = profiles[role] || profiles.seller;

  const handleSaveProfile = (next: UserProfileData) => {
    setProfiles((prev) => ({ ...prev, [role]: next }));
    showToast(
      language === 'en' ? 'Profile updated and saved on this device' : 'प्रोफाइल सेव हो गई',
      'success'
    );
  };

  /** Manual sync trigger from Settings */
  const handleSyncNow = () => {
    if (!isOnline) {
      showToast(
        language === 'en' ? 'No internet connection right now' : 'अभी इंटरनेट नहीं है',
        'warning'
      );
      return;
    }
    const count = pendingSyncCount;
    setRequests((prev) => prev.map((r) => (r.pendingSync ? { ...r, pendingSync: false } : r)));
    showToast(
      language === 'en'
        ? `${count} offline record(s) synced to server`
        : `${count} रिकॉर्ड सर्वर से सिंक हो गए`,
      'success'
    );
  };

  /** Export all locally held datasets as a JSON file */
  const handleExportData = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        app: 'Kabadiwala Connect',
        version: '1.1-prototype',
        profile: activeProfile,
        settings,
        datasets: { requests, inventory, transactions, notifications },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kabadiwala-connect-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        language === 'en' ? 'Data exported as JSON' : 'डेटा JSON में डाउनलोड हो गया',
        'success'
      );
    } catch {
      showToast('Export failed on this browser.', 'warning');
    }
  };

  /** Wipe the on-device store and restore the demo seed data */
  const handleClearLocalData = () => {
    try {
      window.localStorage.removeItem(LOCAL_DB_KEY);
      window.localStorage.removeItem(PROFILES_KEY);
    } catch {
      /* non-fatal */
    }
    setRequests(INITIAL_PICKUP_REQUESTS);
    setInventory(INITIAL_INVENTORY);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProfiles(DEFAULT_PROFILES);
    showToast(
      language === 'en' ? 'Local data reset to demo seed' : 'लोकल डेटा रीसेट हो गया',
      'info'
    );
  };

  const handleTestVoice = () => {
    const sample =
      language === 'hi'
        ? 'पीसीबी का आज का अनुमानित भाव 180 से 250 रुपये प्रति किलो है।'
        : language === 'mr'
        ? 'पीसीबीचा आजचा अंदाजे दर 180 ते 250 रुपये प्रति किलो आहे.'
        : 'Today the estimated rate for PCB is 180 to 250 rupees per kilogram.';
    speakText(sample, language, settings.speechRate);
    showToast(language === 'en' ? 'Playing voice sample…' : 'आवाज का नमूना चल रहा है…', 'info');
  };

  /**
   * Every tab id a role can render. Anything outside this list falls through to
   * a visible fallback instead of an empty main area.
   */
  const KNOWN_TABS: Record<string, string[]> = {
    seller: [
      'dashboard', 'sell-ewaste', 'ai-scanner', 'price-estimate', 'estimator',
      'find-collector', 'collectors', 'my-requests', 'requests', 'transactions',
      'price-history', 'prices', 'safety-guide', 'safety',
    ],
    collector: [
      'dashboard', 'pickup-requests', 'pickups', 'my-collections', 'ai-scanner',
      'price-checker', 'nearby-sellers', 'nearby', 'recycler-marketplace',
      'sell-recycler', 'inventory', 'transactions', 'earnings', 'price-history',
      'prices', 'safety-guide', 'safety',
    ],
    recycler: [
      'dashboard', 'incoming-material', 'purchase-requests', 'inventory',
      'transactions', 'collectors', 'analytics',
    ],
    admin: ['dashboard'],
  };

  /** Tabs that exist for every role */
  const isSharedTab =
    activeTab === 'profile' || activeTab === 'settings' || activeTab === 'notifications';

  const sharedTabContent = (
    <>
      {activeTab === 'profile' && (
        <ProfileView
          role={role}
          language={language}
          profile={activeProfile}
          onSaveProfile={handleSaveProfile}
          transactions={transactions}
          requests={requests}
          inventory={inventory}
          onChangeLanguage={setLanguage}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsView
          language={language}
          onChangeLanguage={(lang) => {
            setLanguage(lang);
            showToast(
              lang === 'hi'
                ? 'भाषा बदलकर हिंदी कर दी गई'
                : lang === 'mr'
                ? 'भाषा मराठी केली'
                : 'Language switched to English',
              'info'
            );
          }}
          settings={settings}
          onChangeSettings={setSettings}
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          onSyncNow={handleSyncNow}
          onExportData={handleExportData}
          onClearLocalData={handleClearLocalData}
          onTestVoice={handleTestVoice}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsView
          language={language}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        />
      )}
    </>
  );

  // Capture a GPS geo-tag for a transaction's digital handover record
  const handleCaptureGeoTag = (transactionId: string, lat: number, lng: number) => {
    const capturedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? {
              ...tx,
              geoLat: lat,
              geoLng: lng,
              geoCapturedAt: capturedAt,
              handoverId: tx.handoverId || `HO-${tx.id}`,
            }
          : tx
      )
    );
    setSelectedTraceTx((prev) =>
      prev && prev.id === transactionId
        ? { ...prev, geoLat: lat, geoLng: lng, geoCapturedAt: capturedAt, handoverId: prev.handoverId || `HO-${prev.id}` }
        : prev
    );
    showToast(
      language === 'hi' ? 'हैंडओवर GPS स्थान सफलतापूर्वक कैप्चर किया गया' : 'Handover GPS location captured successfully',
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Global Navigation Bar */}
      <Navbar
        currentRole={role}
        language={language}
        onLanguageChange={setLanguage}
        onSwitchRole={() => setIsRoleModalOpen(true)}
        onNavigateHome={() => handleRoleChange('landing')}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        profileName={activeProfile.name}
        profileLocation={activeProfile.location}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        isSubscribedCurrentRole={activeSubscription?.role === role}
        onOpenProfile={() => {
          setActiveTab('profile');
          setIsMobileMenuOpen(false);
        }}
        onOpenNotifications={() => {
          setActiveTab('notifications');
          setIsMobileMenuOpen(false);
        }}
      />

      {/* Primary Layout Engine */}
      {role === 'landing' ? (
        <LandingPage
          language={language}
          onExploreRole={(r) => handleRoleChange(r)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          {/* Role-Specific Sidebar */}
          <Sidebar
            currentRole={role}
            currentTab={activeTab}
            language={language}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onSwitchRole={() => setIsRoleModalOpen(true)}
            profileName={activeProfile.name}
            profileLocation={activeProfile.location}
          />

          {/* Main Dashboard Content Area */}
          <main className="flex-1 min-w-0">
            {/* SHARED VIEWS (available in every role) */}
            {isSharedTab && sharedTabContent}

            {/* Safety net: an unmapped tab shows a message, never a blank page */}
            {!isSharedTab &&
              role !== 'landing' &&
              !(KNOWN_TABS[role] || []).includes(activeTab) && (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xs text-center">
                  <p className="text-sm font-bold text-slate-800">
                    {language === 'en'
                      ? 'This section is not available in the prototype yet.'
                      : 'यह हिस्सा अभी प्रोटोटाइप में उपलब्ध नहीं है।'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'en'
                      ? 'Go back to the dashboard to continue the demo.'
                      : 'डेमो जारी रखने के लिए डैशबोर्ड पर वापस जाएं।'}
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर जाएं'}
                  </button>
                </div>
              )}

            {/* SELLER ROLE VIEWS */}
            {role === 'seller' && !isSharedTab && (
              <>
                {activeTab === 'dashboard' && (
                  <SellerDashboard
                    language={language}
                    requests={requests}
                    transactions={transactions}
                    onOpenScanner={() => handleOpenScannerForSeller()}
                    onOpenEstimator={() => setActiveTab('price-estimate')}
                    onFindCollector={() => setActiveTab('find-collector')}
                    onViewRequestDetails={() => setActiveTab('my-requests')}
                    onViewTransaction={(tx) => setSelectedTraceTx(tx)}
                    onViewAllRequests={() => setActiveTab('my-requests')}
                    onViewAllTransactions={() => setActiveTab('transactions')}
                  />
                )}

                {/* Phase 2: AI Material Scanner Dedicated Page */}
                {activeTab === 'ai-scanner' && (
                  <AIMaterialScanner
                    language={language}
                    roleContext="seller"
                    onUseResult={(mat, cond, wt) => handleScanComplete(mat, cond, wt)}
                  />
                )}

                {/* Phase 2: AI Price Estimator Upgraded Step-by-Step View */}
                {(activeTab === 'price-estimate' || activeTab === 'estimator') && (
                  <PriceEstimatorView
                    language={language}
                    initialMaterial={estimatorPrefill.material}
                    initialWeight={estimatorPrefill.weight}
                    initialCondition={estimatorPrefill.condition}
                    initialLocation={estimatorPrefill.location || 'Chandigarh'}
                    onRequestCollector={handleEstimatorRequestCollector}
                  />
                )}

                {activeTab === 'sell-ewaste' && (
                  <SellStartHubView
                    language={language}
                    requests={requests}
                    transactions={transactions}
                    onOpenScanner={() => handleOpenScannerForSeller()}
                    onOpenEstimator={() => setActiveTab('price-estimate')}
                    onFindCollector={() => setActiveTab('find-collector')}
                    onRequestGenericPickup={() => {
                      setTargetCollectorForBooking(null);
                      setIsPickupModalOpen(true);
                    }}
                  />
                )}

                {(activeTab === 'find-collector' || activeTab === 'collectors') && (
                  <FindCollectorView
                    language={language}
                    onBookCollector={handleBookCollector}
                    onRequestGenericPickup={() => {
                      setTargetCollectorForBooking(null);
                      setIsPickupModalOpen(true);
                    }}
                  />
                )}

                {(activeTab === 'my-requests' || activeTab === 'requests') && (
                  <SellerRequestsView
                    language={language}
                    requests={requests}
                    transactions={transactions}
                    initialTab="requests"
                    lockTab
                    onViewRequestDetails={(req) => {
                      showToast(`Viewing request ${req.id} details`, 'info');
                    }}
                    onViewTransactionTraceability={(tx) => setSelectedTraceTx(tx)}
                    onNewRequest={() => {
                      setTargetCollectorForBooking(null);
                      setIsPickupModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'transactions' && (
                  <SellerRequestsView
                    language={language}
                    requests={requests}
                    transactions={transactions}
                    initialTab="transactions"
                    lockTab
                    onViewRequestDetails={(req) => {
                      showToast(`Viewing request ${req.id} details`, 'info');
                    }}
                    onViewTransactionTraceability={(tx) => setSelectedTraceTx(tx)}
                    onNewRequest={() => {
                      setTargetCollectorForBooking(null);
                      setIsPickupModalOpen(true);
                    }}
                  />
                )}

                {(activeTab === 'price-history' || activeTab === 'prices') && (
                  <PriceHistoryView language={language} />
                )}

                {(activeTab === 'safety-guide' || activeTab === 'safety') && (
                  <SafetyGuideView language={language} />
                )}
              </>
            )}

            {/* COLLECTOR ROLE VIEWS */}
            {role === 'collector' && !isSharedTab && (
              <>
                {activeTab === 'dashboard' && (
                  <CollectorDashboard
                    language={language}
                    requests={requests}
                    inventory={inventory}
                    transactions={transactions}
                    onNavigateToPickups={() => setActiveTab('pickup-requests')}
                    onNavigateToInventory={() => setActiveTab('inventory')}
                    onOpenBulkSale={() => {
                      setPreselectedRecyclerId(null);
                      setIsBulkSaleModalOpen(true);
                    }}
                    onOpenWeighingModal={(req) => setWeighingTargetRequest(req)}
                    onAcceptRequest={handleAcceptRequest}
                    onOpenScanner={() => handleOpenScannerForCollector()}
                    onOpenPriceChecker={() => setActiveTab('price-checker')}
                  />
                )}

                {(activeTab === 'pickup-requests' || activeTab === 'pickups') && (
                  <PickupRequestsManager
                    language={language}
                    requests={requests}
                    initialFilter="all"
                    lockFilter
                    headerTitle={
                      language === 'hi' ? 'नए पिकअप अनुरोध' : 'Incoming Pickup Requests'
                    }
                    headerSubtitle={
                      language === 'hi'
                        ? 'नए अनुरोध स्वीकारें और रास्ते में चल रहे पिकअप देखें।'
                        : 'Accept new requests and manage the ones currently in route.'
                    }
                    onAcceptRequest={handleAcceptRequest}
                    onDeclineRequest={handleDeclineRequest}
                    onScheduleRequest={handleScheduleRequest}
                    onOpenWeighingModal={(req) => setWeighingTargetRequest(req)}
                    onOpenScanForRequest={handleOpenScanForRequest}
                  />
                )}

                {activeTab === 'my-collections' && (
                  <PickupRequestsManager
                    language={language}
                    requests={requests}
                    initialFilter="completed"
                    lockFilter
                    headerTitle={
                      language === 'hi' ? 'मेरा संग्रह इतिहास' : 'My Collections History'
                    }
                    headerSubtitle={
                      language === 'hi'
                        ? 'आपके पहले पूरे किए गए सभी संग्रह यहां हैं।'
                        : 'A record of every pickup you have already weighed in and paid for.'
                    }
                    onAcceptRequest={handleAcceptRequest}
                    onDeclineRequest={handleDeclineRequest}
                    onScheduleRequest={handleScheduleRequest}
                    onOpenWeighingModal={(req) => setWeighingTargetRequest(req)}
                    onOpenScanForRequest={handleOpenScanForRequest}
                  />
                )}

                {/* Phase 2: AI Material Scanner Dedicated Page for Collector */}
                {activeTab === 'ai-scanner' && (
                  <AIMaterialScanner
                    language={language}
                    roleContext="collector"
                    onUseResult={(mat, cond, wt) => handleScanComplete(mat, cond, wt)}
                  />
                )}

                {/* Phase 2: AI-assisted Collector Price Checker View */}
                {activeTab === 'price-checker' && (
                  <CollectorPriceChecker
                    language={language}
                    initialMaterial={collectorPricePrefill.material}
                    initialWeight={collectorPricePrefill.weight}
                    initialCondition={collectorPricePrefill.condition}
                    onOpenScanner={() => handleOpenScannerForCollector()}
                    onGenerateQuote={(mat, wt, offer) => {
                      showToast(
                        `Formal quote created for ${wt} kg ${mat} at ₹${offer.toLocaleString('en-IN')}`,
                        'success'
                      );
                    }}
                  />
                )}

                {activeTab === 'inventory' && (
                  <CollectorInventoryView
                    language={language}
                    inventory={inventory}
                    onOpenBulkSale={() => {
                      setPreselectedRecyclerId(null);
                      setIsBulkSaleModalOpen(true);
                    }}
                    onAddManualStock={() => {
                      showToast('Use "Weigh & Pay" on incoming requests to log verified stock.', 'info');
                    }}
                  />
                )}

                {(activeTab === 'recycler-marketplace' || activeTab === 'sell-recycler') && (
                  <RecyclerMarketplaceView
                    language={language}
                    inventory={inventory}
                    onSellToRecycler={(recyclerId) => {
                      setPreselectedRecyclerId(recyclerId);
                      setIsBulkSaleModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'earnings' && (
                  <EarningsLedgerView
                    language={language}
                    requests={requests}
                    transactions={transactions}
                  />
                )}

                {activeTab === 'transactions' && (
                  <CollectorTransactionsView
                    language={language}
                    transactions={transactions}
                    onViewTraceability={(tx) => setSelectedTraceTx(tx)}
                  />
                )}

                {(activeTab === 'price-history' || activeTab === 'prices') && (
                  <PriceHistoryView language={language} />
                )}

                {(activeTab === 'safety-guide' || activeTab === 'safety') && (
                  <SafetyGuideView language={language} />
                )}

                {/* Nearby sellers / collection opportunities around the collector */}
                {(activeTab === 'nearby-sellers' || activeTab === 'nearby') && (
                  <NearbySellersView
                    language={language}
                    requests={requests}
                    onAcceptRequest={handleAcceptRequest}
                    onViewOnMap={(req) =>
                      showToast(
                        language === 'en'
                          ? `Route to ${req.sellerName} — ${req.location} (${req.distanceKm} km)`
                          : `${req.sellerName} तक रास्ता — ${req.location} (${req.distanceKm} किमी)`,
                        'info'
                      )
                    }
                    onContactLead={(name, phone) =>
                      showToast(`${name} — ${phone}`, 'info')
                    }
                  />
                )}
              </>
            )}

            {/* RECYCLER ROLE VIEWS */}
            {role === 'recycler' && !isSharedTab && (
              <>
                {activeTab === 'dashboard' && (
                  <RecyclerDashboard
                    language={language}
                    transactions={transactions}
                    onViewTraceability={(tx) => setSelectedTraceTx(tx)}
                  />
                )}

                {activeTab === 'incoming-material' && (
                  <RecyclerIncomingView
                    language={language}
                    transactions={transactions}
                    onViewTraceability={(tx) => setSelectedTraceTx(tx)}
                  />
                )}

                {activeTab === 'purchase-requests' && (
                  <RecyclerPurchaseRequestsView
                    language={language}
                    onAction={(msg) => showToast(msg, 'success')}
                  />
                )}

                {activeTab === 'inventory' && (
                  <RecyclerInventoryView language={language} transactions={transactions} />
                )}

                {activeTab === 'transactions' && (
                  <RecyclerTransactionsView
                    language={language}
                    transactions={transactions}
                    onViewTraceability={(tx) => setSelectedTraceTx(tx)}
                  />
                )}

                {activeTab === 'collectors' && (
                  <RecyclerCollectorsView
                    language={language}
                    transactions={transactions}
                    onContact={(name, phone) => showToast(`${name} — ${phone}`, 'info')}
                  />
                )}

                {activeTab === 'analytics' && (
                  <RecyclerAnalyticsView language={language} transactions={transactions} />
                )}
              </>
            )}

            {/* ADMIN / PMU ROLE VIEWS */}
            {role === 'admin' && !isSharedTab && (
              <AdminDashboard
                language={language}
                transactions={transactions}
                requests={requests}
                onViewTraceability={(tx) => setSelectedTraceTx(tx)}
                isOnline={isOnline}
                pendingSyncCount={pendingSyncCount}
              />
            )}
          </main>
        </div>
      )}

      {/* PHASE 2: Global Floating Voice Assistant Mic Button */}
      {settings.voiceEnabled && (
        <FloatingVoiceTrigger
          onClick={() => setIsVoiceModalOpen(true)}
          language={language}
        />
      )}

      {/* PHASE 2: Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentRole={role}
        language={language}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onOpenScanner={(suggestedMat) => {
          if (role === 'collector') {
            handleOpenScannerForCollector(suggestedMat);
          } else {
            handleOpenScannerForSeller(suggestedMat);
          }
        }}
        onOpenPriceEstimator={(mat, wt, cond, loc) => {
          setEstimatorPrefill({
            material: mat || 'PCB / Circuit Board',
            weight: wt || 5.0,
            condition: cond || 'Good',
            location: loc || 'Chandigarh',
          });
          setActiveTab('price-estimate');
        }}
        onOpenFindCollector={() => {
          setActiveTab('find-collector');
        }}
      />

      {/* MODALS */}
      {/* Role Selector Modal */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRole={handleRoleChange}
        language={language}
        onViewPlans={() => {
          setIsRoleModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        language={language}
        activeSubscription={activeSubscription}
        onSubscribe={handleSubscribeToPlan}
        onCancelSubscription={handleCancelSubscription}
        onContinueFree={() => {
          setIsSubscriptionModalOpen(false);
          setIsRoleModalOpen(true);
        }}
      />

      {/* AI Material Recognition Modal */}
      <AIScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        language={language}
        roleContext={scannerContextRole}
      />

      {/* Doorstep Pickup Booking Modal */}
      <PickupRequestFormModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        selectedCollector={targetCollectorForBooking}
        initialMaterial={estimatorPrefill.material}
        initialWeight={estimatorPrefill.weight}
        onSubmitSuccess={handleCreatePickupSuccess}
        language={language}
      />

      {/* Collector Digital Scale & Verification Modal */}
      <DigitalWeighingModal
        isOpen={Boolean(weighingTargetRequest)}
        onClose={() => setWeighingTargetRequest(null)}
        request={weighingTargetRequest}
        onCompletePickup={handleCompletePickupAndPay}
        language={language}
      />

      {/* Collector Bulk Sale to Recycler Modal */}
      <BulkSaleModal
        isOpen={isBulkSaleModalOpen}
        onClose={() => {
          setIsBulkSaleModalOpen(false);
          setPreselectedRecyclerId(null);
        }}
        inventory={inventory}
        onConfirmSale={handleBulkSaleToRecycler}
        language={language}
        preselectedRecyclerId={preselectedRecyclerId}
      />

      {/* End-to-End Traceability Modal */}
      <TraceabilityModal
        isOpen={Boolean(selectedTraceTx)}
        onClose={() => setSelectedTraceTx(null)}
        transaction={selectedTraceTx}
        language={language}
        onCaptureGeoTag={handleCaptureGeoTag}
      />
    </div>
  );
}
