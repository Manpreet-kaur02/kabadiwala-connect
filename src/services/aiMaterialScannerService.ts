import { AIScanResult, MaterialCategory, MaterialType } from '../types';

export const STANDARD_MATERIAL_CATEGORIES: MaterialCategory[] = [
  'PCB / Circuit Board',
  'Cable / Wire',
  'Battery',
  'LCD / LED Display',
  'CRT',
  'Motor',
  'Hard Disk',
  'Mobile Phone',
  'Laptop / Computer',
  'Printer',
  'Adapter / Charger',
  'Plastic E-waste',
  'Metal E-waste',
  'Mixed E-waste',
];

export interface SampleEwasteItem {
  id: string;
  name: string;
  category: MaterialCategory;
  confidence: number;
  condition: 'Good' | 'Used' | 'Damaged';
  componentCategory: string;
  defaultWeightKg: number;
  imageUrl: string;
  description: string;
}

export const SAMPLE_EWASTE_ITEMS: SampleEwasteItem[] = [
  {
    id: 'sample-pcb',
    name: 'Computer Motherboard / Green PCB',
    category: 'PCB / Circuit Board',
    confidence: 0.94,
    condition: 'Good',
    componentCategory: 'Electronic Component',
    defaultWeightKg: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=70',
    description: 'High-grade FR4 printed circuit board with gold/copper contacts and SMD components.',
  },
  {
    id: 'sample-cable',
    name: 'Copper Wire & Electrical Cable Harness',
    category: 'Cable / Wire',
    confidence: 0.91,
    condition: 'Used',
    componentCategory: 'Electrical & Wiring',
    defaultWeightKg: 10.0,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=70',
    description: 'Insulated industrial copper wiring with high recovery grade purity.',
  },
  {
    id: 'sample-battery',
    name: 'Lithium-Ion Battery Pack',
    category: 'Battery',
    confidence: 0.89,
    condition: 'Used',
    componentCategory: 'Hazardous Energy Storage',
    defaultWeightKg: 3.5,
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=70',
    description: 'Secondary Li-Ion cell battery module requiring authorized hydrometallurgical recycling.',
  },
  {
    id: 'sample-laptop',
    name: 'Business Laptop Unit',
    category: 'Laptop / Computer',
    confidence: 0.95,
    condition: 'Good',
    componentCategory: 'Whole Unit Computing',
    defaultWeightKg: 2.8,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=70',
    description: 'Complete laptop computer with intact motherboard, display, and aluminum/magnesium chassis.',
  },
  {
    id: 'sample-motor',
    name: 'Industrial Heavy Electric Motor',
    category: 'Motor',
    confidence: 0.90,
    condition: 'Used',
    componentCategory: 'Heavy Ferrous & Copper',
    defaultWeightKg: 18.0,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=70',
    description: 'Electric stator and copper rotor core with magnetic iron frame.',
  },
  {
    id: 'sample-hdd',
    name: '3.5" Enterprise Hard Disk Drive',
    category: 'Hard Disk',
    confidence: 0.96,
    condition: 'Good',
    componentCategory: 'Data Storage Component',
    defaultWeightKg: 1.5,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=70',
    description: 'Magnetic hard drive platter containing rare earth neodymium magnets and aluminum alloy.',
  },
];

/**
 * Service function to simulate:
 * POST /predict/material
 *
 * In a production deployment, this would be replaced with:
 * const response = await fetch('/api/predict/material', { method: 'POST', body: formData });
 * return await response.json();
 */
export async function predictMaterial(
  imageSource: File | string,
  suggestedMaterial?: MaterialType
): Promise<AIScanResult> {
  // Simulate network & AI inference latency (1.0 - 1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1100));

  let matchedSample: SampleEwasteItem | undefined;

  if (typeof imageSource === 'string') {
    matchedSample = SAMPLE_EWASTE_ITEMS.find(
      (s) => s.imageUrl === imageSource || s.id === imageSource || s.category === imageSource
    );
  } else if (imageSource instanceof File) {
    const filename = imageSource.name.toLowerCase();
    if (filename.includes('wire') || filename.includes('cable') || filename.includes('copper')) {
      matchedSample = SAMPLE_EWASTE_ITEMS[1];
    } else if (filename.includes('battery') || filename.includes('cell')) {
      matchedSample = SAMPLE_EWASTE_ITEMS[2];
    } else if (filename.includes('laptop') || filename.includes('macbook') || filename.includes('dell')) {
      matchedSample = SAMPLE_EWASTE_ITEMS[3];
    } else if (filename.includes('motor')) {
      matchedSample = SAMPLE_EWASTE_ITEMS[4];
    } else if (filename.includes('hdd') || filename.includes('disk')) {
      matchedSample = SAMPLE_EWASTE_ITEMS[5];
    } else {
      matchedSample = SAMPLE_EWASTE_ITEMS[0];
    }
  }

  if (suggestedMaterial) {
    const fromCat = SAMPLE_EWASTE_ITEMS.find((s) => s.category === suggestedMaterial);
    if (fromCat) matchedSample = fromCat;
  }

  const selected = matchedSample || SAMPLE_EWASTE_ITEMS[0];

  return {
    material: selected.category,
    confidence: selected.confidence,
    condition: selected.condition,
    category: selected.componentCategory,
    estimatedWeight: undefined, // Per requirement: Not detected — Enter manually
    description: selected.description,
    imageUrl: typeof imageSource === 'string' ? imageSource : selected.imageUrl,
  };
}
