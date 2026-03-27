import { Op } from 'sequelize';
import models from '../models/index.js';
import { standardizeForMatching } from '../utils/transliterate.js';
import { fuzzyMatchCandidates, combineResults, formatForResponse } from './matchingService.js';

/**
 * Perform full screening across all data sources
 * Returns ranked matches with confidence scores
 *
 * @param {object} searchParams - { name, dob, nationality }
 * @returns {object} { request_id, results, response_ms, total_matches }
 */
export async function screenPerson(searchParams) {
  const startTime = Date.now();
  const { name, dob, nationality } = searchParams;

  if (!name) {
    throw new Error('Name is required');
  }

  const standardizedInput = standardizeForMatching(name);

  try {
    // Query all three data sources in parallel
    const [sanctionsCandidates, pepCandidates, mediaCandidates] = await Promise.all([
      querySanctionsList(),
      queryPepProfiles(),
      queryAdverseMedia(),
    ]);

    // Fuzzy match each source
    const [sanctionsMatches, pepMatches, mediaMatches] = await Promise.all([
      fuzzyMatchCandidates(standardizedInput, sanctionsCandidates, 'SANCTIONS'),
      fuzzyMatchCandidates(standardizedInput, pepCandidates, 'PEP'),
      fuzzyMatchCandidates(standardizedInput, mediaCandidates, 'ADVERSE_MEDIA'),
    ]);

    // Combine and deduplicate
    const combinedMatches = combineResults(sanctionsMatches, pepMatches, mediaMatches);

    // Format for API response
    const results = formatForResponse(combinedMatches, 10);

    // Record screening request (audit trail)
    const requestId = generateRequestId();
    const responseMs = Date.now() - startTime;

    await models.ScreeningRequest.create({
      request_id: requestId,
      input_name: name,
      input_dob: dob || null,
      input_nationality: nationality || null,
      match_count: results.length,
      response_ms: responseMs,
    });

    return {
      request_id: requestId,
      query: name,
      response_ms: responseMs,
      total_matches: results.length,
      results,
    };
  } catch (error) {
    console.error('Screening error:', error);
    throw error;
  }
}

/**
 * Query sanctions_list table
 * Returns all records (fuzzy matching done in application)
 *
 * @returns {array} All sanctions list records
 */
async function querySanctionsList() {
  try {
    return await models.SanctionsList.findAll({
      attributes: ['id', 'name_latin', 'name_cyrillic', 'list_source', 'list_date', 'dob', 'nationality'],
      raw: false,
    });
  } catch (error) {
    console.error('Error querying sanctions_list:', error);
    return [];
  }
}

/**
 * Query pep_profiles table
 * Returns active PEPs and recently inactive ones
 *
 * @returns {array} PEP profile records
 */
async function queryPepProfiles() {
  try {
    return await models.PepProfile.findAll({
      where: {
        is_active: true, // Focus on active PEPs
      },
      attributes: [
        'id',
        'pep_id',
        'name_latin',
        'name_cyrillic',
        'tier',
        'position',
        'organization',
        'start_date',
        'end_date',
        'is_active',
      ],
      raw: false,
    });
  } catch (error) {
    console.error('Error querying pep_profiles:', error);
    return [];
  }
}

/**
 * Query adverse_media table
 * Returns recent alerts (last 90 days)
 *
 * @returns {array} Adverse media records
 */
async function queryAdverseMedia() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return await models.AdverseMedia.findAll({
      where: {
        date: {
          [Op.gte]: ninetyDaysAgo,
        },
      },
      attributes: [
        'id',
        'alert_id',
        'date',
        'source',
        'headline',
        'summary',
        'category',
        'url',
      ],
      order: [['date', 'DESC']],
      raw: false,
    });
  } catch (error) {
    console.error('Error querying adverse_media:', error);
    return [];
  }
}

/**
 * Generate unique request ID
 * Format: REQ-YYYYMMDD-XXXXX
 *
 * @returns {string} Request ID
 */
function generateRequestId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `REQ-${dateStr}-${random}`;
}
