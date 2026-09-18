export type UserRole = 'landing' | 'seller' | 'collector' | 'recycler' | 'admin';

export type Language = 'en' | 'hi' | 'mr';

export interface SubscriptionPlan {
  id: string;
  role: UserRole; // which role's demo this plan unlocks ('seller' | 'collector' | 'recycler' | 'admin')
  name: string;
  nameHi: string;
  nameMr: string;
  priceMonthly: number; // ₹ per month — kept deliberately affordable
  tagline: string;
  taglineHi: string;
  taglineMr: string;
  benefits: string[];
  benefitsHi: string[];
  benefitsMr: string[];
  highlight?: boolean; // marks a "Most Popular" plan
  color: 'emerald' | 'teal' | 'slate' | 'indigo';
}

export interface ActiveSubscription {
  planId: string;
  role: UserRole;
  subscribedAt: string;
}

export type MaterialCategory =
  | 'PCB / Circuit Board'
  | 'Cable / Wire'
  | 'Battery'
  | 'LCD / LED Display'
  | 'CRT'
  | 'Motor'
  | 'Hard Disk'
  | 'Mobile Phone'
  | 'Laptop / Computer'
  | 'Printer'
  | 'Adapter / Charger'
  | 'Plastic E-waste'
  | 'Metal E-waste'
  | 'Mixed E-waste';

export type MaterialType =
  | MaterialCategory
  | 'PCB'
  | 'Copper Cable'
  | 'Lithium Battery'
  | 'Lead Acid Battery'
  | 'LCD Screen'
  | 'CRT Monitor'
  | 'Electric Motor'
  | 'Hard Disk (HDD)'
  | 'Printer / Scanner'
  | 'Laptop';

export interface AIScanResult {
  material: MaterialType;
  confidence: number;
  condition: 'Good' | 'Used' | 'Damaged';
  category: string;
  estimatedWeight?: number;
  description?: string;
  imageUrl?: string;
}

export interface PriceEstimateInput {
  material: MaterialType;
  condition: 'Good' | 'Used' | 'Damaged';
  weightKg: number;
  location: string;
  quantity?: number;
}

export interface PriceEstimateResult {
  material: MaterialType;
  condition: 'Good' | 'Used' | 'Damaged';
  weightKg: number;
  location: string;
  estimatedRatePerKg: number;
  estimatedValue: number;
  expectedRange: {
    min: number;
    max: number;
  };
  confidence: 'High' | 'Medium';
  priceBreakdown: string;
  explanation: string;
  disclaimer: string;
  trendHistory: { day: string; rate: number }[];
}

export type VoiceAssistantState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export type RequestStatus = 'new' | 'accepted' | 'scheduled' | 'collected' | 'completed' | 'rejected';

export interface PickupRequest {
  id: string;
  sellerName: string;
  sellerPhone: string;
  location: string;
  distanceKm: number;
  material: MaterialType;
  weightKg: number;
  estimatedValue: number;
  preferredDate: string;
  preferredTime: string;
  address: string;
  status: RequestStatus;
  createdAt: string;
  specialInstructions?: string;
  pendingSync?: boolean;
}

export interface CollectorProfile {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  serviceArea: string;
  distanceKm: number;
  materialsAccepted: MaterialType[];
  pickupAvailable: boolean;
  estimatedRateMultiplier: number; // e.g. 1.0 = standard
  avatarUrl?: string;
  completedCollections: number;
}

export interface RecyclerProfile {
  id: string;
  name: string;
  authorized: boolean;
  licenseNumber: string;
  location: string;
  distanceKm: number;
  materialsAccepted: MaterialType[];
  buyingRates: Record<string, number>;
  minQuantityKg: number;
  pickupAvailable: boolean;
  rating: number;
  contactEmail: string;
  contactPhone: string;
  /** Who issued the authorization, e.g. "Central Pollution Control Board (CPCB)" */
  issuingAuthority?: string;
  /** Date (or year) the E-Waste (Management) Rules, 2022 registration was granted */
  licenseIssuedOn?: string;
  /** Date the registration is valid until, if known */
  licenseValidTill?: string;
  /** How the platform itself verified this recycler before onboarding, shown to collectors for transparency */
  verificationMethod?: string;
  /** ISO date the platform admin last re-checked this recycler's registration */
  lastVerifiedOn?: string;
}

export interface InventoryItem {
  id: string;
  material: MaterialType;
  weightKg: number;
  condition?: 'Good' | 'Used' | 'Damaged / Scrap';
  estimatedRatePerKg: number;
  storageLocation?: string;
  lastUpdated: string;
}

export type RecyclerFacility = RecyclerProfile;

export interface TransactionRecord {
  id: string;
  date: string;
  material: MaterialType;
  weightKg: number;
  collectorName: string;
  recyclerName: string;
  pickupLocation: string;
  quotedPrice: number;
  finalPrice: number;
  status: 'Completed' | 'Processing' | 'In Transit' | 'Collected';
  traceabilityStage: 'Seller' | 'Collector' | 'Authorized Recycler' | 'Under Processing' | 'Recycled';
  sellerName?: string;
  anomalyStatus?: 'normal' | 'suspicious';
  anomalyReason?: string;
  batchId?: string;
  handoverId?: string;
  geoLat?: number;
  geoLng?: number;
  geoCapturedAt?: string;
}

export interface MaterialPriceInfo {
  material: MaterialType;
  category: string;
  indicativeRatePerKg: number;
  minRate: number;
  maxRate: number;
  changeWeekPercent: number;
  history30Days: { day: string; rate: number }[];
  locationRates: { city: string; rate: number }[];
}

export interface SafetyGuideItem {
  id: string;
  category: string;
  categoryHi: string;
  title: string;
  titleHi: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  instructions: string[];
  instructionsHi: string[];
  dos: string[];
  donts: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  timeAgo: string;
  read: boolean;
  type: 'pickup' | 'price' | 'recycler' | 'system' | 'safety';
}
