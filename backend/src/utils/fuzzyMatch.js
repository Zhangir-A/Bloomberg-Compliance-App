import fuzz from 'fuzzball';
import { standardizeForMatching } from './transliterate.js';

/**
 * Score confidence level based on fuzzy match score
 * @param {number} score - Fuzzy match score (0-100)
 * @returns {object} { level: string, color: string }
 */
export const scoreToConfidenceLevel = (score) => {
  if (score === 100) return { level: 'Exact Match', color: 'red' };
  if (score >= 85) return { level: 'High Confidence', color: 'yellow' };
  if (score >= 70) return { level: 'Medium Confidence', color: 'yellow' };
  if (score >= 50) return { level: 'Low Confidence', color: 'green' };
  return { level: 'No Match', color: 'green' };
};

/**
 * Calculate fuzzy match score using multiple algorithms
 * Returns highest score from: basic ratio and token_sort_ratio
 * token_sort_ratio handles name order variants (e.g., "Alimov Nurlan" vs "Nurlan Alimov")
 *
 * @param {string} input - Input text (can be Cyrillic or Latin)
 * @param {string} candidate - Candidate from database (Latin)
 * @returns {number} Score 0-100
 */
export const calculateMatchScore = (input, candidate) => {
  if (!input || !candidate) return 0;

  // Standardize both inputs for consistent matching
  const standardizedInput = standardizeForMatching(input);
  const standardizedCandidate = standardizeForMatching(candidate);

  // Algorithm 1: Basic Levenshtein ratio (handles typos)
  const basicRatio = fuzz.ratio(standardizedInput, standardizedCandidate);

  // Algorithm 2: Token sort ratio (handles name order variants)
  const tokenSortRatio = fuzz.token_sort_ratio(standardizedInput, standardizedCandidate);

  // Return highest score
  const score = Math.max(basicRatio, tokenSortRatio);

  return Math.round(score);
};

/**
 * Check if match should be included based on threshold
 * @param {number} score - Fuzzy match score
 * @param {number} threshold - Minimum score to include (default 50)
 * @returns {boolean}
 */
export const meetsThreshold = (score, threshold = 50) => {
  return score >= threshold;
};

/**
 * Rank matches by score (descending)
 * @param {array} matches - Array of match objects with score property
 * @returns {array} Sorted matches
 */
export const rankMatches = (matches) => {
  return matches.sort((a, b) => b.score - a.score);
};
