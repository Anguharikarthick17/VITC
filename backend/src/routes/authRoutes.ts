import { Router, Request, Response, NextFunction } from 'express';
import { login, register, getMe, googleCallback } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roleGuard';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../utils/schemas';
import passport from '../config/passport';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', authenticate as any, requireRole('SUPER_ADMIN') as any, validate(registerSchema), register as any);
router.get('/me', authenticate as any, getMe as any);

// Google OAuth — only active when credentials are configured
const googleConfigured =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

router.get('/google', (req, res, next) => {
    if (!googleConfigured) {
        res.status(503).json({ error: 'Google OAuth is not configured on this server.' });
        return;
    }
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    if (!googleConfigured) {
        res.redirect(`${process.env.CORS_ORIGIN}/admin/login?error=google_not_configured`);
        return;
    }
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CORS_ORIGIN}/admin/login?error=google_failed`,
    })(req, res, next);
}, googleCallback);

export { router as authRoutes };


