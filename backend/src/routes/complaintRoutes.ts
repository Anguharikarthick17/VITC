import { Router } from 'express';
import {
    createComplaint,
    trackComplaint,
    getPublicComplaints,
    getComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
} from '../controllers/complaintController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roleGuard';
import { upload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { updateComplaintSchema } from '../utils/schemas';

const router = Router();

// Public routes
router.post('/', upload.single('image'), createComplaint);
router.get('/track/:id', trackComplaint);
router.get('/public', getPublicComplaints);

// Admin routes
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaint);
router.patch('/:id', authenticate, validate(updateComplaintSchema), updateComplaint);
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'), deleteComplaint);

export { router as complaintRoutes };
