import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

// ── Google OAuth Callback ─────────────────────────────────────────────────────
// Called after Passport authenticates the user via Google.
// Issues a JWT and redirects to the frontend with the token in the URL.
export const googleCallback = (req: Request, res: Response): void => {
    const user = req.user as any;
    if (!user) {
        res.redirect(`${process.env.CORS_ORIGIN}/admin/login?error=google_failed`);
        return;
    }
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
    );
    res.redirect(`${process.env.CORS_ORIGIN}/admin/oauth-callback?token=${token}`);
};

// ── Email / Password Login ────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                state: user.state,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ── Register (SUPER_ADMIN only) ───────────────────────────────────────────────
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, state } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role, state },
            select: { id: true, name: true, email: true, role: true, state: true, createdAt: true },
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, state: true, createdAt: true },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
