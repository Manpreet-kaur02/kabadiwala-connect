import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  CheckCircle2,
  Truck,
  Phone,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CollectorProfile, MaterialType, Language } from '../../types';
import { INITIAL_COLLECTORS, TRANSLATIONS } from '../../data/mockData';

interface FindCollectorViewProps {
  language: Language;
  onBookCollector: (collector: CollectorProfile) => void;
  onRequestGenericPickup: () => void;
}

export const FindCollectorView: React.FC<FindCollectorViewProps> = ({
  language,
  onBookCollector,
  onRequestGenericPickup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [pickupOnly, setPickupOnly] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<CollectorProfile | null>(null);

  const filteredCollectors = INITIAL_COLLECTORS.filter((col) => {
    if (searchQuery && !col.name.toLowerCase().includes(searchQuery.toLowerCase()) && !col.serviceArea.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedMaterial !== 'all' && !col.materialsAccepted.includes(selectedMaterial as MaterialType)) {
      return false;
    }
    if (col.distanceKm > maxDistance) {
      return false;
    }
    if (verifiedOnly && !col.verified) {
      return false;
    }
    if (pickupOnly && !col.pickupAvailable) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'नजदीकी कबाड़ीवाला खोजें' : 'Find Nearby E-Waste Collectors'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? 'सत्यापित स्थानीय कबाड़ीवालों से जुड़ें, तुरंत पिकअप शेडयूल करें और सर्वोत्तम मूल्य प्राप्त करें।'
              : 'Discover trusted scrap collectors servicing your neighborhood in Chandigarh & Mohali.'}
          </p>
        </div>

        <button
          onClick={onRequestGenericPickup}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'hi' ? 'खुला पिकअप अनुरोध भेजें' : 'Post General Pickup Request'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'कलेक्टर का नाम या इलाका खोजें...' : 'Search collector name, area, sector...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Material Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value="all">All Materials Accepted</option>
              <option value="PCB">PCB Boards</option>
              <option value="Copper Cable">Copper Cable</option>
              <option value="Lithium Battery">Lithium Battery</option>
              <option value="Laptop">Laptop / PCs</option>
              <option value="LCD Screen">LCD Screens</option>
            </select>
          </div>

          {/* Max Distance Filter */}
          <div className="w-full md:w-44">
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value={3}>Within 3 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
            </select>
          </div>
        </div>

        {/* Toggle Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="text-slate-700 font-medium">Verified Identity Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pickupOnly}
              onChange={(e) => setPickupOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="text-slate-700 font-medium">Doorstep Pickup Available</span>
          </label>

          <span className="text-slate-400 ml-auto">
            Showing {filteredCollectors.length} collectors nearby
          </span>
        </div>
      </div>

      {/* Collector Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCollectors.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Name, Verification, Rating, Distance */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{col.name}</h3>
                    {col.verified && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{col.serviceArea}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{col.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({col.reviewsCount})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                    {col.distanceKm} km away
                  </span>
                </div>
              </div>

              {/* Badges / Attributes */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {col.completedCollections} collections done
                </span>
                <span className={`px-2 py-0.5 rounded-md font-medium ${
                  col.pickupAvailable ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {col.pickupAvailable ? '✓ Free Pickup Available' : 'Drop-off Yard Only'}
                </span>
              </div>

              {/* Materials Accepted */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Materials Accepted
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {col.materialsAccepted.map((mat) => (
                    <span
                      key={mat}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`tel:${col.phone}`}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call {col.phone}</span>
              </a>

              <button
                onClick={() => onBookCollector(col)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Request Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCollectors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-semibold text-slate-700">No collectors matched your current filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try increasing the distance slider or selecting all materials.</p>
          <button
            onClick={() => {
              setMaxDistance(25);
              setSelectedMaterial('all');
              setVerifiedOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
