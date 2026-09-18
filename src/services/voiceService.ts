import { Language, UserRole, MaterialType } from '../types';

export interface VoiceCommandParseResult {
  intent:
    | 'SCAN_MATERIAL'
    | 'PRICE_CHECK'
    | 'FIND_COLLECTOR'
    | 'SHOW_REQUESTS'
    | 'SHOW_TRANSACTIONS'
    | 'SHOW_EARNINGS'
    | 'OPEN_INVENTORY'
    | 'OPEN_SAFETY'
    | 'PRICE_STEP_WEIGHT'
    | 'PRICE_STEP_CONDITION'
    | 'PRICE_STEP_LOCATION'
    | 'CONFIRM_ACTION'
    | 'CANCEL_ACTION'
    | 'UNKNOWN';
  material?: MaterialType;
  weight?: number;
  condition?: 'Good' | 'Used' | 'Damaged';
  location?: string;
  recognizedText: string;
  responseMessageEn: string;
  responseMessageHi: string;
  requiresConfirmation?: boolean;
  confirmationPayload?: any;
}

export const ROLE_SUGGESTED_VOICE_PROMPTS: Record<UserRole, { en: string; hi: string; hint: string }[]> = {
  landing: [
    { en: 'Explore as Seller', hi: 'सेलर के रूप में देखें', hint: 'Browse seller features' },
    { en: 'Check PCB price', hi: 'PCB का भाव बताओ', hint: 'View current scrap rates' },
    { en: 'Find nearby collector', hi: 'पास का कलेक्टर दिखाओ', hint: 'See active collectors' },
  ],
  seller: [
    { en: 'Scan material', hi: 'ई-वेस्ट स्कैन करो', hint: 'Open AI Camera & photo scan' },
    { en: 'PCB ka price batao', hi: 'PCB का भाव बताओ', hint: 'Check fair price for PCB' },
    { en: 'Find nearby collector', hi: 'पास का कलेक्टर दिखाओ', hint: 'Locate verified kabadiwalas' },
    { en: 'Show my requests', hi: 'मेरी रिक्वेस्ट दिखाओ', hint: 'View active doorstep requests' },
    { en: 'Show my transactions', hi: 'लेन-देन दिखाओ', hint: 'View completed scrap sales' },
    { en: 'Open safety guide', hi: 'सुरक्षा नियम दिखाओ', hint: 'Safe handling protocols' },
  ],
  collector: [
    { en: 'Scan material', hi: 'ई-वेस्ट स्कैन करो', hint: 'Verify incoming scrap with AI' },
    { en: 'Show pickup requests', hi: 'पिकअप रिक्वेस्ट दिखाओ', hint: 'View scheduled pickups' },
    { en: 'Show my earnings', hi: 'मेरी कमाई दिखाओ', hint: 'Check net profit & payout history' },
    { en: 'Open inventory', hi: 'स्टॉक दिखाओ', hint: 'Check warehouse bin storage' },
    { en: 'Copper cable ka rate kya hai', hi: 'कॉपर का भाव क्या है', hint: 'Verify recycler rate' },
    { en: 'Show transactions', hi: 'लेन-देन दिखाओ', hint: 'Review past transactions' },
  ],
  recycler: [
    { en: 'View incoming material', hi: 'आने वाली सामग्री दिखाओ', hint: 'Batches en route from collectors' },
    { en: 'View purchase requests', hi: 'खरीद अनुरोध दिखाओ', hint: 'Bulk trade lots' },
    { en: 'View inventory', hi: 'स्टॉक दिखाओ', hint: 'Refining and shredding stock' },
    { en: 'Show transactions', hi: 'लेन-देन दिखाओ', hint: 'Green certificates & settlement' },
  ],
  admin: [
    { en: 'Show anomalies', hi: 'असामान्य लेन-देन दिखाओ', hint: 'Flagged suspicious transactions' },
    { en: 'Show transactions', hi: 'लेन-देन दिखाओ', hint: 'Platform-wide material flow' },
  ],
};

/**
 * Text-To-Speech Speech Synthesis utility with language & pitch control
 */
export function speakText(text: string, language: Language = 'en', rate = 0.95): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device/browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Clamp to a range that stays intelligible on low-end Android TTS engines
  utterance.rate = Math.min(Math.max(rate, 0.5), 1.5);
  utterance.pitch = 1.0;

  // Attempt to select language voice
  const voices = window.speechSynthesis.getVoices();
  if (language === 'mr') {
    // Most entry-level devices ship Hindi but not Marathi — fall back gracefully
    const marathiVoice = voices.find((v) => v.lang.includes('mr') || v.name.includes('Marathi'));
    const hindiFallback = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi'));
    if (marathiVoice) {
      utterance.voice = marathiVoice;
      utterance.lang = 'mr-IN';
    } else if (hindiFallback) {
      utterance.voice = hindiFallback;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'mr-IN';
    }
  } else if (language === 'hi') {
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'hi-IN';
    }
  } else {
    const englishVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = 'en-IN';
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Parses user speech or typed command into role-aware action
 */
export function parseVoiceCommand(
  rawInput: string,
  currentRole: UserRole,
  activeContext?: { step?: string; material?: MaterialType; weight?: number; condition?: string; location?: string }
): VoiceCommandParseResult {
  const text = rawInput.trim().toLowerCase();

  // Check for confirmation words first if in confirmation mode
  if (activeContext?.step === 'confirming_action') {
    if (
      text.includes('yes') ||
      text.includes('continue') ||
      text.includes('haan') ||
      text.includes('ha') ||
      text.includes('theek hai') ||
      text.includes('हाँ') ||
      text.includes('आगे बढ़ो')
    ) {
      return {
        intent: 'CONFIRM_ACTION',
        recognizedText: rawInput,
        responseMessageEn: 'Action confirmed successfully.',
        responseMessageHi: 'कार्यवाही सफलतापूर्वक स्वीकृत की गई।',
      };
    }
    if (
      text.includes('no') ||
      text.includes('cancel') ||
      text.includes('nahi') ||
      text.includes('mat karo') ||
      text.includes('नहीं') ||
      text.includes('रद्द करो')
    ) {
      return {
        intent: 'CANCEL_ACTION',
        recognizedText: rawInput,
        responseMessageEn: 'Action cancelled.',
        responseMessageHi: 'कार्यवाही रद्द कर दी गई।',
      };
    }
  }

  // Multi-step price inquiry conversation context handling
  if (activeContext?.step === 'awaiting_weight') {
    const numMatch = text.match(/\d+(\.\d+)?/);
    if (numMatch) {
      const weightVal = parseFloat(numMatch[0]);
      return {
        intent: 'PRICE_STEP_WEIGHT',
        weight: weightVal,
        recognizedText: rawInput,
        responseMessageEn: `Weight noted: ${weightVal} kg. What is the condition? (Good, Used, or Damaged)`,
        responseMessageHi: `वजन दर्ज: ${weightVal} किलो। स्थिति क्या है? (Good, Used, या Damaged)`,
      };
    }
  }

  if (activeContext?.step === 'awaiting_condition') {
    let cond: 'Good' | 'Used' | 'Damaged' = 'Good';
    if (text.includes('damage') || text.includes('kharab') || text.includes('tuta') || text.includes('खराब')) {
      cond = 'Damaged';
    } else if (text.includes('used') || text.includes('purana') || text.includes('पुराना')) {
      cond = 'Used';
    } else {
      cond = 'Good';
    }
    return {
      intent: 'PRICE_STEP_CONDITION',
      condition: cond,
      recognizedText: rawInput,
      responseMessageEn: `Condition recorded as ${cond}. Please specify city or location (e.g., Chandigarh, Mohali, Delhi, Ludhiana).`,
      responseMessageHi: `स्थिति दर्ज: ${cond}। कृपया अपना शहर या स्थान बताएं (जैसे Chandigarh, Mohali, Delhi, Ludhiana)।`,
    };
  }

  if (activeContext?.step === 'awaiting_location') {
    let city = 'Chandigarh';
    if (text.includes('delhi')) city = 'Delhi';
    else if (text.includes('mohali')) city = 'Mohali';
    else if (text.includes('ludhiana')) city = 'Ludhiana';
    else if (text.includes('amritsar')) city = 'Amritsar';
    else if (text.includes('jammu')) city = 'Jammu';

    return {
      intent: 'PRICE_STEP_LOCATION',
      location: city,
      recognizedText: rawInput,
      responseMessageEn: `Location set to ${city}. Preparing fair price estimate review.`,
      responseMessageHi: `स्थान ${city} दर्ज किया गया। निष्पक्ष मूल्य अनुमान समीक्षा तैयार हो रही है।`,
    };
  }

  // Material extraction helper
  const detectMaterial = (query: string): MaterialType | undefined => {
    if (query.includes('pcb') || query.includes('circuit') || query.includes('motherboard')) return 'PCB / Circuit Board';
    if (query.includes('cable') || query.includes('wire') || query.includes('copper') || query.includes('taar') || query.includes('तार')) return 'Cable / Wire';
    if (query.includes('battery') || query.includes('lithium') || query.includes('cell') || query.includes('बैटरी')) return 'Battery';
    if (query.includes('lcd') || query.includes('led') || query.includes('screen') || query.includes('display')) return 'LCD / LED Display';
    if (query.includes('crt') || query.includes('tv tube') || query.includes('picture tube')) return 'CRT';
    if (query.includes('motor') || query.includes('stator') || query.includes('मोटर')) return 'Motor';
    if (query.includes('hard disk') || query.includes('hdd') || query.includes('drive') || query.includes('डिस्क')) return 'Hard Disk';
    if (query.includes('mobile') || query.includes('phone') || query.includes('smartphone') || query.includes('फोन')) return 'Mobile Phone';
    if (query.includes('laptop') || query.includes('computer') || query.includes('pc') || query.includes('लैपटॉप')) return 'Laptop / Computer';
    if (query.includes('printer') || query.includes('scanner') || query.includes('प्रिंटर')) return 'Printer';
    if (query.includes('adapter') || query.includes('charger') || query.includes('चार्जर')) return 'Adapter / Charger';
    if (query.includes('plastic') || query.includes('प्लास्टिक')) return 'Plastic E-waste';
    if (query.includes('metal') || query.includes('loha') || query.includes('लोहा')) return 'Metal E-waste';
    if (query.includes('mixed') || query.includes('assorted')) return 'Mixed E-waste';
    return undefined;
  };

  // SCAN INTENT
  if (
    text.includes('scan') ||
    text.includes('स्कैन') ||
    text.includes('photo') ||
    text.includes('camera') ||
    text.includes('पहचान') ||
    text.includes('e-waste scan')
  ) {
    return {
      intent: 'SCAN_MATERIAL',
      material: detectMaterial(text),
      recognizedText: rawInput,
      responseMessageEn: 'Opening AI Material Scanner. Upload or snap your e-waste.',
      responseMessageHi: 'एआई मटेरियल स्कैनर खोला जा रहा है। फोटो खींचें या अपलोड करें।',
    };
  }

  // PRICE INTENT (Single shot or initiating multi-step)
  if (
    text.includes('price') ||
    text.includes('rate') ||
    text.includes('bhav') ||
    text.includes('भाव') ||
    text.includes('कीमत') ||
    text.includes('kya hai') ||
    text.includes('kitna') ||
    text.includes('estimate') ||
    text.includes('daam')
  ) {
    const mat = detectMaterial(text) || 'PCB / Circuit Board';
    return {
      intent: 'PRICE_CHECK',
      material: mat,
      recognizedText: rawInput,
      responseMessageEn: `${mat} selected. What is the approximate weight in kilograms?`,
      responseMessageHi: `${mat} चुना गया। लगभग कितना वजन (किलो में) है?`,
    };
  }

  // FIND COLLECTOR INTENT
  if (
    text.includes('collector') ||
    text.includes('kabadi') ||
    text.includes('कबाड़ी') ||
    text.includes('कलेक्टर') ||
    text.includes('dhundho') ||
    text.includes('nearby') ||
    text.includes('pass ka') ||
    text.includes('पास का')
  ) {
    return {
      intent: 'FIND_COLLECTOR',
      recognizedText: rawInput,
      responseMessageEn: 'Locating nearby verified scrap collectors in your sector.',
      responseMessageHi: 'आपके क्षेत्र में नजदीकी सत्यापित कबाड़ीवाले दिखाए जा रहे हैं।',
    };
  }

  // REQUESTS INTENT
  if (
    text.includes('request') ||
    text.includes('pickup') ||
    text.includes('रिक्वेस्ट') ||
    text.includes('पिकअप') ||
    text.includes('meri request') ||
    text.includes('मेरी रिक्वेस्ट')
  ) {
    return {
      intent: 'SHOW_REQUESTS',
      recognizedText: rawInput,
      responseMessageEn: 'Opening your doorstep pickup requests.',
      responseMessageHi: 'आपकी पिकअप रिक्वेस्ट खोली जा रही है।',
    };
  }

  // TRANSACTIONS INTENT
  if (
    text.includes('transaction') ||
    text.includes('history') ||
    text.includes('लेन-देन') ||
    text.includes('bill') ||
    text.includes('receipt')
  ) {
    return {
      intent: 'SHOW_TRANSACTIONS',
      recognizedText: rawInput,
      responseMessageEn: 'Displaying complete transaction records.',
      responseMessageHi: 'सभी लेन-देन विवरण दिखाए जा रहे हैं।',
    };
  }

  // EARNINGS INTENT (Collector)
  if (
    text.includes('earning') ||
    text.includes('kamai') ||
    text.includes('कमाई') ||
    text.includes('profit') ||
    text.includes('munafa') ||
    text.includes('मुनाफा')
  ) {
    return {
      intent: 'SHOW_EARNINGS',
      recognizedText: rawInput,
      responseMessageEn: 'Opening collector earnings and revenue analytics.',
      responseMessageHi: 'कलेक्टर कमाई और मुनाफा रिपोर्ट खोली जा रही है।',
    };
  }

  // INVENTORY INTENT
  if (
    text.includes('inventory') ||
    text.includes('stock') ||
    text.includes('स्टॉक') ||
    text.includes('mal') ||
    text.includes('गोदाम')
  ) {
    return {
      intent: 'OPEN_INVENTORY',
      recognizedText: rawInput,
      responseMessageEn: 'Opening storage inventory and bin warehouse manager.',
      responseMessageHi: 'गोदाम स्टॉक और इन्वेंट्री खोली जा रही है।',
    };
  }

  // SAFETY INTENT
  if (
    text.includes('safety') ||
    text.includes('suraksha') ||
    text.includes('सुरक्षा') ||
    text.includes('guide') ||
    text.includes('niyam') ||
    text.includes('नियम')
  ) {
    return {
      intent: 'OPEN_SAFETY',
      recognizedText: rawInput,
      responseMessageEn: 'Displaying hazardous e-waste safety precautions.',
      responseMessageHi: 'ई-वेस्ट सुरक्षा एवं निवारण निर्देश दिखाए जा रहे हैं।',
    };
  }

  return {
    intent: 'UNKNOWN',
    recognizedText: rawInput,
    responseMessageEn: "Sorry, I didn't understand that command. Try asking for PCB price, scanning material, or finding a collector.",
    responseMessageHi: 'क्षमा करें, यह कमांड समझ नहीं आई। कृपया "PCB का भाव बताओ", "सामग्री स्कैन करो" या "कलेक्टर दिखाओ" कहें।',
  };
}
