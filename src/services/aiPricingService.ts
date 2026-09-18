import { MaterialType, PriceEstimateInput, PriceEstimateResult, Language } from '../types';

export const DEMO_BASE_RATES: Record<string, number> = {
  'PCB / Circuit Board': 340,
  'PCB': 340,
  'Cable / Wire': 420,
  'Copper Cable': 420,
  'Battery': 105,
  'Lithium Battery': 120,
  'Lead Acid Battery': 95,
  'LCD / LED Display': 180,
  'LCD Screen': 180,
  'CRT': 90,
  'CRT Monitor': 90,
  'Motor': 160,
  'Electric Motor': 160,
  'Hard Disk': 220,
  'Hard Disk (HDD)': 220,
  'Mobile Phone': 300,
  'Laptop / Computer': 280,
  'Laptop': 280,
  'Printer': 100,
  'Printer / Scanner': 100,
  'Adapter / Charger': 180,
  'Plastic E-waste': 45,
  'Metal E-waste': 55,
  'Mixed E-waste': 70,
};

export const INDIAN_LOCATIONS = [
  'Chandigarh',
  'Mohali',
  'Ludhiana',
  'Amritsar',
  'Delhi',
  'Jammu',
];

export const LOCATION_MULTIPLIERS: Record<string, number> = {
  'Chandigarh': 1.0,
  'Mohali': 1.0,
  'Delhi': 1.06,
  'Delhi NCR': 1.06,
  'Ludhiana': 0.98,
  'Amritsar': 0.97,
  'Jammu': 0.95,
};

export const CONDITION_MULTIPLIERS: Record<'Good' | 'Used' | 'Damaged', number> = {
  'Good': 1.12,
  'Used': 1.0,
  'Damaged': 0.82,
};

/**
 * Service function to simulate:
 * POST /predict/price
 *
 * In production:
 * const res = await fetch('/api/predict/price', { method: 'POST', body: JSON.stringify(input) });
 * return await res.json();
 */
export async function predictPrice(input: PriceEstimateInput): Promise<PriceEstimateResult> {
  // Simulate AI inference latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const baseRate = DEMO_BASE_RATES[input.material] || 200;
  const conditionMult = CONDITION_MULTIPLIERS[input.condition] || 1.0;
  const locationMult = LOCATION_MULTIPLIERS[input.location] || 1.0;

  // Weight volume bonus: larger lots get a slight efficiency premium
  const volumeBonus = input.weightKg >= 50 ? 1.05 : input.weightKg >= 15 ? 1.02 : 1.0;

  const estimatedRatePerKg = Math.round(baseRate * conditionMult * locationMult * volumeBonus);
  const totalValue = Math.round(estimatedRatePerKg * input.weightKg);

  // Range calculation
  const minRange = Math.round(totalValue * 0.88);
  const maxRange = Math.round(totalValue * 1.12);

  // Synthetic 7-day and 30-day historical trend
  const trendHistory = [
    { day: 'Day 1', rate: Math.round(estimatedRatePerKg * 0.95) },
    { day: 'Day 5', rate: Math.round(estimatedRatePerKg * 0.97) },
    { day: 'Day 10', rate: Math.round(estimatedRatePerKg * 0.96) },
    { day: 'Day 15', rate: Math.round(estimatedRatePerKg * 0.99) },
    { day: 'Day 20', rate: Math.round(estimatedRatePerKg * 1.01) },
    { day: 'Day 25', rate: Math.round(estimatedRatePerKg * 1.03) },
    { day: 'Today', rate: estimatedRatePerKg },
  ];

  return {
    material: input.material,
    condition: input.condition,
    weightKg: input.weightKg,
    location: input.location,
    estimatedRatePerKg,
    estimatedValue: totalValue,
    expectedRange: {
      min: minRange,
      max: maxRange,
    },
    confidence: 'High',
    priceBreakdown: `${input.weightKg} kg × ₹${estimatedRatePerKg}/kg = ₹${totalValue.toLocaleString('en-IN')}`,
    explanation: 'Estimate considers material, condition, weight, location and historical/demo market information.',
    disclaimer: 'This is an indicative estimate. Final price may vary after physical inspection and actual market conditions.',
    trendHistory,
  };
}

/**
 * Generates spoken sentence for text-to-speech
 */
export function getSpokenEstimatedPrice(
  material: MaterialType,
  totalValue: number,
  language: Language
): string {
  if (language === 'hi') {
    // Return Hindi representation
    return `आपकी अनुमानित कीमत ${totalValue.toLocaleString('hi-IN')} रुपये है।`;
  }
  return `Your estimated value is ₹${totalValue.toLocaleString('en-IN')} rupees.`;
}

/**
 * Generates audio phrase for other events
 */
export function getSpokenNotificationText(type: 'pickupAccepted' | 'nearbyCollectors' | 'detectedPcb', language: Language): string {
  if (language === 'hi') {
    switch (type) {
      case 'pickupAccepted':
        return 'आपकी pickup request स्वीकार कर ली गई है।';
      case 'nearbyCollectors':
        return 'आपके पास तीन नजदीकी collectors उपलब्ध हैं।';
      case 'detectedPcb':
        return 'यह PCB material लगता है।';
    }
  }
  switch (type) {
    case 'pickupAccepted':
      return 'Your pickup request has been accepted.';
    case 'nearbyCollectors':
      return 'You have three nearby collectors available.';
    case 'detectedPcb':
      return 'This looks like PCB material.';
  }
}
