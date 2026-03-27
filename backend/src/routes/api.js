import express from 'express';
import { screen } from '../controllers/screeningController.js';

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
router.get('/alerts', (req, res) => {
  res.json({
    message: 'Alerts endpoint - coming in M4',
    status: 'not_implemented',
  });
});

/**
 * GET /api/v1/pep/:id
 * Get individual PEP profile details
 */
router.get('/pep/:id', (req, res) => {
  res.json({
    message: 'PEP detail endpoint - coming in M3',
    status: 'not_implemented',
  });
});

/**
 * POST /api/v1/case
 * Record screening decision (true/false positive, needs review)
 */
router.post('/case', (req, res) => {
  res.json({
    message: 'Case decision endpoint - coming in M5',
    status: 'not_implemented',
  });
});

export default router;
