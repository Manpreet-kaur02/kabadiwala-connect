import { Language } from '../types';

/**
 * Small translation helper so components can inline en/hi/mr strings
 * without maintaining a huge central dictionary.
 *
 * Usage:  const L = makeL(language);  L('Profile', 'प्रोफाइल', 'प्रोफाइल')
 * If a Marathi string is not supplied, the Hindi string is used as fallback.
 */
export const makeL =
  (language: Language) =>
  (en: string, hi: string, mr?: string): string => {
    if (language === 'hi') return hi;
    if (language === 'mr') return mr || hi;
    return en;
  };

export const formatINR = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;
