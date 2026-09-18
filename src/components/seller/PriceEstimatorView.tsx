import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Scale,
  RefreshCw,
  Bookmark,
  Volume2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { MaterialCategory, MaterialType, Language, PriceEstimateResult } from '../../types';
import {
  predictPrice,
  INDIAN_LOCATIONS,
  getSpokenEstimatedPrice,
  DEMO_BASE_RATES,
} from '../../services/aiPricingService';
import { STANDARD_MATERIAL_CATEGORIES } from '../../services/aiMaterialScannerService';
import { speakText } from '../../services/voiceService';
import { LineTrendChart } from '../common/SimpleCharts';

interface PriceEstimatorViewProps {
  language: Language;
  initialMaterial?: MaterialType;
  initialWeight?: number;
  initialCondition?: 'Good' | 'Used' | 'Damaged';
  initialLocation?: string;
  onRequestCollector: (material: MaterialType, weight: number, estValue: number) => void;
}

export const PriceEstimatorView: React.FC<PriceEstimatorViewProps> = ({
  language,
  initialMaterial = 'PCB / Circuit Board',
  initialWeight = 5.0,
  initialCondition = 'Good',
  initialLocation = 'Chandigarh',
  onRequestCollector,
}) => {
  // Step-by-step form state
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(initialMaterial);
  const [condition, setCondition] = useState<'Good' | 'Used' | 'Damaged'>(initialCondition);
  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [location, setLocation] = useState<string>(initialLocation);
  const [quantity, setQuantity] = useState<number>(1);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [estimateResult, setEstimateResult] = useState<PriceEstimateResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTrendRange, setActiveTrendRange] = useState<'7d' | '30d'>('7d');

  // Trigger initial calculation
  useEffect(() => {
    runEstimate(initialMaterial, initialCondition, initialWeight, initialLocation);
  }, []);

  // Update if initial props change (e.g. from Scanner or Voice)
  useEffect(() => {
    if (initialMaterial) setSelectedMaterial(initialMaterial);
    if (initialWeight) setWeightKg(initialWeight);
    if (initialCondition) setCondition(initialCondition);
    if (initialLocation) setLocation(initialLocation);
    runEstimate(
      initialMaterial || selectedMaterial,
      initialCondition || condition,
      initialWeight || weightKg,
      initialLocation || location
    );
  }, [initialMaterial, initialWeight, initialCondition, initialLocation]);

  const runEstimate = async (
    mat = selectedMaterial,
    cond = condition,
    wt = weightKg,
    loc = location
  ) => {
    setIsCalculating(true);
    setIsSaved(false);
    try {
      const res = await predictPrice({
        material: mat,
        condition: cond,
        weightKg: wt,
        location: loc,
        quantity,
      });
      setEstimateResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSpeakPrice = () => {
    if (!estimateResult) return;
    const speech = getSpokenEstimatedPrice(estimateResult.material, estimateResult.estimatedValue, language);
    speakText(speech, language);
  };

  const handleSaveEstimate = () => {
    setIsSaved(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Price Estimator (Phase 2)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'एआई निष्पक्ष मूल्य अनुमानक' : 'AI Price Estimator'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'hi'
            ? 'सामग्री, स्थिति, वजन और स्थान के आधार पर पारदर्शी बाजार मूल्य प्राप्त करें।'
            : 'Get indicative fair market prices based on material, condition, weight and regional scrap benchmarks.'}
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Step-by-Step Parameter Configuration (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'अनुमान चरण (Steps)' : 'Step-by-Step Inputs'}</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Interactive
            </span>
          </div>

          {/* STEP 1: Material */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>{language === 'hi' ? 'कदम 1: सामग्री चुनें' : 'Step 1: Material'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                ~₹{DEMO_BASE_RATES[selectedMaterial] || 200}/kg
              </span>
            </div>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value as MaterialType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {STANDARD_MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} (Base ₹{DEMO_BASE_RATES[cat] || 200}/kg)
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              <span>{language === 'hi' ? 'कदम 2: स्थिति' : 'Step 2: Condition'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Good', 'Used', 'Damaged'] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    condition === cond
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Weight in kg */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              <span>{language === 'hi' ? 'कदम 3: वजन (kg)' : 'Step 3: Weight (in kg)'}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">kg</span>
            </div>
          </div>

          {/* STEP 4: Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                4
              </span>
              <span>{language === 'hi' ? 'कदम 4: स्थान (Location)' : 'Step 4: Location'}</span>
            </label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {INDIAN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* STEP 5: Quantity (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center font-bold">
                  5
                </span>
                <span>{language === 'hi' ? 'कदम 5: संख्या (Quantity)' : 'Step 5: Quantity (Optional)'}</span>
              </label>
              <span className="text-[10px] text-slate-400">Units</span>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={() => runEstimate()}
            disabled={isCalculating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'hi' ? 'गणना हो रही है...' : 'Calculating estimated value...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'निष्पक्ष कीमत का अनुमान लगाएं' : 'Estimate Fair Price'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result Card & Trends (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isCalculating ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                Calculating estimated value...
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Comparing regional benchmark prices, physical wear adjustments, and active bulk demand.
              </p>
            </div>
          ) : estimateResult ? (
            <>
              {/* Main Fair Price Result Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-emerald-900/50">
                <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      FAIR PRICE ESTIMATE
                    </span>
                  </div>

                  <button
                    onClick={handleSpeakPrice}
                    className="p-2 bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Speak estimated value"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Listen</span>
                  </button>
                </div>

                {/* Material & Specs badge line */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-bold text-white">
                    {estimateResult.material}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-slate-300">
                    {estimateResult.condition} Condition
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-slate-300">
                    {estimateResult.weightKg} kg
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-emerald-300">
                    📍 {estimateResult.location}
                  </span>
                </div>

                {/* Primary Price Metric */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      Estimated Value:
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                      <span>₹{estimateResult.estimatedValue.toLocaleString('en-IN')}</span>
                      <button
                        onClick={handleSpeakPrice}
                        className="p-1.5 text-emerald-400 hover:text-white transition-colors"
                        title="Read aloud"
                      >
                        🔊
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Expected Range:{' '}
                      <strong className="text-white font-semibold">
                        ₹{estimateResult.expectedRange.min.toLocaleString('en-IN')} – ₹
                        {estimateResult.expectedRange.max.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 text-left sm:text-right">
                    <span className="text-[11px] text-slate-300 uppercase block font-semibold">
                      Estimated Rate:
                    </span>
                    <div className="text-xl font-bold text-emerald-300">
                      ₹{estimateResult.estimatedRatePerKg}{' '}
                      <span className="text-xs font-normal text-white/70">/ kg</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                      Confidence: {estimateResult.confidence}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Price Breakdown
                  </span>
                  <p className="text-sm font-bold text-emerald-300 mt-0.5">
                    {estimateResult.priceBreakdown}
                  </p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {estimateResult.explanation}
                  </p>
                </div>

                {/* Action Buttons Row */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() =>
                      onRequestCollector(
                        estimateResult.material,
                        estimateResult.weightKg,
                        estimateResult.estimatedValue
                      )
                    }
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Request Collector</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSaveEstimate}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isSaved
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{isSaved ? 'Estimate Saved ✓' : 'Save Estimate'}</span>
                  </button>

                  <button
                    onClick={() => runEstimate()}
                    className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recalculate</span>
                  </button>
                </div>
              </div>

              {/* Price Trend Chart Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {estimateResult.material} Scrap Rate Benchmark
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Regional indicative trends for {estimateResult.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      onClick={() => setActiveTrendRange('7d')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        activeTrendRange === '7d'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      7-Day
                    </button>
                    <button
                      onClick={() => setActiveTrendRange('30d')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        activeTrendRange === '30d'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      30-Day
                    </button>
                  </div>
                </div>

                <LineTrendChart data={estimateResult.trendHistory} height={120} />
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Indicative Estimate Disclaimer</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-800">
                  {estimateResult.disclaimer}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
