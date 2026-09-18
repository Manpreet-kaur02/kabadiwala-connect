import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  X,
  Sliders,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { MaterialCategory, MaterialType, Language, AIScanResult } from '../../types';
import {
  predictMaterial,
  SAMPLE_EWASTE_ITEMS,
  STANDARD_MATERIAL_CATEGORIES,
} from '../../services/aiMaterialScannerService';
import { speakText } from '../../services/voiceService';

interface AIMaterialScannerProps {
  language: Language;
  onUseResult: (material: MaterialType, condition: 'Good' | 'Used' | 'Damaged', weight?: number) => void;
  onClose?: () => void;
  isModal?: boolean;
  roleContext?: 'seller' | 'collector';
}

export const AIMaterialScanner: React.FC<AIMaterialScannerProps> = ({
  language,
  onUseResult,
  onClose,
  isModal = false,
  roleContext = 'seller',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_EWASTE_ITEMS[0].imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<AIScanResult | null>(null);
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [editableMaterial, setEditableMaterial] = useState<MaterialType>('PCB / Circuit Board');
  const [editableCondition, setEditableCondition] = useState<'Good' | 'Used' | 'Damaged'>('Good');
  const [manualWeight, setManualWeight] = useState<number | ''>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, WEBP).');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setScanResult(null);
      setIsEditingResult(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setScanResult(null);
      setIsEditingResult(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_EWASTE_ITEMS[0]) => {
    setSelectedFile(null);
    setSelectedImage(sample.imageUrl);
    setScanResult(null);
    setIsEditingResult(false);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setScanResult(null);
    setIsEditingResult(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage && !selectedFile) return;

    setIsAnalyzing(true);
    setScanResult(null);
    setIsEditingResult(false);
    setCameraError(null);

    try {
      const source = selectedFile || selectedImage || '';
      const result = await predictMaterial(source);
      setScanResult(result);
      setEditableMaterial(result.material);
      setEditableCondition(result.condition);
    } catch (err) {
      console.error(err);
      setCameraError('Failed to analyze image. Please try again or choose a sample.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakResult = () => {
    if (!scanResult) return;
    if (language === 'hi') {
      speakText(`यह ${scanResult.material} सामग्री प्रतीत होती है। सटीकता ${Math.round(scanResult.confidence * 100)} प्रतिशत है।`, 'hi');
    } else {
      speakText(`This material is identified as ${scanResult.material} with ${Math.round(scanResult.confidence * 100)}% confidence.`, 'en');
    }
  };

  const handleConfirmAndProceed = () => {
    const finalMaterial = isEditingResult ? editableMaterial : scanResult?.material || 'PCB / Circuit Board';
    const finalCondition = isEditingResult ? editableCondition : scanResult?.condition || 'Good';
    const finalWeight = typeof manualWeight === 'number' && manualWeight > 0 ? manualWeight : undefined;

    onUseResult(finalMaterial, finalCondition, finalWeight);
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Material Recognition (Phase 2 Prototype)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'एआई मटेरियल स्कैनर' : 'AI Material Scanner'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'तस्वीर का उपयोग करके ई-कचरे की सामग्री को तुरंत पहचानें।'
              : 'Identify e-waste materials using a photo.'}
          </p>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Preview vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Live Preview Area */}
        <div className="lg:col-span-6 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 transition-all text-center flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : selectedImage
                ? 'border-slate-300 bg-slate-900'
                : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/50'
            }`}
          >
            {selectedImage ? (
              <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden group">
                <img
                  src={selectedImage}
                  alt="Scrap Preview"
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Laser scan animation overlay while analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                    <div className="w-full h-1 bg-emerald-400 absolute top-0 animate-[bounce_2s_infinite] shadow-lg shadow-emerald-400" />
                    <RefreshCw className="w-10 h-10 text-emerald-300 animate-spin mb-3" />
                    <span className="text-white text-sm font-bold tracking-wide">
                      {language === 'hi' ? 'आपके ई-कचरे का विश्लेषण हो रहा है...' : 'Analyzing your e-waste...'}
                    </span>
                    <span className="text-emerald-200 text-xs mt-1">
                      {language === 'hi' ? 'एआई सामग्री की पहचान कर रहा है...' : 'AI is identifying the material...'}
                    </span>
                  </div>
                )}

                {/* Remove Image Button */}
                {!isAnalyzing && (
                  <button
                    onClick={handleClearImage}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full backdrop-blur-xs transition-colors shadow-md"
                    title="Remove selected image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    📷 Upload or capture e-waste
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Drag and drop your photo here, or use the buttons below to upload or open your camera.
                  </p>
                </div>
              </div>
            )}

            {/* Hidden Input Handles */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Action Row for Upload / Camera */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Image'}</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'कैमरा चालू करें' : 'Use Camera'}</span>
            </button>

            <button
              onClick={handleStartAnalysis}
              disabled={!selectedImage || isAnalyzing}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                !selectedImage || isAnalyzing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'hi' ? 'जाँच हो रही है...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सामग्री का विश्लेषण करें' : 'Analyze Material'}</span>
                </>
              )}
            </button>
          </div>

          {cameraError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Demo Sample Gallery */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {language === 'hi' ? 'या डेमो सैंपल में से चुनें:' : 'Or Select a Demo Sample:'}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SAMPLE_EWASTE_ITEMS.map((sample) => {
                const isSelected = selectedImage === sample.imageUrl;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-1 rounded-xl border text-left transition-all group relative overflow-hidden ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-12 object-cover rounded-lg"
                    />
                    <span className="text-[10px] font-semibold text-slate-700 block truncate mt-1">
                      {sample.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Card */}
        <div className="lg:col-span-6 space-y-4">
          {scanResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    AI
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Result</h3>
                    <span className="text-[11px] text-slate-500">
                      Synthetic computer vision identification
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSpeakResult}
                  className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Identification details */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Detected Material
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {scanResult.material}
                  </div>
                </div>

                {/* Confidence Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Confidence</span>
                    <span className="font-black text-emerald-600">
                      {Math.round(scanResult.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(scanResult.confidence * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Condition</span>
                    <span className="text-sm font-bold text-slate-800">
                      {scanResult.condition}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Category</span>
                    <span className="text-sm font-bold text-slate-800 truncate block">
                      {scanResult.category}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-amber-900 block">
                    Estimated Weight
                  </span>
                  <span className="text-xs text-amber-700 font-medium">
                    Not detected — Enter manually
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="e.g. 5 kg"
                      value={manualWeight}
                      onChange={(e) =>
                        setManualWeight(e.target.value ? parseFloat(e.target.value) : '')
                      }
                      className="w-32 px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">kg (optional)</span>
                  </div>
                </div>

                {/* Edit result panel if toggled */}
                {isEditingResult && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Edit AI Classification
                    </span>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        Select Correct Category
                      </label>
                      <select
                        value={editableMaterial}
                        onChange={(e) => setEditableMaterial(e.target.value as MaterialType)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        {STANDARD_MATERIAL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Condition</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Good', 'Used', 'Damaged'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditableCondition(c)}
                            className={`py-1 text-xs rounded-lg border font-medium ${
                              editableCondition === c
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleConfirmAndProceed}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {roleContext === 'collector'
                      ? 'Use This Result (Generate Offer)'
                      : 'Use This Result'}
                  </span>
                </button>

                <button
                  onClick={() => setIsEditingResult(!isEditingResult)}
                  className="w-full sm:w-auto py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditingResult ? 'Done Editing' : 'Edit Result'}</span>
                </button>

                <button
                  onClick={handleClearImage}
                  className="w-full sm:w-auto py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Item</span>
                </button>
              </div>

              {/* Demo notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                ℹ️ <strong>Demo Simulation:</strong> This AI scanner runs on synthetic prototype logic. Future deployments connect to <code className="text-slate-600">POST /predict/material</code>.
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="text-sm font-bold text-slate-700">
                  Ready to Detect Materials
                </h4>
                <p className="text-xs text-slate-500">
                  Select an image or a sample on the left, then click <strong>"Analyze Material"</strong> to identify composition, condition, and recyclability.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
