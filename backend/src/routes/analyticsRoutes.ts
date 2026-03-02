import { Router } from 'express';
import {
    getSummary,
    getByState,
    getByCategory,
    getBySeverity,
    getDaily,
    getResolutionTime,
    getByCity,
    getByAddress,
    getPublicSummary,
} from '../controllers/analyticsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public (no auth)
router.get('/public', getPublicSummary);

// Admin (auth required)
router.get('/summary', authenticate, getSummary);
router.get('/by-state', authenticate, getByState);
router.get('/by-category', authenticate, getByCategory);
router.get('/by-severity', authenticate, getBySeverity);
router.get('/by-city', authenticate, getByCity);
router.get('/by-address', authenticate, getByAddress);
router.get('/daily', authenticate, getDaily);
router.get('/resolution-time', authenticate, getResolutionTime);

export { router as analyticsRoutes };
