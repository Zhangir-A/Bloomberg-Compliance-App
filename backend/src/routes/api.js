import express from 'express';
import { screen } from '../controllers/screeningController.js';
import { getAlerts, getCategories } from '../controllers/alertsController.js';

const router = express.Router();

/**
 * POST /api/v1/screen
 * Screen a person against sanctions and PEP databases
 */
router.post('/screen', screen);

/**
 * GET /api/v1/alerts
 * Get adverse media alerts with optional filters
 */
router.get('/alerts', getAlerts);

/**
 * GET /api/v1/alerts/categories
 * Get list of available alert categories
 */
router.get('/alerts/categories', getCategories);

/**
 * GET /api/v1/pep/:id
 * Get individual PEP profile details
 */
router.get('/pep/:id', (req, res) => {
  res.status(501).json({
    message: 'PEP detail endpoint - coming in M5',
    status: 'not_implemented',
  });
});

/**
 * POST /api/v1/case
 * Record screening decision (true/false positive, needs review)
 */
router.post('/case', (req, res) => {
  res.status(501).json({
    message: 'Case decision endpoint - coming in M5',
    status: 'not_implemented',
  });
});

export default router;
