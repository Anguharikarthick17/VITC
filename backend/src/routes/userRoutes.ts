import { Router } from 'express';
import { getUsers, getOfficers, updateUser, deleteUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roleGuard';

const router = Router();

router.get('/', authenticate, getUsers);
router.get('/officers', authenticate, getOfficers);
router.patch('/:id', authenticate, requireRole('SUPER_ADMIN'), updateUser);
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'), deleteUser);

export { router as userRoutes };
