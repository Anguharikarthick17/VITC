import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './auth';

export const requireRole = (...roles: Role[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }

        if (!roles.includes(authReq.user.role as Role)) {
            res.status(403).json({ error: 'Insufficient permissions.' });
            return;
        }

        next();
    };
};
