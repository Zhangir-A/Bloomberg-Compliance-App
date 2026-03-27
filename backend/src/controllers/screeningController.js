import { screenPerson } from '../services/screeningService.js';

/**
 * POST /api/v1/screen
 * Screen a person against sanctions, PEP, and adverse media databases
 *
 * Request body:
 * {
 *   "name": "Vladimir Putin",      // Required, Cyrillic or Latin
 *   "dob": "1952-10-01",           // Optional, YYYY-MM-DD
 *   "nationality": "RU"            // Optional, ISO 2-letter code
 * }
 *
 * Response:
 * {
 *   "request_id": "REQ-20260327-00123",
 *   "query": "Vladimir Putin",
 *   "response_ms": 1245,
 *   "total_matches": 5,
 *   "results": [
 *     {
 *       "id": 1,
 *       "name": "Vladimir Putin",
 *       "score": 100,
 *       "confidence": "Exact Match",
 *       "sourceType": "SANCTIONS",
 *       "listSource": "OFAC",
 *       "nationality": "RU",
 *       ...
 *     }
 *   ]
 * }
 */
export async function screen(req, res, next) {
  try {
    const { name, dob, nationality } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Name is required and must be a non-empty string',
      });
    }

    // Validate optional date format
    if (dob && !isValidDate(dob)) {
      return res.status(400).json({
        error: 'Date of birth must be in YYYY-MM-DD format',
      });
    }

    // Validate nationality format
    if (nationality && (typeof nationality !== 'string' || nationality.length !== 2)) {
      return res.status(400).json({
        error: 'Nationality must be a 2-letter ISO code (e.g., KZ, RU, US)',
      });
    }

    // Perform screening
    const result = await screenPerson({
      name: name.trim(),
      dob: dob || null,
      nationality: nationality ? nationality.toUpperCase() : null,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Screening error:', error);
    next(error);
  }
}

/**
 * Validate date string in YYYY-MM-DD format
 *
 * @param {string} dateStr - Date string
 * @returns {boolean} True if valid date format
 */
function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}
