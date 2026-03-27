import { calculateMatchScore, rankMatches, meetsThreshold } from '../utils/fuzzyMatch.js';

/**
 * Orchestrate fuzzy matching across multiple data sources
 * Returns matches ranked by confidence score
 *
 * @param {string} input - User input (name, can be Cyrillic or Latin)
 * @param {array} candidates - Array of candidate records from DB
 * @param {string} sourceType - Type of source (SANCTIONS, PEP, ADVERSE_MEDIA)
 * @returns {array} Matched records with scores
 */
export async function fuzzyMatchCandidates(input, candidates, sourceType) {
  const matches = candidates
    .map(candidate => ({
      ...candidate.toJSON ? candidate.toJSON() : candidate,
      score: calculateMatchScore(input, candidate.name_latin),
      sourceType,
    }))
    .filter(m => meetsThreshold(m.score, 50)) // Minimum 50% threshold
    .map(m => ({
      ...m,
      match_id: `${sourceType}-${m.id}`,
    }));

  return rankMatches(matches);
}

/**
 * Combine results from multiple sources
 * Remove duplicates, maintain ranking
 *
 * @param {array} sanctionsMatches - Matches from sanctions_list
 * @param {array} pepMatches - Matches from pep_profiles
 * @param {array} mediaMatches - Matches from adverse_media
 * @returns {array} Combined, ranked results
 */
export function combineResults(sanctionsMatches = [], pepMatches = [], mediaMatches = []) {
  // Combine all matches
  const allMatches = [
    ...sanctionsMatches.map(m => ({ ...m, resultType: 'SANCTIONS' })),
    ...pepMatches.map(m => ({ ...m, resultType: 'PEP' })),
    ...mediaMatches.map(m => ({ ...m, resultType: 'ADVERSE_MEDIA' })),
  ];

  // Remove exact duplicates (same name, same source)
  const seen = new Set();
  const deduplicated = allMatches.filter(match => {
    const key = `${match.name_latin}-${match.resultType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Rank by score (highest first)
  return rankMatches(deduplicated);
}

/**
 * Format match results for API response
 * Includes confidence level, colors, source info
 *
 * @param {array} matches - Ranked matches
 * @param {number} limit - Maximum results to return
 * @returns {array} Formatted matches for frontend
 */
export function formatForResponse(matches, limit = 10) {
  return matches.slice(0, limit).map(match => {
    let confidence = '';
    let color = '';

    if (match.score === 100) {
      confidence = 'Exact Match';
      color = 'red';
    } else if (match.score >= 85) {
      confidence = 'High Confidence';
      color = 'yellow';
    } else if (match.score >= 70) {
      confidence = 'Medium Confidence';
      color = 'yellow';
    } else if (match.score >= 50) {
      confidence = 'Low Confidence';
      color = 'green';
    }

    // Build result object based on type
    const baseResult = {
      id: match.id,
      name: match.name_latin,
      score: match.score,
      confidence,
      color,
      sourceType: match.resultType,
      match_id: match.match_id,
    };

    // Add type-specific fields
    switch (match.resultType) {
      case 'SANCTIONS':
        return {
          ...baseResult,
          listSource: match.list_source,
          dob: match.dob,
          nationality: match.nationality,
          listDate: match.list_date,
        };

      case 'PEP':
        return {
          ...baseResult,
          tier: match.tier,
          position: match.position,
          organization: match.organization,
          isActive: match.is_active,
          pepId: match.pep_id,
        };

      case 'ADVERSE_MEDIA':
        return {
          ...baseResult,
          headline: match.headline,
          category: match.category,
          date: match.date,
          source: match.source,
        };

      default:
        return baseResult;
    }
  });
}
