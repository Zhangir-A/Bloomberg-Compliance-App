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
    // Query all three data sources in parallel (pass standardizedInput for pre-filtering)
    const [sanctionsCandidates, pepCandidates, mediaCandidates] = await Promise.all([
      querySanctionsList(standardizedInput),
      queryPepProfiles(standardizedInput),
      queryAdverseMedia(),
    ]);

    // Fuzzy match SANCTIONS and PEP (have name_latin field)
    // Adverse media is handled separately via entity matching, not name fuzzy matching
    const [sanctionsMatches, pepMatches] = await Promise.all([
      fuzzyMatchCandidates(standardizedInput, sanctionsCandidates, 'SANCTIONS'),
      fuzzyMatchCandidates(standardizedInput, pepCandidates, 'PEP'),
    ]);

    // Match adverse media by entity mentions (not by fuzzy name matching)
    const mediaMatches = matchAdverseMediaByEntity(standardizedInput, mediaCandidates);

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
 * Query sanctions_list table with basic pre-filter
 * Uses ILIKE on first word to reduce candidates before fuzzy matching
 *
 * @param {string} input - Standardized input name for pre-filter
 * @returns {array} Filtered sanctions list records
 */
async function querySanctionsList(input) {
  try {
    const firstWord = input?.split(' ')[0] || '';
    const where = firstWord ? { name_latin: { [Op.iLike]: `%${firstWord}%` } } : {};

    return await models.SanctionsList.findAll({
      where,
      attributes: ['id', 'name_latin', 'name_cyrillic', 'list_source', 'list_date', 'dob', 'nationality'],
      raw: false,
    });
  } catch (error) {
    console.error('Error querying sanctions_list:', error);
    return [];
  }
}

/**
 * Query pep_profiles table with basic pre-filter
 * Uses ILIKE on first word to reduce candidates before fuzzy matching
 *
 * @param {string} input - Standardized input name for pre-filter
 * @returns {array} Filtered PEP profile records
 */
async function queryPepProfiles(input) {
  try {
    const firstWord = input?.split(' ')[0] || '';
    const where = {
      is_active: true, // Focus on active PEPs
    };

    if (firstWord) {
      where.name_latin = { [Op.iLike]: `%${firstWord}%` };
    }

    return await models.PepProfile.findAll({
      where,
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
        'entities',
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
 * Match adverse media records by entity mentions
 * Searches headline and entities JSONB for mentions of the input name
 *
 * @param {string} input - Standardized input name
 * @param {array} mediaCandidates - Adverse media records
 * @returns {array} Matched records with score and resultType
 */
function matchAdverseMediaByEntity(input, mediaCandidates) {
  return mediaCandidates
    .filter(media => {
      // Match if input appears in headline (case-insensitive)
      const headlineMatch = media.headline?.toLowerCase().includes(input.toLowerCase());

      // Match if input appears in entities array
      let entityMatch = false;
      if (media.entities) {
        const entities = media.entities;
        const allNames = [
          ...(entities.persons?.map(p => p.name?.toLowerCase()) || []),
          ...(entities.organizations?.map(o => o.name?.toLowerCase()) || []),
        ];
        entityMatch = allNames.some(name => name?.includes(input.toLowerCase()));
      }

      return headlineMatch || entityMatch;
    })
    .map((media, idx) => ({
      ...media.toJSON ? media.toJSON() : media,
      score: 85, // Default high score for entity matches
      resultType: 'ADVERSE_MEDIA',
      match_id: `ADVERSE_MEDIA-${media.id}`,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
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
