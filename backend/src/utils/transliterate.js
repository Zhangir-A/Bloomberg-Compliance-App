import CyrillicToTranslit from 'cyrillic-to-translit-js';

const cyrillicToLatin = new CyrillicToTranslit({ preset: 'ru' });

// Kazakh-specific Cyrillic to Latin mappings
// These characters are unique to Kazakh and not in Russian
const kazakhMap = {
  'Ә': 'A',
  'ә': 'a',
  'Ғ': 'G',
  'ғ': 'g',
  'Қ': 'K',
  'қ': 'k',
  'Ң': 'N',
  'ң': 'n',
  'Ө': 'O',
  'ө': 'o',
  'Ұ': 'U',
  'ұ': 'u',
  'Ү': 'U',
  'ү': 'u',
  'Һ': 'H',
  'һ': 'h',
  'І': 'I',
  'і': 'i',
};

/**
 * Convert Cyrillic text to Latin characters
 * Handles Russian/Kazakh Cyrillic input
 * @param {string} text - Input text
 * @returns {string} Latinized text
 */
export const toLatinChars = (text) => {
  if (!text) return '';
  try {
    // First handle Kazakh-specific characters
    let processed = text;
    Object.entries(kazakhMap).forEach(([cyrillic, latin]) => {
      processed = processed.replace(new RegExp(cyrillic, 'g'), latin);
    });

    // Then handle Russian characters with the standard library
    return cyrillicToLatin.transform(processed).toLowerCase().trim();
  } catch (err) {
    console.warn(`Transliteration error for "${text}":`, err.message);
    return text.toLowerCase().trim();
  }
};

/**
 * Normalize name for matching: trim, lowercase, remove extra spaces
 * @param {string} name - Input name
 * @returns {string} Normalized name
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0400-\u04FF]/g, ''); // Remove punctuation except Cyrillic
};

/**
 * Convert both Cyrillic and Latin to standardized Latin form
 * @param {string} name - Input name (any script)
 * @returns {string} Standardized Latin form
 */
export const standardizeForMatching = (name) => {
  if (!name) return '';

  // First normalize
  const normalized = normalizeName(name);

  // Check if contains Cyrillic, transliterate if needed
  const hasCyrillic = /[\u0400-\u04FF]/.test(normalized);
  if (hasCyrillic) {
    return toLatinChars(normalized);
  }

  return normalized;
};
