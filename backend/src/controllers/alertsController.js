import { Op } from 'sequelize';
import models from '../models/index.js';

/**
 * GET /api/v1/alerts
 * Fetch adverse media alerts with optional filtering
 *
 * Query Parameters:
 * - date_from: string (YYYY-MM-DD) — Start date (default: 90 days ago)
 * - date_to: string (YYYY-MM-DD) — End date (default: today)
 * - category: string — Filter by category (Corruption, Fraud, etc.)
 * - entity: string — Filter by mentioned person/organization
 * - limit: number — Max results (default: 50, max: 500)
 * - offset: number — Pagination offset (default: 0)
 *
 * Response:
 * {
 *   "total": 127,
 *   "limit": 50,
 *   "offset": 0,
 *   "alerts": [
 *     {
 *       "alert_id": "ALERT-KZ-001",
 *       "date": "2024-03-15",
 *       "source": "Reuters",
 *       "headline": "Kazakhstan Corruption Case",
 *       "summary": "Official faces charges...",
 *       "category": "Corruption",
 *       "entities": {...},
 *       "url": "https://..."
 *     }
 *   ]
 * }
 */
export async function getAlerts(req, res, next) {
  try {
    const {
      date_from,
      date_to,
      category,
      entity,
      limit = 50,
      offset = 0,
    } = req.query;

    // Validate limit and offset
    const parsedLimit = Math.max(1, Math.min(parseInt(limit) || 50, 500));
    const parsedOffset = Math.max(0, parseInt(offset) || 0);

    // Build where clause
    const where = {};

    // Date range (default: last 90 days)
    const endDate = date_to ? new Date(date_to) : new Date();
    const startDate = date_from ? new Date(date_from) : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Validate dates
    if (date_from && isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date_from format. Use YYYY-MM-DD',
      });
    }

    if (date_to && isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date_to format. Use YYYY-MM-DD',
      });
    }

    where.date = {
      [Op.gte]: startDate,
      [Op.lte]: endDate,
    };

    // Category filter
    if (category && category.trim()) {
      where.category = {
        [Op.iLike]: `%${category}%`,
      };
    }

    // Entity filter (search in entities JSONB)
    if (entity && entity.trim()) {
      where.entities = {
        [Op.or]: [
          { [Op.contains]: { persons: [{ name: entity }] } },
          { [Op.contains]: { organizations: [{ name: entity }] } },
        ],
      };
    }

    // Query database
    const { count, rows } = await models.AdverseMedia.findAndCountAll({
      where,
      limit: parsedLimit,
      offset: parsedOffset,
      order: [['date', 'DESC']],
      attributes: [
        'id',
        'alert_id',
        'date',
        'source',
        'headline',
        'summary',
        'category',
        'entities',
        'url',
      ],
    });

    res.status(200).json({
      total: count,
      limit: parsedLimit,
      offset: parsedOffset,
      alerts: rows.map(alert => ({
        id: alert.id,
        alert_id: alert.alert_id,
        date: alert.date,
        source: alert.source,
        headline: alert.headline,
        summary: alert.summary,
        category: alert.category,
        entities: alert.entities,
        url: alert.url,
      })),
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    next(error);
  }
}

/**
 * GET /api/v1/alerts/categories
 * Get list of available alert categories
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await models.AdverseMedia.findAll({
      attributes: [[models.sequelize.fn('DISTINCT', models.sequelize.col('category')), 'category']],
      where: {
        category: { [Op.not]: null },
      },
      raw: true,
    });

    res.status(200).json({
      categories: categories.map(c => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    next(error);
  }
}
